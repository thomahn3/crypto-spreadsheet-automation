const web3 = require("@solana/web3.js");
require('dotenv').config();
const { promisify } = require('util');
const publicKey = require('@metaplex-foundation/umi');
const createUmi = require('@metaplex-foundation/umi-bundle-defaults');
const dasApi = require('@metaplex-foundation/digital-asset-standard-api');


// Writes console outputs to a file
//const { appendFileSync } = require('fs');
//const origConsole = globalThis.console;
//const console = {
//    log: (...args) => {
//        appendFileSync('./logresults.txt', args.join('\n') + '\n');
//        return origConsole.log.apply(origConsole, args);
//    }
//}


const { google } = require('googleapis');
let secretKey = require("./auth/client_secret.json");
let spreadsheetId = process.env.spreadsheetId;
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
    // Used for getting full wallet history
const solanaQuickNode = new web3.Connection(process.env.RPCURL); 
    // Mainly to get quickest response times
const solana = new web3.Connection(process.env.RPCURL);

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
    const jupiter = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'
    const solAddress = 'So11111111111111111111111111111111111111112'
    const usdcAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    const usdtAddress = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
    let aggregatorList = null
    let solPrice = null
    let solBalance = null
    
   
    try {
        const solData = await fetch(`https://api.binance.com/api/v3/klines?symbol=SOLUSDC&interval=1s&startTime=${(parseFloat((Date.now() * 1e-3).toFixed(0)) - 2) * 1e3}&endTime=${(parseFloat((Date.now() * 1e-3).toFixed(0)) - 2) * 1e3 + 999}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
    });
        const solPriceList = await solData.json();
        solPrice = await (JSON.parse(solPriceList[0][1]) + JSON.parse(solPriceList[0][4]))/2
        console.log('solprice', solPrice)
    } catch (err) {
        console.log('Error fetching sol price: ' + err)
    }


    try {
        const response = await sheets.spreadsheets.values.get({
            auth: jwtClient,
            spreadsheetId: spreadsheetId,
            range: `${process.env.sheetName}!A2:AA100`
        });
        const data = await JSON.parse(JSON.stringify(response, null));
        if (data.data.values == undefined) {
            const response = await sheets.spreadsheets.values.get({
                auth: jwtClient,
                spreadsheetId: spreadsheetId,
                range: `${process.env.sheetName}!A1`
            });
            if (response.data.values == undefined) {
                console.log('No wallet address in A1')
                throw err
            }
            wallet = response.data.values[0][0];
            console.log('Wallet: ' + wallet);

            console.log('formatting');
            sheets.spreadsheets.batchUpdate({
                auth: jwtClient,
                spreadsheetId: spreadsheetId,
                resource: {
                    "requests": [
                        // Merge cells and add text
                        // Adds required fields
                        {
                            "updateSheetProperties": {
                                "properties": {
                                    "sheetId": process.env.SHEET_ID,
                                    "gridProperties": {
                                        "columnCount": 27
                                    }
                                },
                                "fields": "gridProperties.columnCount"
                            }
                        },
                        {
                            "updateSheetProperties": {
                                "properties": {
                                    "sheetId": process.env.SHEET_ID,
                                    "gridProperties": {
                                        "rowCount": 10000 // Set to the desired number of rows
                                    }
                                },
                                "fields": "gridProperties.rowCount"
                            }
                        },
                        // sol price
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 0, "endColumnIndex": 2 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 0, "endColumnIndex": 2 },
                                "rows": [{ "values": [{ "userEnteredValue": { "stringValue": "Sol Price" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 0, "endColumnIndex": 2 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 0, "endColumnIndex": 2 },
                                "rows": [{ "values": [{ "userEnteredValue": { "stringValue": solPrice.toString() }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "numberFormat": {"type": "currency", "pattern": "$#,##0.00"} } }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        // wallet
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 2, "endColumnIndex": 4 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 2, "endColumnIndex": 4 },
                                "rows": [{ "values": [{ "userEnteredValue": { "stringValue": 'Wallet'}, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "wrapStrategy": "WRAP" } }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 2, "endColumnIndex": 4 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 2, "endColumnIndex": 4 },
                                "rows": [{ "values": [{ "userEnteredValue": { "stringValue": wallet}, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "wrapStrategy": "WRAP" } }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        // balance
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 5, "endColumnIndex": 7 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 5, "endColumnIndex": 7 },
                                "rows": [{ "values": [{ "userEnteredValue": { "stringValue": "Balance" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        // sol Balance
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 7, "endColumnIndex": 9 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 7, "endColumnIndex": 9 },
                                "rows": [{ "values": [{ "userEnteredValue": { "stringValue": "Sol Balance" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 7, "endColumnIndex": 9 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        // PnL
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 10, "endColumnIndex": 12 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 10, "endColumnIndex": 12 },
                                "rows": [{ "values": [{ "userEnteredValue": { "stringValue": 'Profit and Loss' }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "wrapStrategy": "WRAP" } }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        // Trading Volume
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 12, "endColumnIndex": 14 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 12, "endColumnIndex": 14 },
                                "rows": [{ "values": [{ "userEnteredValue": { "stringValue": 'Trading Volume' }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "wrapStrategy": "WRAP" } }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        // Total Fees
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 14, "endColumnIndex": 16 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 14, "endColumnIndex": 16 },
                                "rows": [{ "values": [{ "userEnteredValue": { "stringValue": 'Total Fees' }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "wrapStrategy": "WRAP" } }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        
                        // transfers and error block
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 4, "endRowIndex": 6, "startColumnIndex": 21, "endColumnIndex": 27 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 4, "endRowIndex": 6, "startColumnIndex": 21, "endColumnIndex": 27 },
                                "rows": [{ "values": [{ "userEnteredValue": { "stringValue": "Transfers and Error transactions" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },

                        // Adding formulas
                        // balance
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 5, "endColumnIndex": 7 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 5, "endColumnIndex": 7 },
                                "rows": [{ "values": [{ "userEnteredValue": { "formulaValue": `=(H3*A3)+SUM(ARRAYFORMULA(IF(G9:G - M9:M = 0, 0, (G9:G-M9:M)*Q9:Q)))` }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "numberFormat": {"type": "currency", "pattern": "$#,##0.00"}} }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        //PnL
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 10, "endColumnIndex": 12 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 10, "endColumnIndex": 12 },
                                "rows": [{ "values": [{ "userEnteredValue": { "formulaValue": "=S8" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "numberFormat": {"type": "currency", "pattern": "$#,##0.00"} } }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        // Trading Volume
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 12, "endColumnIndex": 14 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 12, "endColumnIndex": 14 },
                                "rows": [{ "values": [{ "userEnteredValue": { "formulaValue": "=H8+N8+J8+P8" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "numberFormat": {"type": "currency", "pattern": "$#,##0.00"} } }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        // Total fees cost
                        {
                            "mergeCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 14, "endColumnIndex": 16 },
                                "mergeType": "MERGE_ALL"
                            }
                        },
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 14, "endColumnIndex": 16 },
                                "rows": [{ "values": [{ "userEnteredValue": { "formulaValue": "=J8+P8" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "numberFormat": {"type": "currency", "pattern": "$#,##0.00"} } }] }],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        


                        // Freeze row 8
                        {
                            "updateSheetProperties": {
                                "properties": { "sheetId": process.env.SHEET_ID, "gridProperties": { "frozenRowCount": 8 } },
                                "fields": "gridProperties.frozenRowCount"
                            }
                        },

                        //Add headers to rows 7 and 8
                        {
                            "updateCells": {
                                "range": { "sheetId": process.env.SHEET_ID, "startRowIndex": 6, "endRowIndex": 8, "startColumnIndex": 0, "endColumnIndex": 28 },
                                "rows": [
                                    {
                                        "values": [{ "userEnteredValue": { "stringValue": "Count" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Name" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Ticker" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "CA" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Transaction ID" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Entry Dates" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Tokens" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Amount" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Average Buy" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Fees" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Transaction ID" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Exit Dates" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Tokens" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Amount" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Average Sell" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Fees" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Current Price" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Unrealized PnL" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Profit" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Date" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Transaction ID" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Total Amount" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Received" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Withdrawn" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                                        { "userEnteredValue": { "stringValue": "Fees" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } }]
                                    },
                                    {
                                        "values": [{ "userEnteredValue": { "formulaValue": "=SUM(A9:A)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "formulaValue": "=SUM(H9:H)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "formulaValue": "=SUM(J9:J)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "formulaValue": "=SUM(N9:N)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "formulaValue": "=SUM(P9:P)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "formulaValue": "=SUM(R9:R)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "formulaValue": "=SUM(S9:S)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "formulaValue": "=SUM(X9:X)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "formulaValue": "=SUM(Y9:Y)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "formulaValue": "=SUM(Z9:Z)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                                        { "userEnteredValue": { "formulaValue": "=SUM(AA9:AA)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } }]
                                    }
                                ],
                                "fields": "userEnteredValue,userEnteredFormat"
                            }
                        },
                        // Conditional Formatting
                        {
                            "addConditionalFormatRule": {
                                "rule": {
                                    "ranges": [
                                        {
                                            "sheetId": process.env.SHEET_ID,
                                            "startRowIndex": 2,
                                            "endRowIndex": 4,
                                            "startColumnIndex": 10,
                                            "endColumnIndex": 12
                                        }
                                    ],
                                    "booleanRule": {
                                        "condition": {
                                            "type": "NUMBER_GREATER",
                                            "values": [
                                                {
                                                    "userEnteredValue": "0"
                                                }
                                            ]
                                        },
                                        "format": {
                                            "backgroundColor": {
                                                "red": 0.7137254901960784,
                                                "green": 0.8431372549019608,
                                                "blue": 0.6588235294117647
                                            }
                                        }
                                    }
                                },
                                "index": 0
                            }
                        },
                        {
                            "addConditionalFormatRule": {
                                "rule": {
                                    "ranges": [
                                        {
                                            "sheetId": process.env.SHEET_ID,
                                            "startRowIndex": 2,
                                            "endRowIndex": 4,
                                            "startColumnIndex": 10,
                                            "endColumnIndex": 12
                                        }
                                    ],
                                    "booleanRule": {
                                        "condition": {
                                            "type": "NUMBER_LESS",
                                            "values": [
                                                {
                                                    "userEnteredValue": "0"
                                                }
                                            ]
                                        },
                                        "format": {
                                            "backgroundColor": {
                                                "red": 0.8784313725490196,
                                                "green": 0.4,
                                                "blue": 0.4
                                            }
                                        }
                                    }
                                },
                                "index": 1
                            }
                        },
                        // Add Borders
                        {
                            "updateBorders": {
                                "range": {
                                "sheetId": process.env.SHEET_ID,  
                                "startRowIndex": 0,  
                                "endRowIndex": 4,    
                                "startColumnIndex": 0, 
                                "endColumnIndex": 4   
                                },
                                "top": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "bottom": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "left": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "right": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "innerHorizontal": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "innerVertical": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                            }
                        }
                      },
                      {
                            "updateBorders": {
                                "range": {
                                "sheetId": process.env.SHEET_ID,  
                                "startRowIndex": 0,  
                                "endRowIndex": 4,    
                                "startColumnIndex": 5, 
                                "endColumnIndex": 9   
                                },
                                "top": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "bottom": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "left": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "right": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "innerHorizontal": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "innerVertical": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                            }
                        }
                    },
                                {
                                    "updateBorders": {
                                        "range": {
                                        "sheetId": process.env.SHEET_ID,  
                                        "startRowIndex": 0,  
                                        "endRowIndex": 4,    
                                        "startColumnIndex": 10, 
                                        "endColumnIndex": 14   
                                        },
                                        "top": {
                                        "style": "SOLID",
                                        "width": 1,
                                        "color": {
                                            "red": 0.0,
                                            "green": 0.0,
                                            "blue": 0.0
                                        }
                                        },
                                        "bottom": {
                                        "style": "SOLID",
                                        "width": 1,
                                        "color": {
                                            "red": 0.0,
                                            "green": 0.0,
                                            "blue": 0.0
                                        }
                                        },
                                        "left": {
                                        "style": "SOLID",
                                        "width": 1,
                                        "color": {
                                            "red": 0.0,
                                            "green": 0.0,
                                            "blue": 0.0
                                        }
                                        },
                                        "right": {
                                        "style": "SOLID",
                                        "width": 1,
                                        "color": {
                                            "red": 0.0,
                                            "green": 0.0,
                                            "blue": 0.0
                                        }
                                        },
                                        "innerHorizontal": {
                                        "style": "SOLID",
                                        "width": 1,
                                        "color": {
                                            "red": 0.0,
                                            "green": 0.0,
                                            "blue": 0.0
                                        }
                                        },
                                        "innerVertical": {
                                        "style": "SOLID",
                                        "width": 1,
                                        "color": {
                                            "red": 0.0,
                                            "green": 0.0,
                                            "blue": 0.0
                                        }
                                    }
                                }
                            },
                            {
                                "updateBorders": {
                                    "range": {
                                    "sheetId": process.env.SHEET_ID,  
                                    "startRowIndex": 6,  
                                    "endRowIndex": 8,    
                                    "startColumnIndex": 0, 
                                    "endColumnIndex": 19   
                                    },
                                    "top": {
                                    "style": "SOLID",
                                    "width": 1,
                                    "color": {
                                        "red": 0.0,
                                        "green": 0.0,
                                        "blue": 0.0
                                    }
                                    },
                                    "bottom": {
                                    "style": "SOLID",
                                    "width": 1,
                                    "color": {
                                        "red": 0.0,
                                        "green": 0.0,
                                        "blue": 0.0
                                    }
                                    },
                                    "left": {
                                    "style": "SOLID",
                                    "width": 1,
                                    "color": {
                                        "red": 0.0,
                                        "green": 0.0,
                                        "blue": 0.0
                                    }
                                    },
                                    "right": {
                                    "style": "SOLID",
                                    "width": 1,
                                    "color": {
                                        "red": 0.0,
                                        "green": 0.0,
                                        "blue": 0.0
                                    }
                                    },
                                    "innerHorizontal": {
                                    "style": "SOLID",
                                    "width": 1,
                                    "color": {
                                        "red": 0.0,
                                        "green": 0.0,
                                        "blue": 0.0
                                    }
                                    },
                                    "innerVertical": {
                                    "style": "SOLID",
                                    "width": 1,
                                    "color": {
                                        "red": 0.0,
                                        "green": 0.0,
                                        "blue": 0.0
                                    }
                                }
                            }
                        },
                        {
                            "updateBorders": {
                                "range": {
                                "sheetId": process.env.SHEET_ID,  
                                "startRowIndex": 4,  
                                "endRowIndex": 8,    
                                "startColumnIndex": 21, 
                                "endColumnIndex": 28   
                                },
                                "top": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "bottom": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "left": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "right": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "innerHorizontal": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "innerVertical": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                            }
                        }
                    },
                        {
                            "updateBorders": {
                                "range": {
                                "sheetId": process.env.SHEET_ID,  
                                "startRowIndex": 0,  
                                "endRowIndex": 4,    
                                "startColumnIndex": 14, 
                                "endColumnIndex": 16   
                                },
                                "top": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "bottom": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "left": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "right": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "innerHorizontal": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                                },
                                "innerVertical": {
                                "style": "SOLID",
                                "width": 1,
                                "color": {
                                    "red": 0.0,
                                    "green": 0.0,
                                    "blue": 0.0
                                }
                            }
                        }
                    },
                        // Add background colour
                        {
                            "updateCells": {
                                "range": {
                                    "sheetId": process.env.SHEET_ID,
                                    "startRowIndex": 6,
                                    "endRowIndex": 7,
                                    "startColumnIndex": 0,
                                    "endColumnIndex": 19,
                                },
                                "rows": [
                                    {
                                        "values": [
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 1.0,
                                                        "green": 0.8980392156862745,
                                                        "blue": 0.6
                                                    }
                                                }
                                            },
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 1.0,
                                                        "green": 0.8980392156862745,
                                                        "blue": 0.6
                                                    }
                                                }
                                            },
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 1.0,
                                                        "green": 0.8980392156862745,
                                                        "blue": 0.6
                                                    }
                                                }
                                            },
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 1.0,
                                                        "green": 0.8980392156862745,
                                                        "blue": 0.6
                                                    }
                                                }
                                            },
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 1.0,
                                                        "green": 0.8980392156862745,
                                                        "blue": 0.6
                                                    }
                                                }
                                            },
                                            {
                                                userEnteredFormat: {
                                                    backgroundColor: {
                                                        red: 0.6431372549019608,
                                                        green: 0.7607843137254902,
                                                        blue: 0.9568627450980393
                                                    }
                                                }
                                            },
                                            {
                                                userEnteredFormat: {
                                                    backgroundColor: {
                                                        red: 0.6431372549019608,
                                                        green: 0.7607843137254902,
                                                        blue: 0.9568627450980393
                                                    }
                                                }
                                            },
                                            {
                                                userEnteredFormat: {
                                                    backgroundColor: {
                                                        red: 0.6431372549019608,
                                                        green: 0.7607843137254902,
                                                        blue: 0.9568627450980393
                                                    }
                                                }
                                            },
                                            {
                                                userEnteredFormat: {
                                                    backgroundColor: {
                                                        red: 0.6431372549019608,
                                                        green: 0.7607843137254902,
                                                        blue: 0.9568627450980393
                                                    }
                                                }
                                            },
                                            {
                                                userEnteredFormat: {
                                                    backgroundColor: {
                                                        red: 0.6431372549019608,
                                                        green: 0.7607843137254902,
                                                        blue: 0.9568627450980393
                                                    }
                                                }
                                            },
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 0.7058823529411765,
                                                        "green": 0.6549019607843137,
                                                        "blue": 0.8392156862745098
                                                    }
                                                }
                                            },
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 0.7058823529411765,
                                                        "green": 0.6549019607843137,
                                                        "blue": 0.8392156862745098
                                                    }
                                                }
                                            },
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 0.7058823529411765,
                                                        "green": 0.6549019607843137,
                                                        "blue": 0.8392156862745098
                                                    }
                                                }
                                            },
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 0.7058823529411765,
                                                        "green": 0.6549019607843137,
                                                        "blue": 0.8392156862745098
                                                    }
                                                }
                                            },
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 0.7058823529411765,
                                                        "green": 0.6549019607843137,
                                                        "blue": 0.8392156862745098
                                                    }
                                                }
                                            },
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 0.7058823529411765,
                                                        "green": 0.6549019607843137,
                                                        "blue": 0.8392156862745098
                                                    }
                                                }
                                            },
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 0.8352941176470589,
                                                        "green": 0.6509803921568628,
                                                        "blue": 0.7411764705882353
                                                    }
                                                }
                                            },
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 0.8352941176470589,
                                                        "green": 0.6509803921568628,
                                                        "blue": 0.7411764705882353
                                                    }
                                                }
                                            },
                                            {
                                                "userEnteredFormat": {
                                                    "backgroundColor": {
                                                        "red": 0.8352941176470589,
                                                        "green": 0.6509803921568628,
                                                        "blue": 0.7411764705882353
                                                    }
                                                }
                                            },
                                        ]
                                    }
                                ],
                                "fields": "userEnteredFormat.backgroundColor"
                            } 
                        }
                    ]
                }, function(err, response) {
                    if (err) {
                        console.log('The API returned an error: ' + err);
                    } else {
                        console.log('Succesfully formatted');
                    }
                }
            });
        } else {
            let response = await sheets.spreadsheets.values.get({
                auth: jwtClient,
                spreadsheetId: spreadsheetId,
                range: `${process.env.sheetName}!A9:P`
            });
            if (response.data.values != undefined) {
                transactionArray = response.data.values
            }

            response = await sheets.spreadsheets.values.get({
                auth: jwtClient,
                spreadsheetId: spreadsheetId,
                range: `${process.env.sheetName}!V9:AA`
            });
            if (response.data.values != undefined) {
                transferArray = response.data.values
            }

            response = await sheets.spreadsheets.values.get({
                auth: jwtClient,
                spreadsheetId: spreadsheetId,
                range: `${process.env.sheetName}!Q9:Q`
            });
            if (response.data.values != undefined) {
                currentPriceArray = response.data.values
            }
        }

    } catch (err) {
        console.log('Error fetching sheet information:', err)
        return
    }

//Gets wallet address in an foramtted enviroment
    if (!wallet) {
        try {
            const response = await sheets.spreadsheets.values.get({
                auth: jwtClient,
                spreadsheetId: spreadsheetId,
                range: `${process.env.sheetName}!C3`
            });
                wallet = response.data.values[0][0]
                console.log('Wallet:' + wallet)
        } catch (err) {
            console.log('The API returned an error: ' + err);
        }
}
    
    // Determine aggregator
    try {
        aggregatorList = await fetch('https://quote-api.jup.ag/v6/program-id-to-label', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        console.log("Fetched active program ID's")
        aggregatorList = await aggregatorList.json()
    } catch (err) {
        console.log('Error while fetching aggregator:', err)
    }

// Gets Transaction Signitures
    while (signatures.length == 0) {
        try{
            const pubkey = new web3.PublicKey(wallet);
            solBalance = await solana.getBalance(pubkey);
            console.log('Sol Balance:', solBalance)
            transactionList = await solanaQuickNode.getSignaturesForAddress(pubkey);
            signatures = transactionList.map(item => item.signature)
            console.log('Signature', signatures.length)
            let transLength = signatures.length
            while (transLength >= 1000) {
                //console.log('MORE THAN 1000 SIGNATURES')
                let newSignatures = [];
                const lastSignature = signatures[signatures.length - 1];
                //console.log(lastSignature)
                const nextSignatures = await solanaQuickNode.getSignaturesForAddress(pubkey, { before: lastSignature });
                newSignatures = nextSignatures.map(item => item.signature)
                signatures = [...signatures, ...newSignatures]
                transLength = newSignatures.map(item => item.signature).length
                console.log('Signature', signatures.length)
            };
        } catch (err) {
            console.log('Error fetching Addresses:', err)
            break
        }
    }
    signatures = signatures.reverse()
    console.log(signatures)
    console.log('FINAL SIGNATURE COUNT:',(signatures.length))

    try {
        response = await sheets.spreadsheets.values.batchGet({
            auth: jwtClient,
            spreadsheetId: spreadsheetId,
            ranges: [`${process.env.sheetName}!E9:E`, `${process.env.sheetName}!K9:K`, `${process.env.sheetName}!W9:W`],
        });
        console.log('Fetching Previous signatures')
      } catch (err) {
        console.log('The API returned an error: ' + err);
      }
      
      const array = [response.data.valueRanges[0].values, response.data.valueRanges[1].values, response.data.valueRanges[2].values]
      
      const result =[]

      for (let arr of array) {
        try {
        for (let subArray of arr) {
          // If the string contains a comma, split it and push each part
          if (subArray[0] != undefined) {
            if (subArray[0].includes(',')) {
              const parts = subArray[0].split(',').map(str => str.trim());
              result.push(...parts); // Spread operator to push each part into result
            } else {
              result.push(subArray[0]); // If no comma, just push the string
            }
          }
        } 
        } catch {
            console.log('No signatures')
        }
      }
      console.log(`${result.length} previous signatures found`)

      //for (let i = 0; i < signatures.length; i++) {
      //  // Check if the current element exists in the second array
      //  const indexInArray2 = result.indexOf(result[i]);
      //  
      //  if (indexInArray2 !== -1) {
//
      //    result.splice(indexInArray2, 1);
      //    
      //    signatures.splice(i, 1);
      //    
      //    // Adjust the index because it just removed an element from array1
      //    i--;
      //  }
      //}  

      signatures = signatures.filter(x => !result.includes(x));
      console.log(signatures)

      if (signatures.length == 0) {
        console.log('No newer transactions')
        console.log('Retrieving latest token prices...')
        currentPriceArray = []
        let tokenCurrentPrice = null
        for (let i of transactionArray) {
            let tokenId = i[3]
        
            try {
                const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenId}`, {
                    method: 'GET',
                    headers: {},
                });
                const tokenData = await response.json();
                
                tokenCurrentPrice = tokenData.pairs[0].priceUsd;
            } catch (err) {
                
            }
            // Backup 1
            if (!tokenCurrentPrice) {
                try {
                    const umi = createUmi.createUmi(process.env.RPCURL).use(dasApi.dasApi());
                    const assetId = publicKey.publicKey(tokenId);
                    const tokenData = await umi.rpc.getAsset(assetId);
                    tokenCurrentPrice = tokenData.token_info.price_info.price_per_token;
                } catch (err) {
                    
                }
            }
            //backup 2
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
            currentPriceArray.push([tokenCurrentPrice])
        }
        console.log(currentPriceArray)
        sheets.spreadsheets.values.batchUpdate({
            auth: jwtClient,
            spreadsheetId: spreadsheetId,
            resource: {
                valueInputOption: 'USER_ENTERED',
                data: [
                    {
                        range: `${process.env.sheetName}!Q9:Q`,
                        values: currentPriceArray
                    },
                    {
                        range: `${process.env.sheetName}!H3:I4`,
                        values: [[solBalance * 1e-9]]
                    },
                ]
            }
        })
        

        return
      }

