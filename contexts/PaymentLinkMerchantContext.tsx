"use client";
import React, { createContext, useState, useContext } from "react";
import { Currency } from "@/constants/currencies";
import { Tokens } from "@/constants/token";
import { fiatCurrency } from "@/constants/CurrenciesAndBanks";

interface PaymentLinkMerchantContextType {
  paywith: string;
  setPaywith: React.Dispatch<React.SetStateAction<string>>;
  currency: (typeof fiatCurrency)[number]; // Adjust this based on how Currency is structured
  setCurrency: React.Dispatch<
    React.SetStateAction<(typeof fiatCurrency)[number]>
  >;
  isConfirming: boolean;
  setIsConfirming: React.Dispatch<React.SetStateAction<boolean>>;
  isSuccessful: boolean;
  setIsSuccessful: React.Dispatch<React.SetStateAction<boolean>>;
  token: (typeof Tokens)[number];
  setToken: React.Dispatch<React.SetStateAction<(typeof Tokens)[number]>>;
  stablecoinPaymentMethod: string;
  setStablecoinPaymentMethod: React.Dispatch<React.SetStateAction<string>>;
}

const PaymentLinkMerchantContext = createContext<
  PaymentLinkMerchantContextType | undefined
>(undefined);

export const PaymentLinkMerchantProvider = ({ children }: any) => {
  const [paywith, setPaywith] = useState("transfer");
  const [token, setToken] = useState(Tokens[0]);
  const [currency, setCurrency] = useState(
    fiatCurrency.filter((currency) => currency.status == "available")[0]
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [stablecoinPaymentMethod, setStablecoinPaymentMethod] = useState("");

  return (
    <PaymentLinkMerchantContext.Provider
      value={{
        paywith,
        setPaywith,
        currency,
        setCurrency,
        isConfirming,
        setIsConfirming,
        isSuccessful,
        setIsSuccessful,
        token,
        setToken,
        stablecoinPaymentMethod,
        setStablecoinPaymentMethod,
      }}
    >
      {children}
    </PaymentLinkMerchantContext.Provider>
  );
};

export const usePaymentLinkMerchantContext = () => {
  const context = useContext(PaymentLinkMerchantContext);
  if (!context) {
    throw new Error(
      "usePaymentLinkMerchantContext must be used within an PaymentLinkMerchantProvider"
    );
  }
  return context;
};
