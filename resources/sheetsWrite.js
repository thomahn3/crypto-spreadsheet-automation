let { google}  = require('googleapis');
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
let spreadsheetId = '1NGAVBZwK75jsTkhsRIIN8fGYH6mBc8FbVkfGZ1VHKnM';
let sheetRange = 'automated-crypto!J2:J3'
let sheets = google.sheets('v4');
// Array of info [Row 1[Column 1, Column 2], Row 2[Column 1, Column 2]]
let values = [
  ['Jarvis'], ['Wealth']
];
const sheetResource = {
  values,
};
sheets.spreadsheets.values.update({
   auth: jwtClient,
   spreadsheetId: spreadsheetId,
   range: sheetRange,
   resource: sheetResource,
   valueInputOption: 'USER_ENTERED'
}, function (err, response) {
   if (err) {
       console.log('The API returned an error: ' + err);
   } else {
        console.log('Successful')
   }
});