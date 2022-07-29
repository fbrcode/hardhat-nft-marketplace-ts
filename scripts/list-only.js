const { ethers, network } = require('hardhat');
const { moveBlocks } = require('../utils/move-blocks');

const PRICE = ethers.utils.parseEther('0.1');
const TOKEN_ID = 0;

async function mintAndList() {
  const nftMarketplace = await ethers.getContract('NftMarketplace');
  const basicNft = await ethers.getContract('BasicNft');
  console.log('Listing Nft... 📝');
  const tx = await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
  await tx.wait(1);

  if (!network.live) {
    await moveBlocks(1, 1000); // move ahead 2 blocks, and sleep for 1 second
  }
}

mintAndList()
  .then(() => {
    console.log('List done! 🏁');
  })
  .catch((err) => {
    console.log(err);
  });
