import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { useEffect, useState } from "react";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { Wallets } from "@/constants/wallets";

export const StableCoinHome = () => {
  const [selectedMethod, setSelectedMethod] = useState("qrCode");
  const { stablecoinPaymentMethod, setStablecoinPaymentMethod } =
    usePaymentLinkMerchantContext();

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

  return (
    <>
      <div>
        <div className="w-full flex gap-2">
          <span className="text-2xl text-black dark:text-white">Pay</span>
          <span className="text-2xl text-[#0259D6] font-semibold dark:text-[#4893FF]">
            5,000 USDC
          </span>
        </div>
        <hr className="mt-5 dark:border-[#242425]" />
        <div className="w-full flex items-center justify-center mt-10">
          <span className="text-center dark:text-[#F9F9F9] text-black text-lg font-medium">
            Select how you would like to pay
          </span>
        </div>

        <div className="w-full min-h-[350px] mt-10  flex flex-col gap-8">
          <label
            className={`flex flex-row h-[90px] px-7 justify-between border-[0.8px] items-center  border-[#E2E3E7] bg-[#F3F3F3] dark:border-[#242425] dark:bg-[#141415] w-full rounded-lg dark:text-[#F9F9F9] dark:hover:border-[#9F9F9F] hover:border-black ${
              selectedMethod === "qrCode"
                ? "border-black dark:border-[#9F9F9F]"
                : ""
            }`}
            onClick={() => setSelectedMethod("qrCode")}
          >
            <div className="flex items-center gap-2 ">
              <div className="h-10 w-10 flex items-center justify-center  rounded-full bg-transparent dark:bg-[#ABABAB]">
                <i className="text-black ">{Icons.qrCodeIcon}</i>
              </div>
              <span className="font-medium text-lg">Pay with QR code</span>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === "qrCode"}
              onChange={() => setSelectedMethod("qrCode")} // Change radio state on button click
            />
          </label>
          <label
            className={`flex flex-row h-[90px] px-7 justify-between border-[0.8px] items-center  border-[#E2E3E7] bg-[#F3F3F3] dark:hover:border-[#9F9F9F] dark:border-[#242425] dark:bg-[#141415] w-full rounded-lg dark:text-[#F9F9F9] hover:border-black ${
              selectedMethod === "wallet"
                ? "border-black dark:border-[#9F9F9F]"
                : ""
            }`}
            onClick={() => setSelectedMethod("wallet")}
          >
            <div className="flex items-center gap-2 ">
              <div className="h-10 w-10 flex items-center justify-center  rounded-full bg-transparent dark:bg-[#ABABAB]">
                <i className="text-black ">{Icons.walletIcon}</i>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-lg">Connect wallet</span>
                <span className="text-sm text-[#696F79]">
                  Pay directly from your Solana wallet
                </span>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === "wallet"}
              onChange={() => setSelectedMethod("wallet")} // Change radio state on button click
            />
          </label>
        </div>
        <div className="w-full flex flex-col items-center mt-12 gap-8">
          <button
            className="w-full text-white bg-[#0E70FD] text-xl rounded-lg text-center  py-4"
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
          <span className="text-lg dark:text-[#F9F9F9]">Powered by LINK</span>
        </div>
      </div>
      {stablecoinPaymentMethod == "wallet" && (
        <div className="w-screen h-screen fixed top-0 left-0 flex items-center justify-center text-white">
          <div
            className="w-full h-full bg-black absolute opacity-20"
            onClick={() => setStablecoinPaymentMethod("")}
          ></div>
          <div className="w-[400px] bg-[#10141E] z-10 rounded-2xl flex flex-col px-5 py-6 items-center">
            <div className="w-full flex items-end justify-end">
              <button
                className="text-[#777777] w-[35px] h-[35px] items-center justify-center flex bg-[#1B1F2D] rounded-full "
                onClick={() => setStablecoinPaymentMethod("")}
              >
                {Icons.closeIcon}
              </button>
            </div>
            <div className="max-w-[300px] mt-5">
              <h2 className=" text-2xl font-semibold text-center ">
                Connect a wallet on Solana to continue
              </h2>
            </div>
            <div className="w-full flex flex-col gap-6 mt-14">
              {Wallets.map((wallet) => (
                <div className="w-full flex items-center justify-between ">
                  <div className="flex items-center gap-2">
                    <Image src={wallet.image} alt="" width={40} height={40} />
                    <span className="text-lg">{wallet.name}</span>
                  </div>
                  <span>Detected</span>
                </div>
              ))}
            </div>
            <div className="w-full flex justify-end mt-8">
              <button className="flex items-center gap-3">
                <span>More Options</span>
                <i>{Icons.chevron_down}</i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
