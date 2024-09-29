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
import { useDevice } from "@/contexts/DeviceContext";
import { NavBar } from "@/components/navBar";
export default function Home() {
  const { isMobile, viewportHeight } = useDevice();
  const {
    paywith,
    setPaywith,
    currency,
    isConfirming,
    isSuccessful,
    setIsConfirming,
    setIsSuccessful,
    stablecoinPaymentMethod,
    setStablecoinPaymentMethod,
  } = usePaymentLinkMerchantContext();

  const renderContent = () => {
    if (isConfirming) {
      return <LoadingState></LoadingState>;
    } else if (isSuccessful) {
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
  if (isMobile) {
    return (
      <div
        className={`w-full bg-black flex flex-grow  `}
        style={{ height: viewportHeight }}
      >
        {/* Left Panel Pay With */}

        {/* Right Panel  */}
        <PayWithModal>{renderContent()}</PayWithModal>
      </div>
    );
  } else {
    return (
      <div
        className={`w-full h-screen bg-black flex items-center justify-center `}
      >
        <div className="max-w-[650px] w-2/4 min-w-[600px] max-h-[520px] h-[90%] flex ">
          {/* Left Panel Pay With */}
          <NavBar></NavBar>

          {/* Right Panel  */}
          <PayWithModal>{renderContent()}</PayWithModal>
        </div>
      </div>
    );
  }
}
