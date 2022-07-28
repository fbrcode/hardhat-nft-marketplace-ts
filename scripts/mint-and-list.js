const { ethers } = require('hardhat');

const PRICE = ethers.utils.parseEther('0.1');

async function mintAndList() {
  const nftMarketplace = await ethers.getContract('NftMarketplace');
  const basicNft = await ethers.getContract('BasicNft');
  console.log('Minting... 🪙');
  const mintTx = await basicNft.mintNft();
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId = mintTxReceipt.events[0].args.tokenId;
  console.log('Approving Nft... ✅');
  const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId);
  await approvalTx.wait(1);
  console.log('Listing Nft... 📝');
  const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
  await tx.wait(1);
}

mintAndList()
  .then(() => {
    console.log('🏁 Mint And List done! 🏁');
  })
  .catch((err) => {
    console.log(err);
  });
