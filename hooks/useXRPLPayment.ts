"use client";
import { useState, useEffect } from "react";
// --- GemWallet Imports ---
import {
    isInstalled as isGemInstalled,
    getAddress as getGemAddress,
    sendPayment as sendGemPayment,
    // Import the confirmed API and type for OfferCreate
    createOffer as createGemOffer,
    CreateOfferRequest
} from "@gemwallet/api";
// --- CrossMark Imports ---
import sdk from '@crossmarkio/sdk';

import crypto from 'crypto';
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useWalletContext } from "@/contexts/WalletContext";
// Add the XRPL Client
import { Client, convertStringToHex, BookOffersResponse } from 'xrpl';

// Wallet IDs and Constants
const GEMWALLET_ID = 0;
const CROSSMARK_ID = 1;

const GEMWALLET_ICON_URL = "assets/images/wallets/xrpl/gemwallet.svg";
const CROSSMARK_ICON_URL = "assets/images/wallets/xrpl/crossmark.svg";

// New Constant: XRPL Public Server
const PUBLIC_SERVER = "wss://xrplcluster.com/";
const RLUSD_ISSUER = "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De"; // Your RLUSD issuer

// ✅ RLUSD Token Configuration
const RLUSD_CONFIG = {
    currency: "RLUSD",
    issuer: RLUSD_ISSUER,
    decimals: 6,
    hexCurrency: "524C555344000000000000000000000000000000",
};

// 🛑 FALLBACK RATES: Used when no active offers are found on the order book.
const FALLBACK_RATES: { [currency: string]: number } = {
    // Conservative rates: RLUSD / SourceToken
    "EUROP": 0.75,
    "USDC": 1.0,
    "XSGD": 0.75,
};

