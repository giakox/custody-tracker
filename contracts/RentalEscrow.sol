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
/// @notice Rental collateral held by code, not by the lessor.
///         The asset is a CustodyLog "shipment" whose owner (shipper) sets the
///         terms. The customer becomes custodian via a two-signature handoff, then
///         deposits the collateral. Once the asset is returned (custody passed to someone else)
///         anyone can call endRental: the contract reads the maximum peak recorded
///         by the device during that custody period and withholds the fee of the
///         corresponding tier. No party decides on its own how much to withhold.
contract RentalEscrow {
    using SafeERC20 for IERC20;

    struct Terms {
        uint256 collateral;  // amount in token units
        uint16 lightCg;      // thresholds in hundredths of g (peak = |a|, gravity included)
        uint16 mediumCg;
        uint16 strongCg;
        uint16 lightBps;     // withheld share of the collateral in basis points (10000 = 100%)
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

    /// @notice The asset owner sets the collateral, thresholds and withholdings.
    ///         Not modifiable during an active rental.
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

    /// @notice The customer, already the on-chain custodian of the asset, deposits the collateral.
    ///         The rental covers the current custody period.
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

    /// @notice Damage tier of a peak: 0 none, 1 light, 2 medium, 3 strong.
    function tierOf(uint256 id, uint16 peakCg) public view returns (uint8) {
        Terms storage t = terms[id];
        if (peakCg >= t.strongCg) return 3;
        if (peakCg >= t.mediumCg) return 2;
        if (peakCg >= t.lightCg) return 1;
        return 0;
    }

    /// @notice Closes the rental after the return. Callable by anyone: the outcome
    ///         depends only on what the device signed during the rental period.
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