//For troubleshooting
    let signature = ['243SqJgDxKpBuh9jwc4bsMxzxSAiiaGe6bPG9vnKaqdxrQ52foTHqw1gUHSzscvjJbHi9tGKAQ2kz85DgS8Lz3eY', '5Reewi7iJ1oJUTGYzSJCR2B5gfC55wbD1hGBtyaQCJcy4SMLR9AtPVBK8L6wCE5wPabijWSyD7kUxCWQ3VygeMEA']
    //
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
        let aggregator = [];
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
        //if (forIteration < 0 || forIteration > 50) {
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
        
        for (let j of transactionData.transaction.message.instructions) {
            if (aggregatorList[j.programId] != undefined) {
                aggregator.push(aggregatorList[j.programId])
            }
        }
        transactionData.meta.innerInstructions.forEach(innerInstructions => {
            innerInstructions.instructions.forEach(instructions => {
                if (aggregatorList[instructions.programId] != undefined) {
                    
                    aggregator.push(aggregatorList[instructions.programId])
                }
            })
           
        })
            
        if (aggregator.length == 1){
            console.log(`1 aggregator pathway: ${aggregator[0]}`)
        } else if (aggregator.length > 1) {
            console.log(`${aggregator.length} aggregator pathways: ${aggregator}`)
        }

