const { ethers, network } = require('hardhat');
const { moveBlocks } = require('../utils/move-blocks');

const PRICE = ethers.utils.parseEther('0.2');
const TOKEN_ID = 0;

async function mintAndList() {
  const nftMarketplace = await ethers.getContract('NftMarketplace');
  const basicNft = await ethers.getContract('BasicNft');
  console.log('Updating Nft price... 📝');
  const tx = await nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE);
  await tx.wait(1);

  if (!network.live) {
    await moveBlocks(1, 1000); // move ahead 2 blocks, and sleep for 1 second
  }
}

mintAndList()
  .then(() => {
    console.log('Update done! 🏁');
  })
  .catch((err) => {
    console.log(err);
  });
