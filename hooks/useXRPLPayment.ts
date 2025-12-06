"use client";
import { useState, useEffect } from "react";
// --- GemWallet Imports ---
import {
    isInstalled as isGemInstalled,
    getAddress as getGemAddress,
    sendPayment as sendGemPayment
} from "@gemwallet/api";
// --- CrossMark Imports ---
import sdk from '@crossmarkio/sdk';

import crypto from 'crypto';
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useWalletContext } from "@/contexts/WalletContext";

// Wallet IDs and Constants
const GEMWALLET_ID = 0;
const CROSSMARK_ID = 1;

const GEMWALLET_ICON_URL = "assets/images/wallets/xrpl/gemwallet.svg";
const CROSSMARK_ICON_URL = "assets/images/wallets/xrpl/crossmark.svg";

// Interface for type safety (just for internal reference)
interface TokenDetails {
    name: string;
    mintAddress: string;
    decimals: number;
}

function convertPaymentIdToDestinationTag(paymentId: string | number): number {
    try {
        // Convert to string if number
        const paymentIdStr = String(paymentId);

        // Hash the payment ID using SHA-256
        const hash = crypto
            .createHash('sha256')
            .update(paymentIdStr)
            .digest();

        // Read first 4 bytes as unsigned 32-bit integer
        const destinationTag = hash.readUInt32BE(0);

        // Ensure it's in valid range (0 to 4,294,967,295)
        return Math.min(destinationTag, 4294967295);
    } catch (error) {
        console.error("Error converting payment ID to destination tag:", error);
        // Fallback: use modulo of the numeric value
        const numericId = parseInt(String(paymentId).replace(/\D/g, '')) || 0;
        return numericId % 4294967295;
    }
}

