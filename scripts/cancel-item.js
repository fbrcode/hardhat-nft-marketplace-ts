const { ethers, network } = require('hardhat');
const { moveBlocks } = require('../utils/move-blocks');

const TOKEN_ID = 0;

async function cancelItem() {
  const nftMarketplace = await ethers.getContract('NftMarketplace');
  const basicNft = await ethers.getContract('BasicNft');
  console.log(`Canceling token ${TOKEN_ID}...`);
  const tx = await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID);
  await tx.wait(1);
  console.log(`Canceled token ${TOKEN_ID}!`);

  if (!network.live) {
    await moveBlocks(1, 1000); // move ahead 2 blocks, and sleep for 1 second
  }
}

cancelItem()
  .then(() => {
    console.log('Item cancelation done! 🏁');
  })
  .catch((err) => {
    console.log(err);
  });
