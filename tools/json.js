const web3 = require("@solana/web3.js");
require('dotenv').config();

(async () => {
  const solana = new web3.Connection(`https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}`);
    transaction = await solana.getParsedTransaction(
      "4tBgdSYCBNrv7E2sTuBXcfijhFZeqLFE2MGw3vYi5NZuG6hM1t5Chanhkxwqc9JwB5SbW9cS8TFGtHVYP5Yvn82Z",
      { maxSupportedTransactionVersion: 0 }
    )
  const data = JSON.parse(JSON.stringify(transaction, null, 2))
  console.log(JSON.stringify(transaction, null, 2))
})();