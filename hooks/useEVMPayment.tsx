
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { useState } from "react";
import { Address, encodeAbiParameters, encodeFunctionData, encodePacked, formatUnits, getContract, maxUint256, parseUnits } from "viem";
import { useAccount, useChains, useConfig, useConnect, useWalletClient } from "wagmi";
import abiQuoter from "@/constants/Quoter.json";
import abiRouter from "@/constants/UniversalRouter.json";
import { multicall, readContract, simulateContract, waitForTransactionReceipt, writeContract } from "viem/actions";
import { QUOTERS, ROUTERS, ROUTES } from "@/constants/routes";
import path from "path";

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
        walletAdapter,
        setWalletAdapter,
        setWalletAddress,
        setWalletConnected,
        setConnectedWalletIndex,
    } = useWalletContext()

    const config = useConfig()
    const { chain, address, isConnected, connector } = useAccount()
    const { connectors, connectAsync } = useConnect()
    const { data: walletClient } = useWalletClient()
    // const chains = useChains()

    const stables: { [key: string]: string } = netAndToken?.stables.reduce((tokens, token) => ({
        ...tokens,
        [token.name]: token.mintAddress
    }), {}) ?? {}

    const routes = ROUTES[network.name]
    const multicallAddress = "0xcA11bde05977b3631167028862bE2a173976CA11"

    const quoteAmount = async () => {
        const amount = data?.transactions?.amount;
        const currency: any = netAndToken?.stables.find(
            (t) => t.name === data?.transactions?.currency
        )

        if (token === null || currency === undefined)
            return 0

        if (token.name === currency.name)
            return amount

        const route = [...(routes.find(r => r[0] === token.name && r[r.length - 1] === currency.name) ?? [])].reverse()
        const path = encodePacked(
            route.map(r => typeof r === 'string' ? 'address' : 'uint24'),
            route.map(r => typeof r === 'string' ? stables[r] as Address : Number(r))
        )
        const result = await simulateContract(config.getClient(), {
            abi: abiQuoter as any,
            address: QUOTERS[network.name],
            functionName: 'quoteExactOutput',
            args: [
                path,
                parseUnits(String(amount), currency.decimals)
            ]
        })
        return Number(formatUnits(result.result[0] as bigint, token.decimals))
    }

    const isApproved = async () => {
        const currency: any = netAndToken?.stables.find(
            (t) => t.name === data?.transactions?.currency
        )
        if (token === null || currency === undefined || !address)
            return false
        if (token.name === currency.name) {
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
                args: [address as Address, multicallAddress as Address]
            })
            return BigInt(result) >= parseUnits(String(tokenAmount * 1.0025), token.decimals)
        }
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
        return BigInt(result) >= parseUnits(String(tokenAmount * 1.0025), token.decimals)
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
        const amount = data?.transactions?.amount;
        setIsProcessing(true);
        if (token.name === currency.name) {
            const sendAmount = parseUnits(String(amount), token.decimals)
            const fee = sendAmount * BigInt(25) / BigInt(10000)
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
                args: [multicallAddress as Address, sendAmount + fee]
            } as any).catch(() => { }).finally(() => setIsProcessing(false))
        } else {
            const sendAmount = parseUnits(String(tokenAmount), token.decimals)
            const fee = sendAmount * BigInt(26) / BigInt(10000)
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
                address: token?.mintAddress,
                functionName: 'approve',
                args: [ROUTERS[network.name] as Address, sendAmount + fee]
            } as any).catch(() => { }).finally(() => setIsProcessing(false))
        }
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
            const devWalletAddress = "0xed6781e11893f334eAE70C55F64c701a296dBec3";

            if (token.name === currency.name) {
                const tokenAmount = parseUnits(String(amount), token.decimals)
                const fee = tokenAmount * BigInt(25) / BigInt(10000)
                const abi = [
                    {
                        name: 'transferFrom',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [
                            { name: 'from', type: 'address' },
                            { name: 'recipient', type: 'address' },
                            { name: 'amount', type: 'uint256' },
                        ],
                        outputs: [{ name: '', type: 'bool' }],
                    },
                ]
                const hash = await walletClient.writeContract({
                    abi: [{
                        "inputs": [{
                            "components": [
                                { "internalType": "address", "name": "target", "type": "address" },
                                { "internalType": "bytes", "name": "callData", "type": "bytes" }
                            ],
                            "internalType": "struct Multicall3.Call[]", "name": "calls", "type": "tuple[]"
                        }],
                        "name": "aggregate",
                        "outputs": [{
                            "internalType": "uint256",
                            "name": "blockNumber",
                            "type": "uint256"
                        }, { "internalType": "bytes[]", "name": "returnData", "type": "bytes[]" }], "stateMutability": "payable", "type": "function"
                    }
                    ],
                    address: multicallAddress as Address,
                    functionName: 'aggregate',
                    args: [
                        [
                            {
                                target: token.mintAddress as Address,
                                callData: encodeFunctionData({
                                    abi,
                                    functionName: 'transferFrom',
                                    args: [address, merchantAddress, tokenAmount]
                                })
                            },
                            {
                                target: token.mintAddress as Address,
                                callData: encodeFunctionData({
                                    abi,
                                    functionName: 'transferFrom',
                                    args: [address, devWalletAddress, fee]
                                })
                            }
                        ]
                    ]
                })
                setIsConfirming(true);
                await waitForTransactionReceipt(walletClient, { hash });
                setIsConfirming(false);
                setTransactionLink(`https://basescan.io/tx/${hash}`);
            } else {
                const tokenAmount = parseUnits(String(amount), token.decimals)
                const route = routes.find(r => r[0] === token.name && r[r.length - 1] === currency.name) ?? []
                const path = encodePacked(
                    route.map(r => typeof r === 'string' ? 'address' : 'uint24').reverse(),
                    route.map(r => typeof r === 'string' ? stables[r] as Address : Number(r)).reverse()
                )
                const result = await simulateContract(config.getClient(), {
                    abi: abiQuoter as any,
                    address: QUOTERS[network.name],
                    functionName: 'quoteExactOutput',
                    args: [
                        path,
                        parseUnits(String(amount), currency.decimals)
                    ]
                })
                const commands = '0x010504'
                const bytes = [
                    encodeAbiParameters(
                        [{ type: 'address' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'bytes' }, { type: 'bool' }],
                        ['0x0000000000000000000000000000000000000002', tokenAmount * BigInt(10025) / BigInt(10000), result.result[0] * BigInt(10250) / BigInt(10000), path, true]
                    ),
                    encodeAbiParameters(
                        [{ type: 'address' }, { type: 'address' }, { type: 'uint256' }],
                        [currency.mintAddress, merchantAddress as Address, tokenAmount]
                    ),
                    encodeAbiParameters(
                        [{ type: 'address' }, { type: 'address' }, { type: 'uint256' }],
                        [currency.mintAddress, devWalletAddress as Address, BigInt(0)]
                    ),
                ]
                const hash = await writeContract(walletClient, {
                    abi: abiRouter as any,
                    address: ROUTERS[network.name],
                    functionName: 'execute',
                    args: [commands, bytes]
                } as any)
                setIsConfirming(true);
                await waitForTransactionReceipt(walletClient, { hash });
                setIsConfirming(false);
                setTransactionLink(`https://basescan.io/tx/${hash}`);
            }
            setIsSuccessful(true);
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