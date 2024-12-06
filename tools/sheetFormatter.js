var { google } = require('googleapis');
let secretKey = require("../auth/client_secret.json");
let jwtClient = new google.auth.JWT(
       secretKey.client_email,
       null,
       secretKey.private_key,
       ['https://www.googleapis.com/auth/spreadsheets']);
//authenticate request
jwtClient.authorize(function (err, tokens) {
 if (err) {
   console.log(err);
   return;
 } else {
   console.log("Successfully connected!");
 }
});

async function format() {
  //Google Sheets API
// Array of info [Row 1[Column 1, Column 2], Row 2[Column 1, Column 2]]
let spreadsheetId = '1NGAVBZwK75jsTkhsRIIN8fGYH6mBc8FbVkfGZ1VHKnM';
let sheetRange = 'test!A1:AA100';
let format = false
let SHEET_ID = '1946952126'
let sheets = google.sheets('v4');
sheets.spreadsheets.values.get({
   auth: jwtClient,
   spreadsheetId: spreadsheetId,
   range: sheetRange
}, async function (err, response) {
   if (err) {
       console.log('The API returned an error: ' + err);
   } else {
       const data = await JSON.parse(JSON.stringify(response, null))
       console.log(data.data.values)
       if (data.data.values == undefined) {
        console.log('formatting')
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
                    "sheetId": SHEET_ID,
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
                    "sheetId": SHEET_ID,
                    "gridProperties": {
                      "rowCount": 10000  // Set to the desired number of rows
                    }
                  },
                  "fields": "gridProperties.rowCount"
                }
              },
              // sol balance
              {
                "mergeCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 0, "endColumnIndex": 2 },
                  "mergeType": "MERGE_ALL"
                }
              },
              {
                "updateCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 0, "endColumnIndex": 2 },
                  "rows": [{ "values": [{ "userEnteredValue": { "stringValue": "SOL BALANCE" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } }] }],
                  "fields": "userEnteredValue,userEnteredFormat"
                }
              },
              // profit and loss
              {
                "mergeCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 2, "endColumnIndex": 4 },
                  "mergeType": "MERGE_ALL"
                }
              },
              {
                "updateCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 2, "endColumnIndex": 4 },
                  "rows": [{ "values": [{ "userEnteredValue": { "stringValue": "Profit and Loss" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } }] }],
                  "fields": "userEnteredValue,userEnteredFormat"
                }
              },
              // wallet
              {
                "mergeCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 4, "endColumnIndex": 6 },
                  "mergeType": "MERGE_ALL"
                }
              },
              {
                "updateCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 0, "endRowIndex": 2, "startColumnIndex": 4, "endColumnIndex": 6 },
                  "rows": [{ "values": [{ "userEnteredValue": { "stringValue": "Wallet" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } }] }],
                  "fields": "userEnteredValue,userEnteredFormat"
                }
              },
              // Inert wallet here
              {
                "mergeCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 4, "endColumnIndex": 6 },
                  "mergeType": "MERGE_ALL"
                }
              },
              {
                "updateCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 4, "endColumnIndex": 6 },
                  "rows": [{ "values": [{ "userEnteredValue": { "stringValue": "INSERT WALLET HERE" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } }] }],
                  "fields": "userEnteredValue,userEnteredFormat"
                }
              },
              // transfers and error block
              {
                "mergeCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 4, "endRowIndex": 6, "startColumnIndex": 21, "endColumnIndex": 27 },
                  "mergeType": "MERGE_ALL"
                }
              },
              {
                "updateCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 4, "endRowIndex": 6, "startColumnIndex": 21, "endColumnIndex": 27 },
                  "rows": [{ "values": [{ "userEnteredValue": { "stringValue": "Transfers and Error transactions" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } }] }],
                  "fields": "userEnteredValue,userEnteredFormat"
                }
              },
          
              // Adding formulas
              {
                "mergeCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 0, "endColumnIndex": 2 },
                  "mergeType": "MERGE_ALL"
                }
              },
              {
                "updateCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 0, "endColumnIndex": 2 },
                  "rows": [{ "values": [{ "userEnteredValue": { "formulaValue": "=SUM(Y9:Y)+SUM(N9:N)-(SUM(Z9:Z)+SUM(AA9:AA)+H8+J8+P8)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } }] }],
                  "fields": "userEnteredValue,userEnteredFormat"
                }
              },
              {
                "mergeCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 2, "endColumnIndex": 4 },
                  "mergeType": "MERGE_ALL"
                }
              },
              {
                "updateCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 2, "endRowIndex": 4, "startColumnIndex": 2, "endColumnIndex": 4 },
                  "rows": [{ "values": [{ "userEnteredValue": { "formulaValue": "=S8" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } }] }],
                  "fields": "userEnteredValue,userEnteredFormat"
                }
              },
              
          
              // Freeze row 8
              {
                "updateSheetProperties": {
                  "properties": { "sheetId": SHEET_ID, "gridProperties": { "frozenRowCount": 8 } },
                  "fields": "gridProperties.frozenRowCount"
                }
              },
          
               //Add headers to rows 7 and 8
              {
                "updateCells": {
                  "range": { "sheetId": SHEET_ID, "startRowIndex": 6, "endRowIndex": 8, "startColumnIndex": 0, "endColumnIndex": 28 },
                  "rows": [
                    { "values": [{ "userEnteredValue": { "stringValue": "Count" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Name" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Ticker" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "CA" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Transaction ID" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Entry Dates" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Tokens" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "SOL" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Average Buy" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Fees (SOL)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Transaction ID" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Exit Dates" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Tokens" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "SOL" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Average Sell" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Fees (SOL)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Current Price" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Unrealized PnL" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Profit (SOL)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Date" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Transaction ID" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "$ Amount" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "SOL Received" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "SOL Withdrawn" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } },
                      { "userEnteredValue": { "stringValue": "Fees" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE", "textFormat": { "bold": true } } }] },
                    { "values": [{ "userEnteredValue": { "formulaValue": "=SUM(A9:A)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
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
                      { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                      { "userEnteredValue": { "formulaValue": "=SUM(R9:R)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                      { "userEnteredValue": { "formulaValue": "=SUM(S9:S)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                      { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                      { "userEnteredValue": { "stringValue": "" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                      { "userEnteredValue": { "formulaValue": "=SUM(X9:X)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                      { "userEnteredValue": { "formulaValue": "=SUM(Y9:Y)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                      { "userEnteredValue": { "formulaValue": "=SUM(Z9:Z)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } },
                      { "userEnteredValue": { "formulaValue": "=SUM(AA9:AA)" }, "userEnteredFormat": { "horizontalAlignment": "CENTER", "verticalAlignment": "MIDDLE" } }] }
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
                        "sheetId": SHEET_ID,  
                        "startRowIndex": 2,
                        "endRowIndex": 4,
                        "startColumnIndex": 2,
                        "endColumnIndex": 4
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
                          "red": 0.0,
                          "green": 1.0,
                          "blue": 0.0
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
                        "sheetId": SHEET_ID,  
                        "startRowIndex": 2,
                        "endRowIndex": 4,
                        "startColumnIndex": 2,
                        "endColumnIndex": 4
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
                          "red": 1.0,
                          "green": 0.0,
                          "blue": 0.0
                        }
                      }
                    }
                  },
                  "index": 1
                }
              },
              // Add background colour
              {
                "updateCells": {
                  "range": {
                    "sheetId": SHEET_ID,  // Replace with the actual sheet ID
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
          }, function (err, response) {
              if (err) {
                  console.log('The API returned an error: ' + err);
              } else {
                console.log('Succesfully formatted')
              } 
          }
        })
  }
}      
});
  
}

format()