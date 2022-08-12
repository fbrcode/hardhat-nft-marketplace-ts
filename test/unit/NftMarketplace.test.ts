const { network, deployments, ethers } = require('hardhat');
const { assert, expect } = require('chai');

const listPrice = ethers.utils.parseEther('50');
const updatePrice = ethers.utils.parseEther('99');

network.live
  ? describe.skip
  : describe('NftMarketplace Unit Tests', () => {
      let basicNft, deployer, user2;
      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        user2 = accounts[1];
        await deployments.fixture(['basic', 'marketplace']);
        nftMarketplaceContract = await ethers.getContract('NftMarketplace');
        nftMarketplace = nftMarketplaceContract.connect(deployer);
        basicNftContract = await ethers.getContract('BasicNft');
        basicNft = basicNftContract.connect(deployer);
      });

      describe('constructor', () => {
        it('initializes the marketplace correctly', async () => {
          const emptyListing = await nftMarketplace.getListing(basicNft.address, 0);
          assert.equal(emptyListing[0].toString(), '0');
          assert.equal(emptyListing[1].toString(), ethers.constants.AddressZero);
          const proceeds = await nftMarketplace.getProceeds(ethers.constants.AddressZero);
          assert.equal(proceeds.toString(), '0');
        });
      });

      describe('listItem', () => {
        it('fail when value is zero', async () => {
          expect(nftMarketplace.listItem(basicNft.address, 0, 0)).to.be.revertedWith(
            'NftMarketplace__PriceMustBeAboveZero()'
          );
        });

        it('fail when value is below zero', async () => {
          expect(nftMarketplace.listItem(basicNft.address, 0, -1)).to.be.revertedWith(
            'NftMarketplace__PriceMustBeAboveZero()'
          );
        });

        it('revert when NFT is not approved for marketplace', async () => {
          await basicNft.mintNft();
          expect(nftMarketplace.listItem(basicNft.address, 0, 1)).to.be.revertedWith(
            'NftMarketplace__NotApprovedForMarketplace()'
          );
        });

        it('success when NFT is listed (added)', async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketplace.address, 0);
          await nftMarketplace.listItem(basicNft.address, 0, listPrice);
          const listing = await nftMarketplace.getListing(basicNft.address, 0);
          assert.equal(listing[0].toString(), listPrice.toString());
        });

        it('revert when item is already listed in the marketplace', async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketplace.address, 0);
          await nftMarketplace.listItem(basicNft.address, 0, listPrice);
          expect(nftMarketplace.listItem(basicNft.address, 0, listPrice)).to.be.revertedWith(
            'NftMarketplace__ItemAlreadyListed()'
          );
        });

        it('revert when item to be listed do not belong to the owner', async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketplace.address, 0);
          nftMarketplace = nftMarketplaceContract.connect(user2);
          expect(nftMarketplace.listItem(basicNft.address, 0, listPrice)).to.be.revertedWith(
            'NftMarketplace__NotOwner()'
          );
        });

        it('emit event when NFT is listed (added)', async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketplace.address, 0);
          await expect(nftMarketplace.listItem(basicNft.address, 0, listPrice)).to.emit(
            nftMarketplace,
            'ItemListed'
          );
        });
      });

      describe('buyItem', () => {
        beforeEach(async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketplace.address, 0);
          await nftMarketplace.listItem(basicNft.address, 0, listPrice);
        });

        it('revert if the NFT item to buy is not listed', async () => {
          expect(nftMarketplace.buyItem(basicNft.address, 1)).to.be.revertedWith(
            'NftMarketplace__NotListed()'
          );
        });

        it('revert if tries to buy the NFT with less than announced', async () => {
          expect(nftMarketplace.buyItem(basicNft.address, 0, { value: 49 })).to.be.revertedWith(
            'NftMarketplace__PriceNotMet()'
          );
        });

        it('ensure that proceeds get the correct value', async () => {
          nftMarketplace = nftMarketplaceContract.connect(user2);
          await nftMarketplace.buyItem(basicNft.address, 0, { value: listPrice });
          const proceeds = await nftMarketplace.getProceeds(deployer.address);
          assert.equal(proceeds.toString(), listPrice.toString());
        });

        it('ensure that listing is removed after buying NFT item', async () => {
          nftMarketplace = nftMarketplaceContract.connect(user2);
          await nftMarketplace.buyItem(basicNft.address, 0, { value: listPrice });
          const listing = await nftMarketplace.getListing(basicNft.address, 0);
          assert.equal(listing[0].toString(), '0');
          assert.equal(listing[1].toString(), ethers.constants.AddressZero);
        });

        it('ensure that the NFT got transferred to the buyer', async () => {
          nftMarketplace = nftMarketplaceContract.connect(user2);
          await nftMarketplace.buyItem(basicNft.address, 0, { value: listPrice });
          const owner = await basicNft.ownerOf(0);
          assert.equal(owner, user2.address);
        });

        it('emits event after buying the NFT', async () => {
          nftMarketplace = nftMarketplaceContract.connect(user2);
          await expect(nftMarketplace.buyItem(basicNft.address, 0, { value: listPrice })).to.emit(
            nftMarketplace,
            'ItemBought'
          );
        });
      });

      describe('cancelListing', () => {
        beforeEach(async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketplace.address, 0);
          await nftMarketplace.listItem(basicNft.address, 0, listPrice);
        });

        it('reverts if cancelling caller is not the owner', async () => {
          nftMarketplace = nftMarketplaceContract.connect(user2);
          expect(nftMarketplace.cancelListing(basicNft.address, 0)).to.be.revertedWith(
            'NftMarketplace__NotOwner()'
          );
        });

        it('revert if the NFT item to cancel is not listed', async () => {
          expect(nftMarketplace.cancelListing(basicNft.address, 1)).to.be.revertedWith(
            'NftMarketplace__NotListed()'
          );
        });

        it('ensure that listing is removed after cancelling NFT item', async () => {
          await nftMarketplace.cancelListing(basicNft.address, 0);
          const listing = await nftMarketplace.getListing(basicNft.address, 0);
          assert.equal(listing[0].toString(), '0');
          assert.equal(listing[1].toString(), ethers.constants.AddressZero);
        });

        it('emit event when NFT listing is cancelled', async () => {
          await expect(nftMarketplace.cancelListing(basicNft.address, 0)).to.emit(
            nftMarketplace,
            'ItemCancelled'
          );
        });
      });

      describe('updateListing', () => {
        beforeEach(async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketplace.address, 0);
          await nftMarketplace.listItem(basicNft.address, 0, listPrice);
        });

        it('reverts if update listing caller is not the owner', async () => {
          nftMarketplace = nftMarketplaceContract.connect(user2);
          expect(nftMarketplace.updateListing(basicNft.address, 0, updatePrice)).to.be.revertedWith(
            'NftMarketplace__NotOwner()'
          );
        });

        it('revert if the NFT item to update is not listed', async () => {
          expect(nftMarketplace.updateListing(basicNft.address, 1, updatePrice)).to.be.revertedWith(
            'NftMarketplace__NotListed()'
          );
        });

        it('revert if the new price is zero', async () => {
          expect(nftMarketplace.updateListing(basicNft.address, 0, 0)).to.be.revertedWith(
            'NftMarketplace__UpdatedPriceMustBeAboveZero()'
          );
        });

        it('revert if the new price is below zero', async () => {
          expect(nftMarketplace.updateListing(basicNft.address, 0, -1)).to.be.revertedWith(
            'NftMarketplace__UpdatedPriceMustBeAboveZero()'
          );
        });

        it('success when listing is updated with new value', async () => {
          await nftMarketplace.updateListing(basicNft.address, 0, updatePrice);
          const listing = await nftMarketplace.getListing(basicNft.address, 0);
          assert.equal(listing[0].toString(), updatePrice.toString());
        });

        it('emit event when NFT price is updated', async () => {
          await expect(nftMarketplace.updateListing(basicNft.address, 0, updatePrice)).to.emit(
            nftMarketplace,
            'ItemListed'
          );
        });
      });

      describe('withdrawProceeds', () => {
        beforeEach(async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketplace.address, 0);
          await nftMarketplace.listItem(basicNft.address, 0, listPrice);
          nftMarketplace = nftMarketplaceContract.connect(user2);
          await nftMarketplace.buyItem(basicNft.address, 0, { value: listPrice });
        });

        it('revert when there is no proceeds to withdraw', async () => {
          nftMarketplace = nftMarketplaceContract.connect(user2);
          expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith(
            'NftMarketplace__NoProceeds()'
          );
        });

        it('success when there is proceeds to withdraw', async () => {
          const beforeBalance = await deployer.getBalance();
          const proceedsBeforeWithdraw = await nftMarketplace.getProceeds(deployer.address);
          nftMarketplace = nftMarketplaceContract.connect(deployer);
          await nftMarketplace.withdrawProceeds();
          const afterBalance = await deployer.getBalance();
          const proceedsAfterWithdraw = await nftMarketplace.getProceeds(deployer.address);
          assert.equal(proceedsBeforeWithdraw.toString(), listPrice.toString());
          assert.equal(proceedsAfterWithdraw.toString(), '0');
          expect(afterBalance > beforeBalance);
        });
      });
    });
