require('dotenv').config();
const publicKey = require('@metaplex-foundation/umi');
const createUmi = require('@metaplex-foundation/umi-bundle-defaults');
const dasApi = require('@metaplex-foundation/digital-asset-standard-api');

(async () => {
    
        let tokens = {
          token1: {
            tokenName: 'Drift',
            tokenSymbol: 'DRIFT',
            address: 'DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7',
            signature: '5WBX7Dc9sMzWp2vjxDKVRzCxZX9vQVja8LjDabwhfsEZSxjZHmwin2JtT9PFP5h1Qu841TttrJEvfL9UGSXLTcV1',
            date: '12/11/2024 18:10:3'
          },
          token2: {
            tokenName: 'USDT',
            tokenSymbol: 'USDT',
            address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
            signature: '5WBX7Dc9sMzWp2vjxDKVRzCxZX9vQVja8LjDabwhfsEZSxjZHmwin2JtT9PFP5h1Qu841TttrJEvfL9UGSXLTcV1',
            date: '12/11/2024 18:10:3'
          },
        }

      console.log(tokens[0][1])
    
})();