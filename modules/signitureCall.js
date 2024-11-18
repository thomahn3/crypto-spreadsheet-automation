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
    let tokenCurrentPrice = null
    let solAvgPrice = null
    let tokenAvgPrice = null
    let sheetData = null
    let updatedSheetData = [];
    let totalFees = null
    let forIteration = 0

    const solana = new web3.Connection(`https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}`); //RPC endpoint https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}

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
        range: `automated-crypto!J3:S`,
     }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
        } else {
            sheetData = JSON.parse(JSON.stringify(response, null)).data.values
            try {
                console.log(sheetData)
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

    let signature = ['41gsqkFHw51Lxk5N7L3QPCLrQRYkGJKhhfcbBa2SS7PdDtmcXz7vUfkdegXKW7K6v1nvj2jmt45UJ6p7nDh4UhLv']

    for (let i of signatures) {
        forIteration += 1
        console.log(forIteration)

        transaction = await solana.getParsedTransaction(
            i,
            { maxSupportedTransactionVersion: 0 }
          )
          const transactionData = JSON.parse(JSON.stringify(transaction, null, 2))

          // Extracting information from JSON (computing units, gas fee, timestamp, buy transaction(SOL buy amount, Token recived), sell transaction (SOL recieved, token sold)
        const computeBudget = transactionData.transaction.message.instructions[0].data
        const computePrice = transactionData.transaction.message.instructions[1].data
        const gasFee = transactionData.meta.fee

        // determine date of transaction
        var timestamp = transactionData.blockTime
        var myDate = new Date(0)
        myDate.setUTCSeconds(timestamp)
        let dateStr = myDate.getDate() + "/" + (myDate.getMonth() + 1) + "/" + myDate.getFullYear() + " " + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds()
        console.log(dateStr)
        
        try {
            const solData = await fetch(`https://api.binance.com/api/v3/klines?symbol=SOLUSDC&interval=1s&startTime=${timestamp * 1e3}&endTime=${(timestamp *1e3 )+999}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
        });
            const solPriceList = await solData.json();
            solAvgPrice = (JSON.parse(solPriceList[0][1]) + JSON.parse(solPriceList[0][4]))/2
            console.log('Sol price at time of transaction: ' + solAvgPrice)
            tokenAvgPrice = solAvgPrice * (solAmount * 1e-9)
        } catch (err) {
            console.log('Error fetching sol price: ' + err)
        }

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
                //console.log(JSON.stringify(tokenData))
                tokenName = tokenData.pairs[0].baseToken.name;
                tokenSymbol = tokenData.pairs[0].baseToken.symbol;
                tokenCurrentPrice = tokenData.pairs[0].priceUsd
                console.log('Token Name: ' + tokenName)
                console.log('Token Symbol: ' + tokenSymbol)
                console.log('Token Current Price: ' + tokenCurrentPrice)
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
            postTokenAmount = postTokenEntry.uiTokenAmount.amount
            if (postTokenEntry.uiTokenAmount.uiAmount == null) {
                postTokenAmount = 0
                console.log('Post Token Amount: ' + postTokenAmount)
            } else {
            console.log('Post Token Amount', postTokenEntry.uiTokenAmount.uiAmount)
            }
        } else {
            console.log('No matching Post Token found in JSON')
        }

        const preTokenEntry = transactionData.meta.preTokenBalances.find(
            (entry) => entry.mint == tokenId && entry.owner == wallet
        );

        if (preTokenEntry) {
            preTokenAmount = preTokenEntry.uiTokenAmount.amount
            console.log('Pre Token Amount: ', preTokenEntry.uiTokenAmount.uiAmount)
        } else {
            preTokenAmount = 0
            console.log('Pre Token Amount: ', preTokenAmount)
        }

        // Decoding computebudget and compute price to get priority fees
        const schema = { 'struct': { 
          'discriminator': 'u8', 
          'units': 'u32' 
        } };

        // Decodes compute budget and price to find priority fess
        try {
            const decodedComputeBudget = borsh.deserialize(schema, Buffer.from(bs58.default.decode(computeBudget))).units;
            const decodedComputePrice = borsh.deserialize(schema, Buffer.from(bs58.default.decode(computePrice))).units;
            totalFees = ((decodedComputeBudget * decodedComputePrice) * 1e-15) + (gasFee * 1e-9)  
            console.log('Total Fees: ' + parseFloat(totalFees).toPrecision(15))
        } catch (err) {
            console.log("Can't determine priority fees: " + err)
            continue;
        }

        // Sol amount in Buy
        if ((!preTokenEntry && postTokenAmount > 0) || (postTokenAmount > preTokenAmount)) {
            solAmount = transactionData.meta.innerInstructions.flatMap((innerInstruction) => 
                innerInstruction.instructions.filter(
                    (instruction) =>
                        instruction.parsed?.info?.amount && instruction.parsed.info.amount != postTokenAmount
                ).map(instruction => instruction.parsed.info.amount)
            )[0]; // Take the first matching amount (if multiple matches are found)

            tokenAvgPrice = (solAvgPrice * (solAmount * 1e-9))/((postTokenAmount - preTokenAmount) * 1e-6)

        // Sol amount in Sell
        } else if (((preTokenAmount > postTokenAmount && (postTokenAmount !=0 && postTokenAmount != null)) || (preTokenAmount > postTokenAmount && (postTokenAmount == 0 || postTokenAmount == null)))) {
            solAmount = transactionData.meta.innerInstructions.flatMap((innerInstruction) => 
                innerInstruction.instructions.filter(
                    (instruction) =>
                        instruction.parsed?.info?.amount && instruction.parsed.info.amount != preTokenAmount
                ).map(instruction => instruction.parsed.info.amount)
            )[0]; // Take the first matching amount (if multiple matches are found)
            tokenAvgPrice = (solAvgPrice * (solAmount * 1e-9))/((preTokenAmount - postTokenAmount) * 1e-6)
        } else {
            console.log("Can't determine sol amounts (continuing)")
            continue;
        }

        //
        

         // Determine the type of transaction
         if (!preTokenEntry && postTokenAmount > 0) {
            transactionType = 'Fresh Buy'
            
            console.log('Avg Buy: ' + tokenAvgPrice)
            const newEntry = [tokenName, tokenSymbol, tokenId, i, dateStr, postTokenAmount, parseFloat(solAmount * 1e-9).toPrecision(15), tokenAvgPrice.toPrecision(15), totalFees.toPrecision(15)]
            updatedSheetData.push(newEntry)


        } else if (postTokenAmount > preTokenAmount) {
            transactionType = 'Buy More'
            
            console.log('Avg Buy: ' + tokenAvgPrice)

        } else if (preTokenAmount > postTokenAmount && (postTokenAmount !=0 && postTokenAmount != null)) {
            transactionType = 'Partial Sell'
            
            console.log('Avg Sell: ' + tokenAvgPrice)

        } else if (preTokenAmount > postTokenAmount && (postTokenAmount == 0 || postTokenAmount == null)) {
            transactionType = 'Full Sell'

            console.log('Avg Sell: ' + tokenAvgPrice)

        } else {
            console.log('Not supported Transaction Type')
            continue;
        }
        console.log ('Lamports exchanged:' + solAmount)
        console.log(transactionType)

        


    }
    console.log('SHEET DATA')
    console.log(updatedSheetData)

};
// [[Current Price]]
// [[Exit Dates, Tokens, SOL (sold), Average Sell, Fees (SOL)
// Data layout (BUY): [[Name, Ticker, CA, TransactionID, Entry Dates, Tokens, SOL (bought), Average Buy, Fees (SOL)]] 
// Variables: [[tokenName, tokenSymbol, tokenId, i, dateStr, postTokenAmount, solAmount, tokenAvgPrice, totalFees]]
transactionDataFetch()
