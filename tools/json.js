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
      "3jWEvPmV7HM4dWsNX92D8HPuMpex1UoFi4VvKBYMnPCVymr932c1UTvd4aHyk3NVptEmwA8d4CyHyeUhz1Ah6LJZ",
      { maxSupportedTransactionVersion: 0 }
    )
  const data = JSON.parse(JSON.stringify(transaction, null, 2))
  console.log(JSON.stringify(transaction, null, 2))
};

getJson();