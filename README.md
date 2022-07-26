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
