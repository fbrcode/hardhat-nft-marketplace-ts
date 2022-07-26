// SPDX-License-Identifier: MIT

// 1: Pragma statements
pragma solidity ^0.8.7;

// 2: Import statements
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

// 3: Interfaces (none in this case)
// 4: Libraries (none in this case)

// 5: Errors
error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__ItemAlreadyListed(address nftAddress, uint256 tokenId);

// 6: Contracts

/// @title NFT Marketplace
/// @author Fabio Bressler
/// @notice Contract for NFT management on the marketplace
contract NftMarketplace {
    // 6.a: Type declarations

    struct Listing {
        uint256 price;
        address seller;
    }
    // 6.b: State variables

    // NFT contract address --(mapped)--> NFT token ID --(mapped)--> Listing (price + seller)
    mapping(address => mapping(uint256 => Listing)) private s_listings;

    // 6.c: Events
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    // 6.d: Modifiers

    modifier notYetListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__ItemAlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    // 6.e: Functions
    // 6.e.1: Constructor
    // 6.e.2: Receive
    // 6.e.3: Fallback
    // 6.e.4: External

    /// @notice List existing NFTs availables on the marketplace
    /// @dev Owners hold their NFT and give approval to the marketplace to sell for them
    /// @dev Approvals use getApproved function from EIP-721
    /// @dev Modifier "notYetListed" make sure the token is not already listed on the marketplace
    /// @param nftAddress The address of the NFT contract
    /// @param tokenId Index of the NFT in the NFT contract
    /// @param price The current price of the NFT
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notYetListed(nftAddress, tokenId, msg.sender) {
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
        // init nft address from erc721 interface
        IERC721 nft = IERC721(nftAddress);
        // token id must be approved for the marketplace address
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }
        // add price & seller to the marketplace listing mapping
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        // trigger event for the listing transaction
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
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
