"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { Currency } from "@/constants/currencies";
import { Tokens, Networks } from "@/constants/token";
import { useFetchLinkDetails } from "@/hooks/fetchLinkDetails";
import { fiatCurrency } from "@/constants/CurrenciesAndBanks";

interface PaymentLinkMerchantContextType {
  paywith: string;
  setPaywith: React.Dispatch<React.SetStateAction<string>>;
  currency: (typeof fiatCurrency)[number];
  setCurrency: React.Dispatch<
    React.SetStateAction<(typeof fiatCurrency)[number]>
  >;
  isConfirming: boolean;
  setIsConfirming: React.Dispatch<React.SetStateAction<boolean>>;
  isSuccessful: boolean;
  setIsSuccessful: React.Dispatch<React.SetStateAction<boolean>>;
  token: (typeof Tokens)[number];
  setToken: React.Dispatch<React.SetStateAction<(typeof Tokens)[number]>>;
  network: (typeof Networks)[number];
  setNetwork: React.Dispatch<React.SetStateAction<(typeof Networks)[number]>>;
  tokenAmount: number;
  setTokenAmount: React.Dispatch<React.SetStateAction<number>>;
  stablecoinPaymentMethod: string;
  setStablecoinPaymentMethod: React.Dispatch<React.SetStateAction<string>>;
  transactionLink: string;
  setTransactionLink: React.Dispatch<React.SetStateAction<string>>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  trx: string | null;
  data: any;
  loading: boolean;
  error: any;
  isExpired: boolean;
  setIsExpired: React.Dispatch<React.SetStateAction<boolean>>;
  isBroken: boolean;
  setIsBroken: React.Dispatch<React.SetStateAction<boolean>>;
  conversionLoading: boolean;
  setConversionLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const PaymentLinkMerchantContext = createContext<
  PaymentLinkMerchantContextType | undefined
>(undefined);

export const PaymentLinkMerchantProvider = ({ children }: any) => {
  const [trx, setTrx] = useState<string | null>(null);

  const { data, loading, error } = useFetchLinkDetails(trx);

  const [paywith, setPaywith] = useState("stablecoin");
  const [conversionLoading, setConversionLoading] = useState(false);
  const [token, setToken] = useState(Tokens[0]);
  const [network, setNetwork] = useState(Networks[0]);
  const [tokenAmount, setTokenAmount] = useState(0);
  const [currency, setCurrency] = useState(
    fiatCurrency.filter((currency) => currency.status == "available")[0]
  );

  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [stablecoinPaymentMethod, setStablecoinPaymentMethod] = useState("");
  const [transactionLink, setTransactionLink] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isBroken, setIsBroken] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const trxValue = searchParams.get("trx");
      setTrx(trxValue);
    }
  }, []);
  useEffect(() => {
    if (data && data.status != 403) {
      const cur_net = data.transactions.merchant_network;
      const cur_currency = data.transactions.currency;

      // const matchedNetwork = Tokens.find(
      //   (token) => token.network === cur_network
      // );
      // const matchedToken = matchedNetwork?.stables.find(
      //   (stable) => stable.name === cur_currency
      // );

      const cur_token = Tokens.find((token) => token.name === cur_currency);
      if (cur_token) setToken(cur_token);

      const cur_network = Networks.find((token) => token.name === cur_currency);
      if (cur_network) setNetwork(cur_network);

      console.log(cur_token, cur_network);
    }
  }, [data]);
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
        network,
        setNetwork,
        tokenAmount,
        setTokenAmount,
        stablecoinPaymentMethod,
        setStablecoinPaymentMethod,
        isDrawerOpen,
        setIsDrawerOpen,
        isExpired,
        setIsExpired,
        isBroken,
        setIsBroken,
        conversionLoading,
        setConversionLoading,
        transactionLink,
        setTransactionLink,
        trx, // Provide trx to the context
        data, // Provide fetched data to the context
        loading, // Provide loading state to the context
        error, // Provide error state to the context
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
      "usePaymentLinkMerchantContext must be used within a PaymentLinkMerchantProvider"
    );
  }
  return context;
};
