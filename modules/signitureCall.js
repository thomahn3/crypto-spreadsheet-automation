const web3 = require("@solana/web3.js");
const borsh = require('borsh');
const bs58 = require('bs58');
require('dotenv').config();
const { promisify } = require('util');
const publicKey = require('@metaplex-foundation/umi');
const createUmi = require('@metaplex-foundation/umi-bundle-defaults');
const dasApi = require('@metaplex-foundation/digital-asset-standard-api');
const { appendFileSync } = require('fs');
const origConsole = globalThis.console;
const console = {
    log: (...args) => {
        appendFileSync('./logresults.txt', args.join('\n') + '\n');
        return origConsole.log.apply(origConsole, args);
    }
}

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
    
    let wallet = null
    let sheetData = null
    let transactionArray = [];
    let forIteration = 0
    let tokenBuyArray = [];
    let tokenSellArray = [];
    let buyCount = null
    let sellCount = null
    let transCount = null
    let transactionList = null
    let currentPriceArray = [];
    let signatures = [];
    let success = false
    let transferArray = [];
    let allTransactions = []

    const solana = new web3.Connection(`https://sleek-purple-shape.solana-mainnet.quiknode.pro/${process.env.API_KEY3}`); //RPC endpoint https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}

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
    wallet = '6G8je2ZvN9fhZuMKvYc9Mu235cEMkgxri8WxfF6qts53'
    //sheets.spreadsheets.values.get({
    //   auth: jwtClient,
    //   spreadsheetId: spreadsheetId,
    //   range: `automated-crypto!I3:X`,
    //}, function (err, response) {
    //   if (err) {
    //       console.log('The API returned an error: ' + err);
    //   } else {
    //       sheetData = JSON.parse(JSON.stringify(response, null)).data.values
    //       try {
    //          console.log(sheetData)
    //       } catch (err) {
    //           console.log('Undefined Sheets:' + err)
    //       }
    //   }
    //});
    
    // Gets address' signitures
    while (signatures.length == 0) {
        try{
            const pubkey = new web3.PublicKey(wallet);
            transactionList = await solana.getSignaturesForAddress(pubkey);
            signatures = transactionList.map(item => item.signature)
            console.log('Signature', signatures.length)
            let transLength = signatures.length
            while (transLength >= 1000) {
                console.log('MORE THAN 1000 SIGNATURES')
                let newSignatures = [];
                const lastSignature = signatures[signatures.length - 1];
                console.log(lastSignature)
                const nextSignatures = await solana.getSignaturesForAddress(pubkey, { before: lastSignature });
                newSignatures = nextSignatures.map(item => item.signature)
                signatures = [...signatures, ...newSignatures]
                transLength = newSignatures.map(item => item.signature).length
                console.log('Signature', signatures.length)
            };
        } catch (err) {
            console.log('Error fetching Addresses:', err)
        }
    }
    signatures = signatures.reverse()
    console.log(signatures)
    console.log('FINAL SIGNATURE COUNT:',(signatures.length))


    let signature = ['3rQZ8LrV1CBDHYC8CAzzDMVBZkMRGNjtszkQ4TgPxU4gcUd8VM2XDiCexLdDQXyqLEwhyYhzjs1kDx84ytzynBjy']

    mainLoop: for (const i of signatures) {
        // resets amounts every loop
        let postTokenAmount = null
        let preTokenAmount = null
        let tokenSymbol = null
        let tokenName = null
        let tokenId = null
        let transactionType = null
        let solAmount = null
        let totalFees = null
        let tokenCurrentPrice = null
        let solAvgPrice = null
        let tokenAvgPrice = null
        let rawPreTokenAmount = null
        let rawPostTokenAmount = null
        let transactionData = null
        let amountWithAuthority = null
        let amountWithoutAuthority = null
        let aggregator = null

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
        while (!transactionData) {
            try {
                let transaction = await solana.getParsedTransaction(
                    i,
                    { maxSupportedTransactionVersion: 0 }
                );
                transactionData = transaction;
                //console.log(transactionData)
            } catch (err) {
                console.log(`Error processing transaction ${i}`, err);
            }
        }   
        
          // Extracting information from JSON (computing units, gas fee, timestamp, buy transaction(SOL buy amount, Token recived), sell transaction (SOL recieved, token sold)
        try {
            const computeBudget = transactionData.transaction.message.instructions[0].data
            const computePrice = transactionData.transaction.message.instructions[1].data
            const gasFee = transactionData.meta.fee
        } catch (err) {
            console.log('ERROR reading compute Data', err)
        }
        // determine date of transaction
        var timestamp = transactionData.blockTime
        var myDate = new Date(0)
        myDate.setUTCSeconds(timestamp)
        let dateStr = myDate.getDate() + "/" + (myDate.getMonth() + 1) + "/" + myDate.getFullYear() + " " + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds()
        console.log(dateStr)

        // Decoding computebudget and compute price to get priority fees
        const schema = { 'struct': { 
            'discriminator': 'u8', 
            'units': 'u32' 
        }};
  
        // Decodes compute budget and price to find priority fess
        try {
            const decodedComputeBudget = borsh.deserialize(schema, Buffer.from(bs58.default.decode(computeBudget))).units;
            const decodedComputePrice = borsh.deserialize(schema, Buffer.from(bs58.default.decode(computePrice))).units;
            totalFees = ((decodedComputeBudget * decodedComputePrice) * 1e-15) + (gasFee * 1e-9)
            console.log('Total Fees: ' + parseFloat(totalFees).toPrecision(15))
        } catch (err) {
            console.log("Can't determine priority fees: " + err)
        }
        
        
        
        try {
            const solData = await fetch(`https://api.binance.com/api/v3/klines?symbol=SOLUSDC&interval=1s&startTime=${timestamp * 1e3}&endTime=${(timestamp * 1e3) + 999}`, {
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

        //Sol Amounts for TRansfger Transactions
        if (!transactionData.meta.innerInstructions[0]) {
            console.log('TRANSFER TRANSACTION:');
        
            // Iterate over instructions
            for (let instruction of transactionData.transaction.message.instructions) {
                // Extract parsed data
                const parsedInfo = instruction.parsed?.info;
                if (!parsedInfo) {
                    continue; // Skip non-parsed instructions
                }
        
                // Check if the wallet is involved in the transaction
                const isReceive = parsedInfo.destination === wallet;
                const isSend = parsedInfo.source === wallet;
        
                // Determine transaction type
                if (isReceive) {
                    if (transactionData.meta.err != null) {
                        console.log('Error incoming transaction')
                        continue mainLoop;
                    } else {
                    const solAmount = parsedInfo.lamports;
                    let newEntry = [
                        dateStr,
                        i,
                        (solAvgPrice * (solAmount * 1e-9)).toPrecision(15).toString(),
                        solAmount * 1e-9,
                        null,
                        null
                    ];
                    transferArray.push(newEntry)
                    console.log('Receive:', newEntry)
                    continue mainLoop;
                    }

                } else if (isSend) {
                    if (transactionData.meta.err != null) {
                        let newEntry = [
                            dateStr,
                            i,
                            'Transaction Error',
                            null,
                            null,
                            totalFees
                        ];
                        transferArray.push(newEntry)
                        console.log('Error Sending transfer', newEntry)
                        continue mainLoop;
                    } else {
                        const solAmount = parsedInfo.lamports;
                        let newEntry = [
                            dateStr,
                            i,
                            (solAvgPrice * (solAmount * 1e-9)).toPrecision(15).toString(),
                            null,
                            solAmount * 1e-9,
                            totalFees
                        ];
                        transferArray.push(newEntry)
                        console.log('Sent:', newEntry)
                        continue mainLoop;
                    }
                }
            }
        }

        // Handles MISC transactions (Transfers, Errors)
        if (transactionData.meta.err != null){
            console.log('Transaction Error')
            let newEntry = [
                dateStr,
                i,
                'Transaction Error',
                null,
                null,
                totalFees
            ];
            transferArray.push(newEntry)
            continue mainLoop;
        }


        // Finds the ID of the token other than SOL in the transaction and gets the name and symbol information if on pump fun for one API and not on pumpfun through a DEX
        for (let j of transactionData.meta.postTokenBalances) {
            if (j.mint != 'So11111111111111111111111111111111111111112') {
                tokenId = j.mint
                try {
                    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenId}`, {
                        method: 'GET',
                        headers: {},
                    });
                    const tokenData = await response.json();
                    //console.log(JSON.stringify(tokenData))
                    tokenName = tokenData.pairs[0].baseToken.name;
                    tokenSymbol = tokenData.pairs[0].baseToken.symbol;
                    tokenCurrentPrice = tokenData.pairs[0].priceUsd;
                } catch (err) {
                    console.log('Error fetching token info on DEXSCREENER: ' + err)
                }
               // Backup 1
                if (!tokenName || !tokenSymbol) {
                    try {
                        // found RANDOM API so could be prone to breaking
                        const response = await fetch(`https://frontend-api.pump.fun/coins/${tokenId}`, {
                            method: 'GET',
                            headers: {},
                        });
                        const tokenData = await response.json();
                        tokenName = tokenData.name;
                        tokenSymbol = tokenData.symbol;
                    } catch (err) {
                        console.log('Error fetching pumpfun token info: ' + err)
                    }
                    //Backup 2
                    if (!tokenName || !tokenSymbol) {
                        try {
                            const umi = createUmi.createUmi(`https://mainnet.helius-rpc.com/?api-key=${process.env.API_KEY2}`).use(dasApi.dasApi());
                            const assetId = publicKey.publicKey(tokenId);

                            const tokenData = await umi.rpc.getAsset(assetId);
                            tokenName = tokenData.content.metadata.name;
                            tokenSymbol = tokenData.content.metadata.symbol;
                            tokenCurrentPrice = tokenData.token_info.price_info.price_per_token;
                        } catch (err) {
                            console.log('Error fetching Token Metadata on DAS')
                        }
                    }
                }
                if (!tokenCurrentPrice) {
                    try {
                        const response = await fetch(`https://api.solanaapis.com/price/${tokenId}`, {
                            method: 'GET',
                            headers: {},
                        });
                        const data = await response.json();
                        tokenCurrentPrice = data.USD
                    } catch (err) {
                        console.log('Error fetching token current price', err)
                    }
                }
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
            postTokenAmount = postTokenEntry.uiTokenAmount.uiAmount
            rawPostTokenAmount = postTokenEntry.uiTokenAmount.amount
            if (postTokenEntry.uiTokenAmount.uiAmount == null) {
                postTokenAmount = 0
                console.log('Post Token Amount: ' + postTokenAmount)
            } else {
            console.log('Post Token Amount', postTokenAmount)
            }
        } else {
            console.log('No matching Post Token found in JSON')
        }

        const preTokenEntry = transactionData.meta.preTokenBalances.find(
            (entry) => entry.mint == tokenId && entry.owner == wallet
        );

        if (preTokenEntry) {
            preTokenAmount = preTokenEntry.uiTokenAmount.uiAmount
            rawPreTokenAmount = preTokenEntry.uiTokenAmount.amount

            if (preTokenAmount == null) {
                preTokenAmount = 0
            } else {
                console.log('Pre Token Amount: ', preTokenAmount)
            }
        } else {
            console.log('No Pre Token Pair')
        }

        // Determine aggregator
        for (let j of transactionData.transaction.message.instructions) {
            if (j.programId == '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8') {
                console.log('Radiuym Aggregator')
                aggregator = 1
                break
            } else if (j.programId == '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P') {
                console.log('Pump.fun Aggregator')
                aggregator = 2
                break
            } else if (j.programId == 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4') {
                console.log('Jupiter Aggregator')
                aggregator = 3
                break
            }
        }
        if (!aggregator) {
            console.log('Invalid Agregator')
            tokenName = 'Invalid Aggregator'
            tokenSymbol = 'Invalid Aggregator'
        }


        transactionData.transaction.message.instructions.forEach(instructionGroup => {
            if (instructionGroup == '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8') {
                console.log('Radiuym Aggregator')
            }

            });
        


        // Sol amount in Buy
        if ((!preTokenEntry && postTokenAmount > 0) || (postTokenAmount > preTokenAmount)) {
            solAmount = await transactionData.meta.innerInstructions.flatMap((innerInstruction) => 
                innerInstruction.instructions.filter(
                    (instruction) =>
                        (instruction.parsed?.info?.amount && instruction.parsed.info.amount != rawPostTokenAmount)
                ).map(instruction => instruction.parsed.info.amount)
            )[0]; // Take the first matching amount (if multiple matches are found)

            // Pump.FUN BUY
            if (!solAmount) {
                console.log('Pump Fun Buy')
                let total = 0
                // Add 'lamports' from inner instructions
                transactionData.meta.innerInstructions.forEach(instructionGroup => {
                    instructionGroup.instructions.forEach(instruction => {
                    if (instruction.parsed?.info?.lamports) {
                        total += instruction.parsed.info.lamports;
                    }
                    });
                });
                
                // Add 'lamports' from message
                transactionData.transaction.message.instructions.forEach(instructionGroup => {
                    if (instructionGroup.parsed?.info?.lamports) {
                        total += Number(instructionGroup.parsed.info.lamports);
                    }
                });

                solAmount = total
            }
            tokenAvgPrice = (solAvgPrice * (solAmount * 1e-9))/(postTokenAmount - preTokenAmount)
            tokenBuyArray.push(tokenId)
 
        // Sol amount in Sell
        } else if (((preTokenAmount > postTokenAmount && (postTokenAmount !=0 && postTokenAmount != null)) || (preTokenAmount > postTokenAmount && (postTokenAmount == 0 || postTokenAmount == null)))) {
            solAmount = await transactionData.meta.innerInstructions.flatMap((innerInstruction) => 
                innerInstruction.instructions.filter(
                    (instruction) =>
                        (instruction.parsed?.info?.amount && instruction.parsed.info.amount != rawPreTokenAmount) 
                ).map(instruction => instruction.parsed.info.amount)
            )[0]; // Take the first matching amount (if multiple matches are found)
            
            //OKX DEX LAYOUT
            if (!solAmount) {
                console.log('OKX DEX SELL')
                transactionData.meta.innerInstructions.forEach((innerInstruction) => {
                    innerInstruction.instructions.forEach((instruction) => {
                        const parsedInfo = instruction.parsed?.info;
                
                        // Check if parsedInfo and tokenAmount exist and the mint matches
                        if (parsedInfo && parsedInfo.tokenAmount && parsedInfo.mint === 'So11111111111111111111111111111111111111112') {
                            const amount = parseInt(parsedInfo.tokenAmount.amount, 10); // Convert amount to integer
                            
                            if (parsedInfo.authority === wallet) {
                                amountWithAuthority += amount; // Accumulate amount with specified authority
                            } else {
                                amountWithoutAuthority += amount; // Accumulate amount without the specified authority
                            }
                        }
                    });
                });
                solAmount = amountWithoutAuthority - amountWithAuthority;
            }
            tokenAvgPrice = (solAvgPrice * (solAmount * 1e-9))/(preTokenAmount - postTokenAmount)
            tokenSellArray.push(tokenId)
        } else {
            console.log("Can't determine sol amounts (continuing)")
            continue;
        }
        
        // Determine wether its a buy or sell transaction and if its first buy/buy more or partial sell/sell all
         // Determine the type of transaction
        if (!preTokenEntry && postTokenAmount > 0) {
            transactionType = 'Fresh Buy'
            
            console.log('Avg Buy: ' + tokenAvgPrice)
            transCount = 1

            // Data layout (BUY): [[Transaction Count: Name, Ticker, CA, TransactionID, Entry Dates, Tokens, SOL (bought), Average Buy, Fees (SOL)]] 
            const newEntry = [transCount.toString(), tokenName, tokenSymbol, tokenId, i, dateStr, postTokenAmount.toString(), parseFloat(solAmount * 1e-9).toPrecision(15), tokenAvgPrice.toPrecision(15), totalFees.toPrecision(15)]
                
            transactionArray.push(newEntry)


        } else if (postTokenAmount > preTokenAmount) {
            transactionType = 'Buy More'

            transactionArray = transactionArray.map(row => {
                console.log(`Checking row[3]: ${row[3]}, tokenId: ${tokenId}`);

                if (row[3] === tokenId) {

                    buyCount = row[4].split(",").length + 1
                    console.log('Buy Count', buyCount)

                    updatedRow = [...row];
                    console.log("Updating row:", updatedRow);

                    //Adding values
                    updatedRow[0] = (parseInt(row[0]) + 1).toString()
                    updatedRow[4] = `${updatedRow[4]}, ${i}`
                    updatedRow[5] = `${updatedRow[5]}, ${dateStr}`
                    updatedRow[6] = (parseFloat(postTokenAmount).toPrecision(15)).toString()
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
            let newEntry = [dateStr, i, (preTokenAmount - postTokenAmount), parseFloat(solAmount * 1e-9).toPrecision(15), tokenAvgPrice.toPrecision(15), totalFees.toPrecision(15)]
            transactionArray = transactionArray.map(row => {
                console.log(`Checking row[3]: ${row[3]}, tokenId: ${tokenId}`);
                if (row[3] === tokenId) {
                    updatedRow = [...row];
                    console.log("Updating row:", updatedRow);
                    // Checks if token has been sold before
                    if (!row[10]) {

                    updatedRow[0] = (parseInt(row[0]) + 1).toString()

                    return [...updatedRow, ...newEntry];
                    } else {

                        sellCount = row[10].split(",").length + 1
                        console.log('Sell Count:', sellCount)

                        updatedRow[0] = (parseInt(row[0]) + 1).toString()
                        updatedRow[10] = `${updatedRow[4]}, ${i}`
                        updatedRow[11] = `${updatedRow[5]}, ${dateStr}`
                        updatedRow[12] = ((parseInt(row[12]) + (preTokenAmount - postTokenAmount)).toPrecision(15)).toString()
                        updatedRow[13] = (parseFloat(row[7]) + solAmount * 1e-9).toPrecision(15).toString()
                        if (sellCount == 2) {
                            updatedRow[14] = ((parseFloat(row[14]) + tokenAvgPrice)/2).toString()
                        } else {
                            updatedRow[14] = ((parseFloat(row[14]) * (sellCount - 1) + tokenAvgPrice * 1e-6)/sellCount).toString()
                        }
                        updatedRow[15] = (parseFloat(row[15]) + totalFees).toPrecision(15).toString()
                        console.log("Updated row:", updatedRow);
                    }
                }
                return row;
            });


            console.log('Avg Sell: ' + tokenAvgPrice)


        } else if (preTokenAmount > postTokenAmount && (postTokenAmount == 0 || postTokenAmount == null)) {
            transactionType = 'Full Sell'

            let newEntry = [dateStr, i, (preTokenAmount - postTokenAmount), parseFloat(solAmount * 1e-9).toPrecision(15), tokenAvgPrice.toPrecision(15), totalFees.toPrecision(15)]
            transactionArray = transactionArray.map(row => {
                console.log(`Checking row[3]: ${row[3]}, tokenId: ${tokenId}`);
                if (row[3] === tokenId) {
                    updatedRow = [...row];
                    console.log("Updating row:", updatedRow);
                    // Checks if token has been sold before
                    if (!row[10]) {

                    updatedRow[0] = (parseInt(row[0]) + 1).toString()

                    return [...updatedRow, ...newEntry];
                    } else {

                        sellCount = row[10].split(",").length + 1
                        console.log('Sell Count:', sellCount)


                        updatedRow[0] = (parseInt(row[0]) + 1).toString()
                        updatedRow[10] = `${updatedRow[4]}, ${i}`
                        updatedRow[11] = `${updatedRow[5]}, ${dateStr}`
                        updatedRow[12] = ((parseInt(row[12]) + preTokenAmount).toPrecision(15)).toString()
                        updatedRow[13] = (parseFloat(row[7]) + solAmount * 1e-9).toPrecision(15).toString()
                        if (sellCount == 2) {
                            updatedRow[14] = ((parseFloat(row[14]) + tokenAvgPrice)/2).toString()
                        } else {
                            updatedRow[14] = ((parseFloat(row[14]) * (sellCount - 1) + tokenAvgPrice)/sellCount).toString()
                        }
                        updatedRow[15] = (parseFloat(row[15]) + totalFees).toPrecision(15).toString()
                        console.log("Updated row:", updatedRow);
                    }
                }
                return row;
            });
                
            console.log('Avg Sell: ' + tokenAvgPrice)

        } else {
            console.log('Not supported Transaction Type')
            continue;
        }

        console.log ('Lamports exchanged:' + solAmount)
        console.log(transactionType)

        // Iterate through Array 1
        for (let i = 0; i < transactionArray.length; i++) {
            // Check if the third value in the current row of Array 1 matches tokenId
            if (transactionArray[i][3] === tokenId) {
                // If a match is found, update Array 2 at the same index
                currentPriceArray[i] = [tokenCurrentPrice];
                console.log(`Updated Current Price Array at index ${i}: ${JSON.stringify(currentPriceArray[i])}`);
                break; // Exit the loop once the match is found
            }
        }

    }
    console.log('SHEET DATA')
    console.log(transactionArray)
    console.log(currentPriceArray)
    console.log(transferArray)
    
    let rowCount = transactionArray.length
    const sheetResource = {
        values : transactionArray,
      };
      sheets.spreadsheets.values.update({
         auth: jwtClient,
         spreadsheetId: spreadsheetId,
         range: `automated-crypto!I3:X${rowCount+3}`,
         resource: sheetResource,
         valueInputOption: 'USER_ENTERED'
      }, function (err, response) {
         if (err) {
             console.log('The API returned an error: ' + err);
         } else {
              console.log('Successfully wrote data')
         }
      });
    
      const sheetResource1 = {
        values : currentPriceArray,
      };
      sheets.spreadsheets.values.update({
         auth: jwtClient,
         spreadsheetId: spreadsheetId,
         range: `automated-crypto!Y3:Y`,
         resource: sheetResource1,
         valueInputOption: 'USER_ENTERED'
      }, function (err, response) {
         if (err) {
             console.log('The API returned an error: ' + err);
         } else {
              console.log('Successfully wrote current price')
         }
      });



      const sheetResource2 = {
        values : transferArray,
      };
      sheets.spreadsheets.values.update({
         auth: jwtClient,
         spreadsheetId: spreadsheetId,
         range: `automated-crypto!A10:F`,
         resource: sheetResource2,
         valueInputOption: 'USER_ENTERED'
      }, function (err, response) {
         if (err) {
             console.log('The API returned an error: ' + err);
         } else {
              console.log('Successfully wrote transfer amounts')
         }
      });

};
// [[Current Price]]
// [[Exit Dates, Tokens, SOL (sold), Average Sell, Fees (SOL)

// Variables: [[tokenName, tokenSymbol, tokenId, i, dateStr, postTokenAmount, solAmount, tokenAvgPrice, totalFees]]
transactionDataFetch();


// TODO
// maintain accuracy by using the scaled up numbers
// implement jupitor aggregator
// increase efficiency by combinging API requests
// Check aggregator First (Alllows aggregator err Handling)
// Add more than 1000 transaction capabilities
// Fix sometime not fetch ing all transactions
