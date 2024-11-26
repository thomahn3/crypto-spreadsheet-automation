  // Extracting information from JSON (computing units, gas fee, timestamp, buy transaction(SOL buy amount, Token recived), sell transaction (SOL recieved, token sold)
        //try {
        //    computeBudget = transactionData.transaction.message.instructions[0].data
        //    computePrice = transactionData.transaction.message.instructions[1].data
        //    gasFee = transactionData.meta.fee
        //} catch (err) {
        //    console.log('ERROR reading compute Data', err)
        //}

        // Decoding computebudget and compute price to get priority fees
        //const schema = { 'struct': { 
        //    'discriminator': 'u8', 
        //    'units': 'u32' 
        //}};
  //
        //// Decodes compute budget and price to find priority fess
        //try {
        //    const decodedComputeBudget = borsh.deserialize(schema, Buffer.from(bs58.default.decode(computeBudget))).units;
        //    const decodedComputePrice = borsh.deserialize(schema, Buffer.from(bs58.default.decode(computePrice))).units;
        //    totalFees = ((decodedComputeBudget * decodedComputePrice) * 1e-15) + (gasFee * 1e-9)
        //    console.log('Total Fees: ' + parseFloat(totalFees).toPrecision(15))
        //} catch (err) {
        //    console.log("Can't determine priority fees: " + err)
        //}