const web3 = require("@solana/web3.js");
require('dotenv').config();

(async () => {
  const solana = new web3.Connection(`https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}`);
    transaction = await solana.getParsedTransaction(
      "5viJgMht2AGC1V153oamFHvCbn9qoTgc4oaBqsVFdmuFwfkmbHWxBXoRwfrgJFSYqyeGnRcWT2WvbhWpz8V3Cijp",
      { maxSupportedTransactionVersion: 0 }
    )
  const data = JSON.parse(JSON.stringify(transaction, null, 2))
  console.log(JSON.stringify(transaction, null, 2))
})();