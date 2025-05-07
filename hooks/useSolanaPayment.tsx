import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter, TrustWalletAdapter } from "@solana/wallet-adapter-wallets";
import { ComputeBudgetProgram, Connection, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import { useState } from "react";
import { formatUnits, parseUnits } from "viem";

export function useSolanaPayment() {
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const {
        setStablecoinPaymentMethod,
        setIsSuccessful,
        setTransactionLink,
        token,
        data,
        setIsConfirming,
        setIsBroken,
        setPaywith,
        netAndToken,
    } = usePaymentLinkMerchantContext();

    const {
        connectedWalletIndex,
        walletConnected,
        walletAdapter,
        setWalletAdapter,
        setWalletAddress,
        setWalletConnected,
        setConnectedWalletIndex,
    } = useWalletContext()

    const customRpcUrl =
        "https://mainnet.helius-rpc.com/?api-key=f0ae3d5d-3bd5-4a09-b2b6-d3a2b389f2cd";
    const connection = new Connection(customRpcUrl, "finalized");

    /////////////////////////////Function for token swap and transfer starts here ////////////////
    // Replace with the Jupiter API endpoint
    const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6/quote";
    const JUPITER_SWAP_API = "https://quote-api.jup.ag/v6/swap";

    const devWalletAddress = "8ajjPhDqJFWGKAQdagWUQL6YmR4BabKAqixM1AghhTSu"; // Developer's wallet address

    // Step 1: Fetch swap info from Jupiter
    const fetchSwapInfo = async (
        inputMint: string,
        outputMint: string,
        amount: number
    ) => {
        const url = `${JUPITER_QUOTE_API}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=150&&swapMode=ExactIn&onlyDirectRoutes=false&asLegacyTransaction=false&maxAccounts=64&minimizeSlippage=false`;
        const response = await fetch(url);
        const data = await response.json();
        return {
            inAmount: data.inAmount,
            otherAmountThreshold: data.otherAmountThreshold,
            quoteResponse: data,
        };
    };

    // Step 2: Fetch swap transaction from Jupiter
    const fetchSwapTransaction = async (
        walletAddress: PublicKey | null,
        recipientAddress: string,
        swapInfo: any
    ) => {
        if (!walletAddress || !recipientAddress || !swapInfo?.quoteResponse) {
            throw new Error(
                "Invalid parameters: Ensure walletAddress, recipientAddress, and swapInfo are defined."
            );
        }

        const requestBody = {
            userPublicKey: walletAddress.toBase58(),
            destinationTokenAccount: recipientAddress,
            useSharedAccounts: true,
            quoteResponse: swapInfo.quoteResponse,
            allowOptimizedWrappedSolTokenAccount: true,
            asLegacyTransaction: false,
            dynamicComputeUnitLimit: true,
            prioritizationFeeLamports: {
                priorityLevelWithMaxLamports: {
                    global: false,
                    maxLamports: 4000000,
                    priorityLevel: "veryHigh",
                },
            },
            wrapAndUnwrapSol: true,
        };

        const response = await fetch(JUPITER_SWAP_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error fetching swap transaction: ${errorText}`);
        }

        const { swapTransaction, lastValidBlockHeight } = await response.json();
        return { swapTransaction, lastValidBlockHeight };
    };

    // Function to find the fee account and get serialized transactions for the swap
    // Step 3: Send transaction to Solana blockchain
    const sendTransaction = async (
        swapTransaction: string,
        walletAdapter: WalletAdapter
    ) => {
        let latestBlockHash = await connection.getLatestBlockhash();

        // deserialize the transaction
        const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
        console.log(transaction);

        // Set the recent blockhash
        transaction.message.recentBlockhash = latestBlockHash.blockhash;

        const signedTransaction = await (walletAdapter as any).signTransaction(
            transaction
        );

        // Execute the transaction
        const rawTransaction = signedTransaction.serialize();
        console.log("Raw transaction:", rawTransaction);

        latestBlockHash = await connection.getLatestBlockhash();
        const txid = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight: false,
            maxRetries: 5,
        });
        // get the latest block hash
        console.log(`https://solscan.io/tx/${txid}`);
        setIsConfirming(true);
        await connection.confirmTransaction(
            {
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: txid,
            },
            "confirmed"
        );
        setIsConfirming(false);
        setTransactionLink(`https://solscan.io/tx/${txid}`);
        console.log(`https://solscan.io/tx/${txid}`);
        return txid;
    };

    // Step 4: Main function to swap and send token
    const swapAndSendToken = async (
        walletAdapter: WalletAdapter,
        recipientAddress: string,
        inputMint: string,
        outputMint: string,
        amount: number
    ) => {
        try {
            const walletPublicKey = walletAdapter.publicKey;

            console.log("Wallet public key:", walletPublicKey);
            console.log("Fetching swap info for:", {
                walletAdapter,
                recipientAddress,
                inputMint,
                outputMint,
                amount,
            });

            // Step 1: Fetch swap info
            const swapInfo = await fetchSwapInfo(inputMint, outputMint, amount);
            console.log("Swap info fetched:", swapInfo);

            // Step 2: Fetch the swap transaction
            const { swapTransaction } = await fetchSwapTransaction(
                walletPublicKey,
                recipientAddress,
                swapInfo
            );
            console.log("Swap transaction fetched:", swapTransaction);

            // Step 5: Send the transaction to the blockchain
            const txid = await sendTransaction(swapTransaction, walletAdapter);

            console.log("Swap and send transaction completed successfully.");
            console.log("$ sent successfully!\n https://solscan.io/tx/" + txid);

            setIsSuccessful(true);
        } catch (error) {
            console.error("Error during swap and send:", error);
            setIsBroken(true);
            alert("Swap and send failed");
        }
    };

    ///////////////////////////// Function for token swap and transfer ends here ////////////////

    // Function to send token directly
    const sendDirectToken = async (
        walletAdapter: WalletAdapter, // Adapter for interacting with the wallet
        sourceAccount: any, // Token account of the sender
        destinationOwner: PublicKey, // Merchant wallet
        devOwner: PublicKey, // Dev wallet
        mint: PublicKey, // Token mint address
        transferAmount: number, // Amount to transfer
        devFeeAmount: number, // Fee amount to developer
        connection: Connection // Solana connection instance
    ) => {
        try {
            // Ensure PublicKey instances
            const sourcePubKey = new PublicKey(sourceAccount.value[0].pubkey);
            const walletPubKey = walletAdapter.publicKey as PublicKey;

            // Get or create destination associated token account
            const destTokenAccount = await getAssociatedTokenAddress(
                mint,
                destinationOwner
            );

            // Get or create developer associated token account
            const devTokenAccount = await getAssociatedTokenAddress(mint, devOwner);

            const instructions = [
                ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 12345 }),
            ];

            // Check and create destination token account if necessary
            const destAccountInfo = await connection.getAccountInfo(destTokenAccount);

            if (!destAccountInfo) {
                instructions.push(
                    createAssociatedTokenAccountInstruction(
                        walletPubKey,
                        destTokenAccount,
                        destinationOwner,
                        mint,
                        TOKEN_PROGRAM_ID,
                        ASSOCIATED_TOKEN_PROGRAM_ID
                    )
                );
            }

            // Check and create developer token account if necessary
            const devAccountInfo = await connection.getAccountInfo(devTokenAccount);

            if (!devAccountInfo) {
                instructions.push(
                    createAssociatedTokenAccountInstruction(
                        walletPubKey,
                        devTokenAccount,
                        devOwner,
                        mint,
                        TOKEN_PROGRAM_ID,
                        ASSOCIATED_TOKEN_PROGRAM_ID
                    )
                );
            }

            // Add transfer instructions
            instructions.push(
                createTransferInstruction(
                    sourcePubKey,
                    destTokenAccount,
                    walletPubKey,
                    transferAmount,
                    [],
                    TOKEN_PROGRAM_ID
                ),
                createTransferInstruction(
                    sourcePubKey,
                    devTokenAccount,
                    walletPubKey,
                    devFeeAmount,
                    [],
                    TOKEN_PROGRAM_ID
                )
            );

            const latestBlockhash = await connection.getLatestBlockhash("finalized");

            // Create transaction message
            const messageV0 = new TransactionMessage({
                payerKey: walletPubKey,
                recentBlockhash: latestBlockhash.blockhash,
                instructions,
            }).compileToV0Message();

            const versionedTransaction = new VersionedTransaction(messageV0);

            const signedTransaction = await (walletAdapter as any).signTransaction(
                versionedTransaction
            );

            setIsConfirming(true);
            setIsProcessing(false);

            // Send transaction
            const txid = await connection.sendTransaction(signedTransaction, {
                maxRetries: 10,
                skipPreflight: true,
            });

            // Confirm the transaction
            await connection.confirmTransaction(
                {
                    blockhash: latestBlockhash.blockhash,
                    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                    signature: txid,
                },
                "confirmed"
            );
            setIsConfirming(false);
            setTransactionLink(`https://solscan.io/tx/${txid}`);
            setIsSuccessful(true);

            console.log(`Transaction confirmed: https://solscan.io/tx/${txid}`);
        } catch (error) {
            console.error("Error during token transfer:", error);
            // throw new Error('Token transfer failed. Please check the logs.');
            setPaywith("stablecoin");
            setIsProcessing(false);
            setIsConfirming(false);
            alert("Please try again.");
        }
    };

    const quoteAmount = async () => {
        const amount = data?.transactions?.amount;
        const currency: any = netAndToken?.stables.find(
            (t) => t.name === data?.transactions?.currency
        )

        if (token === null || currency === undefined)
            return 0

        if (token.name === currency.name)
            return amount

        const response = await axios.get(`https://quote-api.jup.ag/v6/quote`, {
            params: {
                inputMint: currency.mintAddress, // USDC token
                outputMint: token.mintAddress,
                amount: String(parseUnits(amount, currency.decimals)), // Amount of fromToken you want to swap
                slippage: 1, // Optional: Set slippage tolerance (1%)
                // onlyDirectRoutes: true, // Optional: If you only want direct swap routes (could improve speed)
            },
        });

        return Number(formatUnits(BigInt(response.data.outAmount), token.decimals));
    }

    const payCoin = async () => {
        try {
            if (isProcessing) return;
            setIsProcessing(true);

            const selectedPayToken = token;
            const merchantAddress = data?.transactions?.merchant_address;
            console.log("merchantAddress", merchantAddress);

            const amount = data?.transactions?.amount;
            console.log("amount", amount);
            const targetTokenName = data?.transactions?.currency;

            const selectedToken: any = netAndToken?.stables.find(
                (t) => t.name === targetTokenName
            );
            if (!selectedToken) throw new Error("Selected token not found.");

            const merchantPublicKey = new PublicKey(merchantAddress);
            console.log("merchantPublicKey", merchantPublicKey.toBase58());

            const devWalletPublicKey = new PublicKey(devWalletAddress);
            console.log("devWalletPublicKey", devWalletPublicKey.toBase58());

            const mintTokenAddress = new PublicKey(selectedToken.mintAddress);
            console.log("mintTokenAddress", mintTokenAddress.toBase58());
            console.log("selectedToken.mintAddress", selectedToken.mintAddress);

            const customerPublicKey = new PublicKey(walletAdapter.publicKey);
            console.log("customerPublicKey", customerPublicKey.toBase58());
            if (!selectedPayToken) return;
            const srcAccount = await connection.getTokenAccountsByOwner(
                customerPublicKey,
                {
                    mint: new PublicKey(selectedPayToken.mintAddress),
                }
            );
            console.log("srcAccount", srcAccount);
            console.log("selectedPayToken.mintAddress", selectedPayToken.mintAddress);

            const transferAmount = amount * Math.pow(10, selectedToken.decimals);
            console.log("transferAmount", transferAmount);

            const devFeeAmount = Math.floor(transferAmount * 0.0025); // 0.25%
            console.log("devFeeAmount", devFeeAmount);

            if (selectedPayToken.name === targetTokenName) {
                // Direct transfer
                await sendDirectToken(
                    walletAdapter,
                    srcAccount,
                    merchantPublicKey,
                    devWalletPublicKey,
                    mintTokenAddress,
                    transferAmount - devFeeAmount,
                    devFeeAmount,
                    connection
                );
            } else {
                // Token swap logic (if implemented)
                console.log("Initiating token swap...");
                await swapAndSendToken(
                    walletAdapter,
                    merchantPublicKey.toString(),
                    selectedPayToken.mintAddress,
                    mintTokenAddress.toString(),
                    amount * Math.pow(10, selectedPayToken.decimals)
                );
            }
        } catch (error) {
            console.error("Error during payment:", error);
            alert("Payment failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Function to connect to the wallet
    const connectWallet = async (walletId: number) => {
        const wallets = [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new TrustWalletAdapter(),
        ];
        const wallet = wallets[walletId];

        try {
            await wallet.connect();
            if (wallet.publicKey == null) return;
            setWalletAddress(wallet.publicKey.toString());
            console.log("Connected to wallet:", wallet.publicKey.toString());
            // const publicKey = wallet.publicKey;
            setWalletAdapter(wallet);
            setConnectedWalletIndex(walletId);
            setWalletConnected(true);
            setStablecoinPaymentMethod("");
        } catch (error) {
            console.error("Failed to connect to wallet:", error);
        }
    };
    return {
        isConnected: walletConnected,
        connectedWalletIndex,
        isProcessing,
        isApproved: async () => true,
        approve: async () => {},
        quoteAmount,
        payCoin,
        connectWallet
    };
}