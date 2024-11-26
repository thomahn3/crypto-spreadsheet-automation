var { google } = require('googleapis');
let secretKey = require("../client_secret.json");
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

//Google Sheets API
// Array of info [Row 1[Column 1, Column 2], Row 2[Column 1, Column 2]]
let spreadsheetId = '1NGAVBZwK75jsTkhsRIIN8fGYH6mBc8FbVkfGZ1VHKnM';
let sheetRange = 'automated-crypto!A1:C2';
let sheets = google.sheets('v4');
sheets.spreadsheets.values.get({
   auth: jwtClient,
   spreadsheetId: spreadsheetId,
   range: sheetRange
}, function (err, response) {
   if (err) {
       console.log('The API returned an error: ' + err);
   } else {
       const data = JSON.parse(JSON.stringify(response, null))
       console.log(data.data.values)
   }
});