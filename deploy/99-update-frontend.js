const { network } = require('hardhat');
const fs = require('fs');
const path = require('path');

const SOURCE_DEPLOYMENT_FOLDER = './deployments';
const TARGET_FRONTEND_FOLDER = '../nextjs-nft-marketplace-moralis-ts/constants';

async function updateFrontend({ deployments }) {
  // const { deploy, log } = deployments;
  // const { deployer } = await getNamedAccounts();
  const { log } = deployments;

  log('----------------------------------------------------');
  log(`Updating frontend contract for network: ${network.name}`);

  // if hardhat, use localhost generated files
  const chosenNetwork = network.name === 'hardhat' ? 'localhost' : network.name;
  const sourceDeploymentFolder = `${SOURCE_DEPLOYMENT_FOLDER}/${chosenNetwork}`;

  // check if the source deployment folder exists
  if (!fs.existsSync(sourceDeploymentFolder)) {
    console.log(`❌ Deployment folder does not exist: ${sourceDeploymentFolder}. Aborting...`);
    return;
  }

  // check if there is any json contract file in the deployment folder
  const contractFiles = fs
    .readdirSync(sourceDeploymentFolder)
    .filter((file) => path.extname(file).toLowerCase() === '.json');
  if (contractFiles.length === 0) {
    console.log(
      `❌ No contract files found in deployment folder: ${sourceDeploymentFolder}. Aborting...`
    );
    return;
  }

  // create the target folder if it does not exist
  if (!fs.existsSync(TARGET_FRONTEND_FOLDER)) {
    console.log(`❌ Target folder does not exist: ${targetFrontendFolder}. Aborting...`);
    return;
  }

  // create target network folder if it does not exist
  const targetFrontendFolderNetwork = `${TARGET_FRONTEND_FOLDER}/${chosenNetwork}`;
  fs.existsSync(targetFrontendFolderNetwork) || fs.mkdirSync(targetFrontendFolderNetwork);

  // copy the contract files to the target folder
  contractFiles.forEach((file) => {
    const sourceFile = `${sourceDeploymentFolder}/${file}`;
    const targetFile = `${targetFrontendFolderNetwork}/${file}`;
    fs.copyFileSync(sourceFile, targetFile);
    console.log(` ✅ Copied ${sourceFile} to ${targetFile}`);
  });

  log(`Frontend deployment copied!`);
  log('----------------------------------------------------');
}

module.exports = updateFrontend;
module.exports.tags = ['all', 'frontend'];
