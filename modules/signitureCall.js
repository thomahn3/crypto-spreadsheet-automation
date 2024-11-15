const web3 = require("@solana/web3.js");
const borsh = require('borsh');
const bs58 = require('bs58');
require('dotenv').config();

async function transactionDataFetch(wallet) {
    // declare variables
    let tokenId = null
    let transactionType = null

    const solana = new web3.Connection(`https://api.mainnet-beta.solana.com`); //RPC endpoint https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}
  

    transaction = await solana.getParsedTransaction(
      "57oMGi1qoHynV6a9cXgyNuHaVTgLCPny5eEi255m793FyTAiZQs2R4B7QdWrgr6CCeo2G6eGxpFUqiEDYJ5NAK3E",
      { maxSupportedTransactionVersion: 0 }
    )
    const transactionData = JSON.parse(JSON.stringify(transaction, null, 2))

    // Extracting information from JSON (computing units, gas fee, timestamp, buy transaction(SOL buy amount, Token recived), sell transaction (SOL recieved, token sold)
    const computeBudget = transactionData.transaction.message.instructions[0].data
    const computePrice = transactionData.transaction.message.instructions[1].data
    const gasFee = transactionData.meta.fee
    const timestamp = transactionData.blockTime 
    // Determine wether its a buy or sell transaction and if its first buy/buy more or partial sell/sell all
    // const transactionType = transactionData.meta.innerInstructions[0].instructions[0].parsed.type;
    // Finds the ID of the token other than SOL in the transaction and gets the name and symbol information
    for (let i of transactionData.meta.postTokenBalances) {
      if (i.mint != 'So11111111111111111111111111111111111111112') {
          tokenId = i.mint
          const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenId}`, {
              method: 'GET',
              headers: {},
            });
            const tokenData = await response.json();
            const tokenName = tokenData.pairs[0].baseToken.name;
            const tokenSymbol = tokenData.pairs[0].baseToken.symbol;
            console.log(tokenName)
            console.log(tokenSymbol)
            break
      }
    }

    // If minted token is not So11111111111111111111111111111111111111112 AND type: "getAccountDataSize" (issue is what if sol isn't involved and its USDC or smthn)
    // Only 2  "mint": "token", "owner": "wallet" in pre and post balances (if amountPostBalance > amountPreBalance then its a BUY)
    // if innerInstructions = [] then its an account-account transfer 
    // if post > pre but pre = 0 (no pre and token and wallet entry) then it is a buy if post > pre but pre != 0 then buy more if post < pre but post = 0 then sell all if post < pre but post != 0 then sell
  
    // Determine token amounts before and after transaction
    const postTokenEntry = transactionData.meta.postTokenBalances.find(
        (entry) => entry.mint == tokenId && entry.owner == wallet
    );
    if (postTokenEntry) {
        const postTokenAmount = postTokenEntry.uiTokenAmount.uiAmount
        console.log('Post Token Amount', postTokenAmount)
    } else {
        console.log('No matching Post Token found in JSON')
    }

    const preTokenEntry = transactionData.meta.postTokenBalances.find(
        (entry) => entry.mint == tokenId && entry.owner == wallet
    );

    if (preTokenEntry) {
        const preTokenAmount = preTokenEntry.uiTokenAmount.uiAmount
        console.log('Pre Token Amount', preTokenAmount)
    } else {
        console.log('No mathcing Post Pairs')
    }

    // Determine the type of transaction
    if (!preTokenEntry && postTokenAmount > 0) {
        transactionType = 'Fresh Buy'
    } else if (postTokenAmount > preTokenAmount) {
        transactionType = 'Buy More'
    } else if (preTokenAmount > PostTokenAmount && PostTokenAmount !=0) {
        transactionType = 'Partial Sell'
    } else if (preTokenAmount > PostTokenAmount && PostTokenAmount == 0){
        transactionType = 'Full Sell'
    } else {
        console.log('Not supported Transaction Type')
    }

    console.log(transactionType)

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

const wallet = '2bXjC7XSvxh48prZqJdZqCT8Fp9KGeGnGBkPGnaR2vNp'
transactionDataFetch(wallet)
