const { deployments, ethers } = require('hardhat');
const { assert } = require('chai');

network.live
  ? describe.skip
  : describe('BasicNft Unit Tests', () => {
      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(['basic']);
        basicNftContract = await ethers.getContract('BasicNft');
        basicNft = basicNftContract.connect(deployer);
      });

      it('should startup the NFT contract correctly', async () => {
        const counter = await basicNft.getTokenCounter();
        assert.equal(counter.toString(), '0');
      });

      it('should increase token count when minting', async () => {
        await basicNft.mintNft();
        const counter = await basicNft.getTokenCounter();
        assert.equal(counter.toString(), '1');
      });

      it('should increase token count when minting multiple times', async () => {
        await basicNft.mintNft();
        await basicNft.mintNft();
        const counter = await basicNft.getTokenCounter();
        assert.equal(counter.toString(), '2');
      });

      it('should return the correct token uri', async () => {
        const mockURI = 'ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json';
        const tokenURI = await basicNft.tokenURI(0);
        assert.equal(tokenURI, mockURI);
      });
    });
