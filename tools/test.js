
require('dotenv').config();

async function getData() {
  const response = await fetch(`https://api.helius.xyz/v0/transactions?api-key=${process.env.API_KEY2}`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({"transactions": ['5tam5RMqR874usYoLJ69FppvdkQLFuKrpmw9Yey8oeTVYS26C5KNZpV7XFFKRdLdBErz7i2VNtiWgMoDjfU8boBm']}),
});
  const data = await response.json();
  console.log(data[0])
}

getData()
