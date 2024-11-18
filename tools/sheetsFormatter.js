var { google } = require('googleapis');
let secretKey = require("../client_secret.json");
let spreadsheetId = '1NGAVBZwK75jsTkhsRIIN8fGYH6mBc8FbVkfGZ1VHKnM';
let sheets = google.sheets('v4');
let jwtClient = new google.auth.JWT(
       secretKey.client_email,
       null,
       secretKey.private_key,
       ['https://www.googleapis.com/auth/spreadsheets']);

const sheetId = "1817498683";  // <--- Please set the sheet ID of "MySheet".
const resource = {
  auth: jwtClient,
  spreadsheetId: spreadsheetId,
  resource: {
    requests: [
      {
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 1,
            startColumnIndex: 20,
            endColumnIndex: 20,
          },
          cell: {
            userEnteredFormat: {
              numberFormat: {
                pattern: "dd/mm/yyyy hh:mm:ss",
                type: "DATE",
              },
              horizontalAlignment: "RIGHT", // <--- Added
            },
          },
          fields: "userEnteredFormat",
        },
      },
    ],
  },
};
sheets.spreadsheets.batchUpdate(resource);