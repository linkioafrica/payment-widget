import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { useEffect, useState } from "react";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useWallet as walletContext } from "@/contexts/WalletContext";

import { Wallets } from "@/constants/wallets";
import { useDevice } from "@/contexts/DeviceContext";
import { ChangePaymentMethod } from "../changePaymentMethod";
import axios from "axios";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  TransactionMessage,
  VersionedMessage,
  VersionedTransaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
  WalletProvider,
  ConnectionProvider,
  useWallet,
  Wallet,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
  // Import any other wallet adapters you need
} from "@solana/wallet-adapter-wallets";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { stableCoinInfos } from "@/constants/stableCoinInfos";
import { DisconnectWallet } from "../disconnectWallet";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Tokens } from "@/constants/token";

export const StableCoinHome = () => {
  const [selectedMethod, setSelectedMethod] = useState("wallet");
  const {
    stablecoinPaymentMethod,
    setStablecoinPaymentMethod,
    setIsSuccessful,
    setTransactionLink,
    tokenAmount,
    token,
    data,
    setIsConfirming,
    setIsBroken,
    setPaywith,
  } = usePaymentLinkMerchantContext();
  const { isMobile } = useDevice();
  const { connected, disconnect } = useWallet(); // Get the wallet status
  const [currentWalletId, setCurrentWalletId] = useState<number | null>(null);
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const {
    walletConnected,
    walletAddress,
    walletAdapter,
    setWalletAdapter,
    setWalletAddress,
    setWalletConnected,
    setConnectedWalletIndex,
    connectedWalletIndex,
  } = walletContext();
  
  const customRpcUrl =
		// "https://radial-aged-diamond.solana-mainnet.quiknode.pro/3edb6073fca7e4ed8460ff4a450ae31fb766cc76/";
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
			console.log("Fetching swap info for:", { walletAdapter, recipientAddress, inputMint, outputMint, amount });

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
        destinationOwner,
      );

      // Get or create developer associated token account
      const devTokenAccount = await getAssociatedTokenAddress(
        mint,
        devOwner,
      );

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

      const latestBlockhash = await connection.getLatestBlockhash('finalized');

      // Create transaction message
      const messageV0 = new TransactionMessage({
        payerKey: walletPubKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions,
      }).compileToV0Message();

      const versionedTransaction = new VersionedTransaction(messageV0);

      const signedTransaction = await (walletAdapter as any).signTransaction(versionedTransaction);

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
      console.error('Error during token transfer:', error);
      // throw new Error('Token transfer failed. Please check the logs.');
      setPaywith("stablecoin");
      setIsProcessing(false);
      setIsConfirming(false);
      alert("Please try again.");

    }
  };

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

      const selectedToken: any = Tokens.find((t) => t.name === targetTokenName);
      if (!selectedToken) throw new Error('Selected token not found.');

      const merchantPublicKey = new PublicKey(merchantAddress);
      console.log("merchantPublicKey", merchantPublicKey.toBase58());

      const devWalletPublicKey = new PublicKey(devWalletAddress);
      console.log("devWalletPublicKey", devWalletPublicKey.toBase58());

      const mintTokenAddress = new PublicKey(selectedToken.mintAddress);
      console.log("mintTokenAddress", mintTokenAddress.toBase58());
      console.log("selectedToken.mintAddress", selectedToken.mintAddress);

      const customerPublicKey = new PublicKey(walletAdapter.publicKey);
      console.log("customerPublicKey", customerPublicKey.toBase58());

      const srcAccount = await connection.getTokenAccountsByOwner(customerPublicKey, {
        mint: new PublicKey(selectedPayToken.mintAddress),
      });
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
        console.log('Initiating token swap...');
        await swapAndSendToken(
          walletAdapter,
          merchantPublicKey.toString(),
          selectedPayToken.mintAddress,
          mintTokenAddress.toString(),
          amount * Math.pow(10, selectedPayToken.decimals),
        );
      }
    } catch (error) {
      console.error('Error during payment:', error);
      alert('Payment failed. Please try again.');
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
			const publicKey = wallet.publicKey;
			setWalletAdapter(wallet);
			setConnectedWalletIndex(walletId);
			setWalletConnected(true);
			setStablecoinPaymentMethod("");
		} catch (error) {
			console.error("Failed to connect to wallet:", error);
		}
	};

  if (isMobile) {
    return (
      <>
        <div>
          <div className="w-full flex items-center justify-center mt-8">
            <span className="text-center dark:text-[#F9F9F9] text-black text-lg max-w-[400px] font-medium">
              Select how you would like to pay
            </span>
          </div>

          <div className="w-full min-h-[170px] mt-3 flex flex-col gap-5">
            <label
              className={`flex flex-row h-[70px] px-4 opacity-50 justify-between border-[0.8px] items-center border-[#E2E3E7] bg-[#F3F3F3] dark:border-[#242425] dark:bg-[#141415] w-full rounded-lg dark:text-[#F9F9F9] text-black  ${
                selectedMethod === "qrCode"
                  ? "border-black dark:border-[#9F9F9F]"
                  : ""
              }`}
              onClick={() => {
                // setSelectedMethod("qrCode")
                // dark:hover:border-[#9F9F9F] hover:border-black
              }}
            >
              <div className="flex items-center gap-2 ">
                <div className="h-7 w-7 flex items-center justify-center rounded-full bg-transparent dark:bg-[#ABABAB]">
                  <i className="text-black">{Icons.qrCodeIcon}</i>
                </div>
                <span className="font-medium ">Pay with QR code</span>
              </div>

              <div className="relative">
                {/* Hidden default radio input */}
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === "qrCode"}
                  onChange={() => {
                    // setSelectedMethod("qrCode")
                  }}
                  className="hidden"
                />
                {/* Custom radio button styling */}
                <div
                  className={`w-3 h-3 rounded-full border-[1px]  flex items-center justify-center ${
                    selectedMethod === "qrCode"
                      ? "border-black dark:border-[#9F9F9F]"
                      : "border-gray-400 dark:border-[#242425]"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5  rounded-full ${selectedMethod === "qrCode" ? "bg-black dark:bg-[#9F9F9F]" : "dark:bg-[#242425] bg-[#9F9F9F]"}`}
                  ></div>
                </div>
              </div>
            </label>

            <label
              className={`flex flex-row h-[70px] px-4 justify-between border-[0.8px] items-center border-[#E2E3E7] bg-[#F3F3F3] dark:hover:border-[#9F9F9F] dark:border-[#242425] dark:bg-[#141415] w-full text-black rounded-lg dark:text-[#F9F9F9] hover:border-black ${
                selectedMethod === "wallet"
                  ? "border-black dark:border-[#9F9F9F]"
                  : ""
              }`}
              onClick={() => setSelectedMethod("wallet")}
            >
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 flex items-center justify-center rounded-full bg-transparent dark:bg-[#ABABAB]">
                  <i className="text-black">{Icons.walletIcon}</i>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium ">Connect wallet</span>
                  <span className="text-sm text-[#696F79]">
                    Pay directly from your Solana wallet
                  </span>
                </div>
              </div>

              <div className="relative">
                {/* Hidden default radio input */}
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === "wallet"}
                  onChange={() => setSelectedMethod("wallet")}
                  className="hidden"
                />
                {/* Custom radio button styling */}
                <div
                  className={`w-3 h-3 rounded-full border-[1px]  flex items-center justify-center ${
                    selectedMethod === "wallet"
                      ? "border-black dark:border-[#9F9F9F]"
                      : "border-gray-400 dark:border-[#242425]"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5  rounded-full ${selectedMethod === "wallet" ? "bg-black dark:bg-[#9F9F9F]" : "dark:bg-[#242425] bg-[#9F9F9F]"}`}
                  ></div>
                </div>
              </div>
            </label>
          </div>
          <div className="w-full flex flex-col items-center mt-6 gap-4">
            {walletConnected && (
              <div className="">
                <DisconnectWallet></DisconnectWallet>
              </div>
            )}
            <button
              className="w-full text-white bg-[#0E70FD]  rounded-lg text-center  py-3"
              onClick={
                selectedMethod == "qrCode"
                  ? () => {
                      setStablecoinPaymentMethod("qrCode");
                    }
                  : walletConnected
                    ? () => {
                        payCoin();
                      }
                    : () => {
                        setStablecoinPaymentMethod("wallet");
                      }
              }
            >
              {selectedMethod == "qrCode"
                ? "Continue"
                : walletConnected
                  ? isProcessing
                    ? "Processing..."
                    : "Pay now"
                  : "Select Wallet"}
            </button>
            {/* <ChangePaymentMethod></ChangePaymentMethod> */}
          </div>
        </div>
        {stablecoinPaymentMethod == "wallet" && (
          <div className="w-screen h-screen fixed top-0 left-0 flex items-center justify-center text-white">
            <div
              className="w-full h-full bg-black absolute opacity-20"
              onClick={() => setStablecoinPaymentMethod("")}
            ></div>
            <div className="w-[300px] bg-[#10141E] z-10 rounded-2xl flex flex-col px-4 py-6 items-center">
              <div className="w-full flex items-end justify-end">
                <button
                  className="text-[#777777] w-[30px] h-[30px] items-center justify-center flex bg-[#1B1F2D] rounded-full "
                  onClick={() => setStablecoinPaymentMethod("")}
                >
                  {Icons.closeIcon}
                </button>
              </div>
              <div className="max-w-[300px] my-3">
                <h2 className=" text-xl font-semibold text-center ">
                  Connect a Solana Wallet & continue
                </h2>
              </div>
              <div className="w-full flex flex-col gap-6 mt-7">
                {Wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={wallet.image}
                        alt={wallet.name}
                        width={20}
                        height={20}
                      />
                      <span className="text-[15px]">{wallet.name}</span>
                    </div>
                    {connectedWalletIndex === wallet.id ? (
                      <span className="text-green-500">Connecting...</span>
                    ) : (
                      <button
                        className="bg-blue-500 text-white px-4 py-1 rounded text-[15px]"
                        onClick={() => {
                          connectWallet(wallet.id);
                        }}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  } else {
    return (
      <>
        <div>
          <div className="w-full flex items-center justify-center mt-5">
            <span className="text-center dark:text-[#F9F9F9] text-black text-[13px] font-medium">
              Select how you would like to pay
            </span>
          </div>

          <div className="w-full min-h-[150px] mt-5 flex flex-col gap-5">
            <label
              className={`flex flex-row h-[50px] px-4 opacity-50 justify-between border-[0.8px] items-center border-[#E2E3E7] bg-[#F3F3F3] dark:border-[#242425] dark:bg-[#141415] w-full rounded-lg dark:text-[#F9F9F9] text-black  ${
                selectedMethod === "qrCode"
                  ? "border-black dark:border-[#9F9F9F]"
                  : ""
              }`}
              onClick={() => {
                // setSelectedMethod("qrCode")
                // dark:hover:border-[#9F9F9F] hover:border-black
              }}
            >
              <div className="flex items-center gap-2 ">
                <div className="h-7 w-7 flex items-center justify-center rounded-full bg-transparent dark:bg-[#ABABAB]">
                  <i className="text-black">{Icons.qrCodeIcon}</i>
                </div>
                <span className="font-medium text-sm">Pay with QR code</span>
              </div>

              <div className="relative">
                {/* Hidden default radio input */}
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === "qrCode"}
                  onChange={() => {
                    // setSelectedMethod("qrCode")
                  }}
                  className="hidden"
                />
                {/* Custom radio button styling */}
                <div
                  className={`w-3 h-3 rounded-full border-[1px]  flex items-center justify-center ${
                    selectedMethod === "qrCode"
                      ? "border-black dark:border-[#9F9F9F]"
                      : "border-gray-400 dark:border-[#242425]"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5  rounded-full ${selectedMethod === "qrCode" ? "bg-black dark:bg-[#9F9F9F]" : "dark:bg-[#242425] bg-[#9F9F9F]"}`}
                  ></div>
                </div>
              </div>
            </label>

            <label
              className={`flex flex-row h-[50px] px-4 cursor-pointer justify-between border-[0.8px] items-center border-[#E2E3E7] bg-[#F3F3F3] dark:hover:border-[#9F9F9F] dark:border-[#242425] dark:bg-[#141415] w-full text-black rounded-lg dark:text-[#F9F9F9] hover:border-black ${
                selectedMethod === "wallet"
                  ? "border-black dark:border-[#9F9F9F]"
                  : ""
              }`}
              onClick={() => setSelectedMethod("wallet")}
            >
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 flex items-center justify-center rounded-full bg-transparent dark:bg-[#ABABAB]">
                  <i className="text-black">{Icons.walletIcon}</i>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">Connect wallet</span>
                  <span className="text-[10px] text-[#696F79]">
                    Pay directly from your Solana wallet
                  </span>
                </div>
              </div>

              <div className="relative">
                {/* Hidden default radio input */}
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === "wallet"}
                  onChange={() => setSelectedMethod("wallet")}
                  className="hidden"
                />
                {/* Custom radio button styling */}
                <div
                  className={`w-3 h-3 rounded-full border-[1px]  flex items-center justify-center ${
                    selectedMethod === "wallet"
                      ? "border-black dark:border-[#9F9F9F]"
                      : "border-gray-400 dark:border-[#242425]"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5  rounded-full ${selectedMethod === "wallet" ? "bg-black dark:bg-[#9F9F9F]" : "dark:bg-[#242425] bg-[#9F9F9F]"}`}
                  ></div>
                </div>
              </div>
            </label>
          </div>
          <div className="w-full flex flex-col items-center mt-6 gap-4">
            {walletConnected && (
              <div className="">
                <DisconnectWallet></DisconnectWallet>
              </div>
            )}
            <button
              className="w-full text-white bg-[#0E70FD] text-sm rounded-lg text-center  py-2"
              onClick={
                selectedMethod == "qrCode"
                  ? () => {
                      setStablecoinPaymentMethod("qrCode");
                    }
                  : walletConnected
                    ? () => {
                        payCoin();
                      }
                    : () => {
                        setStablecoinPaymentMethod("wallet");
                      }
              }
            >
              {selectedMethod == "qrCode"
                ? "Continue"
                : walletConnected
                  ? isProcessing
                    ? "Processing..."
                    : "Pay now"
                  : "Select Wallet"}
            </button>
          </div>
        </div>
        {stablecoinPaymentMethod == "wallet" && (
          <div className="w-screen h-screen fixed top-0 left-0 flex items-center justify-center text-white">
            <div
              className="w-full h-full bg-black absolute opacity-20"
              onClick={() => setStablecoinPaymentMethod("")}
            ></div>
            <div className="w-[350px] bg-[#10141E] z-10 rounded-2xl flex flex-col px-4 py-4 items-center">
              <div className="w-full flex items-end justify-end">
                <button
                  className="text-[#777777] w-[30px] h-[30px] items-center justify-center flex bg-[#1B1F2D] rounded-full "
                  onClick={() => setStablecoinPaymentMethod("")}
                >
                  {Icons.closeIcon}
                </button>
              </div>
              <div className="max-w-[300px] mt-3">
                <h2 className=" text-xl font-semibold text-center ">
                  Connect a Solana Wallet & continue
                </h2>
              </div>
              <div className="w-full flex flex-col gap-6 mt-7">
                {Wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={wallet.image}
                        alt={wallet.name}
                        width={30}
                        height={30}
                      />
                      <span className="text-[17px]">{wallet.name}</span>
                    </div>
                    {connectedWalletIndex === wallet.id ? (
                      <span className="text-green-500">connecting...</span>
                    ) : (
                      <button
                        className="bg-blue-500 text-white px-4 py-1 rounded text-[17px]"
                        onClick={() => connectWallet(wallet.id)}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {/* <div className="w-full flex justify-end mt-8">
                <button className="flex items-center text-sm gap-3">
                  <span>More Options</span>
                  <i>{Icons.chevron_down}</i>
                </button>
              </div> */}
            </div>
          </div>
        )}
      </>
    );
  }
};
