const web3 = require("@solana/web3.js");
const borsh = require('borsh');
const bs58 = require('bs58');
require('dotenv').config();

var { google } = require('googleapis');
let secretKey = require("../client_secret.json");
let spreadsheetId = '1NGAVBZwK75jsTkhsRIIN8fGYH6mBc8FbVkfGZ1VHKnM';
let sheets = google.sheets('v4');
let jwtClient = new google.auth.JWT(
       secretKey.client_email,
       null,
       secretKey.private_key,
       ['https://www.googleapis.com/auth/spreadsheets']);

// Autehntication Request
jwtClient.authorize(function (err, tokens) {
 if (err) {
   console.log(err);
   return;
 } else {
   console.log("Successfully connected to google API");
 }
});


async function transactionDataFetch() {
    // declare variables
    let tokenId = null
    let transactionType = null
    let postTokenAmount = null
    let preTokenAmount = null
    let solAmount = null
    let tokenSymbol = null
    let tokenName = null
    let wallet = null

    const solana = new web3.Connection(`https://api.mainnet-beta.solana.com`); //RPC endpoint https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}
    let sheetRange = `automated-crypto!K2:K`;

    try {
        const response = await sheets.spreadsheets.values.get({
            auth: jwtClient,
            spreadsheetId: spreadsheetId,
            range: 'automated-crypto!E3'
         });
            wallet = response.data.values[0][0]
            console.log('Wallet:' + wallet)
        } catch (err) {
            console.log('The API returned an error: ' + err);
        }
        
    sheets.spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: spreadsheetId,
        range: sheetRange
     }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
        } else {
            const data = JSON.parse(JSON.stringify(response, null))
            try {
                console.log(data.data.values)
            } catch (err) {
                console.log('Undefined Sheets:' + err)
            }
        }
     });


    // Gets address' signitures
    const pubkey = new web3.PublicKey(wallet);
    let transactionList = await solana.getSignaturesForAddress(pubkey);
    const signatures = transactionList.map(item => item.signature);
    console.log(signatures)

    let signature = '37a61dHbGXMgTpwRh9qs9X3qosj1kNZP3aAuHMRsgN1vZVQAGjqBgvqqq1Udno1MW1MLRmDbf6V3cpiwt4xKCRYo'

    transaction = await solana.getParsedTransaction(
      signature,
      { maxSupportedTransactionVersion: 0 }
    )
    const transactionData = JSON.parse(JSON.stringify(transaction, null, 2))

    // Extracting information from JSON (computing units, gas fee, timestamp, buy transaction(SOL buy amount, Token recived), sell transaction (SOL recieved, token sold)
    const computeBudget = transactionData.transaction.message.instructions[0].data
    const computePrice = transactionData.transaction.message.instructions[1].data
    const gasFee = transactionData.meta.fee

    // determine date of transaction
    var timestamp = transactionData.blockTime
    var d = new Date(0)
    d.setUTCSeconds(timestamp)
    console.log(d)

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
            tokenName = tokenData.pairs[0].baseToken.name;
            tokenSymbol = tokenData.pairs[0].baseToken.symbol;
            break
        } else {
        console.log('Failed to get token Id')
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
        postTokenAmount = postTokenEntry.uiTokenAmount.amount
        console.log('Post Token Amount', postTokenAmount)
    } else {
        console.log('No matching Post Token found in JSON')
    }

    const preTokenEntry = transactionData.meta.preTokenBalances.find(
        (entry) => entry.mint == tokenId && entry.owner == wallet
    );

    if (preTokenEntry) {
        preTokenAmount = preTokenEntry.uiTokenAmount.amount
        console.log('Pre Token Amount', preTokenAmount)
    } else {
        console.log('No mathcing Pre Pairs')
    }

    // Decoding computebudget and compute price to get priority fees
    const schema = { 'struct': { 
      'discriminator': 'u8', 
      'units': 'u32' 
    } };

    const decodedComputeBudget = borsh.deserialize(schema, Buffer.from(bs58.default.decode(computeBudget))).units;
    const decodedComputePrice = borsh.deserialize(schema, Buffer.from(bs58.default.decode(computePrice))).units;
    const totalFees = ((decodedComputeBudget * decodedComputePrice) * 1e-15) + (gasFee * 1e-9)  
    console.log('Total Fees: ' + parseFloat(totalFees).toPrecision(15))
    
    // Sol amount in Buy
    if ((!preTokenEntry && postTokenAmount > 0) || (postTokenAmount > preTokenAmount)) {
        solAmount = transactionData.meta.innerInstructions.flatMap((innerInstruction) => 
            innerInstruction.instructions.filter(
                (instruction) =>
                    instruction.parsed?.info?.amount && instruction.parsed.info.amount != postTokenAmount
            ).map(instruction => instruction.parsed.info.amount)
        )[0]; // Take the first matching amount (if multiple matches are found)
    // Sol amount in Sell
    } else if (((preTokenAmount > postTokenAmount && (postTokenAmount !=0 && postTokenAmount != null)) || (preTokenAmount > postTokenAmount && (postTokenAmount == 0 || postTokenAmount == null)))) {
        solAmount = transactionData.meta.innerInstructions.flatMap((innerInstruction) => 
            innerInstruction.instructions.filter(
                (instruction) =>
                    instruction.parsed?.info?.amount && instruction.parsed.info.amount != preTokenAmount
            ).map(instruction => instruction.parsed.info.amount)
        )[0]; // Take the first matching amount (if multiple matches are found)
    } else {
        console.log("Can't determine sol amounts")
    }

     // Determine the type of transaction
     if (!preTokenEntry && postTokenAmount > 0) {
        transactionType = 'Fresh Buy'

    } else if (postTokenAmount > preTokenAmount) {
        transactionType = 'Buy More'
    } else if (preTokenAmount > postTokenAmount && (postTokenAmount !=0 && postTokenAmount != null)) {
        transactionType = 'Partial Sell'
    } else if (preTokenAmount > postTokenAmount && (postTokenAmount == 0 || postTokenAmount == null)) {
        transactionType = 'Full Sell'
    } else {
        console.log('Not supported Transaction Type')
    }
    console.log ('Lamports exchanged:' + solAmount)
    console.log(transactionType)

    //for (let i of signatures) {
    //    transaction = await solana.getParsedTransaction(
    //        i,
    //        { maxSupportedTransactionVersion: 0 }
    //      )
    //      const transactionData = JSON.parse(JSON.stringify(transaction, null, 2))
    //}
};

transactionDataFetch()
