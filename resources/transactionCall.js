// Import Solana Web3.js
const solanaWeb3 = require('@solana/web3.js');

// Function to get transaction details and compute budget
async function getTransactionDetails(signature) {
    // Connect to a Solana RPC endpoint
    const endpoint = 'https://solana-mainnet.g.alchemy.com/v2/yEpLTRshQDR3CNGWUHm6J2Hf9NfEVreF';
    const connection = new solanaWeb3.Connection(endpoint);  
    
    try {
        // Fetch the transaction using the signature
        const transactionResponse = await connection.getParsedTransaction(signature, {maxSupportedTransactionVersion:0});

        if (!transactionResponse) {
            console.log("Transaction not found!");
            return;
        }

        const transaction = transactionResponse.transaction;
        const message = transaction.message;

        let computeUnits = null;
        let lamportsPerUnit = null;

        // Check each instruction for compute budget program
        for (let instruction of message.instructions) {
            // Check if the instruction is from the Compute Budget program
            const programId = instruction.programId.toString();
            if (programId === solanaWeb3.ComputeBudgetProgram.programId.toString()) {
                const computeBudgetInstruction = solanaWeb3.ComputeBudgetProgram.decodeInstruction(instruction);

                // Decode based on the instruction type
                if (computeBudgetInstruction.setComputeUnitLimit) {
                    computeUnits = computeBudgetInstruction.setComputeUnitLimit.units;
                }
                if (computeBudgetInstruction.setComputeUnitPrice) {
                    lamportsPerUnit = computeBudgetInstruction.setComputeUnitPrice.microLamports;
                }
            }
        }

        // Output the compute budget details
        console.log(`Transaction Signature: ${signature}`);
        console.log(`Maximum Compute Units: ${computeUnits ? computeUnits : "Not Set"}`);
        console.log(`Maximum Lamports per Compute Unit: ${lamportsPerUnit ? lamportsPerUnit : "Not Set"}`);
    } catch (error) {
        console.error("Error fetching transaction:", error);
    }
}

// Example usage: replace with your transaction signature
const signature = "RptB5WvgHWVR78z5TWPgiJ19sSwehif3cnSqckR1NfFsTF2tH1sS3SwoQ1DNn7mL7h7UoshVifAVHEmbamZiku9";
getTransactionDetails(signature);
