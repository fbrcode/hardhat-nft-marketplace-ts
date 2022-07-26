// SPDX-License-Identifier: MIT

// 1: Pragma statements
pragma solidity ^0.8.7;

// 2: Import statements
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

// 3: Interfaces (none in this case)
// 4: Libraries (none in this case)

// 5: Errors
error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__ItemAlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotOwner();
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__UpdatedPriceMustBeAboveZero();
error NftMarketplace__NoProceeds();
error NftMarketplace__TransferFailed();

// 6: Contracts

/// @title NFT Marketplace
/// @author Fabio Bressler
/// @notice Contract for NFT management on the marketplace
contract NftMarketplace is ReentrancyGuard {
    // 6.a: Type declarations

    struct Listing {
        uint256 price;
        address seller;
    }
    // 6.b: State variables

    // NFT contract address --(mapped)--> NFT token ID --(mapped)--> Listing (price + seller)
    mapping(address => mapping(uint256 => Listing)) private s_listings;

    // Keep track of how many money people have earned selling their NFTs
    // Seller address --(mapped)--> Amount earned
    mapping(address => uint256) private s_proceeds;

    // 6.c: Events
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCancelled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    // 6.d: Modifiers

    /// @notice Modifier to ensure that the NFT is not listed already on the marketplace
    modifier isNotListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__ItemAlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    /// @notice Modifier to check if the seller is the owner of the NFT
    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address seller
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (seller != owner) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }

    /// @notice Modifier to ensure the the NFT item is already listed on the marketplace
    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    // 6.e: Functions
    // 6.e.1: Constructor
    // 6.e.2: Receive
    // 6.e.3: Fallback
    // 6.e.4: External

    /// @notice Add existing NFTs on the marketplace listing
    /// @dev Owners hold one or more NFTs and give approval for the marketplace to sell it for them
    /// @dev Approvals use "getApproved" function from EIP-721
    /// @dev Modifier "notYetListed" make sure the token is not already listed on the marketplace
    /// @dev Modifier "isOwner" make sure the token owner is indeed the seller
    /// @param nftAddress The address of the NFT contract
    /// @param tokenId Index of the NFT in the NFT contract
    /// @param price The initial price for the NFT
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external isNotListed(nftAddress, tokenId) isOwner(nftAddress, tokenId, msg.sender) {
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

    /// @notice Allow someone to buy an NFT from the marketplace
    /// @dev Payable for the buyer to buy the NFT from the marketplace with ETH or other Layer-1 currency
    /// @param nftAddress The address of the NFT contract
    /// @param tokenId Index of the NFT in the NFT contract
    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        isListed(nftAddress, tokenId)
        nonReentrant // adds the locking mechanism (mutex) to avoid reentrancy attacks
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < listedItem.price) {
            revert NftMarketplace__PriceNotMet(nftAddress, tokenId, listedItem.price);
        }
        // adds paid amount to the seller's account
        // pull over push: https://fravoll.github.io/solidity-patterns/pull_over_push.html
        // instead of sending the money to the user ❌
        // we have then withdraw the money ✅
        s_proceeds[listedItem.seller] += msg.value;
        // remove the item from the marketplace listing (mapping)
        delete (s_listings[nftAddress][tokenId]);
        // transfer the NFT to the buyer
        // instead of using the ERC721 transferFrom function ❌
        // we'll call the ERC721 safeTransferFrom function to avoid loosing the NFT ✅
        // ⚠️ We run the transfer in the end to avoid reentrancy attacks
        // Re-Entrancy: https://solidity-by-example.org/hacks/re-entrancy/
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);
        // trigger event for the buying transaction
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    /// @notice Allow the owner to remove a listed NFT item from the marketplace
    /// @param nftAddress The address of the NFT contract
    /// @param tokenId Index of the NFT in the NFT contract
    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        // remove the item from the marketplace listing (mapping)
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCancelled(msg.sender, nftAddress, tokenId);
    }

    /// @notice Allow the owner to update the price of a listed NFT item in the marketplace
    /// @dev As when the listing was created, the new price must be greater than zero
    /// @param nftAddress The address of the NFT contract
    /// @param tokenId Index of the NFT in the NFT contract
    /// @param newPrice The new price for the NFT listing
    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isOwner(nftAddress, tokenId, msg.sender) isListed(nftAddress, tokenId) {
        if (newPrice <= 0) {
            revert NftMarketplace__UpdatedPriceMustBeAboveZero();
        }
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    /// @notice Withdraw all money from NFT selling on the marketplace
    /// @dev Prevent reantrancy attacks #1 by locking the function
    /// @dev Prevent reantrancy attacks #2 by setting the balance to 0 before the actual transfer
    function withdrawProceeds() external nonReentrant {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NftMarketplace__NoProceeds();
        }
        // set proceeds storage to zero before transfering to avoid reentrancy attacks
        s_proceeds[msg.sender] = 0;
        // transfer the ETH to the seller
        (bool success, ) = payable(msg.sender).call{value: proceeds}('');
        if (!success) {
            revert NftMarketplace__TransferFailed();
        }
    }

    // 6.e.5: Public
    // 6.e.6: Internal
    // 6.e.7: Private
    // 6.e.8: View / Pure

    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}

// TODO:
//  1. `listItem`: List (adds) NFT on the marketplace ✅
//  2. `buyItem`: Buy an NFT ✅
//  3. `cancelListing`: Cancel an item listing ✅
//  4. `updateListing`: Update price of an item listing ✅
//  5. `withdrawProceeds`: Withdraw payment for my bought NFTs ✅
