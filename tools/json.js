const web3 = require("@solana/web3.js");
require('dotenv').config();

(async () => {
  const solana = new web3.Connection(`https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}`);
    transaction = await solana.getParsedTransaction(
      "4MMff4gHwbogQYnqbNZqZA2VjjbXXnAxVu41cFwSU2d4W1xeNaeyiS7ziZeHWpmhFKkXzJD6KNLZq18AZ2N5Z26c",
      { maxSupportedTransactionVersion: 0 }
    )
  const data = JSON.parse(JSON.stringify(transaction, null, 2))
  console.log(JSON.stringify(transaction, null, 2))
})();