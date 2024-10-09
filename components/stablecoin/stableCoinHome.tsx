import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { useEffect, useState } from "react";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { Wallets } from "@/constants/wallets";
import { useDevice } from "@/contexts/DeviceContext";
import { ChangePaymentMethod } from "../changePaymentMethod";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
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
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { stableCoinInfos } from "@/constants/stableCoinInfos";
import { WalletAdapter } from "@solana/wallet-adapter-base";

export const StableCoinHome = () => {
  const [selectedMethod, setSelectedMethod] = useState("qrCode");
  const {
    stablecoinPaymentMethod,
    setStablecoinPaymentMethod,
    isSuccessful,
    setIsSuccessful,
    token,
  } = usePaymentLinkMerchantContext();
  const { isMobile } = useDevice();
  const { connected, disconnect } = useWallet(); // Get the wallet status
  const [currentWalletId, setCurrentWalletId] = useState<number | null>(null);
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<number | null>(null);

  // Dynamic cluster (devnet or mainnet)
  // const isMainnet = true;
  // const connection = new Connection(clusterApiUrl(isMainnet ? "mainnet-beta" : "devnet"));
  // const customRpcUrl = 'https://neat-lively-voice.solana-mainnet.quiknode.pro/5948cc9447d9f5b1a516be7adf618ccbdffa7e99';
  const customRpcUrl = 'https://radial-aged-diamond.solana-mainnet.quiknode.pro/3edb6073fca7e4ed8460ff4a450ae31fb766cc76/';
  const connection = new Connection(customRpcUrl, 'finalized');

  // Replace with the Jupiter API endpoint
  const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6/quote';
  const JUPITER_SWAP_API = 'https://quote-api.jup.ag/v6/swap';


  // Step 1: Fetch swap info from Jupiter
  const fetchSwapInfo = async (inputMint: string, outputMint: string, amount: number) => {
    const url = `${JUPITER_QUOTE_API}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&swapMode=ExactOut&slippageBps=50`;
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
        throw new Error('Invalid parameters: Ensure walletAddress, recipientAddress, and swapInfo are defined.');
    }

    const requestBody = {
        userPublicKey: walletAddress.toBase58(),
        wrapAndUnwrapSol: true,
        // destinationTokenAccount: recipientAddress,
        quoteResponse: swapInfo.quoteResponse,
    };

    const response = await fetch(JUPITER_SWAP_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching swap transaction: ${errorText}`);
    }

    const { swapTransaction, lastValidBlockHeight } = await response.json();
    return { swapTransaction, lastValidBlockHeight };
  };

// Step 3: Send transaction to Solana blockchain
const sendTransaction = async (swapTransaction: string, walletAdapter: WalletAdapter) => {

    // deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    console.log(transaction);
    transaction = await walletAdapter.signTransaction(transaction);

   // get the latest block hash
    const latestBlockHash = await connection.getLatestBlockhash();

    // Execute the transaction
    const rawTransaction = transaction.serialize()
    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2
    });
    console.log(`https://solscan.io/tx/${txid}`);
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: txid
    });
    console.log(`https://solscan.io/tx/${txid}`);

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

        // Step 1: Fetch swap info
        const swapInfo = await fetchSwapInfo(inputMint, outputMint, amount);

        // Step 2: Fetch the swap transaction
        const { swapTransaction, lastValidBlockHeight } = await fetchSwapTransaction(walletPublicKey, recipientAddress, swapInfo);
        console.log(swapTransaction);
        // Step 3: Send the transaction to the blockchain
        await sendTransaction(swapTransaction, walletAdapter, lastValidBlockHeight);

        alert("USDC sent successfully!");
        console.log('Swap and send transaction completed successfully.');
    } catch (error) {
        console.error('Error during swap and send:', error);
        alert("Failed! " + error.message);
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

    if (wallet) {
        try {
            await wallet.connect();
            console.log("Connected to wallet:", wallet.publicKey.toString());
            const publicKey = wallet.publicKey;

            await swapAndSendToken(
                wallet,
                "ANJt85VAVGhknPAhKBaS2qWVZUWW59rkQSbAg4sW4dFA", // Merchant's USDC address
                "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // Input mint address
                "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Output mint address
                0.1 * 1000000 // Example: 0.1 USDC in micro-lamports
            );
        } catch (error) {
            console.error("Failed to connect to wallet:", error);
        }
    } else {
        console.error("Wallet not found");
    }
  };
 
  useEffect(() => {

    if (stablecoinPaymentMethod == "wallet") {
      // Disable scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Enable scrolling
      document.body.style.overflow = "auto";
    }

    // Cleanup when the component is unmounted or menu closes
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [stablecoinPaymentMethod]);
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
              className={`flex flex-row h-[70px] px-4 justify-between border-[0.8px] items-center border-[#E2E3E7] bg-[#F3F3F3] dark:border-[#242425] dark:bg-[#141415] w-full rounded-lg dark:text-[#F9F9F9] text-black dark:hover:border-[#9F9F9F] hover:border-black ${
                selectedMethod === "qrCode"
                  ? "border-black dark:border-[#9F9F9F]"
                  : ""
              }`}
              onClick={() => setSelectedMethod("qrCode")}
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
                  onChange={() => setSelectedMethod("qrCode")}
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
          <div className="w-full flex flex-col items-center mt-6 gap-8">
            <button
              className="w-full text-white bg-[#0E70FD]  rounded-lg text-center  py-3"
              onClick={
                selectedMethod == "qrCode"
                  ? () => {
                      setStablecoinPaymentMethod("qrCode");
                    }
                  : () => {
                      setStablecoinPaymentMethod("wallet");
                    }
              }
            >
              {selectedMethod == "qrCode" ? "Continue" : "Select Wallet"}
            </button>
            <ChangePaymentMethod></ChangePaymentMethod>
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
                    {connectedWallet === wallet.id ? (
                      <span className="text-green-500">Paying...</span>
                    ) : (
                      <button
                        className="bg-blue-500 text-white px-4 py-1 rounded text-[15px]"
                        onClick={() => connectWallet(wallet.id)}
                      >
                        Connect & Pay
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
  } else {
    return (
      <>
        <div>
          <div className="w-full flex items-center justify-center mt-5">
            <span className="text-center dark:text-[#F9F9F9] text-black text-[13px] font-medium">
              Select how you would like to pay
            </span>
          </div>

          <div className="w-full min-h-[170px] mt-5 flex flex-col gap-5">
            <label
              className={`flex flex-row h-[50px] px-4 justify-between border-[0.8px] items-center border-[#E2E3E7] bg-[#F3F3F3] dark:border-[#242425] dark:bg-[#141415] w-full rounded-lg dark:text-[#F9F9F9] text-black dark:hover:border-[#9F9F9F] hover:border-black ${
                selectedMethod === "qrCode"
                  ? "border-black dark:border-[#9F9F9F]"
                  : ""
              }`}
              onClick={() => setSelectedMethod("qrCode")}
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
                  onChange={() => setSelectedMethod("qrCode")}
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
              className={`flex flex-row h-[50px] px-4 justify-between border-[0.8px] items-center border-[#E2E3E7] bg-[#F3F3F3] dark:hover:border-[#9F9F9F] dark:border-[#242425] dark:bg-[#141415] w-full text-black rounded-lg dark:text-[#F9F9F9] hover:border-black ${
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
          <div className="w-full flex flex-col items-center mt-6 gap-8">
            <button
              className="w-full text-white bg-[#0E70FD] text-sm rounded-lg text-center  py-2"
              onClick={
                selectedMethod == "qrCode"
                  ? () => {
                      setStablecoinPaymentMethod("qrCode");
                    }
                  : () => {
                      setStablecoinPaymentMethod("wallet");
                    }
              }
            >
              {selectedMethod == "qrCode" ? "Continue" : "Select Wallet"}
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
                    {connectedWallet === wallet.id ? (
                      <span className="text-green-500">Paying...</span>
                    ) : (
                      <button
                        className="bg-blue-500 text-white px-4 py-1 rounded text-[17px]"
                        onClick={() => connectWallet(wallet.id)}
                      >
                        Connect & Pay
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
