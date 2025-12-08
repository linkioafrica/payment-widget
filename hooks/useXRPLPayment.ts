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
                taker_pays: {
                    currency: currencyCodeForAPI,
                    issuer: sourceIssuer,
                },
                taker_gets: {
                    currency: RLUSD_CONFIG.hexCurrency, // ✅ FIX: Use hex code for RLUSD in API call
                    issuer: RLUSD_CONFIG.issuer,
                },
                limit: 1,
            };

            const response = await client.request(request) as BookOffersResponse;

            if (response.result?.offers && response.result.offers.length > 0) {
                const bestOffer = response.result.offers[0];
                const takerPays = bestOffer.TakerPays;
                const takerGets = bestOffer.TakerGets;

                const RLUSDValue = Number(takerGets.value);

                if (typeof takerPays === 'string') {
                    throw new Error(`Unexpected XRP as TakerPays for token ${sourceCurrency}.`);
                }
                const sourceValue = Number(takerPays.value);

                const rate = RLUSDValue / sourceValue;

                if (isNaN(rate) || rate <= 0) {
                    throw new Error(`Calculated invalid rate for ${sourceCurrency}: ${rate}`);
                }

                console.log(`Real-Time Rate for ${sourceCurrency} -> RLUSD: ${rate}`);
                return rate;

            } else {
                console.warn(`No active offers found for ${sourceCurrency} -> RLUSD. Using fallback rate (0).`);
                return 0;
            }

        } catch (error) {
            console.error(`Error fetching price for ${sourceCurrency}:`, error);
            // This is where the dstIsrMalformed error occurs if the RLUSD issuer is not funded.
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
    // 6. ✅ Pay Coin (Uses Real-Time Quote)
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
            let amountToPay: number;

            // Step 1: Determine the amount of source token to pay using the real-time rate
            if (tokenName.toUpperCase() === RLUSD_CONFIG.currency) {
                amountToPay = rlusdAmount;
                console.log("Direct RLUSD payment (no swap needed)");
            } else {
                const tokenIssuer = token.mintAddress;
                const exchangeRate = await fetchExchangeRate(tokenName, tokenIssuer);

                if (exchangeRate <= 0) {
                    throw new Error(`Invalid or zero exchange rate for ${tokenName}. Cannot proceed with swap.`);
                }

                amountToPay = rlusdAmount / exchangeRate;

                console.log(`Swap Info: Target ${rlusdAmount} RLUSD requires ${amountToPay} ${tokenName}`);
            }

            let transactionResult = null;
            setIsConfirming(true);
            const memoData = trx ? String(trx) : undefined;

            // Step 2 & 3: Execute Payment/Swap
            if (tokenName.toUpperCase() === RLUSD_CONFIG.currency) {
                // Direct payment - no swap needed
                const paymentValue = String(amountToPay.toFixed(RLUSD_CONFIG.decimals));

                if (currentWalletId === GEMWALLET_ID) {
                    const payload: any = {
                        amount: {
                            currency: RLUSD_CONFIG.currency, // GemWallet may prefer the string code
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
                            currency: RLUSD_CONFIG.hexCurrency, // Use hex code for CrossMark payment
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
                // Swap needed - Create OfferCreate then send RLUSD
                const sourceCurrencyCode = getCurrencyCodeForAPI(tokenName);

                console.log("Swap needed - Creating OfferCreate...");

                const offerPayload: any = {
                    TransactionType: "OfferCreate",
                    Account: userAddress,
                    TakerPays: {
                        currency: sourceCurrencyCode,
                        issuer: token.mintAddress,
                        value: String(amountToPay.toFixed(token.decimals || 6)),
                    },
                    TakerGets: {
                        currency: RLUSD_CONFIG.hexCurrency, // ✅ FIX: Use hex code for TakerGets (RLUSD)
                        issuer: RLUSD_CONFIG.issuer,
                        value: String(rlusdAmount.toFixed(RLUSD_CONFIG.decimals)),
                    },
                    Flags: 0x00080000,
                };

                if (memoData) {
                    offerPayload.Memos = [{ Memo: { MemoData: memoData } }];
                }

                if (currentWalletId === GEMWALLET_ID) {
                    alert("Please use CrossMark wallet for token swaps");
                    return null;
                } else if (currentWalletId === CROSSMARK_ID) {
                    console.log("Executing OfferCreate with CrossMark...");
                    const response = await crossmarkSdk.async.signAndSubmitAndWait(offerPayload);
                    transactionResult = response.response?.data?.resp?.result?.hash;

                    if (!transactionResult) {
                        throw new Error("OfferCreate transaction failed");
                    }

                    console.log("Swap successful:", transactionResult);

                    // Step 3: Send RLUSD to merchant (Payment)
                    console.log("Sending RLUSD to merchant...");
                    const paymentPayload: any = {
                        TransactionType: "Payment",
                        Account: userAddress,
                        Destination: merchantAddress,
                        Amount: {
                            currency: RLUSD_CONFIG.hexCurrency, // ✅ FIX: Use hex code for Payment
                            issuer: RLUSD_CONFIG.issuer,
                            value: String(rlusdAmount.toFixed(RLUSD_CONFIG.decimals)),
                        },
                    };

                    if (memoData) {
                        paymentPayload.Memos = [{ Memo: { MemoData: memoData } }];
                    }

                    console.log("Payment Payload:", paymentPayload);
                    const paymentResponse = await crossmarkSdk.async.signAndSubmitAndWait(paymentPayload);
                    transactionResult = paymentResponse.response?.data?.resp?.result?.hash;

                    if (!transactionResult) {
                        throw new Error("Payment transaction failed");
                    }
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