const { moveBlocks } = require('../utils/move-blocks');

async function mine() {
  if (!network.live) {
    await moveBlocks(2, 1000);
  }
}

mine()
  .then(() => {
    console.log('Mine done! 🏁');
  })
  .catch((err) => {
    console.log(err);
  });
