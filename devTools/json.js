const web3 = require("@solana/web3.js");
require('dotenv').config();

const { appendFileSync } = require('fs');
const origConsole = globalThis.console;
const console = {
    log: (...args) => {
        appendFileSync('./logresults.txt', args.join('\n') + '\n');
        return origConsole.log.apply(origConsole, args);
    }
}

async function getJson() {
  const solana = new web3.Connection(process.env.RPCURL);
    transaction = await solana.getParsedTransaction(
      "64fBEkQFJfuHG8XVvinThKsRTwNYsn1FETb3P454qd5eya75xRcrZVSSXSpBxmG2hFKeEegrGkvDHAqebzvFdCtD",
      { maxSupportedTransactionVersion: 0 }
    )
  const data = JSON.parse(JSON.stringify(transaction, null, 2))
  console.log(JSON.stringify(transaction, null, 2))
};

getJson();