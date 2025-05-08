
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { useState } from "react";
import { Address, encodePacked, formatUnits, parseUnits } from "viem";
import { useAccount, useConfig, useConnect, useWalletClient } from "wagmi";
import abiMarket from "@/constants/Market.json";
import { readContract, simulateContract, waitForTransactionReceipt } from "viem/actions";
import { ROUTERS, ROUTES } from "@/constants/routes";

export function useEVMPayment() {
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const {
        network,
        setStablecoinPaymentMethod,
        setIsSuccessful,
        setTransactionLink,
        token,
        tokenAmount,
        data,
        setIsConfirming,
        setIsBroken,
        setPaywith,
        netAndToken,
    } = usePaymentLinkMerchantContext();

    const {
        connectedWalletIndex,
        walletConnected,
        setWalletAdapter,
        setWalletAddress,
        setWalletConnected,
        setConnectedWalletIndex,
    } = useWalletContext()

    const config = useConfig()
    const { address, isConnected, connector } = useAccount()
    const { connectors, connectAsync } = useConnect()
    const { data: walletClient } = useWalletClient()
    // const chains = useChains()

    const stables: { [key: string]: string } = netAndToken?.stables.reduce((tokens, token) => ({
        ...tokens,
        [token.name]: token.mintAddress
    }), {}) ?? {}

    const routes = ROUTES[network.name]
    
    const quoteAmount = async (asBigInt?: boolean) => {
        const amount = data?.transactions?.amount;
        const currency: any = netAndToken?.stables.find(
            (t) => t.name === data?.transactions?.currency
        )

        if (token === null || currency === undefined)
            return 0

        if (token.name === currency.name) {
            if (asBigInt)
                return parseUnits(String(amount * 1.0025), token.decimals)
            return amount
        }

        const route = routes.find(r => r[0] === currency.name && r[r.length - 1] === token.name) ?? []
        const path = encodePacked(
            route.map(r => typeof r === 'string' ? 'address' : 'uint24'),
            route.map(r => typeof r === 'string' ? stables[r] as Address : Number(r))
        )
        const result = await simulateContract(config.getClient(), {
            abi: abiMarket as any,
            address: ROUTERS[network.name],
            functionName: 'estimate',
            args: [
                path,
                parseUnits(String(amount), currency.decimals)
            ]
        })
        if (asBigInt)
            return BigInt(String(result.result))
        return Number(formatUnits(BigInt(String(result.result)), token.decimals))
    }

    const isApproved = async () => {
        const currency: any = netAndToken?.stables.find(
            (t) => t.name === data?.transactions?.currency
        )
        if (token === null || currency === undefined || !address)
            return false
        const result = await readContract(config.getClient(), {
            abi: [{
                "name": "allowance",
                "type": "function",
                "stateMutability": "view",
                "inputs": [
                    { "name": "owner", "type": "address" },
                    { "name": "spender", "type": "address" }
                ],
                "outputs": [
                    { "name": "", "type": "uint256" }
                ]
            }],
            address: token.mintAddress as Address,
            functionName: 'allowance',
            args: [address as Address, ROUTERS[network.name] as Address]
        })
        // console.log(result, tokenAmount)
        return BigInt(result) >= parseUnits(String(tokenAmount * (token.name === currency.name ? 1.0025 : 1)), token.decimals)
    }

    const approve = async () => {
        if (!walletClient)
            return
        if (isProcessing) return;
        const currency: any = netAndToken?.stables.find(
            (t) => t.name === data?.transactions?.currency
        )
        if (token === null || currency === undefined)
            return
        setIsProcessing(true);
        const estimate = await quoteAmount(true)
        await walletClient.writeContract({
            abi: [{
                "name": "approve",
                "type": "function",
                "stateMutability": "nonpayable",
                "inputs": [
                    { "name": "spender", "type": "address" },
                    { "name": "amount", "type": "uint256" }
                ],
                "outputs": [
                    { "name": "", "type": "bool" }
                ]
            }],
            address: token.mintAddress,
            functionName: 'approve',
            args: [ROUTERS[network.name] as Address, estimate]
        } as any).catch(() => { }).finally(() => setIsProcessing(false))
    }

    const payCoin = async () => {
        try {
            if (isProcessing || !walletClient) return;
            setIsProcessing(true);

            const amount = data?.transactions?.amount;
            const currency: any = netAndToken?.stables.find(
                (t) => t.name === data?.transactions?.currency
            )

            if (token === null || currency === undefined)
                return

            const merchantAddress = data?.transactions?.merchant_address;
            const route = routes.find(r => r[0] === token.name && r[r.length - 1] === currency.name) ?? []
            const path = route.length ? encodePacked(
                route.map(r => typeof r === 'string' ? 'address' : 'uint24').reverse(),
                route.map(r => typeof r === 'string' ? stables[r] as Address : Number(r)).reverse()
            ) : '0x'

            const tokenAmount = parseUnits(String(amount), token.decimals)
            const hash = await walletClient.writeContract({
                abi: abiMarket as any,
                address: ROUTERS[network.name],
                functionName: 'pay',
                args: [
                    token.mintAddress,
                    currency.mintAddress,
                    tokenAmount,
                    merchantAddress,
                    path
                ]
            })
            setIsConfirming(true);
            const tx = await waitForTransactionReceipt(walletClient, { hash });
            setIsConfirming(false);
            if (tx.status === "success") {
                setTransactionLink(`https://basescan.io/tx/${hash}`);
                setIsSuccessful(true);
            } else {
                setIsBroken(true);
            }
        } catch (error) {
            console.error("Error during payment:", error);
            setIsBroken(true);
            alert("Payment failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Function to connect to the wallet
    const connectWallet = async (walletId: number) => {
        try {
            if (isConnected && address) {
                setWalletAddress(address);
                setWalletAdapter(connector);
                setConnectedWalletIndex(walletId);
                setWalletConnected(true);
                setStablecoinPaymentMethod("");
            } else {
                await connectAsync({
                    connector: connectors[walletId],
                    chainId: network.chainId
                }).then(({ accounts }) => {
                    setWalletAddress(accounts[0]);
                    setWalletAdapter(connectors[walletId]);
                    setConnectedWalletIndex(walletId);
                    setWalletConnected(true);
                    setStablecoinPaymentMethod("");
                })
            }
        } catch (error) {
            console.error("Failed to connect to wallet:", error);
        }
    };
    return {
        isConnected: walletConnected,
        connectedWalletIndex,
        isProcessing,
        quoteAmount,
        isApproved,
        approve,
        payCoin,
        connectWallet
    };
}