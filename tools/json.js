const web3 = require("@solana/web3.js");
require('dotenv').config();

(async () => {
  const solana = new web3.Connection(`https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}`);
    transaction = await solana.getParsedTransaction(
      "qSVhUEcpDCTg5ii9DCjfukwRyecBYZGQ7qjmg19ozqQMgr9Ui35tjJofW5Ak2obT7dTybpndPHPBQZRTUecQWZ5",
      { maxSupportedTransactionVersion: 0 }
    )
  const data = JSON.parse(JSON.stringify(transaction, null, 2))
  console.log(JSON.stringify(transaction, null, 2))
})();