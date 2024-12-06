
require('dotenv').config();
const web3 = require("@solana/web3.js");

async function getData() {

const urls = [
  `https://sleek-purple-shape.solana-mainnet.quiknode.pro/${process.env.API_KEY3}`,
  `https://solana-mainnet.g.alchemy.com/v2/${process.env.API_KEY}`,
  `https://mainnet.helius-rpc.com/?api-key=${process.env.API_KEY2}`
];

async function testUrls(urls) {
  const results = [];

  for (const url of urls) {
    const solana = new web3.Connection(url);
    const start = performance.now(); // Start timer
    try {
      await solana.getParsedTransaction(
        'jLgLTnhpJFf5faAdeJvP5j4d5hAQboEj7b7U8SrQhFW6k8oHmdfrpkj6Cgpi8pVruSDUfXXUvehNtEi2SroD4GH',
        { maxSupportedTransactionVersion: 0 }
      ); // Make a request to the URL
      const end = performance.now(); // End timer
      results.push({ url, time: end - start }); // Calculate time taken
    } catch (error) {
      results.push({ url, time: Infinity, error: error.message }); // Handle errors
    }
  }

  results.sort((a, b) => a.time - b.time); // Sort by time (ascending)

  console.log("Response times:");
  results.forEach(result => {
    if (result.time === Infinity) {
      console.log(`URL: ${result.url} - Failed: ${result.error}`);
    } else {
      console.log(`URL: ${result.url} - Time: ${result.time.toFixed(2)}ms`);
    }
  });

  const fastest = results.find(result => result.time !== Infinity);
  if (fastest) {
    console.log(`\nFastest URL: ${fastest.url} - Time: ${fastest.time.toFixed(2)}ms`);
  } else {
    console.log("\nNo URLs were reachable.");
  }
}

testUrls(urls);
};

getData()
