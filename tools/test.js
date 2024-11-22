
(async () => {
    try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/CmpuL8k9KY3NrpfDRoJrVmuwd1zRMFRUxX55avyGpump`, {
            method: 'GET',
            headers: {},
        });
        const tokenData = await response.json();
        //console.log(JSON.stringify(tokenData))
        tokenName = tokenData.pairs[0].baseToken.name;
        tokenSymbol = tokenData.pairs[0].baseToken.symbol;
        console.log(JSON.stringify(tokenData))
    } catch (err) {
        console.log(err)
    }
})();