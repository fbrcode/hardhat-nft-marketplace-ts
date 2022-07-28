const { network } = require('hardhat');
const { verify } = require('../utils/verify');

async function deployBasicNft({ getNamedAccounts, deployments }) {
  // deploy only on local for unit tests
  if (!network.live) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    log('----------------------------------------------------');
    log('Deploying BasicNft contract...');

    const args = [];
    await deploy('BasicNft', {
      from: deployer,
      args,
      log: true,
      waitConfirmations: 1,
    });

    log(`BasicNft Deployed!`);
    log('----------------------------------------------------');
  }
}

module.exports = deployBasicNft;
module.exports.tags = ['all', 'nft', 'basic'];
