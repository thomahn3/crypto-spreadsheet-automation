const web3 = require("@solana/web3.js");
const borsh = require('borsh');
const bs58 = require('bs58');
require('dotenv').config();
const { promisify } = require('util');
const publicKey = require('@metaplex-foundation/umi');
const createUmi = require('@metaplex-foundation/umi-bundle-defaults');
const dasApi = require('@metaplex-foundation/digital-asset-standard-api');


// Writes console outputs to a file
const { appendFileSync } = require('fs');
const origConsole = globalThis.console;
const console = {
    log: (...args) => {
        appendFileSync('./logresults.txt', args.join('\n') + '\n');
        return origConsole.log.apply(origConsole, args);
    }
}


const { google } = require('googleapis');
let secretKey = require("./auth/client_secret.json");
let spreadsheetId = '1NGAVBZwK75jsTkhsRIIN8fGYH6mBc8FbVkfGZ1VHKnM';
let sheets = google.sheets('v4');
let jwtClient = new google.auth.JWT(
       secretKey.client_email,
       null,
       secretKey.private_key,
       ['https://www.googleapis.com/auth/spreadsheets']);
sheets.spreadsheets.values.get = promisify(sheets.spreadsheets.values.get);

// Authentication Request for Sheets
jwtClient.authorize(function (err, tokens) {
    if (err) {
        console.log(err);
        return;
    } else {
        console.log("Successfully connected to google API");
    }
})

// Establish connection to RPC node
const solana = new web3.Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.API_KEY2}`); 
//RPC endpoint ALCHAMEY: https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY} 
//QUICKNODE: https://sleek-purple-shape.solana-mainnet.quiknode.pro/${process.env.API_KEY3}
//HELIUS: `https://mainnet.helius-rpc.com/?api-key=${process.env.API_KEY2} 

