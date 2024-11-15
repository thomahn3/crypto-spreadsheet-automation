const SrchAddress = "2bXjC7XSvxh48prZqJdZqCT8Fp9KGeGnGBkPGnaR2vNp";
const endpoint = "https://api.mainnet-beta.solana.com";
const web3 = require("@solana/web3.js");

const SolanaConnection = new web3.Connection(endpoint);
const getTransactions = async (address) => {
    const pubkey = new web3.PublicKey(address);
    let transactionList = await SolanaConnection.getSignaturesForAddress(pubkey);
    console.log(transactionList);
};

getTransactions(SrchAddress);

// fLiPgg2yTvmgfhiPkKriAHkDmmXGP6CdeFX9UF5o7Zc playflip.gg wallet to filter out
// Habp5bncMSsBC3vkChyebepym5dcTNRYeg2LVG464E96 flip.gg wallet to filter out
