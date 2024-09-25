"use client";

import { useEffect, useState } from "react";
import { Icons } from "./icons";
import Image from "next/image";
import Tag from "@/components/tag";
import { CurrencyDropDown } from "@/components/currencyDropDown";
import { PayWithModal } from "@/components/payWithModal";
import { TransferBRL } from "@/components/transfer/transferBRL";
import { TransferNGN } from "@/components/transfer/transferNGN";
import { TransferUSD } from "@/components/transfer/transferUSD";
import { BankUSD } from "@/components/bank/bankUSD";
import { BankBRL } from "@/components/bank/bankBRL";
import { BankNGN } from "@/components/bank/bankNGN";
import { StableCoinHome } from "@/components/stablecoin/stableCoinHome";
import { LoadingState } from "@/components/loadingState";
import { PaymentSuccessfulState } from "@/components/paymentSuccessfulState";
import { Currency } from "@/constants/currencies";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { StableQRCode } from "@/components/stablecoin/stableQRCode";
export default function Home() {
  const {
    paywith,
    setPaywith,
    currency,
    isConfirming,
    isSuccessfull,
    setIsConfirming,
    setIsSuccessfull,
    stablecoinPaymentMethod,
    setStablecoinPaymentMethod,
  } = usePaymentLinkMerchantContext();

  const renderContent = () => {
    if (isConfirming) {
      return <LoadingState></LoadingState>;
    } else if (isSuccessfull) {
      return <PaymentSuccessfulState></PaymentSuccessfulState>;
    } else if (paywith == "transfer" && currency.name == "NGN") {
      return <TransferNGN></TransferNGN>;
    } else if (paywith == "transfer" && currency.name == "BRL") {
      return <TransferBRL></TransferBRL>;
    } else if (paywith == "transfer" && currency.name == "USD") {
      return <TransferUSD></TransferUSD>;
    } else if (paywith == "bank" && currency.name == "USD") {
      return <BankUSD></BankUSD>;
    } else if (paywith == "bank" && currency.name == "BRL") {
      return <BankBRL></BankBRL>;
    } else if (paywith == "bank" && currency.name == "NGN") {
      return <BankNGN></BankNGN>;
    } else if (
      paywith == "stablecoin" &&
      (stablecoinPaymentMethod == "" || stablecoinPaymentMethod == "wallet")
    ) {
      return <StableCoinHome></StableCoinHome>;
    } else if (paywith == "stablecoin" && stablecoinPaymentMethod == "qrCode") {
      return <StableQRCode></StableQRCode>;
    }
  };

  return (
    <div
      className={`w-full min-h-screen bg-black flex items-center justify-center py-20 `}
    >
      <div className="w-[750px] h-[600px] flex ">
        {/* Left Panel Pay With */}
        <div className="w-[270px] bg-[#1E1E1E] py-5 flex flex-col justify-between rounded-l-lg gap-20 ">
          <div className="flex flex-col w-full gap-6 px-5">
            <h1 className="text-white font-medium text-xl">PAY WITH</h1>
            <div className="flex flex-col w-full gap-3">
              <button
                className={`w-full text-start  hover:bg-[#4f4f4f] py-3 px-6  rounded-full flex gap-2 items-center  ${paywith == "transfer" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
                onClick={() => {
                  setPaywith("transfer");
                  setIsConfirming(false);
                  setIsSuccessfull(false);
                }}
              >
                <i>{Icons.transfer}</i>
                Transfer
              </button>
              <button
                className={`w-full text-start  hover:bg-[#4f4f4f] py-3 px-6  rounded-full flex gap-2 items-center  ${paywith == "bank" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
                onClick={() => {
                  setPaywith("bank");
                  setIsConfirming(false);
                  setIsSuccessfull(false);
                }}
              >
                <i>{Icons.bank}</i>
                Bank
              </button>
              <button className="w-full  text-start  py-3 px-6  rounded-full cursor-default flex gap-2 items-center text-white">
                <i>{Icons.card}</i>
                Card
                <Tag
                  text="Comming soon"
                  bgColor="bg-[#BFD9FF]"
                  textColor="text-[#4f4f4f]"
                ></Tag>
              </button>
              <button
                className={`w-full text-start  hover:bg-[#4f4f4f] py-3 px-6  rounded-full flex gap-2 items-center  ${paywith == "stablecoin" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
                onClick={() => {
                  setPaywith("stablecoin");
                  setIsConfirming(false);
                  setIsSuccessfull(false);
                  setStablecoinPaymentMethod("");
                }}
              >
                <i>{Icons.stableCoin}</i>
                Stablecoin
                <Tag
                  text="Fastest"
                  bgColor="bg-[#81F4C3]"
                  textColor="text-[#4f4f4f]"
                  icon={Icons.fastest}
                ></Tag>
              </button>
            </div>
          </div>
          <div className="border-t flex flex-col px-5 border-[#888888] py-10 gap-4">
            <div className="flex items-center gap-3">
              <i className="text-[#9F9F9F]">{Icons.info}</i>
              <span className="text-[#9F9F9F] text-xs">
                Available methods change according to currency.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <i className="text-[#9F9F9F]">{Icons.info}</i>
              <span className="text-[#9F9F9F] text-xs">
                Available methods change according to currency.
              </span>
            </div>
          </div>
        </div>
        {/* Right Panel  */}
        <PayWithModal>{renderContent()}</PayWithModal>
      </div>
    </div>
  );
}
