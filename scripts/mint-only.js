const { ethers, network } = require('hardhat');
const { moveBlocks } = require('../utils/move-blocks');

async function mint() {
  const basicNft = await ethers.getContract('BasicNft');
  console.log('Minting... 🪙');
  const mintTx = await basicNft.mintNft();
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId = mintTxReceipt.events[0].args.tokenId;
  console.log(
    `Account ${mintTx.from}, minted NFT (address = ${basicNft.address}) with new tokenId: ${tokenId} 🎉`
  );

  if (!network.live) {
    await moveBlocks(2, 1000); // move ahead 2 blocks, and sleep for 1 second
  }
}

mint()
  .then(() => {
    console.log('Mint done! 🏁');
  })
  .catch((err) => {
    console.log(err);
  });
