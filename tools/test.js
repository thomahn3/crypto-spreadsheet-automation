require('dotenv').config();
const publicKey = require('@metaplex-foundation/umi');
const createUmi = require('@metaplex-foundation/umi-bundle-defaults');
const dasApi = require('@metaplex-foundation/digital-asset-standard-api');

(async () => {
    try {
        const umi = createUmi.createUmi(`https://mainnet.helius-rpc.com/?api-key=${process.env.API_KEY2}`).use(dasApi.dasApi());
        const assetId = publicKey.publicKey('AmrQXwT57S4Acf4tFX8CCdMGRbSB4ezSbvC5icofzmgM');

        const tokenData = await umi.rpc.getAsset(assetId);
        tokenName = tokenData.content.metadata.name;
        tokenSymbol = tokenData.content.metadata.symbol;
        console.log(JSON.stringify(tokenData))
    } catch (err) {
        console.log('Error fetching Token Metadata on DAS')
    }
})();