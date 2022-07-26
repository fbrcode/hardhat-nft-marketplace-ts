const { network } = require('hardhat');
const { verify } = require('../utils/verify');

let waitConfirmations = 1;
if (network.live) {
  waitConfirmations = 5;
}

async function deployNftMarketplace({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log('----------------------------------------------------');
  log('Deploying NftMarketplace contract...');
  const args = [];
  const nftMarketplace = await deploy('NftMarketplace', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: waitConfirmations,
  });
  log(`NftMarketplace Deployed!`);
  log('----------------------------------------------------');

  // if not deploying to local evm (check hardhat config for network.live = true)
  if (network.live && process.env.ETHERSCAN_API_KEY) {
    log(
      `Verifying contract "${nftMarketplace.address}" with args [${args}] on a live network: ${network.name} ...`
    );
    await verify(nftMarketplace.address, args);
  }
}

module.exports = deployNftMarketplace;
module.exports.tags = ['all', 'marketplace', 'nft'];
