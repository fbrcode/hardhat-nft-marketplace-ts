const { network } = require('hardhat');
const { verify } = require('../utils/verify');

let waitConfirmations = 1;
if (network.live) {
  waitConfirmations = 5;
}

async function deployBasicNft({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log('----------------------------------------------------');
  log('Deploying BasicNft contract...');

  const args = [];
  const basicNft = await deploy('BasicNft', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: waitConfirmations,
  });

  log(`BasicNft Deployed!`);
  log('----------------------------------------------------');

  // if not deploying to local evm (check hardhat config for network.live = true)
  if (network.live && process.env.ETHERSCAN_API_KEY) {
    log(
      `Verifying contract "${basicNft.address}" with args [${args}] on a live network: ${network.name} ...`
    );
    await verify(basicNft.address, args);
  }
}

module.exports = deployBasicNft;
module.exports.tags = ['all', 'nft', 'basic'];
