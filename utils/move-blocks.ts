const { network } = require('hardhat');

// allow to move blocks ahead, for us to simulate mining and block confirmation in hardhat
async function moveBlocks(amount, sleepMilliseconds = 0) {
  console.log(`⛏ Moving ${amount} blocks... `);
  for (let index = 0; index < amount; index++) {
    await network.provider.request({ method: 'evm_mine', params: [] });
    if (sleepMilliseconds > 0) {
      console.log(`💤 Sleeping for ${sleepMilliseconds}ms... `);
      await new Promise((resolve) => setTimeout(resolve, sleepMilliseconds));
    }
  }
  console.log(`Moved ${amount} blocks ahead.`);
}

module.exports = {
  moveBlocks,
};
