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
  const solana = new web3.Connection(`https://sleek-purple-shape.solana-mainnet.quiknode.pro/${process.env.API_KEY3}`);
    transaction = await solana.getParsedTransaction(
      "5DB585CjxcgJX3weWP32RM7PnezK1zAWBdAxUsWjFVHHUeB4sr5pnq9nZt2SsF1izQfmRGbeM31RUPGa2K5jHS4o",
      { maxSupportedTransactionVersion: 0 }
    )
  const data = JSON.parse(JSON.stringify(transaction, null, 2))
  console.log(JSON.stringify(transaction, null, 2))
};

getJson();