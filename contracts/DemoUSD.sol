// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title DemoUSD
/// @notice Fake stablecoin ONLY for the testnet demo: 6 decimals like USDC,
///         anyone can mint 1000 for themselves with faucet(). No value.
contract DemoUSD is ERC20 {
    constructor() ERC20("Demo USD (testnet, no value)", "dUSD") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function faucet() external {
        _mint(msg.sender, 1000 * 10 ** 6);
    }
}