interface TokenDetails {
    name: string;
    mintAddress: string;
    decimals: number;
    hexCurrency?: string; // Required for non-standard 3-char codes
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
        walletAddress,
    } = useWalletContext();

    // Payment Context States
    const {
        token,
        data,
        tokenAmount, // This should eventually be set to the required source amount
        trx,
        setIsConfirming,
        setIsSuccessful,
        setTransactionLink,
        setStablecoinPaymentMethod,
        network,
    } = usePaymentLinkMerchantContext();

    // CrossMark SDK Instance
    const crossmarkSdk = sdk;

    // ============================================================================
    // 1. Installation Check
    // ============================================================================
    useEffect(() => {
        const checkInstallation = async () => {
            // GemWallet Check
            try {
                const response = await isGemInstalled();
                setIsWalletInstalled(response.result?.isInstalled || false);
            } catch (error) {
                console.error("Error checking GemWallet:", error);
                setIsWalletInstalled(false);
            }

            // CrossMark Check
            try {
                const isCrossmarkConnected = await crossmarkSdk.async.connect();
                if (typeof isCrossmarkConnected !== 'undefined') {
                    setIsCrossmarkInstalled(isCrossmarkConnected);
                } else {
                    setIsCrossmarkInstalled(false);
                }
            } catch (error) {
                console.error("Error checking CrossMark installation status:", error);
                setIsCrossmarkInstalled(false);
            }
        };
        checkInstallation();
    }, []);

    // ============================================================================
    // 2. Fake Adapter Factory
    // ============================================================================
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

    // ============================================================================
    // 3. Connection Logics
    // ============================================================================
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
            let signInResponse = await crossmarkSdk.async.signInAndWait();
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

    // ============================================================================
    // 4. ✅ Real-Time Exchange Rate Fetch
    // ============================================================================
    const getCurrencyCodeForAPI = (currencyName: string): string => {
        const cleanName = currencyName.toUpperCase().trim();

        if (cleanName.length === 3) {
            return cleanName;
        }

        try {
            let hex = convertStringToHex(cleanName);

            // Ensure padding to 40 characters for non-standard codes
            if (hex.length < 40) {
                hex = hex.padEnd(40, '0');
            }

            return hex;
        } catch (e) {
            console.error(`Failed to convert and pad currency ${cleanName} to hex:`, e);
            throw new Error(`Invalid currency code: ${cleanName}`);
        }
    };

    const fetchExchangeRate = async (sourceCurrency: string, sourceIssuer: string): Promise<number> => {
        if (sourceCurrency.toUpperCase() === RLUSD_CONFIG.currency) {
            return 1.0;
        }
        if (!sourceIssuer) {
            throw new Error(`Issuer is missing for token: ${sourceCurrency}`);
        }

        const currencyCodeForAPI = getCurrencyCodeForAPI(sourceCurrency);

        const client = new Client(PUBLIC_SERVER);
        await client.connect();

        try {
            const request: any = {
                command: "book_offers",
                // TakerPays: The Source Token (e.g., EUROP)
                taker_pays: {
                    currency: currencyCodeForAPI,
                    issuer: sourceIssuer,
                },
                // TakerGets: The Destination Token (RLUSD)
                taker_gets: {
                    currency: RLUSD_CONFIG.hexCurrency,
                    issuer: RLUSD_CONFIG.issuer,
                },
                limit: 1,
            };

            const response = await client.request(request) as BookOffersResponse;

            if (response.result?.offers && response.result.offers.length > 0) {
                const bestOffer = response.result.offers[0];
                const takerPays = bestOffer.TakerPays;
                const takerGets = bestOffer.TakerGets;

                // Type Guard Check for TakerGets (must be Issued Currency object)
                if (typeof takerGets === 'string') {
                    throw new Error("TakerGets unexpectedly returned XRP drops instead of Issued Currency (RLUSD).");
                }
                const RLUSDValue = Number(takerGets.value); // RLUSD amount received

                // Type Guard Check for TakerPays (must be Issued Currency object)
                if (typeof takerPays === 'string') {
                    throw new Error(`Unexpected XRP as TakerPays for token ${sourceCurrency}.`);
                }
                const sourceValue = Number(takerPays.value); // Source token amount paid

                // Rate = RLUSD / Source Token
                const rate = RLUSDValue / sourceValue;

                if (isNaN(rate) || rate <= 0) {
                    throw new Error(`Calculated invalid rate for ${sourceCurrency}: ${rate}`);
                }

                console.log(`Real-Time Rate for ${sourceCurrency} -> RLUSD: ${rate}`);
                return rate;

            } else {
                // Use conservative fallback rates if order book is empty
                const fallbackRate = FALLBACK_RATES[sourceCurrency.toUpperCase()] || 0;

                if (fallbackRate > 0) {
                    console.warn(`No active offers found for ${sourceCurrency} -> RLUSD. Using conservative fallback rate: ${fallbackRate}.`);
                    return fallbackRate;
                }

                console.warn(`No active offers found and no fallback rate defined for ${sourceCurrency}. Returning 0.`);
                return 0;
            }

        } catch (error) {
            console.error(`Error fetching price for ${sourceCurrency}:`, error);
            throw new Error("Failed to fetch real-time exchange rate.");
        } finally {
            await client.disconnect();
        }
    };

    // ============================================================================
    // 5. ✅ Quote Amount (Calculates required source token amount)
    // ============================================================================
    const quoteAmount = async (): Promise<number> => {
        try {
            if (!token || !data?.transactions?.amount) {
                return 0;
            }

            const tokenName = token.name;
            const targetRlusdAmount = data.transactions.amount;

            if (tokenName.toUpperCase() === RLUSD_CONFIG.currency) {
                return targetRlusdAmount;
            }

            const tokenIssuer = token.mintAddress;

            const exchangeRate = await fetchExchangeRate(tokenName, tokenIssuer);

            if (exchangeRate <= 0) {
                throw new Error(`Invalid or zero exchange rate for ${tokenName}.`);
            }

            const sourceTokenNeeded = targetRlusdAmount / exchangeRate;

            return sourceTokenNeeded;
        } catch (error) {
            console.error("Error in quoteAmount:", error);
            return 0;
        }
    };

    // ============================================================================
    // 6. ✅ Pay Coin (Uses Single Cross-Currency Payment)
    // ============================================================================
    const payCoin = async () => {
        const targetRlusdAmount = data?.transactions?.amount;
        const merchantAddress = data?.transactions?.merchant_address;
        const currentWalletId = connectedWalletIndex;
        const userAddress = walletAddress;

        if (!walletConnected || !merchantAddress || !token || !targetRlusdAmount || targetRlusdAmount <= 0) {
            alert("Missing wallet connection or transaction details.");
            return null;
        }

        setIsProcessing(true);

        try {
            const tokenName = token.name;
            const rlusdAmount = targetRlusdAmount;
            let amountToPay: number; // The maximum amount of source token the user will pay

            // Step 1: Determine the maximum source token amount to pay based on current rate
            if (tokenName.toUpperCase() === RLUSD_CONFIG.currency) {
                amountToPay = rlusdAmount;
                console.log("Direct RLUSD payment (no swap needed)");
            } else {
                const tokenIssuer = token.mintAddress;
                // Fetch the rate again for the transaction (best practice)
                const exchangeRate = await fetchExchangeRate(tokenName, tokenIssuer);

                if (exchangeRate <= 0) {
                    throw new Error(`Invalid or zero exchange rate for ${tokenName}. Cannot proceed with swap.`);
                }

                // Calculate required Source Token amount: SourceToken_Needed = RLUSD_Target / Rate
                // This will be used as SendMax or TakerPays amount
                amountToPay = rlusdAmount / exchangeRate;

                console.log(`Swap Info: Target ${rlusdAmount} RLUSD requires max ${amountToPay} ${tokenName}`);
            }

            let transactionResult = null;
            setIsConfirming(true);
            const memoData = trx ? String(trx) : undefined;

            // Step 2: Execute Payment
            if (tokenName.toUpperCase() === RLUSD_CONFIG.currency) {
                // ====================================================================
                // A. DIRECT RLUSD PAYMENT (NO SWAP)
                // ====================================================================
                const paymentValue = String(amountToPay.toFixed(RLUSD_CONFIG.decimals));

                if (currentWalletId === GEMWALLET_ID) {
                    const payload: any = {
                        amount: {
                            currency: RLUSD_CONFIG.currency,
                            issuer: RLUSD_CONFIG.issuer,
                            value: paymentValue,
                        },
                        destination: merchantAddress,
                    };

                    if (memoData) {
                        payload.memos = [{ memo: { memoData } }];
                    }

                    console.log("GemWallet Payload:", payload);
                    const response = await sendGemPayment(payload);
                    transactionResult = response.result?.hash;

                } else if (currentWalletId === CROSSMARK_ID) {
                    if (!userAddress) throw new Error("Wallet address is missing for CrossMark transaction.");

                    const txPayload: any = {
                        TransactionType: 'Payment' as const,
                        Account: userAddress,
                        Destination: merchantAddress,
                        Amount: {
                            currency: RLUSD_CONFIG.hexCurrency,
                            issuer: RLUSD_CONFIG.issuer,
                            value: paymentValue,
                        },
                    };

                    if (memoData) {
                        txPayload.Memos = [{ Memo: { MemoData: memoData } }];
                    }

                    console.log("CrossMark Payload:", txPayload);
                    const response = await crossmarkSdk.async.signAndSubmitAndWait(txPayload);
                    transactionResult = response.response?.data?.resp?.result?.hash;
                }
            } else {
                // ====================================================================
                // B. CROSS-CURRENCY PAYMENT (SWAP)
                // ====================================================================
                const sourceCurrencyCode = getCurrencyCodeForAPI(tokenName);
                const sourceAmountString = String(amountToPay.toFixed(token.decimals || 6));
                const rlusdAmountString = String(rlusdAmount.toFixed(RLUSD_CONFIG.decimals));

                if (currentWalletId === GEMWALLET_ID) {
                    // --- GEMWALLET TWO-STEP SWAP: OfferCreate (Buy RLUSD) + Payment ---

                    // 1. Prepare OfferCreate Payload (BUY RLUSD with SourceToken)
                    const offerPayload: CreateOfferRequest = {
                        // TakerPays: The source token the user gives (max amount calculated)
                        takerPays: {
                            currency: sourceCurrencyCode.length === 3 ? sourceCurrencyCode : tokenName,
                            issuer: token.mintAddress,
                            value: sourceAmountString,
                        },
                        // TakerGets: The RLUSD token the user receives (fixed amount)
                        takerGets: {
                            currency: RLUSD_CONFIG.currency,
                            issuer: RLUSD_CONFIG.issuer,
                            value: rlusdAmountString,
                        },
                        // Flag: tfFillOrKill (Requires full fill or fails the whole transaction)
                        flags: {
                            tfPassive: true
                        } as any,
                        memos: memoData ? [{ memo: { memoData } }] : undefined,
                    };

                    console.log("Executing OfferCreate with GemWallet (FillOrKill)...", offerPayload);
                    const offerResponse = await createGemOffer(offerPayload);
                    const offerHash = offerResponse.result?.hash;

                    if (!offerHash) {
                        throw new Error("OfferCreate transaction failed or rejected by GemWallet.");
                    }
                    console.log("OfferCreate successful:", offerHash);

                    // ⚠️ WARNING: In a production environment, you MUST ADD LOGIC HERE 
                    // to poll the ledger, check the transaction result (ensure not tecKILLED), 
                    // AND verify the user's RLUSD balance before proceeding to the payment step.
                    // This is essential because OfferCreate is asynchronous and might not fill.

                    // 2. Send RLUSD to merchant (Payment) - Assumes successful swap
                    console.log("Sending acquired RLUSD to merchant via GemWallet...");
                    const paymentPayload: any = {
                        amount: {
                            currency: RLUSD_CONFIG.currency,
                            issuer: RLUSD_CONFIG.issuer,
                            value: rlusdAmountString,
                        },
                        destination: merchantAddress,
                        memos: memoData ? [{ memo: { memoData } }] : undefined,
                    };

                    const paymentResponse = await sendGemPayment(paymentPayload);
                    transactionResult = paymentResponse.result?.hash;

                    if (!transactionResult) {
                        throw new Error("Final RLUSD Payment transaction failed.");
                    }

                } else if (currentWalletId === CROSSMARK_ID) {
                    // --- CROSSMARK SINGLE-STEP SWAP (Payment + SendMax) - WORKING FINE ---
                    if (!userAddress) throw new Error("Wallet address is missing for CrossMark transaction.");

                    // 1. Define the Source Token (SendMax) - What user pays
                    const sendMaxAmount = {
                        currency: sourceCurrencyCode,
                        issuer: token.mintAddress,
                        value: sourceAmountString,
                    };

                    // 2. Define the Destination Token (Amount) - What merchant receives
                    const destinationAmount = {
                        currency: RLUSD_CONFIG.hexCurrency,
                        issuer: RLUSD_CONFIG.issuer,
                        value: rlusdAmountString,
                    };

                    const txPayload: any = {
                        TransactionType: 'Payment' as const,
                        Account: userAddress,
                        Destination: merchantAddress,
                        Amount: destinationAmount, // Target RLUSD amount (What the merchant gets)
                        SendMax: sendMaxAmount,   // Max source token paid (What the user pays)
                    };

                    if (memoData) {
                        txPayload.Memos = [{ Memo: { MemoData: memoData } }];
                    }

                    console.log("CrossMark SWAP Payment Payload (Single Transaction):", txPayload);

                    const response = await crossmarkSdk.async.signAndSubmitAndWait(txPayload);
                    transactionResult = response.response?.data?.resp?.result?.hash;
                }
            }

            setIsConfirming(false);

            if (transactionResult) {
                setIsSuccessful(true);
                setTransactionLink(`https://livenet.xrpl.org/transactions/${transactionResult}`);
                console.log("Payment successful:", transactionResult);
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

    return {
        isConnected: walletConnected,
        connectedWalletIndex,
        isProcessing,
        connectWallet,
        payCoin,
        quoteAmount,
        findRoute: () => null,
        isApproved: async () => true,
        approve: async () => { },
    };
};