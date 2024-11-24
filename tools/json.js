const web3 = require("@solana/web3.js");
require('dotenv').config();

//const { appendFileSync } = require('fs');
//const origConsole = globalThis.console;
//const console = {
//    log: (...args) => {
//        appendFileSync('./logresults.txt', args.join('\n') + '\n');
//        return origConsole.log.apply(origConsole, args);
//    }
//}

async function getJson() {
  const solana = new web3.Connection(`https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}`);
    transaction = await solana.getParsedTransaction(
      "122amq2zVwHWNJ4vZE5EDhF6YzKUCewWUuF8oNsmU4CGs29LfwoMHmrPed45tEoEXBrTV9NHN1S5x1X23vDG1thc",
      { maxSupportedTransactionVersion: 0 }
    )
  const data = JSON.parse(JSON.stringify(transaction, null, 2))
  console.log(JSON.stringify(transaction, null, 2))
};

getJson();