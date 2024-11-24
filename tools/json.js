const web3 = require("@solana/web3.js");
require('dotenv').config();

(async () => {
  const solana = new web3.Connection(`https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}`);
    transaction = await solana.getParsedTransaction(
      "4BNTF5u4oxZbjwaKetrZUWF4HivwTX3WcCYwPBuj3zeAuWNE195esVXfh4tNhbG4K7WDSmE26ZL2kZwtibEhGKj4",
      { maxSupportedTransactionVersion: 0 }
    )
  const data = JSON.parse(JSON.stringify(transaction, null, 2))
  console.log(JSON.stringify(transaction, null, 2))
})();