// Determines if its a send or Receive transfer
        if (!transactionData.meta.innerInstructions || (Array.isArray(transactionData.meta.innerInstructions) && transactionData.meta.innerInstructions.length == 0)) {
            console.log('TRANSFER TRANSACTION:');
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
                        let newEntry = [
                            'Error Incoming transaction',
                            i,
                            null,
                            null,
                            null,
                            null
                        ];
                        transferArray.push(newEntry)
                        console.log('Error incoming transaction:', newEntry)
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
                            parseFloat((solAvgPrice * ((transactionData.meta.preBalances[0] - transactionData.meta.postBalances[0]) * 1e-9).toPrecision(15)).toFixed(2))
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
                            (solAmount * 1e-9).toPrecision(15),
                            parseFloat((solAvgPrice * (transactionData.meta.fee * 1e-9).toPrecision(15)).toFixed(2))
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
                parseFloat((solAvgPrice * ((transactionData.meta.preBalances[0] - transactionData.meta.postBalances[0]) * 1e-9).toPrecision(15)).toFixed(2))
            ];
            transferArray.push(newEntry)
            continue mainLoop;
        }

// Maps all non sol values to an array
        transactionData.meta.postTokenBalances.forEach(balance => {
            if (balance.owner == wallet && balance.mint != solAddress) {
                tokenAddresses.push([balance.mint])
            }
        })
        if (tokenAddresses.length == 0) {
            transactionData.meta.preTokenBalances.forEach(balance => {
                if (balance.owner == wallet && balance.mint != solAddress) {
                    tokenAddresses.push([balance.mint])
                }
            })
        }
        
        console.log(tokenAddresses)

