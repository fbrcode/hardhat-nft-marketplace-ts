# Hardhat NFT Marketplace

This project is the backend part of a web3 fullstack implementation to buy and sell NFTs.

## Init

- `git init`
- `yarn init -y`
- `yarn add --dev hardhat`
- `yarn add --dev prettier prettier-plugin-solidity`
- `yarn hardhat`
- `yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv`

## Project Info

Steps:

1. Create a decentralized NFT Marketplace
   1. `listItem`: List NFTs on the marketplace
   2. `buyItem`: Buy the NFTs
   3. `cancelItem`: Cancel a listing
   4. `updateListing`: Update price
   5. `withdrawProceeds`: Withdraw payment for my bought NFTs

## Contract Natspec Boilerplate

```js
// SPDX-License-Identifier: MIT

// 1: Pragma statements
pragma solidity ^0.8.7;

// 2: Import statements
// 3: Interfaces (none in this case)
// 4: Libraries (none in this case)
// 5: Errors
// 6: Contracts

/// @title NFT Marketplace
/// @author Fabio Bressler
/// @notice Contract that...
contract MyContractName {
  // 6.a: Type declarations
  // 6.b: State variables
  // 6.c: Events
  // 6.d: Modifiers
  // 6.e: Functions
  // 6.e.1: Constructor
  // 6.e.2: Receive
  // 6.e.3: Fallback
  // 6.e.4: External
  // 6.e.5: Public
  // 6.e.6: Internal
  // 6.e.7: Private
  // 6.e.8: View / Pure
}
```

## ERC 721 (EIP-721)

Import from Openzeppelin ERC-721 boilerplate.

`yarn add --dev @openzeppelin/contracts`
