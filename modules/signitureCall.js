const web3 = require("@solana/web3.js");
const borsh = require('borsh');
const bs58 = require('bs58');
require('dotenv').config();
const { promisify } = require('util');

var { google } = require('googleapis');
let secretKey = require("../client_secret.json");
let spreadsheetId = '1NGAVBZwK75jsTkhsRIIN8fGYH6mBc8FbVkfGZ1VHKnM';
let sheets = google.sheets('v4');
let jwtClient = new google.auth.JWT(
       secretKey.client_email,
       null,
       secretKey.private_key,
       ['https://www.googleapis.com/auth/spreadsheets']);
sheets.spreadsheets.values.get = promisify(sheets.spreadsheets.values.get);

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
    let solAmount = null
    let tokenSymbol = null
    let tokenName = null
    let wallet = null
    let tokenCurrentPrice = null
    let solAvgPrice = null
    let tokenAvgPrice = null
    let sheetData = null
    let transactionArray = [];
    let totalFees = null
    let forIteration = 0
    let caData = null
    let transactionData = null
    let tokenBuyArray = [];
    let tokenSellArray = [];
    let buyCount = 1
    let transCount = null

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
        range: `automated-crypto!I3:X`,
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
    const signatures = transactionList.map(item => item.signature).reverse();
    //console.log(signatures)

    let signature = ['5viJgMht2AGC1V153oamFHvCbn9qoTgc4oaBqsVFdmuFwfkmbHWxBXoRwfrgJFSYqyeGnRcWT2WvbhWpz8V3Cijp']

    for (const i of signatures) {
        // resets amounts every loop
        let postTokenAmount = null
        let preTokenAmount = null

        forIteration += 1
        console.log(forIteration)
        console.log(i)
    
        //sheets.spreadsheets.values.get({
        //    auth: jwtClient,
        //    spreadsheetId: spreadsheetId,
        //    range: `automated-crypto!L3:L`,
        // }, async function (err, response) {
        //    if (err) {
        //        console.log('The API returned an error: ' + err);
        //    } else {
        //        caData = await JSON.parse(JSON.stringify(response, null)).data.values
        //        try {
        //            console.log("All CA's: " + caData)
        //        } catch (err) {
        //            console.log('Undefined Sheets:' + err)
        //        }
        //    }
        //});

        try {
            transaction = await solana.getParsedTransaction(
                i,
                { maxSupportedTransactionVersion: 0 }
            )
            transactionData = JSON.parse(JSON.stringify(transaction, null, 2))
        } catch (err) {
            console.error(`Error processing transaction ${i}:`, err);
        }
        
        if (transactionData.meta.innerInstructions[0] == undefined) {
            console.log('Transfer Transaction (Skipping)');
            continue;
        } 

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
            solAvgPrice = await (JSON.parse(solPriceList[0][1]) + JSON.parse(solPriceList[0][4]))/2
            console.log('Sol price at time of transaction: ' + solAvgPrice)
        } catch (err) {
            console.log('Error fetching sol price: ' + err)
        }

        // Determine wether its a buy or sell transaction and if its first buy/buy more or partial sell/sell all
        // const transactionType = transactionData.meta.innerInstructions[0].instructions[0].parsed.type;
        // Finds the ID of the token other than SOL in the transaction and gets the name and symbol information
        for (let i of transactionData.meta.postTokenBalances) {
            if (i.mint != 'So11111111111111111111111111111111111111112') {
                tokenId = i.mint
                try {
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
                } catch (err) {
                    console.log('Error fetching token info ' + err)
                }
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
            postTokenAmount = await postTokenEntry.uiTokenAmount.amount
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
            preTokenAmount = await preTokenEntry.uiTokenAmount.amount
            if (preTokenAmount == null) {
                preTokenAmount = 0
            } else {
                console.log('Pre Token Amount: ', preTokenEntry.uiTokenAmount.uiAmount)
            }
        } else {
            console.log('No Pre Token Pair')
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
            solAmount = await transactionData.meta.innerInstructions.flatMap((innerInstruction) => 
                innerInstruction.instructions.filter(
                    (instruction) =>
                        instruction.parsed?.info?.amount && instruction.parsed.info.amount != postTokenAmount
                ).map(instruction => instruction.parsed.info.amount)
            )[0]; // Take the first matching amount (if multiple matches are found)
            tokenAvgPrice = (solAvgPrice * (solAmount * 1e-9))/((postTokenAmount - preTokenAmount) * 1e-6)
            tokenBuyArray.push(tokenId)

        // Sol amount in Sell
        } else if (((preTokenAmount > postTokenAmount && (postTokenAmount !=0 && postTokenAmount != null)) || (preTokenAmount > postTokenAmount && (postTokenAmount == 0 || postTokenAmount == null)))) {
            solAmount = await transactionData.meta.innerInstructions.flatMap((innerInstruction) => 
                innerInstruction.instructions.filter(
                    (instruction) =>
                        instruction.parsed?.info?.amount && instruction.parsed.info.amount != preTokenAmount
                ).map(instruction => instruction.parsed.info.amount)
            )[0]; // Take the first matching amount (if multiple matches are found)
            tokenAvgPrice = (solAvgPrice * (solAmount * 1e-9))/((preTokenAmount - postTokenAmount) * 1e-6)
            tokenSellArray.push(tokenId)
        } else {
            console.log("Can't determine sol amounts (continuing)")
            continue;
        }

        //
        

         // Determine the type of transaction
         if (!preTokenEntry && postTokenAmount > 0) {
            transactionType = 'Fresh Buy'
            
            console.log('Avg Buy: ' + tokenAvgPrice)
            transCount = 1

            const newEntry = [transCount.toString(), tokenName, tokenSymbol, tokenId, i, dateStr, parseFloat(postTokenAmount * 1e-6).toPrecision(15), parseFloat(solAmount * 1e-9).toPrecision(15), tokenAvgPrice.toPrecision(15), totalFees.toPrecision(15)]
                
            transactionArray.push(newEntry)


        } else if (postTokenAmount > preTokenAmount) {
            transactionType = 'Buy More'

            transactionArray = transactionArray.map(row => {
                console.log(`Checking row[3]: ${row[3]}, tokenId: ${tokenId}`);

                if (row[3] === tokenId) {

                    buyCount = row[3].split(",").length + 1
                    console.log('Buy Count', buyCount)

                    updatedRow = [...row];
                    console.log("Updating row:", updatedRow);

                    //Adding values
                    updatedRow[0] = `${transCount+ 1}`
                    updatedRow[4] = `${updatedRow[4]}, ${i}`
                    updatedRow[5] = `${updatedRow[5]}, ${dateStr}`
                    updatedRow[6] = (parseFloat(postTokenAmount * 1e-6).toPrecision(15)).toString()
                    updatedRow[7] = (parseFloat(row[7]) + solAmount * 1e-9).toPrecision(15).toString()
                    if (buyCount == 2) {
                        updatedRow[8] = ((parseFloat(row[8]) + tokenAvgPrice)/2).toString()
                    } else {
                        updatedRow[8] = ((parseFloat(row[8]) * (buyCount - 1) + tokenAvgPrice * 1e-6)/buyCount).toString()
                    }
                    updatedRow[9] = (parseFloat(row[9]) + totalFees).toPrecision(15).toString()
                    console.log("Updated row:", updatedRow);
                    //console.log("After updates:", transactionArray);
                    return updatedRow
                }
                return row
            });

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
    console.log(transactionArray)
    
    const rowCount = transactionArray.length

    const sheetResource = {
        values : transactionArray,
      };
      sheets.spreadsheets.values.update({
         auth: jwtClient,
         spreadsheetId: spreadsheetId,
         range: `automated-crypto!I3:R${rowCount+3}`,
         resource: sheetResource,
         valueInputOption: 'USER_ENTERED'
      }, function (err, response) {
         if (err) {
             console.log('The API returned an error: ' + err);
         } else {
              console.log('Successfully wrote content')
         }
      });

};
// [[Current Price]]
// [[Exit Dates, Tokens, SOL (sold), Average Sell, Fees (SOL)
// Data layout (BUY): [[Name, Ticker, CA, TransactionID, Entry Dates, Tokens, SOL (bought), Average Buy, Fees (SOL)]] 
// Variables: [[tokenName, tokenSymbol, tokenId, i, dateStr, postTokenAmount, solAmount, tokenAvgPrice, totalFees]]
transactionDataFetch()