// Determines SOL net Change 
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
                                const umi = createUmi.createUmi(process.env.RPCURL).use(dasApi.dasApi());
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

            // assign first or last values for the solAmount using [].length - 1] for last or [0] for first

    // Sol amount in Buy
            if ((!preTokenAmount && postTokenAmount > 0) || (postTokenAmount > preTokenAmount)) {
                token.transType = 'buy'
                solNetChange = (transactionData.meta.preBalances[0] - transactionData.meta.postBalances[0])

                // Gets first value
                if (solAmountArray.length != 0) {
                    if ((solAmountArray[0][1] == wallet && solAmountArray.length == 2) || (solAmountArray[0][1] == wallet && solAmountArray[1][1] == wallet && solAmountArray.length == 3 && parseFloat(solAmountArray[0][0]) > parseFloat(solAmountArray[1][0]))) {
                        solAmount = parseFloat(solAmountArray[0][0])
                    } else if (solAmountArray[0][1] == wallet && solAmountArray[1][1] == wallet && solAmountArray.length == 3 && parseFloat(solAmountArray[0][0]) < parseFloat(solAmountArray[1][0])) {
                        solAmount = parseFloat(solAmountArray[1][0])
                    }
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

                if (aggregator[0] == 'Pump.fun') {
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
            
            tokenAvgPrice = parseFloat((solAvgPrice * parseFloat((solAmount * 1e-9).toPrecision(15))).toFixed(2))/(postTokenAmount - preTokenAmount)
                        
            totalFees = ((parseFloat(solNetChange) - parseFloat(solAmount)));
            tokenBuyArray.push(tokenId)

    // Sol amount in Sell
            } else if (((preTokenAmount > postTokenAmount && (postTokenAmount !=0 && postTokenAmount != null)) || (preTokenAmount > postTokenAmount && (postTokenAmount == 0 || postTokenAmount == null)))) {
                token.transType = 'sell'

                solNetChange = transactionData.meta.postBalances[0] - transactionData.meta.preBalances[0]
                
                
                // Last value typically the amount being deposited
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

            if (aggregator.length == 0) {
                console.log('No valid Aggregator found')
                solAmount = 0
                tokenAvgPrice = 0
                totalFees = 0
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
            if ((!token.preTokenAmount && token.postTokenAmount > 0) || (token.postTokenAmount > token.preTokenAmount)) {
                transactionType = 'Buy'
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
                        updatedRow[0] = parseFloat(row[0]) + 1
                        updatedRow[4] = `${row[4]}, ${token.signature}`
                        updatedRow[5] = `${row[5]}, ${token.date}`
                        updatedRow[6] = (parseFloat(row[6]) + (token.postTokenAmount - token.preTokenAmount))
                        updatedRow[7] = parseFloat(row[7]) + parseFloat((solAvgPrice * parseFloat((token.solAmount * 1e-9).toPrecision(15))).toFixed(2))
                        updatedRow[8] = updatedRow[7]/updatedRow[6]
                        //if (buyCount == 2) {
                        //    updatedRow[8] = updatedRow[7]/updatedRow[6]
                        //} else {
                        //    updatedRow[8] = ((parseFloat(row[8]) * (buyCount - 1) + token.avgPrice)/buyCount)
                        //}
                        updatedRow[9] = parseFloat(row[9]) + parseFloat((solAvgPrice * parseFloat(token.fees.toPrecision(15))).toFixed(2))
                        console.log("Updated row:", updatedRow);
                        //console.log("After updates:", transactionArray);
                        return updatedRow
                    }
                    return row 
                });
                if (!match) {
                    // Data layout (BUY): [[Transaction Count: Name, Ticker, CA, TransactionID, Entry Dates, Tokens, SOL (bought), Average Buy, Fees (SOL)]] 
                    const newEntry = [transCount, token.tokenName, token.tokenSymbol, token.address, token.signature, token.date, token.postTokenAmount, parseFloat((solAvgPrice * parseFloat((token.solAmount * 1e-9).toPrecision(15))).toFixed(2)), parseFloat(token.avgPrice.toPrecision(15)), parseFloat((solAvgPrice * parseFloat(token.fees.toPrecision(15))).toFixed(2))]
                        
                    transactionArray.push(newEntry)
                }

            } else if ((token.preTokenAmount > token.postTokenAmount && (token.postTokenAmount !=0 && token.postTokenAmount != null)) || (token.preTokenAmount > token.postTokenAmount && (token.postTokenAmount == 0 || token.postTokenAmount == null))) {
                transactionType = 'Sell'
                
                transactionArray = transactionArray.map(row => {
                    console.log(`Checking row[3]: ${row[3]}, tokenId: ${token.address}`);
                    if (row[3] === token.address) {
                        updatedRow = [...row];
                        console.log("Updating row:", updatedRow);
                        // Checks if token has been sold before
                        if (!row[10]) {
                        
                            let newEntry = [token.signature, token.date, (token.preTokenAmount - token.postTokenAmount), parseFloat((solAvgPrice * parseFloat((token.solAmount * 1e-9).toPrecision(15))).toFixed(2)), parseFloat(token.avgPrice.toPrecision(15)), parseFloat((solAvgPrice * parseFloat(token.fees.toPrecision(15))).toFixed(2))]
                            updatedRow[0] = parseFloat(row[0]) + 1

                            return [...updatedRow, ...newEntry];
                        } else {

                            sellCount = row[10].split(",").length + 1
                            console.log('Sell Count:', sellCount)

                            updatedRow[0] = parseFloat(row[0]) + 1
                            updatedRow[10] = `${row[10]}, ${token.signature}`
                            updatedRow[11] = `${row[11]}, ${token.date}`
                            updatedRow[12] = (parseFloat(row[12]) + (token.preTokenAmount - token.postTokenAmount))
                            updatedRow[13] = parseFloat(row[13]) + parseFloat((solAvgPrice * parseFloat((token.solAmount * 1e-9).toPrecision(15))).toFixed(2))
                            updatedRow[14] = updatedRow[13]/updatedRow[12]
                            //if (sellCount == 2) {
                            //    updatedRow[14] = parseFloat(((parseFloat(row[14]) + token.avgPrice)/2).toPrecision(15))
                            //} else {
                            //    updatedRow[14] = (parseFloat(row[14]) * (sellCount - 1) + token.avgPrice)/sellCount
                            //}
                            updatedRow[15] = parseFloat(row[15]) + parseFloat((solAvgPrice * parseFloat(token.fees.toPrecision(15))).toFixed(2))
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
                    //console.log(symbol)
                    

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
                                solAmount = (1/solAvgPrice) * (tokens[tokenKey].preTokenAmount - tokens[tokenKey].postTokenAmount) * 1e9
                            } else if ((!preTokenAmount && postTokenAmount > 0) || (postTokenAmount > preTokenAmount)) {
                                //buy
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
                            if (((preTokenAmount > postTokenAmount && (postTokenAmount !=0 && postTokenAmount != null)) || (preTokenAmount > postTokenAmount && (postTokenAmount == 0 || postTokenAmount == null)))) {
                                //sell
                                // Gets the first second last value thats not authoritised by the wallet
                                solAmountArray.reverse().every(a => {
                                    if (a[1] != wallet) {
                                        console.log('Found key')
                                        tokens[tokenKey].solAmount = parseFloat(solAmountArray[c + 1][0])
                                        return false
                                    } else {
                                        c += 1
                                        return true
                                    }
                                })
                            } else if ((!preTokenAmount && postTokenAmount > 0) || (postTokenAmount > preTokenAmount)) {
                                // buy
                                solAmountArray.reverse().every(a => {
                                    if (a[1] == wallet) {
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
            }
                    
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
                        console.log(tokens[tokenKey].solAmount)
                        
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
                    if ((!tokens[tokenKey].preTokenAmount && tokens[tokenKey].postTokenAmount > 0) || (tokens[tokenKey].postTokenAmount > tokens[tokenKey].preTokenAmount)) {
                        transactionType = 'Buy'
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
                                updatedRow[0] = parseFloat(row[0]) + 1
                                updatedRow[4] = `${row[4]}, ${tokens[tokenKey].signature}`
                                updatedRow[5] = `${row[5]}, ${tokens[tokenKey].date}`
                                updatedRow[6] = (parseFloat(row[6]) + (tokens[tokenKey].postTokenAmount - tokens[tokenKey].preTokenAmount))
                                updatedRow[7] = parseFloat(row[7]) + parseFloat((solAvgPrice * parseFloat((tokens[tokenKey].solAmount * 1e-9).toPrecision(15))).toFixed(2))
                                updatedRow[8] = updatedRow[7]/updatedRow[6]
                                //if (buyCount == 2) {
                                //    updatedRow[8] = ((parseFloat(row[8]) + tokens[tokenKey].avgPrice)/2) 
                                //} else {
                                //    updatedRow[8] = ((parseFloat(row[8]) * (buyCount - 1) + tokens[tokenKey].avgPrice)/buyCount) 
                                //}
                                updatedRow[9] = parseFloat(row[9]) + parseFloat((solAvgPrice * parseFloat(tokens[tokenKey].fees.toPrecision(15))).toFixed(2)) 
                                console.log("Updated row:", updatedRow);
                                //console.log("After updates:", transactionArray);
                                return updatedRow
                            }
                            return row 
                        });
                        if (!match) {
                            // Data layout (BUY): [[Transaction Count: Name, Ticker, CA, TransactionID, Entry Dates, Tokens, SOL (bought), Average Buy, Fees (SOL)]] 
                            const newEntry = [transCount , tokens[tokenKey].tokenName, tokens[tokenKey].tokenSymbol, tokens[tokenKey].address, tokens[tokenKey].signature, tokens[tokenKey].date, tokens[tokenKey].postTokenAmount, parseFloat((solAvgPrice * parseFloat((tokens[tokenKey].solAmount * 1e-9).toPrecision(15))).toFixed(2)), parseFloat(tokens[tokenKey].avgPrice.toPrecision(15)), parseFloat((solAvgPrice * parseFloat(tokens[tokenKey].fees.toPrecision(15))).toFixed(2))]
                                
                            transactionArray.push(newEntry)
                        }

                    } else if ((tokens[tokenKey].preTokenAmount > tokens[tokenKey].postTokenAmount && (tokens[tokenKey].postTokenAmount !=0 && tokens[tokenKey].postTokenAmount != null)) || (tokens[tokenKey].preTokenAmount > tokens[tokenKey].postTokenAmount && (tokens[tokenKey].postTokenAmount == 0 || tokens[tokenKey].postTokenAmount == null))) {
                        transactionType = 'Sell'
                        
                        transactionArray = transactionArray.map(row => {
                            console.log(`Checking row[3]: ${row[3]}, tokenId: ${tokens[tokenKey].address}`);
                            if (row[3] === tokens[tokenKey].address) {
                                updatedRow = [...row];
                                
                                // Checks if tokens[tokenKey] has been sold before
                                if (!row[10]) {
                                    
                                    let newEntry = [tokens[tokenKey].signature, tokens[tokenKey].date, (tokens[tokenKey].preTokenAmount - tokens[tokenKey].postTokenAmount), parseFloat((solAvgPrice * parseFloat((tokens[tokenKey].solAmount * 1e-9).toPrecision(15))).toFixed(2)), parseFloat(tokens[tokenKey].avgPrice.toPrecision(15)), parseFloat((solAvgPrice * parseFloat(tokens[tokenKey].fees.toPrecision(15))).toFixed(2))]
                                    updatedRow[0] = parseFloat(row[0]) + 1
                                    console.log('New Sell Array:', [...updatedRow, ...newEntry])
                                    return [...updatedRow, ...newEntry];

                                } else {

                                    sellCount = row[10].split(",").length + 1
                                    console.log('Sell Count:', sellCount)
                                    console.log("Updating row:", updatedRow);

                                    updatedRow[0] = parseFloat(row[0]) + 1
                                    updatedRow[10] = `${row[10]}, ${tokens[tokenKey].signature}`
                                    updatedRow[11] = `${row[11]}, ${tokens[tokenKey].date}`
                                    updatedRow[12] = (parseFloat(row[12]) + (tokens[tokenKey].preTokenAmount - tokens[tokenKey].postTokenAmount))
                                    updatedRow[13] = parseFloat(row[13]) + parseFloat((solAvgPrice * parseFloat((tokens[tokenKey].solAmount * 1e-9).toPrecision(15))).toFixed(2))
                                    updatedRow[14] = updatedRow[13]/updatedRow[12]
                                    //if (sellCount == 2) {
                                    //    updatedRow[14] = (parseFloat(row[14]) + tokens[tokenKey].avgPrice)/2
                                    //} else {
                                    //    updatedRow[14] = ((parseFloat(row[14]) * (sellCount - 1) + tokens[tokenKey].avgPrice)/sellCount) 
                                    //}
                                    updatedRow[15] = parseFloat(row[15]) + parseFloat((solAvgPrice * parseFloat(tokens[tokenKey].fees.toPrecision(15))).toFixed(2))
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
            let newEntry = [
                'Unidentified Token Address',
                i,
                null,
                null,
                null,
                parseFloat((solAvgPrice * parseFloat((transactionData.meta.fee * 1e-9).toPrecision(15))).toFixed(2))
            ];
            transferArray.push(newEntry)
            console.log('Error incoming transaction:', newEntry)
            continue mainLoop;
        }
    }
    
// Logs all data 
    console.log('SHEET DATA')
    console.log(transactionArray)
    console.log(currentPriceArray)
    console.log(transferArray)

    let formulas = [];
    for (let i = 0; i < transactionArray.length; i++) {
        const newEntry = [`=((G${i+9}-M${i+9})*Q${i+9})-((G${i+9}-M${i+9})*(H${i+9}/G${i+9}))`, `=((G${i+9}-M${i+9})*Q${i+9}+N${i+9})-H${i+9}-J${i+9}-P${i+9}`]
        formulas.push(newEntry)
    }

// Writes all the transaction info
    sheets.spreadsheets.values.batchUpdate({
    auth: jwtClient,
    spreadsheetId: spreadsheetId,
    resource: {
        valueInputOption: 'USER_ENTERED',
        data: [
            {
                range: `${process.env.sheetName}!V9:AA`,
                values: transferArray
            },
            {
                range: `${process.env.sheetName}!A9:P`,
                values: transactionArray
            },
            {
                range: `${process.env.sheetName}!Q9:Q`,
                values: currentPriceArray
            },
            {
                range: `${process.env.sheetName}!R9:S`,
                values: formulas
            },
            {
                range: `${process.env.sheetName}!A3:B4`,
                values: [[solPrice]]
            },
            {
                range: `${process.env.sheetName}!H3:I4`,
                values: [[solBalance * 1e-9]]
            },
        ]
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
        } else {
                console.log('Successfully wrote data')
        }
    }
    });
};

initializeWallet();

// TODO
// Update current Price even if all signitures are done

// ISSUES 

