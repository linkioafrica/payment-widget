"use client";

import { useEffect, useState } from "react";
import { Icons } from "./icons";
import Tag from "@/components/tag";
import { PayWithModal } from "@/components/payWithModal";

import { StableCoinHome } from "@/components/stablecoin/stableCoinHome";
import { LoadingState } from "@/components/loadingState";
import { PaymentSuccessfulState } from "@/components/paymentSuccessfulState";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { StableQRCode } from "@/components/stablecoin/stableQRCode";
import {
  AllCurrencyBanks,
  AllVendorList,
} from "@/constants/CurrenciesAndBanks";
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
    } else if (paywith == "transfer") {
      let selectedVendor = AllVendorList.find(
        (vendor) => vendor.currency == currency.currency
      );
      return selectedVendor?.component;
    } else if (paywith == "bank") {
      let selectedCurrency = AllCurrencyBanks.find(
        (bankCurrency) => bankCurrency.currency == currency.currency
      );
      return selectedCurrency?.component;
    } else if (paywith == "stablecoin") {
      const screen =
        stablecoinPaymentMethod == "" || stablecoinPaymentMethod == "wallet" ? (
          <StableCoinHome></StableCoinHome>
        ) : (
          <StableQRCode></StableQRCode>
        );
      return screen;
    }
  };

  return (
    <div
      className={`w-full h-screen bg-black flex items-center justify-center `}
    >
      <div className="max-w-[700px] w-2/4 min-w-[640px] max-h-[580px] h-[90%] flex ">
        {/* Left Panel Pay With */}
        <div className="w-[250px] bg-[#1E1E1E] py-5 flex flex-col justify-between rounded-l-lg gap-20 ">
          <div className="flex flex-col w-full gap-6 px-5">
            <h1 className="text-white font-medium text-lg">PAY WITH</h1>
            <div className="flex flex-col w-full gap-3 text-sm">
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
              <span className="text-[#9F9F9F] text-[11px]">
                Available methods change according to currency.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <i className="text-[#9F9F9F]">{Icons.info}</i>
              <span className="text-[#9F9F9F] text-[11px]">
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
