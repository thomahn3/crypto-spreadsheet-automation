async function getTransaction() {
    const response = await fetch('https://api.helius.xyz/v0/transactions?api-key=47b64714-2a32-4a0a-95a1-f8e88c69983f', {
        method: 'POST',
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({'transactions': ['fyTnUs8nivfcBQrsKZib523a2HkxwHrpo8PF8nZemrb1EBPTcdKkbbVqqwWWkcXYdXdgeHdGrDVNBRWT8KLMS1u']}),
    });
    const data = await response.json();
    console.log(JSON.stringify(data))
}

getTransaction()

// Downside is it is jupiter exclusive
