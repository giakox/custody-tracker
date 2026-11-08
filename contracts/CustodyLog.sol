// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {P256} from "@openzeppelin/contracts/utils/cryptography/P256.sol";

/// @title CustodyLog
/// @notice Registro condiviso tra mittente, vettori e destinatario di una spedizione.
///         Un device con secure element (ATECC608, P-256) firma la Merkle root di ogni
///         batch di letture (GPS + accelerometro). Chiunque può inoltrare il batch: la
///         fiducia viene dalla firma del device, non da chi invia la transazione.
///         On-chain vanno solo root + header; le letture restano off-chain e si
///         dimostrano con una Merkle proof.
contract CustodyLog {
    struct Device {
        bytes32 qx;
        bytes32 qy;
        bool registered;
    }

    struct Shipment {
        bytes32 deviceId;
        address shipper;
        address custodian;        // chi ha il pacco adesso (responsabile)
        address pendingCustodian; // handoff in attesa di accettazione
        address receiver;
        uint16 maxAllowedCg;      // soglia di danno in centesimi di g (es. 1500 = 15 g)
        uint32 lastSeq;
        bool delivered;
        bool damaged;
    }

    struct Batch {
        bytes32 root;
        uint32 count;
        uint16 maxPeakCg;
        uint32 tStart;
        uint32 tEnd;
        address custodian; // custode al momento della registrazione
    }

    mapping(bytes32 => Device) public devices;
    mapping(uint256 => Shipment) public shipments;
    mapping(uint256 => mapping(uint32 => Batch)) public batches;
    uint256 public shipmentCount;

    /// @notice Periodo di custodia corrente: aumenta di 1 a ogni passaggio accettato.
    ///         Un noleggio corrisponde a un periodo (sblocco → riconsegna).
    mapping(uint256 => uint32) public custodyPeriod;
    /// @notice Picco massimo registrato per spedizione e periodo di custodia (centesimi di g).
    ///         Lo legge RentalEscrow per regolare il collaterale del noleggio.
    mapping(uint256 => mapping(uint32 => uint16)) public periodMaxPeakCg;

    event DeviceRegistered(bytes32 indexed deviceId, bytes32 qx, bytes32 qy);
    event ShipmentCreated(uint256 indexed id, bytes32 indexed deviceId, address shipper, address carrier, address receiver);
    event HandoffProposed(uint256 indexed id, address from, address to);
    event CustodyTransferred(uint256 indexed id, address from, address to);
    event BatchAnchored(uint256 indexed id, uint32 indexed seq, bytes32 root, uint16 maxPeakCg, address custodian);
    event DamageDetected(uint256 indexed id, uint32 indexed seq, uint16 peakCg, address indexed custodian);
    event Delivered(uint256 indexed id, bool damaged);

    error UnknownDevice();
    error AlreadyRegistered();
    error NotCustodian();
    error NotPending();
    error BadSequence();
    error BadSignature();
    error AlreadyDelivered();

    /// @dev deviceId = sha256(qx || qy): l'identità del device è la sua chiave pubblica.
    function registerDevice(bytes32 qx, bytes32 qy) external returns (bytes32 deviceId) {
        if (!P256.isValidPublicKey(qx, qy)) revert BadSignature();
        deviceId = sha256(abi.encodePacked(qx, qy));
        if (devices[deviceId].registered) revert AlreadyRegistered();
        devices[deviceId] = Device(qx, qy, true);
        emit DeviceRegistered(deviceId, qx, qy);
    }

    function createShipment(bytes32 deviceId, address carrier, address receiver, uint16 maxAllowedCg)
        external
        returns (uint256 id)
    {
        if (!devices[deviceId].registered) revert UnknownDevice();
        id = ++shipmentCount;
        Shipment storage s = shipments[id];
        s.deviceId = deviceId;
        s.shipper = msg.sender;
        s.custodian = carrier;
        s.receiver = receiver;
        s.maxAllowedCg = maxAllowedCg;
        emit ShipmentCreated(id, deviceId, msg.sender, carrier, receiver);
    }

    /// @notice Passaggio di custodia in due fasi: propone il custode attuale, accetta il nuovo.
    ///         Nessuna delle due parti può riscrivere da sola chi aveva il pacco e quando.
    function proposeHandoff(uint256 id, address to) external {
        Shipment storage s = shipments[id];
        if (msg.sender != s.custodian) revert NotCustodian();
        if (s.delivered) revert AlreadyDelivered();
        s.pendingCustodian = to;
        emit HandoffProposed(id, msg.sender, to);
    }

    function acceptHandoff(uint256 id) external {
        Shipment storage s = shipments[id];
        if (msg.sender != s.pendingCustodian) revert NotPending();
        address from = s.custodian;
        s.custodian = msg.sender;
        s.pendingCustodian = address(0);
        custodyPeriod[id]++;
        emit CustodyTransferred(id, from, msg.sender);
        if (msg.sender == s.receiver) {
            s.delivered = true;
            emit Delivered(id, s.damaged);
        }
    }

    /// @notice Digest firmato dal device. Deve coincidere byte per byte con il firmware.
    function batchDigest(
        bytes32 deviceId,
        uint32 seq,
        bytes32 root,
        uint32 count,
        uint16 maxPeakCg,
        uint32 tStart,
        uint32 tEnd
    ) public pure returns (bytes32) {
        return sha256(abi.encodePacked(bytes4("CLv1"), deviceId, seq, root, count, maxPeakCg, tStart, tEnd));
    }

    /// @notice Chiunque può inoltrare un batch; vale solo se firmato dal device della spedizione.
    ///         seq è il contatore monotono del secure element: niente replay, niente riordino.
    function submitBatch(
        uint256 id,
        uint32 seq,
        bytes32 root,
        uint32 count,
        uint16 maxPeakCg,
        uint32 tStart,
        uint32 tEnd,
        bytes32 r,
        bytes32 s_
    ) external {
        Shipment storage s = shipments[id];
        if (s.delivered) revert AlreadyDelivered();
        if (seq <= s.lastSeq) revert BadSequence();
        Device storage d = devices[s.deviceId];
        if (!d.registered) revert UnknownDevice();

        bytes32 h = batchDigest(s.deviceId, seq, root, count, maxPeakCg, tStart, tEnd);
        if (!P256.verify(h, r, s_, d.qx, d.qy)) revert BadSignature();

        s.lastSeq = seq;
        batches[id][seq] = Batch(root, count, maxPeakCg, tStart, tEnd, s.custodian);
        emit BatchAnchored(id, seq, root, maxPeakCg, s.custodian);
        uint32 period = custodyPeriod[id];
        if (maxPeakCg > periodMaxPeakCg[id][period]) periodMaxPeakCg[id][period] = maxPeakCg;

        if (maxPeakCg > s.maxAllowedCg) {
            s.damaged = true;
            emit DamageDetected(id, seq, maxPeakCg, s.custodian);
        }
    }

    /// @notice Verifica che una singola lettura faccia parte di un batch ancorato.
    ///         leaf = sha256(0x00 || record), node = sha256(0x01 || left || right);
    ///         con numero dispari di nodi l'ultimo sale invariato.
    function verifyReading(uint256 id, uint32 seq, bytes calldata record, uint256 index, bytes32[] calldata proof)
        external
        view
        returns (bool)
    {
        Batch storage b = batches[id][seq];
        bytes32 node = sha256(abi.encodePacked(bytes1(0x00), record));
        uint256 n = b.count;
        uint256 p;
        while (n > 1) {
            bool isRight = index & 1 == 1;
            bool hasSibling = isRight || index + 1 < n;
            if (hasSibling) {
                bytes32 sib = proof[p++];
                node = isRight
                    ? sha256(abi.encodePacked(bytes1(0x01), sib, node))
                    : sha256(abi.encodePacked(bytes1(0x01), node, sib));
            }
            index >>= 1;
            n = (n + 1) >> 1;
        }
        return p == proof.length && node == b.root;
    }
}
