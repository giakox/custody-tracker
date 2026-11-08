// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {P256} from "@openzeppelin/contracts/utils/cryptography/P256.sol";

/// @title CustodyLog
/// @notice Ledger shared by the shipper, carriers and receiver of a shipment.
///         A device with a secure element (ATECC608, P-256) signs the Merkle root of each
///         batch of readings (GPS + accelerometer). Anyone can relay the batch: trust
///         comes from the device signature, not from whoever sends the transaction.
///         Only the root + header go on-chain; the readings stay off-chain and are
///         proven with a Merkle proof.
contract CustodyLog {
    struct Device {
        bytes32 qx;
        bytes32 qy;
        bool registered;
    }

    struct Shipment {
        bytes32 deviceId;
        address shipper;
        address custodian;        // who holds the package right now (responsible party)
        address pendingCustodian; // handoff awaiting acceptance
        address receiver;
        uint16 maxAllowedCg;      // damage threshold in hundredths of g (e.g. 1500 = 15 g)
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
        address custodian; // custodian at the time of recording
    }

    mapping(bytes32 => Device) public devices;
    mapping(uint256 => Shipment) public shipments;
    mapping(uint256 => mapping(uint32 => Batch)) public batches;
    uint256 public shipmentCount;

    /// @notice Current custody period: increments by 1 on every accepted handoff.
    ///         A rental corresponds to one period (unlock → return).
    mapping(uint256 => uint32) public custodyPeriod;
    /// @notice Maximum peak recorded per shipment and custody period (hundredths of g).
    ///         Read by RentalEscrow to settle the rental collateral.
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

    /// @dev deviceId = sha256(qx || qy): the device identity is its public key.
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

    /// @notice Two-phase custody handoff: the current custodian proposes, the new one accepts.
    ///         Neither party can rewrite on its own who held the package and when.
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

    /// @notice Digest signed by the device. Must match the firmware byte for byte.
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

    /// @notice Anyone can relay a batch; it counts only if signed by the shipment's device.
    ///         seq is the secure element's monotonic counter: no replay, no reordering.
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

    /// @notice Verifies that a single reading is part of an anchored batch.
    ///         leaf = sha256(0x00 || record), node = sha256(0x01 || left || right);
    ///         with an odd number of nodes the last one is promoted unchanged.
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
