// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ICustodyLog {
    function shipments(uint256 id)
        external
        view
        returns (
            bytes32 deviceId,
            address shipper,
            address custodian,
            address pendingCustodian,
            address receiver,
            uint16 maxAllowedCg,
            uint32 lastSeq,
            bool delivered,
            bool damaged
        );
    function custodyPeriod(uint256 id) external view returns (uint32);
    function periodMaxPeakCg(uint256 id, uint32 period) external view returns (uint16);
}

/// @title RentalEscrow
/// @notice Collaterale di un noleggio custodito dal codice, non dal noleggiatore.
///         Il bene è una "spedizione" di CustodyLog il cui proprietario (shipper) fissa
///         le condizioni. Il cliente diventa custode con un handoff a due firme, poi
///         deposita il collaterale. A riconsegna avvenuta (custodia passata ad altri)
///         chiunque può chiamare endRental: il contratto legge il picco massimo registrato
///         dal device durante quel periodo di custodia e trattiene la fee del livello
///         corrispondente. Nessuna parte decide da sola quanto trattenere.
contract RentalEscrow {
    using SafeERC20 for IERC20;

    struct Terms {
        uint256 collateral;  // importo in unità del token
        uint16 lightCg;      // soglie in centesimi di g (picco = |a|, gravità inclusa)
        uint16 mediumCg;
        uint16 strongCg;
        uint16 lightBps;     // trattenuta in punti base del collaterale (10000 = 100%)
        uint16 mediumBps;
        uint16 strongBps;
        bool set;
    }

    struct Rental {
        address renter;
        uint32 period;
        uint256 amount;
        bool active;
    }

    ICustodyLog public immutable log;
    IERC20 public immutable token;

    mapping(uint256 => Terms) public terms;
    mapping(uint256 => Rental) public rentals;

    event TermsSet(uint256 indexed id, uint256 collateral, uint16 lightCg, uint16 mediumCg, uint16 strongCg);
    event RentalStarted(uint256 indexed id, address indexed renter, uint32 period, uint256 amount);
    event RentalSettled(
        uint256 indexed id, address indexed renter, uint32 period, uint16 peakCg, uint8 tier, uint256 fee, uint256 refund
    );

    error NotOwner();
    error NoTerms();
    error BadTerms();
    error NotCustodian();
    error RentalActive();
    error NoRental();
    error StillInCustody();

    constructor(ICustodyLog log_, IERC20 token_) {
        log = log_;
        token = token_;
    }

    function _owner(uint256 id) internal view returns (address shipper) {
        (, shipper,,,,,,,) = log.shipments(id);
    }

    function _custodian(uint256 id) internal view returns (address custodian) {
        (,, custodian,,,,,,) = log.shipments(id);
    }

    /// @notice Il proprietario del bene fissa collaterale, soglie e trattenute.
    ///         Non modificabili durante un noleggio attivo.
    function setTerms(uint256 id, Terms calldata t) external {
        if (msg.sender != _owner(id)) revert NotOwner();
        if (rentals[id].active) revert RentalActive();
        if (!(t.lightCg < t.mediumCg && t.mediumCg < t.strongCg)) revert BadTerms();
        if (!(t.lightBps <= t.mediumBps && t.mediumBps <= t.strongBps && t.strongBps <= 10_000)) revert BadTerms();
        Terms memory tt = t;
        tt.set = true;
        terms[id] = tt;
        emit TermsSet(id, t.collateral, t.lightCg, t.mediumCg, t.strongCg);
    }

    /// @notice Il cliente, già custode on-chain del bene, deposita il collaterale.
    ///         Il noleggio copre il periodo di custodia corrente.
    function startRental(uint256 id) external {
        Terms storage t = terms[id];
        if (!t.set) revert NoTerms();
        if (rentals[id].active) revert RentalActive();
        if (msg.sender != _custodian(id)) revert NotCustodian();
        uint32 period = log.custodyPeriod(id);
        rentals[id] = Rental(msg.sender, period, t.collateral, true);
        token.safeTransferFrom(msg.sender, address(this), t.collateral);
        emit RentalStarted(id, msg.sender, period, t.collateral);
    }

    /// @notice Livello di danno di un picco: 0 nessuno, 1 leggero, 2 medio, 3 forte.
    function tierOf(uint256 id, uint16 peakCg) public view returns (uint8) {
        Terms storage t = terms[id];
        if (peakCg >= t.strongCg) return 3;
        if (peakCg >= t.mediumCg) return 2;
        if (peakCg >= t.lightCg) return 1;
        return 0;
    }

    /// @notice Chiude il noleggio dopo la riconsegna. Chiamabile da chiunque: l'esito
    ///         dipende solo da ciò che il device ha firmato durante il periodo del noleggio.
    function endRental(uint256 id) external returns (uint256 fee, uint256 refund) {
        Rental memory r = rentals[id];
        if (!r.active) revert NoRental();
        if (log.custodyPeriod(id) == r.period) revert StillInCustody();

        uint16 peak = log.periodMaxPeakCg(id, r.period);
        uint8 tier = tierOf(id, peak);
        Terms storage t = terms[id];
        uint16 bps = tier == 3 ? t.strongBps : tier == 2 ? t.mediumBps : tier == 1 ? t.lightBps : 0;
        fee = (r.amount * bps) / 10_000;
        refund = r.amount - fee;

        delete rentals[id];
        if (fee > 0) token.safeTransfer(_owner(id), fee);
        if (refund > 0) token.safeTransfer(r.renter, refund);
        emit RentalSettled(id, r.renter, r.period, peak, tier, fee, refund);
    }
}
