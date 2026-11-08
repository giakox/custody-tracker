// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title DemoUSD
/// @notice Stablecoin finta SOLO per la demo su testnet: 6 decimali come USDC,
///         chiunque può coniarsene 1000 con faucet(). Nessun valore.
contract DemoUSD is ERC20 {
    constructor() ERC20("Demo USD (testnet, no value)", "dUSD") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function faucet() external {
        _mint(msg.sender, 1000 * 10 ** 6);
    }
}
