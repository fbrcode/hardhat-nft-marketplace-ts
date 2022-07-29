const { ethers, network } = require('hardhat');
const { moveBlocks } = require('../utils/move-blocks');

const TOKEN_ID = 0;

async function buyItem() {
  const nftMarketplace = await ethers.getContract('NftMarketplace');
  const basicNft = await ethers.getContract('BasicNft');
  console.log(`Buying token ${TOKEN_ID}...`);
  const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
  const price = listing.price.toString();
  const tx = await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: price });
  await tx.wait(1);
  console.log(`Bough NFT with token ${TOKEN_ID}!`);

  if (!network.live) {
    await moveBlocks(1, 1000); // move ahead 2 blocks, and sleep for 1 second
  }
}

buyItem()
  .then(() => {
    console.log('Item buying done! 🏁');
  })
  .catch((err) => {
    console.log(err);
  });
