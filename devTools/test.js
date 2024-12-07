const web3 = require("@solana/web3.js");
(async () => {
  const publicKey = new web3.PublicKey(
    "2bXjC7XSvxh48prZqJdZqCT8Fp9KGeGnGBkPGnaR2vNp"
  );
  const solana = new web3.Connection("https://docs-demo.solana-mainnet.quiknode.pro/");
  console.log(await solana.getBalance(publicKey));
})();
