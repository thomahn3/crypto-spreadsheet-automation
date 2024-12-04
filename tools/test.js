
require('dotenv').config();

async function getData() {
  let aggregatorList = await fetch('https://quote-api.jup.ag/v6/program-id-to-label', {
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    }
  })

  aggregatorList = await aggregatorList.json()

  console.log(aggregatorList)
  console.log(aggregatorList['SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8'])

  for (let k in aggregatorList) {
    console.log(k)
  }
};

getData()