export const useXrplPayment = () => {
    // Local State
    const [isProcessing, setIsProcessing] = useState(false);
    const [isWalletInstalled, setIsWalletInstalled] = useState(false);
    const [isCrossmarkInstalled, setIsCrossmarkInstalled] = useState(false);

    // Global Wallet Context States
    const {
        walletConnected,
        connectedWalletIndex,
        setWalletAdapter,
        setWalletAddress,
        setWalletConnected,
        setConnectedWalletIndex,
        walletAddress, // Needed for CrossMark's Account field
    } = useWalletContext();

    // Payment Context States
    const {
        token,
        data,
        tokenAmount,
        trx,
        setIsConfirming,
        setIsSuccessful,
        setTransactionLink,
        setStablecoinPaymentMethod,
    } = usePaymentLinkMerchantContext();

    // CrossMark SDK Instance
    const crossmarkSdk = sdk;

    // ----------------------------------------------------------------------
    // 1. Installation Check (CORRECTED) ✅
    // ----------------------------------------------------------------------
    useEffect(() => {
        const checkInstallation = async () => {
            // GemWallet Check: Uses the dedicated imported function (isGemInstalled)
            try {
                const response = await isGemInstalled();
                console.log("Response from GemWallet:", response);
                setIsWalletInstalled(response.result?.isInstalled || false);
            } catch (error) {
                console.error("Error checking GemWallet:", error);
                setIsWalletInstalled(false);
            }

            // CrossMark Check: Uses the documented SDK synchronous method with timeout
            try {
                const isCrossmarkConnected = await crossmarkSdk.async.connect();
                if (typeof isCrossmarkConnected !== 'undefined') {
                    setIsCrossmarkInstalled(isCrossmarkConnected);
                } else {
                    // Handle the case when the value is undefined
                    setIsCrossmarkInstalled(false);
                }
            } catch (error) {
                console.error("Error checking CrossMark installation status:", error);
                setIsCrossmarkInstalled(false);
            }
        };
        checkInstallation();
    }, []);

    // ----------------------------------------------------------------------
    // 2. Fake Adapter Factory
    // ----------------------------------------------------------------------
    const createFakeAdapter = (id: number) => {
        const name = id === GEMWALLET_ID ? "GemWallet" : "CrossMark";
        const icon = id === GEMWALLET_ID ? GEMWALLET_ICON_URL : CROSSMARK_ICON_URL;

        return {
            name,
            icon,
            disconnect: () => {
                console.log(`${name} 'fake' adapter disconnect called.`);
                setWalletConnected(false);
                setConnectedWalletIndex(null);
                setWalletAddress("");
                setWalletAdapter(null);
            },
        };
    };

    // ----------------------------------------------------------------------
    // 3. Connection Logics
    // ----------------------------------------------------------------------
    const connectGemWallet = async () => {
        if (!isWalletInstalled) {
            alert("Please install GemWallet from https://gemwallet.app/");
            setConnectedWalletIndex(-1);
            return;
        }
        try {
            const addressResponse = await getGemAddress();
            if (addressResponse.type === "response" && addressResponse.result?.address) {
                setWalletAddress(addressResponse.result.address);
                setWalletConnected(true);
                setConnectedWalletIndex(GEMWALLET_ID);
                setWalletAdapter(createFakeAdapter(GEMWALLET_ID));
                setStablecoinPaymentMethod("");
            } else {
                setConnectedWalletIndex(-1);
            }
        } catch (err) {
            console.error("GemWallet connection failed:", err);
            setConnectedWalletIndex(-1);
        }
    };

    const connectCrossmarkWallet = async () => {
        if (!isCrossmarkInstalled) {
            alert("Please install the CrossMark Wallet extension.");
            setConnectedWalletIndex(-1);
            return;
        }
        try {
            // NOTE: Using sdk.async.signInAndWait() as specified in the latest prompt
            let signInResponse = await crossmarkSdk.async.signInAndWait();

            // ✅ FIX: Access the address deeper within the response structure
            const address = signInResponse.response?.data?.address;

            if (address) {
                setWalletAddress(address);
                setWalletConnected(true);
                setConnectedWalletIndex(CROSSMARK_ID);
                setWalletAdapter(createFakeAdapter(CROSSMARK_ID));
                setStablecoinPaymentMethod("");
            } else {
                setConnectedWalletIndex(-1);
            }
        } catch (err) {
            console.error("CrossMark connection failed:", err);
            setConnectedWalletIndex(-1);
        }
    };

    // Public Connect Wallet (Router)
    const connectWallet = async (id: number) => {
        setConnectedWalletIndex(id);
        if (id === GEMWALLET_ID) {
            await connectGemWallet();
        } else if (id === CROSSMARK_ID) {
            await connectCrossmarkWallet();
        } else {
            console.warn(`Wallet ID ${id} not supported by this XRPL hook.`);
            setConnectedWalletIndex(-1);
        }
    };

    // ----------------------------------------------------------------------
    // 4. Dynamic PayCoin Function
    // ----------------------------------------------------------------------
    const payCoin = async () => {
        const amountToPay = tokenAmount;
        const merchantAddress = data?.transactions?.merchant_address;
        const currentWalletId = connectedWalletIndex;
        const userAddress = walletAddress;

        if (!walletConnected || !merchantAddress || !token || amountToPay <= 0) {
            alert("Missing wallet connection or transaction details.");
            return null;
        }

        setIsProcessing(true);

        // Issued Currency (Token) Payload
        const tokenAmountObject = {
            currency: token.name,
            issuer: token.mintAddress,
            value: String(amountToPay),
        };

        try {
            let transactionResult = null;
            setIsConfirming(true);
            const destinationTag = trx ? convertPaymentIdToDestinationTag(trx) : undefined;
            if (currentWalletId === GEMWALLET_ID) {
                // GEMWALLET PAYMENT
                // const payload = { amount: tokenAmountObject, destination: merchantAddress, destinationTag: trx ?? "" };
                const payload = { amount: tokenAmountObject, destination: merchantAddress, destinationTag: destinationTag };
                const response = await sendGemPayment(payload);
                transactionResult = response.result?.hash;

            } else if (currentWalletId === CROSSMARK_ID) {
                // CROSSMARK PAYMENT: Use documentation object literal style
                if (!userAddress) throw new Error("Wallet address is missing for CrossMark transaction.");

                if (tokenAmountObject.currency === "RLUSD") {
                    tokenAmountObject.currency = "524C555344000000000000000000000000000000";
                }
                const txPayload = {
                    TransactionType: 'Payment' as const,
                    // Use the connected address as shown in the CrossMark documentation
                    Account: userAddress,
                    Destination: merchantAddress,
                    Amount: tokenAmountObject,
                    DestinationTag: destinationTag
                };

                // Use the documented signAndSubmitAndWait method
                const response = await crossmarkSdk.async.signAndSubmitAndWait(txPayload);

                // Access the hash as documented: response.response.data.resp.result.hash
                transactionResult = response.response?.data?.resp?.result?.hash;

            } else {
                throw new Error("Unsupported XRPL wallet connected.");
            }

            setIsConfirming(false);

            if (transactionResult) {
                setIsSuccessful(true);
                setTransactionLink(`https://livenet.xrpl.org/transactions/${transactionResult}`);
                return transactionResult;
            } else {
                throw new Error("Transaction rejected or failed by wallet.");
            }
        } catch (err) {
            console.error("Payment error:", err);
            alert("An error occurred during payment.");
            return null;
        } finally {
            setIsProcessing(false);
            setIsConfirming(false);
        }
    };

    // Placeholder to match Solana hook structure
    const quoteAmount = async () => {
        return tokenAmount;
    };

    return {
        isConnected: walletConnected,
        connectedWalletIndex,
        isProcessing,
        connectWallet,
        payCoin,
        isApproved: async () => true,
        approve: async () => { },
        quoteAmount,
    };
};
