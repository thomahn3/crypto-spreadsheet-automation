const web3 = require("@solana/web3.js");
require('dotenv').config();

(async () => {
  const solana = new web3.Connection(`https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}`);
    transaction = await solana.getParsedTransaction(
      "3rQZ8LrV1CBDHYC8CAzzDMVBZkMRGNjtszkQ4TgPxU4gcUd8VM2XDiCexLdDQXyqLEwhyYhzjs1kDx84ytzynBjy",
      { maxSupportedTransactionVersion: 0 }
    )
  const data = JSON.parse(JSON.stringify(transaction, null, 2))
  console.log(JSON.stringify(transaction, null, 2))
})();