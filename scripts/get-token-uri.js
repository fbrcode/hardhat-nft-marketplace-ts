const { ethers, network } = require('hardhat');
const { moveBlocks } = require('../utils/move-blocks');

const TOKEN_ID = 0;

async function getTokenURI() {
  const basicNft = await ethers.getContract('BasicNft');
  const tokenURI = await basicNft.tokenURI(TOKEN_ID);
  console.log(`Token URI for id ${TOKEN_ID}: ${tokenURI}`);
}

getTokenURI()
  .then(() => {
    console.log('Done! 🏁');
  })
  .catch((err) => {
    console.log(err);
  });
