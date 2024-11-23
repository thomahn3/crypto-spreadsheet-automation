const web3 = require("@solana/web3.js");
require('dotenv').config();

(async () => {
  const solana = new web3.Connection(`https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}`);
    transaction = await solana.getParsedTransaction(
      "3P1mwUzqSNjUw8JXgiKFUW4E6MruCHRJPa7nBA9T8gwnvctM71GySS8Ko5xRDWEnpaqbuHFX3EmUKHRfAsdxL5t1",
      { maxSupportedTransactionVersion: 0 }
    )
  const data = JSON.parse(JSON.stringify(transaction, null, 2))
  console.log(JSON.stringify(transaction, null, 2))
})();