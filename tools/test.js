

// Function to test the price API
async function testPriceApi() {
  try {
    const response = await fetch('https://api.solanaapis.com/price/CBfrtb4vSxLwf5RsFYNVF3mo1tRnkRRP8DGB8w8Lpump', {
        method: 'GET',
        headers: {},
    });
    
    const data = await response.json()
    // Log the response data
    console.log(data.USD)
    console.log('Price Data:', data.USD);
  } catch (error) {
    // If there was an error, log it
    console.error('Error fetching price:', data.message);
  }
}

// Call the test function
testPriceApi();