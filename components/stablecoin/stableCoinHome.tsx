import { Icons } from "@/app/icons";
import { useEffect, useState } from "react";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";

import { useDevice } from "@/contexts/DeviceContext";

import { DisconnectWallet } from "../disconnectWallet";
import { ConnectWalletMenu } from "./Components/connectWalletMenu";
import { AllWallets } from "@/constants/wallets";
import { useSolanaPayment } from "@/hooks/useSolanaPayment";
import { useEVMPayment } from "@/hooks/useEVMPayment";
import { useXrplPayment } from "@/hooks/useXRPLPayment";

function usePayment(network: any) {
  const evm = useEVMPayment();
  const sol = useSolanaPayment();
  const xrpl = useXrplPayment();
  if (network.id === 4)
    return xrpl
  if (network.id === 1)
    return sol
  return evm
}

export const StableCoinHome = () => {
  const [selectedMethod, setSelectedMethod] = useState("wallet");
  const [approved, setApproved] = useState(false)
  const {
    network,
    token,
    tokenAmount,
    stablecoinPaymentMethod,
    setStablecoinPaymentMethod,
  } = usePaymentLinkMerchantContext();
  const { isMobile } = useDevice();

  const {
    isConnected,
    connectedWalletIndex,
    isProcessing,
    isApproved,
    approve,
    payCoin,
    connectWallet
  } = usePayment(network);

  useEffect(() => {
    if (!isApproved)
      setApproved(true)
    else
      isApproved().then((_approved) => setApproved(_approved))
  }, [isConnected, isApproved, token, tokenAmount])

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
              className={`flex flex-row h-[70px] px-4 opacity-50 justify-between border-[0.8px] items-center border-[#E2E3E7] bg-[#F3F3F3] dark:border-[#242425] dark:bg-[#141415] w-full rounded-lg dark:text-[#F9F9F9] text-black  ${selectedMethod === "qrCode"
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
                  className={`w-3 h-3 rounded-full border-[1px]  flex items-center justify-center ${selectedMethod === "qrCode"
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
              className={`flex flex-row h-[70px] px-4 justify-between border-[0.8px] items-center border-[#E2E3E7] bg-[#F3F3F3] dark:hover:border-[#9F9F9F] dark:border-[#242425] dark:bg-[#141415] w-full text-black rounded-lg dark:text-[#F9F9F9] hover:border-black ${selectedMethod === "wallet"
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
                    Pay directly from your Wallet
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
                  className={`w-3 h-3 rounded-full border-[1px]  flex items-center justify-center ${selectedMethod === "wallet"
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
            {isConnected && (
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
                  : isConnected
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
                : isConnected
                  ? isProcessing
                    ? "Processing..."
                    : "Pay now"
                  : "Select Wallet"}
            </button>
            {/* <ChangePaymentMethod></ChangePaymentMethod> */}
          </div>
        </div>
        {stablecoinPaymentMethod == "wallet" && (
          <ConnectWalletMenu
            setStablecoinPaymentMethod={setStablecoinPaymentMethod}
            connectedWalletIndex={connectedWalletIndex}
            connectWallet={connectWallet}
            wallets={
              AllWallets.find((netWal) => netWal.name === network.name)?.wallets
            }
            network={network.name}
          ></ConnectWalletMenu>
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
              className={`flex flex-row h-[50px] px-4 opacity-50 justify-between border-[0.8px] items-center border-[#E2E3E7] bg-[#F3F3F3] dark:border-[#242425] dark:bg-[#141415] w-full rounded-lg dark:text-[#F9F9F9] text-black  ${selectedMethod === "qrCode"
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
                  className={`w-3 h-3 rounded-full border-[1px]  flex items-center justify-center ${selectedMethod === "qrCode"
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
              className={`flex flex-row h-[50px] px-4 cursor-pointer justify-between border-[0.8px] items-center border-[#E2E3E7] bg-[#F3F3F3] dark:hover:border-[#9F9F9F] dark:border-[#242425] dark:bg-[#141415] w-full text-black rounded-lg dark:text-[#F9F9F9] hover:border-black ${selectedMethod === "wallet"
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
                    Pay directly from your Wallet
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
                  className={`w-3 h-3 rounded-full border-[1px]  flex items-center justify-center ${selectedMethod === "wallet"
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
            {isConnected && (
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
                  : isConnected
                    ? () => {
                      if (!approved && approve)
                        approve().then(() => setApproved(true))
                      else
                        payCoin();
                    }
                    : () => {
                      setStablecoinPaymentMethod("wallet");
                    }
              }
            >
              {selectedMethod == "qrCode"
                ? "Continue"
                : isConnected
                  ? isProcessing
                    ? "Processing..."
                    : approved ? "Pay now" : "Approve"
                  : "Select Wallet"}
            </button>
          </div>
        </div>
        {stablecoinPaymentMethod == "wallet" && (
          <ConnectWalletMenu
            setStablecoinPaymentMethod={setStablecoinPaymentMethod}
            connectedWalletIndex={connectedWalletIndex}
            connectWallet={connectWallet}
            network={network.name}
            wallets={
              AllWallets.find((netWal) => netWal.name === network.name)?.wallets
            }
          ></ConnectWalletMenu>
        )}
      </>
    );
  }
};
