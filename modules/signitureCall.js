const web3 = require("@solana/web3.js");
const borsh = require('borsh');
const bs58 = require('bs58');
require('dotenv').config();

async function transactionData() {
  const solana = new web3.Connection(`https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}`);
  

    transaction = await solana.getParsedTransaction(
      "37a61dHbGXMgTpwRh9qs9X3qosj1kNZP3aAuHMRsgN1vZVQAGjqBgvqqq1Udno1MW1MLRmDbf6V3cpiwt4xKCRYo",
      { maxSupportedTransactionVersion: 0 }
    )
  data = JSON.parse(JSON.stringify(transaction, null, 2))
  //console.log(JSON.stringify(transaction, null, 2))

  // Extracting information from JSON (computing units, gas fee, timestamp, buy transaction(SOL buy amount, Token recived), sell transaction (SOL recieved, token sold)
  var computeBudget = data.transaction.message.instructions[0].data
  var computePrice = data.transaction.message.instructions[1].data
  var gasFee = data.meta.fee
  var timestamp = data.blockTime

  // Determine wether its a buy or sell transaction and if its first buy/buy more or partial sell/sell all
  boughtToken = data.meta.innerInstructions[0].instructions[0].parsed.info.mint;
  transactionType = data.meta.innerInstructions[0].instructions[0].parsed.type;
  // If minted token is not So11111111111111111111111111111111111111112 AND type: "getAccountDataSize" (issue is what if sol isn't involved and its USDC or smthn)
  // Only 2  "mint": "token", "owner": "wallet" in pre and post balances (if amountPostBalance > amountPreBalance then its a BUY)
  if (boughtToken != 'So11111111111111111111111111111111111111112' && transactionType == 'getAccountDataSize') {
    
  };


  // Decoding computebudget and cimpute price to get priority fees
  const schema = { 'struct': { 
    'discriminator': 'u8', 
    'units': 'u32' 
  } };
  
  const decodedComputeBudget = borsh.deserialize(schema, Buffer.from(bs58.default.decode(computeBudget))).units;
  const decodedComputePrice = borsh.deserialize(schema, Buffer.from(bs58.default.decode(computePrice))).units;
  const totalFees = ((decodedComputeBudget * decodedComputePrice) * 1e-15) + (gasFee * 1e-9)

  console.log('Total Fees: ' + parseFloat(totalFees).toPrecision(15))
};


transactionData()
