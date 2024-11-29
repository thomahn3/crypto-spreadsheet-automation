require('dotenv').config();
const publicKey = require('@metaplex-foundation/umi');
const createUmi = require('@metaplex-foundation/umi-bundle-defaults');
const dasApi = require('@metaplex-foundation/digital-asset-standard-api');

(async () => { 
  try {
    const solData = await fetch(`https://api.binance.com/api/v3/klines?symbol=MOODENGUSDC&interval=1s&startTime=1732870111000&endTime=1732870111999`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
  });
  let solAvgPrice = null
      const solPriceList = await solData.json();
      solAvgPrice = JSON.stringify(solPriceList)
      console.log('Sol price at time of transaction: ' + solAvgPrice)
    
  } catch (err) {
      console.log('Error fetching sol price: ' + err)
  }
  
    
})();