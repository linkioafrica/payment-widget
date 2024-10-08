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
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  WalletProvider,
  ConnectionProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
  // Import any other wallet adapters you need
} from "@solana/wallet-adapter-wallets";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { stableCoinInfos } from "@/constants/stableCoinInfos";
import { DisconnectWallet } from "../disconnectWallet";

export const StableCoinHome = () => {
  const [selectedMethod, setSelectedMethod] = useState("wallet");
  const {
    stablecoinPaymentMethod,
    setStablecoinPaymentMethod,
    setIsSuccessful,
  } = usePaymentLinkMerchantContext();
  const { isMobile } = useDevice();
  const { connected, disconnect } = useWallet(); // Get the wallet status
  const [currentWalletId, setCurrentWalletId] = useState<number | null>(null);
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<number | null>(null);
  const {
    walletConnected,
    walletAddress,
    setWalletAddress,
    setWalletConnected,
    setConnectedWalletIndex,
    connectedWalletIndex,
  } = walletContext();
  const connection = new Connection(clusterApiUrl("mainnet-beta")); // Use 'mainnet-beta' for mainnet

  console.log(walletConnected, walletAddress);

  // Function to send USDC
  const sendUSDC = async (walletAddress: string, recipientAddress: string) => {
    console.log(walletAddress);
    console.log(recipientAddress);

    if (!walletAddress || !recipientAddress) {
      return alert("Connect wallet and enter recipient address");
    }

    try {
      const senderPublicKey = new PublicKey(walletAddress);
      const recipientPublicKey = new PublicKey(recipientAddress);

      // Create or get associated token account for the sender
      const senderTokenAddress = await getAssociatedTokenAddress(
        new PublicKey(stableCoinInfos.USDC_MINT_ADDRESS),
        senderPublicKey
      );
      console.log(senderTokenAddress);

      // Create or get associated token account for the recipient
      const recipientTokenAddress = await getAssociatedTokenAddress(
        new PublicKey(stableCoinInfos.USDC_MINT_ADDRESS),
        recipientPublicKey
      );
      console.log(recipientTokenAddress);

      // Create the transfer instruction
      // const transaction = new Transaction().add(
      //   createTransferInstruction(
      //     senderTokenAddress, // Sender's token address
      //     recipientTokenAddress, // Recipient's token address
      //     senderPublicKey, // Sender's public key (authority)
      //     amountToSend * 10 ** stableCoinInfos.USDC_DECIMALS, // Amount in USDC (1 USDC = 10^6 lamports)
      //     [], // Multisignature authority (if any)
      //     TOKEN_PROGRAM_ID
      //   )
      // );
      const amountToSend = 0.1; // Amount of SOL to send (in SOL, not lamports)

      // Create the SOL transfer instruction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports: amountToSend * 10 ** 9, // Convert SOL to lamports (1 SOL = 10^9 lamports)
        })
      );

      // Fetch recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash; // Set the recent blockhash
      transaction.feePayer = senderPublicKey; // Set fee payer

      // Request signature from the connected wallet
      const signedTransaction =
        await window.solana.signAndSendTransaction(transaction);

      // Wait for confirmation
      await connection.confirmTransaction(
        signedTransaction.signature,
        "confirmed"
      );

      console.log("Transaction confirmed:", signedTransaction.signature);
      alert("USDC sent successfully!");
      setIsSuccessful(true);
      setStablecoinPaymentMethod("");
    } catch (error) {
      console.error("Error sending USDC:", error);
      alert("failed!" + error);
      setIsSuccessful(false);
      setStablecoinPaymentMethod("");
    }
  };

  const connectWallet = async (walletId: number) => {
    const wallets = [
      new PhantomWalletAdapter(), // Ensure you import your wallet adapters
      new SolflareWalletAdapter(), // Ensure you import your wallet adapters
      new TrustWalletAdapter(), // Ensure you import your wallet adapters
    ];

    const wallet = wallets[walletId];

    if (wallet) {
      // If a wallet is already connected, disconnect it first
      if (connected) {
        await disconnect();
        console.log("Disconnected from previous wallet");
      }

      try {
        await wallet.connect(); // Connect to the selected wallet
        setCurrentWalletId(walletId); // Store the currently connected wallet ID
        setConnectedWallet(walletId);
        const publicKey = wallet.publicKey?.toString() ?? null; // Replace this with the actual public key you receive

        if (publicKey) {
          setWalletPublicKey(publicKey);
          setWalletAddress(publicKey);
          setWalletConnected(true);
          setConnectedWalletIndex(walletId);
          // sendUSDC(publicKey, stableCoinInfos.merchantUSDCaddress);
          console.log(`Connected to wallet: ${publicKey}`);
          console.log(walletConnected, walletAddress);
          setStablecoinPaymentMethod("");
        } else {
          alert("Wallet public key is undefined");
        }
      } catch (error) {
        console.error("Failed to connect to wallet:", error);
      }
    } else {
      console.error("Wallet not found");
    }
  };

  // Function to get swap price
  // const getSwapPrice = async (value: number) => {
  //   try {
  //     setConversionLoading(true);

  //     if (token.name == "USDC") return value;
  //     const usdcAmountInAtomicUnits = value * 10 ** 6;

  //     const response = await axios.get(`https://quote-api.jup.ag/v6/quote`, {
  //       params: {
  //         inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC token
  //         outputMint: token.mintAddress,
  //         amount: usdcAmountInAtomicUnits, // Amount of fromToken you want to swap
  //         slippage: 1, // Optional: Set slippage tolerance (1%)
  //         onlyDirectRoutes: true, // Optional: If you only want direct swap routes (could improve speed)
  //       },
  //     });

  //     const swapPrice = response.data;
  //     console.log("Swap Price:", swapPrice);
  //     var TokenUnit = 10 ** token.decimals;
  //     return swapPrice.outAmount / TokenUnit;
  //   } catch (error) {
  //     console.error("Error fetching swap price:", error);
  //   } finally {
  //       setConversionLoading(false);

  //   }
  // };
  // useEffect(() => {
  //   // Simulate an API call or calculation to set the amount
  //   const fetchTokenAmount = async () => {
  //     setTokenAmount(0);
  //     // In a real use case, this would be dynamic based on API or user input
  //     var price = await getSwapPrice(5000);
  //     setTokenAmount(price as number); // Example of setting new token amount dynamically
  //   };
  //   fetchTokenAmount();
  //   if (stablecoinPaymentMethod == "wallet") {
  //     // Disable scrolling
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     // Enable scrolling
  //     document.body.style.overflow = "auto";
  //   }

  //   // Cleanup when the component is unmounted or menu closes
  //   return () => {
  //     document.body.style.overflow = "auto";
  //   };
  // }, [stablecoinPaymentMethod]);
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
                        sendUSDC(
                          walletAddress,
                          stableCoinInfos.merchantUSDCaddress
                        );
                      }
                    : () => {
                        setStablecoinPaymentMethod("wallet");
                      }
              }
            >
              {selectedMethod == "qrCode"
                ? "Continue"
                : walletConnected
                  ? "Pay now"
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
                        sendUSDC(
                          walletAddress,
                          stableCoinInfos.merchantUSDCaddress
                        );
                      }
                    : () => {
                        setStablecoinPaymentMethod("wallet");
                      }
              }
            >
              {selectedMethod == "qrCode"
                ? "Continue"
                : walletConnected
                  ? "Pay now"
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