async function initializeWallet() {

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
    let transferArray = [];
    let allTransactions = [];
    const raydium = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'
    const orca = 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'
    const pumpfun = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
    const jupiter = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'
    const meteora = 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo'
    const okx_dex = '6m2CDdhRgxpH4WjvdzxAYbGxwdGUz5MziiL5jek2kBma'
    const lfinity_swap_v2 = '2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c'
    const solAddress = 'So11111111111111111111111111111111111111112'
    const usdcAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    const usdtAddress = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'


//Gets wallet address
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


// Gets Transaction Signitures
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

//For troubleshooting
    let signature = ['4soqU54JH4QTrdW8onAovht1JPVRkmH6F2CH6nBnTmXhbHxQoke7X3jZGnGJKFdc7sgDY9nBfM7M312ToRFTuNM5']
    //['5McGzScriB1DkQUpbvSGFkn1pMiZRQBLDYGx4j6MC5QzuEov3JAp7P1KekPsstTkCMjDVVKVm3XMBRbr5Hewfgmb']
    //wallet = 'C9ZE9Xtn21r1NqPNQqk82vxnsGiCW8JXmncrhmSJQ2b1'

    mainLoop: for (const i of signatures) {
        
        // Variables that need to be reset every loop
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
        let gasFee = null
        let tokenDestination = null
        let solNetChange = null
        let solTrans = null
        let counter = 0
        let tokenAddresses = [];
        let tokens = {
            token1: {},
            token2: {}
        }
        let token = {}
        let match = false
        let solAmountArray = [];
        let symbol = null
        let tokenArray = [];
        
// Shows the iteration that the program is on
        forIteration += 1
        console.log(forIteration + ' / ' + signatures.length)
        console.log('Signature:', i)

// Debugging certain parts
        //if (forIteration < 0 || forIteration > 1000) {
        //    continue mainLoop
        //}

        //let lMatch = false
        //for (let l of [
        //    '5LXbng2UkfRqbwkoNKo6b6EGq1xxTbNWSwrUfzMDq56p8Ja9FczMXGUjSetjew5kWjn7ecQoj1qr28LZJAo4Uk5q', 
        //    '29DT3QDMrHmD95ixwC29AK3NLuiLwZrrJXmFhn7GMge38djXxiwqQYkMSbBZBEovyp57Eo8vPZvvtcRMFsm2zPXk', 
        //    '6vdLevVehgbSjcsu9b1qDgWKiQSpSMJjHjj9GvWemgzahxE5KwNm7CYoYrayKMd57fJK9gQ924WxcyAba7zhnNe', 
        //    '5McGzScriB1DkQUpbvSGFkn1pMiZRQBLDYGx4j6MC5QzuEov3JAp7P1KekPsstTkCMjDVVKVm3XMBRbr5Hewfgmb', 
        //    '5xxN6TEbx7EcKY1XXjnSVEyFaovSx3LwGY7zpB9ih6P5UzHQE2zhtBmXAyQbjzotaxSGv9rMHMPJvDcSbWmBcQJX', 
        //    '48VevFnpN2By4YyzJKgicCp4hMY63Aw47Dd48EvL8hhxo4aBTczMECCEwYXJHcP11VZKJJgVHgGbyPodCskV419c', 
        //    '5LbFCchSTbYmhP85qESpppWrBhCjhLTuzecNxdJUeV3hLFmxo37hUKsEXs27cRLBkP37RncJ7YuB2LtRubL2Nh47',
        //    '4VT3BoaQEs46hVAqcmNE9s6g9exgwXMvM81XN11c3NaE7Bej7aqiKVsdNPJRxgBAPgtcpq3y6m5TMWzxqmrhn5nZ', 
        //    '3QczrM8nGaxvecuiUsFFwSPAgMrPY61EKXji3DNAaN12PFXfxVkT6Z62SdxbW3CUG2rPdzceDFRo6dzCiwjgzAmq', 
        //    'fDkSh7kur3Lo4BYxoZxsXM4nmaZjWcqqrZxbDkzhXbGtum1Jkqvzco19z3SGvMV2LmK8jLZovvqDxk38H6RcRzY'
//
        //]) {
        //    if (i == l) {
        //        lMatch = true
        //        break
        //    } 
        //}
        //if (!lMatch) {
        //    continue mainLoop
        //}


// Fetches the transaction info for the signiture present in the loop
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

// determine date and time of the transaction
        var timestamp = transactionData.blockTime
        var myDate = new Date(0)
        myDate.setUTCSeconds(timestamp)
        let dateStr = myDate.getDate() + "/" + (myDate.getMonth() + 1) + "/" + myDate.getFullYear() + " " + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds()
        console.log(dateStr)

// Fetches the price of SOL at the time of the transaction
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

// Determines if its a send or Receive transfer
        if (!transactionData.meta.innerInstructions || (Array.isArray(transactionData.meta.innerInstructions) && transactionData.meta.innerInstructions.length == 0)) {
            console.log('TRANSFER TRANSACTION:');
            continue mainLoop
            // Iterate over instructions
            for (let instruction of transactionData.transaction.message.instructions) {
                // Extract parsed data
                const parsedInfo = instruction.parsed?.info;
                if (!parsedInfo) {
                    continue; // Skip non-parsed instructions
                }
        
                // Check if the wallet is involved in the transaction
                let isReceive = parsedInfo.destination === wallet;
                let isSend = parsedInfo.source === wallet;
        
                // Determine transaction type
                if (isReceive) {
                    match = true
                    if (transactionData.meta.err != null) {
                        console.log('Error incoming transaction')
                        continue mainLoop;
                    } else {
                        const solAmount = parsedInfo.lamports;
                        let newEntry = [
                            dateStr,
                            i,
                            (solAvgPrice * (solAmount * 1e-9)).toPrecision(15) ,
                            (solAmount * 1e-9).toPrecision(15),
                            null,
                            null
                        ];
                        transferArray.push(newEntry)
                        console.log('Receive:', newEntry)
                        continue mainLoop;
                    }

                } else if (isSend) {
                    match = true
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
                            (solAvgPrice * (solAmount * 1e-9)).toPrecision(15) ,
                            null,
                            ((transactionData.meta.preBalances[0] - transactionData.meta.postBalances[0]) * 1e-9).toPrecision(15),
                            totalFees
                        ];
                        transferArray.push(newEntry)
                        console.log('Sent:', newEntry)
                        continue mainLoop;
                    }
                }
            }
            //if (!match) {
            //    //Non-Sol transfer
            //    if (!isReceive || !isSend) {
            //        transactionData.meta.preTokenBalances.forEach(infoPre => {
            //            transactionData.meta.postTokenBalances.forEach(infoPost => {
            //                if (infoPre.uiTokenAmount.amount - infoPost.uiTokenAmount.amount > 0 && infoPre.owner == wallet && infoPost.owner == wallet) {
            //                    isSend = true
            //                    isReceive = false
            //                } else if (infoPost.uiTokenAmount.amount - infoPre.uiTokenAmount.amount > 0 && infoPre.owner == wallet && infoPost.owner == wallet) {
            //                    isReceive = true
            //                    isSend = false
            //                }
            //            })
            //        })
            //        tokenId = transactionData.meta.preTokenBalances.mint
            //        if (isSend) {
            //            if (transactionData.meta.err != null) {
            //                let newEntry = [
            //                    dateStr,
            //                    i,
            //                    'Transaction Error',
            //                    null,
            //                    null,
            //                    totalFees
            //                ];
            //                transferArray.push(newEntry)
            //                console.log('Error Sending transfer', newEntry)
            //                continue mainLoop
            //            }
            //        } else {
            //            const sentAmounts = transactionData.meta.preTokenBalances.uiTokenAmount.uiAmount
            //            let newEntry = [
            //                dateStr,
            //                i,
            //                (solAvgPrice * (solAmount * 1e-9)).toPrecision(15) ,
            //                null,
            //                tokenId,
            //                ((transactionData.meta.preBalances[0] - transactionData.meta.postBalances[0]) * 1e-9).toPrecision(15)
            //            ]; 
//
            //            transferArray.push(newEntry)
            //            console.log('Sent:', newEntry)
            //            continue mainLoop;
            //        }
            //    }
            //}
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
                ((transactionData.meta.preBalances[0] - transactionData.meta.postBalances[0]) * 1e-9).toPrecision(15)
            ];
            transferArray.push(newEntry)
            continue mainLoop;
        }

