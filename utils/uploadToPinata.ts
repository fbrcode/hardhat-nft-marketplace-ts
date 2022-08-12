// use pinata sdk: @pinata/sdk
const pinataSdk = require('@pinata/sdk');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// use log instead of console.log
const { deployments } = require('hardhat');
const { log } = deployments;

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = pinataSdk(pinataApiKey, pinataApiSecret);

async function storeImages(imagesFilePath) {
  const fullImagesPath = path.resolve(__dirname, imagesFilePath);
  const files = fs.readdirSync(fullImagesPath);
  const pngFiles = files.filter((f) => f.endsWith('.png'));
  // log(`Found ${JSON.stringify(pngFiles, null, 2)} images`);
  let responses = [];
  log('Uploading images to Pinata IPFS...');
  for (const file of pngFiles) {
    // log(`Uploading ${file}...`);
    const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${file}`);
    try {
      const response = await pinata.pinFileToIPFS(readableStreamForFile);
      log(`Uploaded ${file} to Pinata IPFS: ${response.IpfsHash}`);
      responses.push({ ...response, fileName: file });
    } catch (error) {
      // console.log(error);
      throw error;
    }
  }
  log('All images uploaded to Pinata IPFS!');
  // log(`Responses: ${JSON.stringify(responses, null, 2)}`);
  // log(`Files: ${JSON.stringify(pngFiles, null, 2)}`);
  return responses;
}

async function storeTokenUriMetadata(metadata) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (error) {
    // console.log(error);
    throw error;
  }
}

module.exports = {
  storeImages,
  storeTokenUriMetadata,
};
