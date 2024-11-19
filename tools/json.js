const web3 = require("@solana/web3.js");
const borsh = require('borsh');
const bs58 = require('bs58');
require('dotenv').config();

(async () => {
  const solana = new web3.Connection(`https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}`);
    transaction = await solana.getParsedTransaction(
      "4FoWib253F7wmRx7kVVpPoqDA1DyAFZUgPYNQYjbzFTd6hcmQ15yPwT2Cg22dkydE6jNVTiQDUsaqzFLnWXUiGnc",
      { maxSupportedTransactionVersion: 0 }
    )
  data = JSON.parse(JSON.stringify(transaction, null, 2))
  console.log(JSON.stringify(transaction, null, 2))
})();