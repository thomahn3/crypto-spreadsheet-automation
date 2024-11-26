const web3 = require("@solana/web3.js");
require('dotenv').config();

(async () => {
  const publicKey = new web3.PublicKey(
    "2bXjC7XSvxh48prZqJdZqCT8Fp9KGeGnGBkPGnaR2vNp"
  );
  const solana = new web3.Connection(`https://sleek-purple-shape.solana-mainnet.quiknode.pro/${process.env.API_KEY3}/`);
  console.log(await solana.getBalance(publicKey));
})();
