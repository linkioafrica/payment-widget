import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { useEffect, useState } from "react";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { Wallets } from "@/constants/wallets";
import { useDevice } from "@/contexts/DeviceContext";
import { ChangePaymentMethod } from "../changePaymentMethod";

export const StableCoinHome = () => {
  const [selectedMethod, setSelectedMethod] = useState("qrCode");
  const { stablecoinPaymentMethod, setStablecoinPaymentMethod } =
    usePaymentLinkMerchantContext();
  const { isMobile } = useDevice();

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
          <div className="w-full flex items-center justify-center mt-10">
            <span className="text-center dark:text-[#F9F9F9] text-black text-lg max-w-[400px] font-medium">
              Select how you would like to pay
            </span>
          </div>

          <div className="w-full min-h-[250px] mt-3 flex flex-col gap-5">
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
              <div className="max-w-[300px] mt-3">
                <h2 className=" text-xl font-semibold text-center ">
                  Connect a wallet on Solana to continue
                </h2>
              </div>
              <div className="w-full flex flex-col gap-6 mt-7">
                {Wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="w-full flex items-center justify-between "
                  >
                    <div className="flex items-center gap-2">
                      <Image src={wallet.image} alt="" width={30} height={30} />
                      <span className="text-[17px]">{wallet.name}</span>
                    </div>
                    <span>Detected</span>
                  </div>
                ))}
              </div>
              <div className="w-full flex justify-end mt-8">
                <button className="flex items-center text-sm gap-3">
                  <span>More Options</span>
                  <i>{Icons.chevron_down}</i>
                </button>
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
                  Connect a wallet on Solana to continue
                </h2>
              </div>
              <div className="w-full flex flex-col gap-6 mt-7">
                {Wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="w-full flex items-center justify-between "
                  >
                    <div className="flex items-center gap-2">
                      <Image src={wallet.image} alt="" width={30} height={30} />
                      <span className="text-[17px]">{wallet.name}</span>
                    </div>
                    <span>Detected</span>
                  </div>
                ))}
              </div>
              <div className="w-full flex justify-end mt-8">
                <button className="flex items-center text-sm gap-3">
                  <span>More Options</span>
                  <i>{Icons.chevron_down}</i>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
};
