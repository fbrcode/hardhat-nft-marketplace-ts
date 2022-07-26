// SPDX-License-Identifier: MIT

// 1: Pragma statements
pragma solidity ^0.8.7;

// 2: Import statements
// 3: Interfaces (none in this case)
// 4: Libraries (none in this case)

// 5: Errors
error NftMarketplace__PriceMustBeAboveZero();

// 6: Contracts

/// @title NFT Marketplace
/// @author Fabio Bressler
/// @notice Contract for NFT management on the marketplace
contract NftMarketplace {
    // 6.a: Type declarations
    // 6.b: State variables
    // 6.c: Events
    // 6.d: Modifiers
    // 6.e: Functions
    // 6.e.1: Constructor
    // 6.e.2: Receive
    // 6.e.3: Fallback
    // 6.e.4: External

    /// @notice List existing NFTs availables on the marketplace
    /// @dev Owners hold their NFT and give approval to the marketplace to sell for them
    /// @dev Approvals use getApproved function from EIP-721
    /// @param nftAddress The address of the NFT contract
    /// @param tokenId Index of the NFT in the NFT contract
    /// @param price The current price of the NFT
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external {
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
    }

    // 6.e.5: Public
    // 6.e.6: Internal
    // 6.e.7: Private
    // 6.e.8: View / Pure
}

//  1. `listItem`: List NFTs on the marketplace
//  2. `buyItem`: Buy the NFTs
//  3. `cancelItem`: Cancel a listing
//  4. `updateListing`: Update price
//  5. `withdrawProceeds`: Withdraw payment for my bought NFTs

/// @notice Request a random winner
/// @dev Request a random winner (verifiably random) and automatically run through Chainlink Keepers
/// @dev https://docs.chain.link/docs/chainlink-keepers/introduction/
/// @dev Step 1 : request the random number
/// @dev Step 2 : once we get it, do something with it
/// @dev it is a 2 (two) transaction process: intentional to make it trully random
// RENAMED : function requestRandomWinner() external {
// FROM requestRandomWinner to performUpkeep
