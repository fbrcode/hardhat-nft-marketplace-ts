require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-deploy');
require('solidity-coverage');
require('hardhat-gas-reporter');
require('hardhat-contract-sizer');
require('dotenv').config();

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || 'https://eth-rinkeby';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xKey';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'key';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || 'key';
// const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || 'https://eth-mainnet';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    localhost: {
      live: false,
      saveDeployments: true,
      chainId: 31337,
      tags: ['local'],
    },
    hardhat: {
      live: false,
      saveDeployments: true,
      chainId: 31337,
      tags: ['test', 'local'],
      // forking: { url: MAINNET_RPC_URL, },
    },
    rinkeby: {
      live: true,
      saveDeployments: true,
      url: RINKEBY_RPC_URL,
      chainId: 4,
      accounts: [PRIVATE_KEY],
      tags: ['staging'],
    },
  },
  etherscan: {
    // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    apiKey: {
      rinkeby: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: 'gas-reporter.log',
    noColors: true,
    currency: 'USD',
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: 'ETH', // how much it costs to deploy/run on ethereum
    // token: "MATIC", // how much it costs to deploy/run on polygon
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  solidity: {
    compilers: [{ version: '0.8.7' }, ],
  },
  mocha: {
    timeout: 900000, // 900 seconds max
  },
};
