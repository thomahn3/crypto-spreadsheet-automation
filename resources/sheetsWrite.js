let { google }  = require('googleapis');
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

// Writes console outputs to a file
const { appendFileSync } = require('fs');
const origConsole = globalThis.console;
const console = {
    log: (...args) => {
        appendFileSync('./logresults.txt', args.join('\n') + '\n');
        return origConsole.log.apply(origConsole, args);
    }
}

//Google Sheets API
let spreadsheetId = '1NGAVBZwK75jsTkhsRIIN8fGYH6mBc8FbVkfGZ1VHKnM';
let sheetRange = 'automated-crypto!E9:E'
let sheets = google.sheets('v4');
let flattenedArray = [];
let response = null

async function getsig() {
try {
  response = await sheets.spreadsheets.values.batchGet({
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      ranges: ['automated-crypto!E9:E', 'automated-crypto!K9:K', 'automated-crypto!W9:W'],
  });
} catch (err) {
  console.log('The API returned an error: ' + err);
}

const array = [response.data.valueRanges[0].values, response.data.valueRanges[1].values, response.data.valueRanges[2].values]

const result =[]

for (let arr of array) {
  for (let subArray of arr) {
    for (let item of subArray) {
      // If the string contains a comma, split it and push each part
      if (item.includes(',')) {
        const parts = item.split(',').map(str => str.trim());
        result.push(...parts); // Spread operator to push each part into result
      } else {
        result.push(item); // If no comma, just push the string
      }
    }
  }
}
console.log(result.reverse())
console.log(result.length)
}

getsig()