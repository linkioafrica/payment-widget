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

// ✅ ROUTE CONFIGURATION (Like Solana/EVM)
export const XRPL_ROUTES: { [network: string]: (string | number)[][] } = {
    "XRPL": [
        ["NGN", 0.0019, "RLUSD"],      // 1 NGN = 0.0019 RLUSD
        ["USDC", 1.0, "RLUSD"],        // 1 USDC = 1 RLUSD
        ["XSGD", 0.75, "RLUSD"],       // 1 XSGD = 0.75 RLUSD
        ["EUROP", 1.1, "RLUSD"],       // 1 EUROP = 1.1 RLUSD
        ["AUDD", 0.68, "RLUSD"],       // 1 AUDD = 0.68 RLUSD
        ["RLUSD", 1.0, "RLUSD"],       // 1 RLUSD = 1 RLUSD (no swap)
    ]
};

// ✅ RLUSD Token Configuration
const RLUSD_CONFIG = {
    currency: "RLUSD",
    issuer: "rN7n7otQDd6FczFgLdlqtyMVrDj5d3o8z",
    decimals: 6,
    hexCurrency: "524C555344000000000000000000000000000000",
};

interface TokenDetails {
    name: string;
    mintAddress: string;
    decimals: number;
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
        tokenAmount,
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
                console.log("Response from GemWallet:", response);
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
    // 4. ✅ Find Route (Like EVM)
    // ============================================================================
    const findRoute = (sourceTokenName?: string): (string | number)[] | null => {
        try {
            const tokenName = sourceTokenName || token?.name;

            if (!tokenName) {
                console.error("No token name provided");
                return null;
            }

            const networkName = network?.name || "XRPL";
            const routes = XRPL_ROUTES[networkName] || XRPL_ROUTES["XRPL"];

            // Find route that matches source token
            const route = routes.find(
                (r) => String(r[0]).toUpperCase() === String(tokenName).toUpperCase()
            );

            if (!route) {
                console.warn(`No route found for token: ${tokenName}`);
                return null;
            }

            console.log(`Found route: ${route[0]} → ${route[2]} (rate: ${route[1]})`);
            return route;
        } catch (error) {
            console.error("Error finding route:", error);
            return null;
        }
    };

    // ============================================================================
    // 5. ✅ Quote Amount (Like EVM - Convert to RLUSD)
    // ============================================================================
    const quoteAmount = async () => {
        try {
            if (!token || !tokenAmount) {
                return 0;
            }

            // Find route for current token
            const route = findRoute(token.name);

            if (!route) {
                console.error(`No route found for ${token.name}`);
                return tokenAmount;
            }

            // route[1] is the exchange rate
            const exchangeRate = Number(route[1]);

            // Convert to RLUSD (what merchant receives)

            const originalAmount = data?.transactions?.amount;  // Using original amount!
            const rlusdAmount = originalAmount * exchangeRate;
            return rlusdAmount;
        } catch (error) {
            console.error("Error in quoteAmount:", error);
            return tokenAmount;
        }
    };

    // ============================================================================
    // 6. ✅ Pay Coin (Unified - Swap to RLUSD + Send to Merchant)
    // ============================================================================
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

        try {
            // Step 1: Find route to get exchange rate
            const route = findRoute(token.name);
            if (!route) {
                throw new Error(`No route found for ${token.name}`);
            }

            const exchangeRate = Number(route[1]);
            const rlusdAmount = amountToPay * exchangeRate;

            console.log(`Swap Info: ${amountToPay} ${token.name} → ${rlusdAmount} RLUSD`);

            let transactionResult = null;
            setIsConfirming(true);

            const memoData = trx ? String(trx) : undefined;

            // Step 2: Check if swap is needed
            if (token.name === "RLUSD") {
                // Direct payment - no swap needed
                console.log("Direct RLUSD payment (no swap needed)");

                if (currentWalletId === GEMWALLET_ID) {
                    const payload: any = {
                        amount: {
                            currency: RLUSD_CONFIG.currency,
                            issuer: RLUSD_CONFIG.issuer,
                            value: String(amountToPay),
                        },
                        destination: merchantAddress,
                    };

                    if (memoData) {
                        payload.memos = [
                            {
                                memo: {
                                    memoData: memoData,
                                },
                            },
                        ];
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
                            value: String(amountToPay),
                        },
                    };

                    if (memoData) {
                        txPayload.Memos = [
                            {
                                Memo: {
                                    MemoData: memoData,
                                },
                            },
                        ];
                    }

                    console.log("CrossMark Payload:", txPayload);
                    const response = await crossmarkSdk.async.signAndSubmitAndWait(txPayload);
                    transactionResult = response.response?.data?.resp?.result?.hash;
                }
            } else {
                // Swap needed - Create OfferCreate then send RLUSD
                console.log("Swap needed - Creating OfferCreate...");

                const offerPayload: any = {
                    TransactionType: "OfferCreate",
                    Account: userAddress,
                    TakerPays: {
                        currency: token.name,
                        issuer: token.mintAddress,
                        value: String(amountToPay.toFixed(token.decimals || 6)),
                    },
                    TakerGets: {
                        currency: RLUSD_CONFIG.currency,
                        issuer: RLUSD_CONFIG.issuer,
                        value: String(rlusdAmount.toFixed(RLUSD_CONFIG.decimals)),
                    },
                    // IOC Flag: Immediate or Cancel
                    Flags: 0x00080000,
                };

                if (memoData) {
                    offerPayload.Memos = [
                        {
                            Memo: {
                                MemoData: memoData,
                            },
                        },
                    ];
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

                    // Step 3: Send RLUSD to merchant
                    console.log("Sending RLUSD to merchant...");
                    const paymentPayload: any = {
                        TransactionType: "Payment",
                        Account: userAddress,
                        Destination: merchantAddress,
                        Amount: {
                            currency: RLUSD_CONFIG.currency,
                            issuer: RLUSD_CONFIG.issuer,
                            value: String(rlusdAmount.toFixed(RLUSD_CONFIG.decimals)),
                        },
                    };

                    if (memoData) {
                        paymentPayload.Memos = [
                            {
                                Memo: {
                                    MemoData: memoData,
                                },
                            },
                        ];
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
        findRoute,
        isApproved: async () => true,
        approve: async () => { },
    };
};