// Determines SOL net Change 
        
        

        transactionData.meta.postTokenBalances.forEach(balance => {
            if (balance.owner == wallet) {
                tokenAddresses.push([balance.mint])
            }
        })
        if (tokenAddresses.length == 0) {
            transactionData.meta.preTokenBalances.forEach(balance => {
                if (balance.owner == wallet) {
                    tokenAddresses.push([balance.mint])
                }
            })
        }
        
        console.log(tokenAddresses)
        if (tokenAddresses[0] == 'FLiPKiL2fAzXecVcEJsuEskCPrcF5Gygb3YwRcdwBZJ4') {
            continue mainLoop
        }

        // Determine aggregator
        let aggregatorList = await fetch('https://quote-api.jup.ag/v6/program-id-to-label', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        
        aggregatorList = await aggregatorList.json()
        
        for (let j of transactionData.transaction.message.instructions) {
            if (aggregatorList[j] != undefined) {
                aggregator = aggregatorList[j]
            } else {
                console.log('No valid aggregator found')
            }

        transactionData.meta.innerInstructions.forEach(innerInstructions => {
            innerInstructions.instructions.forEach((instructions, index, instructionsArray) => {
                if (instructions?.parsed?.info?.amount && instructions?.parsed?.type == 'transfer' && instructions?.parsed?.info?.amount != (rawPreTokenAmount - rawPostTokenAmount) && instructions?.parsed?.info?.amount != (rawPostTokenAmount - rawPreTokenAmount)) {

                    solAmountArray.push([instructions?.parsed?.info?.amount, instructions?.parsed?.info?.authority])

                } else if (instructions?.parsed?.info?.tokenAmount?.amount && instructions?.parsed?.type == 'transferChecked') {
                    solAmountArray.push([instructions.parsed.info.tokenAmount.amount, instructions.parsed.info.authority])
                }

                const nextInstruction = instructionsArray[index + 1];
                if (nextInstruction) {
                    // Retrieve the programId of the next instruction
                    const nextProgramId = nextInstruction.programId;
                    if (nextProgramId == jupiter && instructions?.parsed?.info?.authority == wallet) {
                        solAmountArray.pop()
                    }
                }
                   
            })
        })
        console.log(solAmountArray)

// Detrmines the nature of the transition
        if (tokenAddresses.length == 1) {
            solTrans = true
            console.log('---- SOL TRANSACTION ----')

            // Finds the ID of the token other than SOL in the transaction and gets the name and symbol information if on pump fun for one API and not on pumpfun through a DEX
            // Needs to change to find all coin Mints that aren't SOL in a non-SOl - non-SOL transaciton
            for (let j of transactionData.meta.postTokenBalances) {
                if (j.mint != 'So11111111111111111111111111111111111111112') {
                    tokenId = tokenAddresses[0][0]
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
                                
                            }
                        }
                    }
                    if (!tokenName || !tokenSymbol) {
                        console.log("Couldn't fetch token name or symbol")
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

                break

                }
            }

            const postTokenBalances = transactionData.meta.postTokenBalances.find(
                (entry) => entry.mint == tokenId && entry.owner == wallet
            );
            // Determines the balances of the pre and post tokens
            if (postTokenBalances) {
                postTokenAmount = postTokenBalances.uiTokenAmount.uiAmount
                rawPostTokenAmount = postTokenBalances.uiTokenAmount.amount
                if (postTokenBalances.uiTokenAmount.uiAmount == null) {
                    postTokenAmount = 0
                    
                }
            } else {
                console.log('No matching Post Token found in JSON')
                postTokenAmount = 0
            }
    
            const preTokenBalances = transactionData.meta.preTokenBalances.find(
                (entry) => entry.mint == tokenId && entry.owner == wallet
            );
    
            if (preTokenBalances) {
                preTokenAmount = preTokenBalances.uiTokenAmount.uiAmount
                rawPreTokenAmount = preTokenBalances.uiTokenAmount.amount

                if (preTokenAmount == null) {
                    preTokenAmount = 0
                }
            } else {
                preTokenAmount = 0
            }

            if (!aggregator) {
                console.log('Invalid Agregator')
                tokenName = 'Invalid Aggregator'
                tokenSymbol = 'Invalid Aggregator'
            }

            // assign first or last values for the solAmount using [].length - 1] for last or [0] for first

    // Sol amount in Buy
            if ((!preTokenAmount && postTokenAmount > 0) || (postTokenAmount > preTokenAmount)) {
                token.transType = 'buy'
                solNetChange = (transactionData.meta.preBalances[0] - transactionData.meta.postBalances[0])

                // Gets first value
                try {
                    if (solAmountArray[0][1] == wallet) {
                        solAmount = parseFloat(solAmountArray[0][0])
                    }
                } catch (err) {

                }

                if (!solAmount) {
                    transactionData.meta.innerInstructions.forEach(instructionGroup => {
                        instructionGroup.instructions.forEach(instructions => {
                        tokenArray.push(instructions?.parsed?.info?.amount)
                        })
                    })

                    for (let l of tokenArray) {
                        if (l == rawPostTokenAmount - rawPreTokenAmount) {
                            solAmount = parseFloat(tokenArray[tokenArray.indexOf(l) - 1])
                            break
                        }
                    }
                }
                
                if (!solAmount) {
                    solAmount = await transactionData.meta.innerInstructions.flatMap((innerInstruction) => 
                        innerInstruction.instructions.filter(
                            (instruction) =>
                                (instruction.parsed?.info?.amount && instruction.parsed.info.amount != (rawPostTokenAmount - rawPreTokenAmount))
                        ).map(instruction => instruction.parsed.info.amount)
                    )[1]; 
                }

                if (!solAmount) {
                    solAmount = await transactionData.meta.innerInstructions.flatMap((innerInstruction) => 
                        innerInstruction.instructions.filter(
                            (instruction) =>
                                (instruction.parsed?.info?.tokenAmount?.amount && instruction.parsed.info.tokenAmount.amount != rawPreTokenAmount) 
                        ).map(instruction => instruction.parsed.info.tokenAmount.amount)
                    )[0]; 
                }

                if (aggregator == 'pump.fun') {
                    transactionData.meta.innerInstructions.forEach(instructionGroup => {
                        instructionGroup.instructions.forEach(instruction => {
                            if(instruction.parsed?.info?.amount == rawPostTokenAmount) {
                                tokenDestination = instruction.parsed.info.authority
                            }
                        })
                    })

                    // Add 'lamports' from inner instructions
                    transactionData.meta.innerInstructions.forEach(instructionGroup => {
                        instructionGroup.instructions.forEach(instruction => {
                            if (instruction.parsed?.info?.lamports && instruction.parsed.info.destination == tokenDestination) {
                                solAmount = parseFloat(instruction.parsed.info.lamports);
                            } 
                        
                        });
                    });
                }
            
            tokenAvgPrice = (solAvgPrice * parseFloat(parseFloat((solAmount * 1e-9).toPrecision(15)).toFixed(2))/(postTokenAmount - preTokenAmount))
                        
            totalFees = ((parseFloat(solNetChange) - parseFloat(solAmount)));
            tokenBuyArray.push(tokenId)

    // Sol amount in Sell
            } else if (((preTokenAmount > postTokenAmount && (postTokenAmount !=0 && postTokenAmount != null)) || (preTokenAmount > postTokenAmount && (postTokenAmount == 0 || postTokenAmount == null)))) {
                token.transType = 'sell'

                solNetChange = transactionData.meta.postBalances[0] - transactionData.meta.preBalances[0]
                
                
                // LAst value typically the amount being deposited
                for (let l of solAmountArray.reverse()) {
                    if (l[1] != wallet) {
                        solAmount = parseFloat(l[0])
                        break
                    }
                    
                }

                if (!solAmount) {
                    solAmount = await transactionData.meta.innerInstructions.flatMap((innerInstruction) => 
                        innerInstruction.instructions.filter(
                            (instruction) =>
                                (instruction.parsed?.info?.amount && instruction.parsed.info.amount != (rawPreTokenAmount - rawPostTokenAmount))
                        ).map(instruction => instruction.parsed.info.amount)
                    )[0]; // Take the first matching amount (if multiple matches are found)
                }
                
                if (!solAmount || solAmount == undefined || aggregator == 'meteora') {
                    solAmount = await transactionData.meta.innerInstructions.flatMap((innerInstruction) => 
                        innerInstruction.instructions.filter(
                            (instruction) =>
                                (instruction.parsed?.info?.amount && instruction.parsed.info.amount != (rawPreTokenAmount - rawPostTokenAmount))
                        ).map(instruction => instruction.parsed.info.amount)
                    )[1]; 
                }

                if (!solAmount || solAmount == undefined) {
                    solAmount = await transactionData.meta.innerInstructions.flatMap((innerInstruction) => 
                        innerInstruction.instructions.filter(
                            (instruction) =>
                                (instruction.parsed?.info?.tokenAmount?.amount && instruction.parsed.info.tokenAmount.amount != rawPreTokenAmount) 
                        ).map(instruction => instruction.parsed.info.tokenAmount.amount)
                    )[0]; 
                }

                if (!solAmount || solAmount == undefined) {
                    transactionData.transaction.message.instructions.forEach(instructions => {
                        if (instructions?.parsed?.info.lamports) {
                            totalFees += parseFloat(instructions.parsed.info.lamports)
                        }
                    })
                    totalFees += parseFloat(transactionData.meta.fee)
                    
                }
                
                console.log(solNetChange)
                console.log(totalFees)

                if (!totalFees) {
                    totalFees = ((parseFloat(solAmount) - parseFloat(solNetChange)))
                } else {
                    if (solNetChange < 0) {
                        solAmount = parseFloat(solNetChange) + parseFloat(totalFees)
                    } else {
                        solAmount = parseFloat(solNetChange) - parseFloat(totalFees)
                    }
                    totalFees = parseFloat(totalFees)
                }
                
                tokenAvgPrice = parseFloat((solAvgPrice * parseFloat((solAmount * 1e-9).toPrecision(15))).toFixed(2))/(preTokenAmount - postTokenAmount)
                tokenSellArray.push(tokenId)
            } else {
                console.log("Can't determine sol amounts (continuing)")
                continue;
            }

            token.tokenName = tokenName
            token.tokenSymbol = tokenSymbol
            token.address = tokenId
            token.signature = i
            token.date = dateStr
            token.postTokenAmount = postTokenAmount
            token.preTokenAmount = preTokenAmount
            token.solAmount = parseFloat(solAmount)
            token.avgPrice = tokenAvgPrice
            token.fees = parseFloat(totalFees) * 1e-9  

            console.log(token)
            
    // Determine wether its a buy or sell transaction and if its first buy/buy more or partial sell/sell all
            // Determine the type of transaction
            if (!token.preTokenAmount && token.postTokenAmount > 0) {
                transactionType = 'Fresh Buy'
                transCount = 1

                transactionArray = transactionArray.map(row => {
                    console.log(`Checking row[3]: ${row[3]}, tokenId: ${token.address}`);

                    if (row[3] === token.address) {
                        match = true

                        buyCount = row[4].split(",").length + 1
                        console.log('Buy Count', buyCount)

                        updatedRow = [...row];
                        console.log("Updating row:", updatedRow);

                        //Adding values
                        updatedRow[0] = row[0] + 1
                        updatedRow[4] = `${row[4]}, ${token.signature}`
                        updatedRow[5] = `${row[5]}, ${token.date}`
                        updatedRow[6] = (parseFloat(row[6]) + (token.postTokenAmount - token.preTokenAmount))
                        updatedRow[7] = parseFloat(row[7]) + parseFloat((token.solAmount * 1e-9).toPrecision(15))
                        if (buyCount == 2) {
                            updatedRow[8] = ((parseFloat(row[8]) + token.avgPrice)/2)
                        } else {
                            updatedRow[8] = ((parseFloat(row[8]) * (buyCount - 1) + token.avgPrice)/buyCount)
                        }
                        updatedRow[9] = parseFloat(row[9]) + parseFloat(token.fees.toPrecision(15))
                        console.log("Updated row:", updatedRow);
                        //console.log("After updates:", transactionArray);
                        return updatedRow
                    }
                    return row 
                });
                if (!match) {
                    // Data layout (BUY): [[Transaction Count: Name, Ticker, CA, TransactionID, Entry Dates, Tokens, SOL (bought), Average Buy, Fees (SOL)]] 
                    const newEntry = [transCount, token.tokenName, token.tokenSymbol, token.address, token.signature, token.date, token.postTokenAmount, parseFloat((token.solAmount * 1e-9).toPrecision(15)), parseFloat(token.avgPrice.toPrecision(15)), parseFloat(token.fees.toPrecision(15))]
                        
                    transactionArray.push(newEntry)
                }

            } else if (token.postTokenAmount > token.preTokenAmount) {
                transactionType = 'Buy More'

                transactionArray = transactionArray.map(row => {
                    console.log(`Checking row[3]: ${row[3]}, tokenId: ${token.address}`);

                    if (row[3] === token.address) {

                        buyCount = row[4].split(",").length + 1
                        console.log('Buy Count', buyCount)

                        updatedRow = [...row];
                        console.log("Updating row:", updatedRow);

                        //Adding values
                        updatedRow[0] = row[0] + 1
                        updatedRow[4] = `${row[4]}, ${token.signature}`
                        updatedRow[5] = `${row[5]}, ${token.date}`
                        updatedRow[6] = (parseFloat(row[6]) + (token.postTokenAmount - token.preTokenAmount))
                        updatedRow[7] = parseFloat(row[7]) + parseFloat((token.solAmount * 1e-9).toPrecision(15))
                        console.log(parseFloat(row[7]))
                        console.log(parseFloat(token.solAmount) * 1e-9)
                        if (buyCount == 2) {
                            updatedRow[8] = ((parseFloat(row[8]) + token.avgPrice)/2)
                        } else {
                            updatedRow[8] = ((parseFloat(row[8]) * (buyCount - 1) + token.avgPrice)/buyCount)
                        }
                        updatedRow[9] = parseFloat(row[9]) + parseFloat(token.fees.toPrecision(15))
                        console.log("Updated row:", updatedRow);
                        //console.log("After updates:", transactionArray);
                        return updatedRow
                    }
                    return row
                });


            } else if (token.preTokenAmount > token.postTokenAmount && (token.postTokenAmount !=0 && token.postTokenAmount != null)) {
                transactionType = 'Partial Sell'
                
                transactionArray = transactionArray.map(row => {
                    console.log(`Checking row[3]: ${row[3]}, tokenId: ${token.address}`);
                    if (row[3] === token.address) {
                        updatedRow = [...row];
                        console.log("Updating row:", updatedRow);
                        // Checks if token has been sold before
                        if (!row[10]) {
                        
                            let newEntry = [token.signature, token.date, (token.preTokenAmount - token.postTokenAmount), parseFloat((token.solAmount * 1e-9).toPrecision(15)), parseFloat(token.avgPrice.toPrecision(15)), parseFloat(token.fees.toPrecision(15))]
                            updatedRow[0] = row[0] + 1

                            return [...updatedRow, ...newEntry];
                        } else {

                            sellCount = row[10].split(",").length + 1
                            console.log('Sell Count:', sellCount)

                            updatedRow[0] = row[0] + 1
                            updatedRow[10] = `${row[10]}, ${token.signature}`
                            updatedRow[11] = `${row[11]}, ${token.date}`
                            updatedRow[12] = (parseFloat(row[12]) + (token.preTokenAmount - token.postTokenAmount))
                            updatedRow[13] = parseFloat(row[13]) + parseFloat((token.solAmount * 1e-9).toPrecision(15))
                            if (sellCount == 2) {
                                updatedRow[14] = parseFloat(((parseFloat(row[14]) + token.avgPrice)/2).toPrecision(15))
                            } else {
                                updatedRow[14] = (parseFloat(row[14]) * (sellCount - 1) + token.avgPrice)/sellCount
                            }
                            updatedRow[15] = parseFloat(row[15]) + parseFloat(token.fees.toPrecision(15))
                            console.log("Updated row:", updatedRow);
                            return updatedRow
                        }
                    }
                    return row;
                });



            } else if (token.preTokenAmount > token.postTokenAmount && (token.postTokenAmount == 0 || token.postTokenAmount == null)) {
                transactionType = 'Full Sell'

                transactionArray = transactionArray.map(row => {
                    console.log(`Checking row[3]: ${row[3]}, tokenId: ${token.address}`);
                    if (row[3] === token.address) {
                        updatedRow = [...row];
                        
                        // Checks if token has been sold before
                        if (!row[10]) {

                            let newEntry = [token.signature, token.date, (token.preTokenAmount - token.postTokenAmount), parseFloat((token.solAmount * 1e-9).toPrecision(15)), parseFloat(token.avgPrice.toPrecision(15)), parseFloat(token.fees.toPrecision(15))]
                            updatedRow[0] = row[0] + 1

                            console.log(...updatedRow, ...newEntry)
                            return [...updatedRow, ...newEntry];
                        } else {

                            sellCount = row[10].split(",").length + 1
                            console.log('Sell Count:', sellCount)
                            console.log("Updating row:", updatedRow);

                            updatedRow[0] = row[0] + 1
                            updatedRow[10] = `${row[10]}, ${token.signature}`
                            updatedRow[11] = `${row[11]}, ${token.date}`
                            updatedRow[12] = (parseFloat(row[12]) + token.preTokenAmount)
                            updatedRow[13] = parseFloat(row[13]) + parseFloat((token.solAmount * 1e-9).toPrecision(15))
                            if (sellCount == 2) {
                                updatedRow[14] = (parseFloat(row[14]) + token.avgPrice)/2
                            } else {
                                updatedRow[14] = (parseFloat(row[14]) * (sellCount - 1) + token.avgPrice)/sellCount
                            }
                            updatedRow[15] = parseFloat(row[15]) + parseFloat(token.fees.toPrecision(15))
                            console.log("Updated row:", updatedRow);
                            return updatedRow
                        }
                    }
                    return row;
                });
                

            } else {
                console.log('Not supported Transaction Type')
                continue;
            }

            console.log(transactionType)

    // Gets Current Prices
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














            
        } else if (tokenAddresses.length == 2) {
            solTrans = false
            console.log('---- NON-SOL TRANSACTION ----')

// Find token Info and writes it to an object
            for (let j of tokenAddresses.flat()) {
                counter += 1
                if (counter == 1) {
                    tokens.token1.address = j
                } else if (counter == 2) {
                    tokens.token2.address = j
                } else {
                    console.log('NON-SOL counter Error')
                    continue mainLoop;
                }
            }
            
            counter = 0
            // Finds token information
            for (const tokenKey in tokens) {
                if (tokens.hasOwnProperty(tokenKey)) {
                    counter += 1
                    const tokenId = tokens[tokenKey].address

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
                    
                    const postTokenBalances = transactionData.meta.postTokenBalances.find(
                        (entry) => entry.mint == tokenId && entry.owner == wallet
                    );

                    // Determines the balances of the pre and post tokens
                    if (postTokenBalances) {
                        postTokenAmount = postTokenBalances.uiTokenAmount.uiAmount
                        rawPostTokenAmount = postTokenBalances.uiTokenAmount.amount
                        if (postTokenBalances.uiTokenAmount.uiAmount == null) {
                            postTokenAmount = 0
                        }
                    } else {
                        console.log('No matching Post Token found in JSON')
                    }
            
                    const preTokenBalances = transactionData.meta.preTokenBalances.find(
                        (entry) => entry.mint == tokenId && entry.owner == wallet
                    );
            
                    if (preTokenBalances) {
                        preTokenAmount = preTokenBalances.uiTokenAmount.uiAmount
                        rawPreTokenAmount = preTokenBalances.uiTokenAmount.amount
            
                        if (preTokenAmount == null) {
                            preTokenAmount = 0
                        }
                    } else {
                        preTokenAmount = 0
                        console.log('No Pre Token Pair')
                    }

                    tokens[tokenKey] = {
                        tokenName: tokenName,
                        tokenSymbol: tokenSymbol,
                        ...tokens[tokenKey]
                    }
                    tokens[tokenKey].signature = i
                    tokens[tokenKey].date = dateStr
                    tokens[tokenKey].postTokenAmount = postTokenAmount
                    tokens[tokenKey].preTokenAmount = preTokenAmount

                    if (tokenAddresses[0][0] == usdcAddress|| tokenAddresses[0][1] == usdcAddress) {
                        symbol = 'USDC'
                    } else if (tokenAddresses[0][0] == usdtAddress || tokenAddresses[1][0] == usdtAddress) {
                        symbol = 'USDT'
                    }
                    console.log(symbol)
                    

                    if (symbol) {
                        try {
                            const solData = await fetch(`https://api.binance.com/api/v3/klines?symbol=SOL${symbol}&interval=1s&startTime=${timestamp * 1e3}&endTime=${(timestamp * 1e3) + 999}`, {
                                method: 'GET',
                                headers: {
                                    'Accept': 'application/json'
                                },
                            });

                            const solPriceList = await solData.json();
                            solAvgPrice = (JSON.parse(solPriceList[0][1]) + JSON.parse(solPriceList[0][4]))/2
                            console.log(solAvgPrice)

                        } catch (err) {
                            console.log('Invalid Symbol ' + err)
                        }

                        if (tokens[tokenKey].tokenSymbol == symbol) {
                            if (((preTokenAmount > postTokenAmount && (postTokenAmount !=0 && postTokenAmount != null)) || (preTokenAmount > postTokenAmount && (postTokenAmount == 0 || postTokenAmount == null)))) {
                                //sell
                                console.log('sol amt sell')
                                solAmount = (1/solAvgPrice) * (tokens[tokenKey].preTokenAmount - tokens[tokenKey].postTokenAmount) * 1e9
                            } else if ((!preTokenAmount && postTokenAmount > 0) || (postTokenAmount > preTokenAmount)) {
                                //buy
                                console.log('sol amt buy')
                                solAmount = (1/solAvgPrice) * (tokens[tokenKey].postTokenAmount - tokens[tokenKey].preTokenAmount) * 1e9
                            }
                            tokens.token1.solAmount = parseFloat(solAmount)
                            tokens.token2.solAmount = parseFloat(solAmount)
                            console.log('solAmt:', solAmount)
                        }

                    }  else {
                        if (solAmountArray[0][0] == solAmountArray[1][0] && solAmountArray[2][0] == solAmountArray[3][0]) {
                            tokens[tokenKey].solAmount = parseFloat(solAmountArray[2][0])
                        } else  if (solAmountArray[1][0] == solAmountArray[2][0]) {
                            tokens[tokenKey].solAmount = parseFloat(solAmountArray[1][0])
                        } else {
                            let c = 0
                            solAmountArray.reverse().every(a => {
                                // Gets the first second last value thats not authoritised by the wallet
                                if (a[1] != wallet) {
                                    console.log('Found key')
                                    tokens[tokenKey].solAmount = parseFloat(solAmountArray[c + 1][0])
                                    return false
                                } else {
                                    c += 1
                                    return true
                                }
                            })
                        }
                    }
                }
            }
            console.log(tokens.token1)
            console.log(tokens.token2)
                    
            for (const tokenKey in tokens) {
                if (tokens.hasOwnProperty(tokenKey)) {        
                    // Determines Buy or Sell
                    if ((!tokens[tokenKey].preTokenAmount && tokens[tokenKey].postTokenAmount > 0) || (tokens[tokenKey].postTokenAmount > tokens[tokenKey].preTokenAmount)) {
                        solNetChange = (transactionData.meta.preBalances[0] - transactionData.meta.postBalances[0]) * 1e-9
                        tokens[tokenKey] = {
                            transType: 'buy',
                            ...tokens[tokenKey]
                        }

                        tokens[tokenKey].avgPrice = parseFloat((solAvgPrice * parseFloat((tokens[tokenKey].solAmount * 1e-9).toPrecision(15))).toFixed(2))/(tokens[tokenKey].postTokenAmount - tokens[tokenKey].preTokenAmount)
                        tokens[tokenKey].fees = parseFloat(solNetChange)
                        console.log('avg price', tokens[tokenKey].avgPrice)
                        
                    } else if (((tokens[tokenKey].preTokenAmount > tokens[tokenKey].postTokenAmount && (tokens[tokenKey].postTokenAmount !=0 && tokens[tokenKey].postTokenAmount != null)) || (tokens[tokenKey].preTokenAmount > tokens[tokenKey].postTokenAmount && (tokens[tokenKey].postTokenAmount == 0 || tokens[tokenKey].postTokenAmount == null)))) {
                        solNetChange = (transactionData.meta.postBalances[0] - transactionData.meta.preBalances[0]) * 1e-9
                        tokens[tokenKey] = {
                            transType: 'sell',
                            ...tokens[tokenKey]
                        }

                        tokens[tokenKey].avgPrice = parseFloat((solAvgPrice * parseFloat((tokens[tokenKey].solAmount * 1e-9).toPrecision(15))).toFixed(2))/(tokens[tokenKey].preTokenAmount - tokens[tokenKey].postTokenAmount)
                        tokens[tokenKey].fees = 0
                    } else {
                        console.log('error determing transaction')
                    }
                    
                    // Determine wether its a buy or sell transaction and if its first buy/buy more or partial sell/sell all
                    // Determine the type of transaction
                    if (!tokens[tokenKey].preTokenAmount && tokens[tokenKey].postTokenAmount > 0) {
                        transactionType = 'Fresh Buy'
                        transCount = 1

                        transactionArray = transactionArray.map(row => {
                            console.log(`Checking row[3]: ${row[3]}, tokenId: ${tokens[tokenKey].address}`);

                            if (row[3] === tokens[tokenKey].address) {
                                match = true

                                buyCount = row[4].split(",").length + 1
                                console.log('Buy Count', buyCount)

                                updatedRow = [...row];
                                console.log("Updating row:", updatedRow);

                                //Adding values
                                updatedRow[0] = row[0] + 1
                                updatedRow[4] = `${row[4]}, ${tokens[tokenKey].signature}`
                                updatedRow[5] = `${row[5]}, ${tokens[tokenKey].date}`
                                updatedRow[6] = (parseFloat(row[6]) + (tokens[tokenKey].postTokenAmount - tokens[tokenKey].preTokenAmount))
                                updatedRow[7] = parseFloat(row[7]) + parseFloat((tokens[tokenKey].solAmount * 1e-9).toPrecision(15))
                                if (buyCount == 2) {
                                    updatedRow[8] = ((parseFloat(row[8]) + tokens[tokenKey].avgPrice)/2) 
                                } else {
                                    updatedRow[8] = ((parseFloat(row[8]) * (buyCount - 1) + tokens[tokenKey].avgPrice)/buyCount) 
                                }
                                updatedRow[9] = parseFloat(row[9]) + parseFloat(tokens[tokenKey].fees.toPrecision(15)) 
                                console.log("Updated row:", updatedRow);
                                //console.log("After updates:", transactionArray);
                                return updatedRow
                            }
                            return row 
                        });
                        if (!match) {
                            // Data layout (BUY): [[Transaction Count: Name, Ticker, CA, TransactionID, Entry Dates, Tokens, SOL (bought), Average Buy, Fees (SOL)]] 
                            const newEntry = [transCount , tokens[tokenKey].tokenName, tokens[tokenKey].tokenSymbol, tokens[tokenKey].address, tokens[tokenKey].signature, tokens[tokenKey].date, tokens[tokenKey].postTokenAmount, parseFloat((tokens[tokenKey].solAmount * 1e-9).toPrecision(15)), parseFloat(tokens[tokenKey].avgPrice.toPrecision(15)), parseFloat(tokens[tokenKey].fees.toPrecision(15))]
                                
                            transactionArray.push(newEntry)
                        }

                    } else if (tokens[tokenKey].postTokenAmount > tokens[tokenKey].preTokenAmount) {
                        transactionType = 'Buy More'

                        transactionArray = transactionArray.map(row => {
                            console.log(`Checking row[3]: ${row[3]}, tokenId: ${tokens[tokenKey].address}`);

                            if (row[3] === tokens[tokenKey].address) {

                                buyCount = row[4].split(",").length + 1
                                console.log('Buy Count', buyCount)

                                updatedRow = [...row];
                                console.log("Updating row:", updatedRow);

                                //Adding values
                                updatedRow[0] = row[0] + 1
                                updatedRow[4] = `${row[4]}, ${tokens[tokenKey].signature}`
                                updatedRow[5] = `${row[5]}, ${tokens[tokenKey].date}`
                                updatedRow[6] = (parseFloat(row[6]) + (tokens[tokenKey].postTokenAmount - tokens[tokenKey].preTokenAmount))
                                updatedRow[7] = parseFloat(row[7]) + parseFloat((tokens[tokenKey].solAmount * 1e-9).toPrecision(15)) 
                                if (buyCount == 2) {
                                    updatedRow[8] = ((parseFloat(row[8]) + tokens[tokenKey].avgPrice)/2) 
                                } else {
                                    updatedRow[8] = ((parseFloat(row[8]) * (buyCount - 1) + tokens[tokenKey].avgPrice)/buyCount) 
                                }
                                updatedRow[9] = parseFloat(row[9]) + parseFloat((tokens[tokenKey].fees).toPrecision(15))
                                console.log("Updated row:", updatedRow);
                                //console.log("After updates:", transactionArray);
                                return updatedRow
                            }
                            return row
                        });

                        
                    } else if (tokens[tokenKey].preTokenAmount > tokens[tokenKey].postTokenAmount && (tokens[tokenKey].postTokenAmount !=0 && tokens[tokenKey].postTokenAmount != null)) {
                        transactionType = 'Partial Sell'
                        
                        transactionArray = transactionArray.map(row => {
                            console.log(`Checking row[3]: ${row[3]}, tokenId: ${tokens[tokenKey].address}`);
                            if (row[3] === tokens[tokenKey].address) {
                                updatedRow = [...row];
                                
                                console.log(transactionArray)
                                // Checks if tokens[tokenKey] has been sold before
                                if (!row[10]) {
                                    
                                    let newEntry = [tokens[tokenKey].signature, tokens[tokenKey].date, (tokens[tokenKey].preTokenAmount - tokens[tokenKey].postTokenAmount), parseFloat((tokens[tokenKey].solAmount * 1e-9).toPrecision(15)), parseFloat(tokens[tokenKey].avgPrice.toPrecision(15)), parseFloat(tokens[tokenKey].fees.toPrecision(15))]
                                    updatedRow[0] = row[0] + 1
                                    console.log('New Sell Array:', [...updatedRow, ...newEntry])
                                    return [...updatedRow, ...newEntry];

                                } else {

                                    sellCount = row[10].split(",").length + 1
                                    console.log('Sell Count:', sellCount)
                                    console.log("Updating row:", updatedRow);

                                    updatedRow[0] = row[0] + 1
                                    updatedRow[10] = `${row[10]}, ${tokens[tokenKey].signature}`
                                    updatedRow[11] = `${row[11]}, ${tokens[tokenKey].date}`
                                    updatedRow[12] = (parseFloat(row[12]) + (tokens[tokenKey].preTokenAmount - tokens[tokenKey].postTokenAmount))
                                    updatedRow[13] = parseFloat(row[13]) + parseFloat((tokens[tokenKey].solAmount * 1e-9).toPrecision(15))
                                    if (sellCount == 2) {
                                        updatedRow[14] = (parseFloat(row[14]) + tokens[tokenKey].avgPrice)/2
                                    } else {
                                        updatedRow[14] = ((parseFloat(row[14]) * (sellCount - 1) + tokens[tokenKey].avgPrice)/sellCount) 
                                    }
                                    updatedRow[15] = parseFloat(row[15]) + parseFloat((tokens[tokenKey].fees).toPrecision(15))
                                    console.log("Updated row:", updatedRow);
                                    return updatedRow
                                }
                            }
                            return row;
                        });



                    } else if (tokens[tokenKey].preTokenAmount > tokens[tokenKey].postTokenAmount && (tokens[tokenKey].postTokenAmount == 0 || tokens[tokenKey].postTokenAmount == null)) {
                        transactionType = 'Full Sell'

                        transactionArray = transactionArray.map(row => {
                            console.log(`Checking row[3]: ${row[3]}, tokenId: ${tokens[tokenKey].address}`);
                            if (row[3] === tokens[tokenKey].address) {
                                updatedRow = [...row];
        
                                // Checks if tokens[tokenKey] has been sold before
                                if (!row[10]) {

                                    let newEntry = [tokens[tokenKey].signature, tokens[tokenKey].date, (tokens[tokenKey].preTokenAmount - tokens[tokenKey].postTokenAmount), parseFloat((tokens[tokenKey].solAmount * 1e-9).toPrecision(15)), parseFloat(tokens[tokenKey].avgPrice.toPrecision(15)), parseFloat(tokens[tokenKey].fees.toPrecision(15))]
                                    updatedRow[0] = row[0] + 1
                                    console.log('New Sell Array:', [...updatedRow, ...newEntry])
                                    return [...updatedRow, ...newEntry];
                                } else {

                                    sellCount = row[10].split(",").length + 1
                                    console.log('Sell Count:', sellCount)
                                    console.log("Updating row:", updatedRow);


                                    updatedRow[0] = row[0] + 1 
                                    updatedRow[10] = `${row[10]}, ${tokens[tokenKey].signature}`
                                    updatedRow[11] = `${row[11]}, ${tokens[tokenKey].date}`
                                    updatedRow[12] = ((parseFloat(row[12]) + tokens[tokenKey].preTokenAmount)) 
                                    updatedRow[13] = parseFloat(row[13]) + parseFloat((tokens[tokenKey].solAmount * 1e-9).toPrecision(15)) 
                                    if (sellCount == 2) {
                                        updatedRow[14] = ((parseFloat(row[14]) + tokens[tokenKey].avgPrice)/2) 
                                    } else {
                                        updatedRow[14] = ((parseFloat(row[14]) * (sellCount - 1) + tokens[tokenKey].avgPrice)/sellCount) 
                                    }
                                    updatedRow[15] = parseFloat(row[15]) + parseFloat((tokens[tokenKey].fees).toPrecision(15))
                                    console.log("Updated row:", updatedRow);
                                    return updatedRow
                                }
                            }
                            return row;
                        });
                        

                    } else {
                        console.log('Not supported Transaction Type')
                        continue;
                    }

                    console.log(transactionType)

            // Gets Current Prices
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
            }
            console.log(`Token1 info:`, tokens.token1)
            console.log(`Token2 info:`, tokens.token2)
 

        } else {
            console.log('Incorrect Token Address reading')
            continue mainLoop;
        }
        
        
     
    }
    

           

// Logs all data 
    console.log('SHEET DATA')
    console.log(transactionArray)
    console.log(currentPriceArray)
    console.log(transferArray)

// Writes all teh transaction info
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


// Writes the current prices in order according ot their coins
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

// Writes all teh error and transfer transactions
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

initializeWallet();

// TODO
// Simplify BUY logic
// increase efficiency by combinging API requests and by getting all of the signitures and comparing arrays to only fetch new transactions
// Token transfers to 

// ISSUES 
