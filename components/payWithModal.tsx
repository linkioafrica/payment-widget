import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { CurrencyDropDown } from "./currencyDropDown";
import { Icons } from "@/app/icons";
import { TokensDropDown } from "./tokenDropDown";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export const PayWithModal = ({ children }: any) => {
  const { paywith, isConfirming, isSuccessfull } =
    usePaymentLinkMerchantContext();
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex-grow bg-white dark:bg-[#101113] px-10 pt-6 pb-3 flex-col relative ">
      <div
        className={`flex items-center ${isConfirming || isSuccessfull ? "justify-end" : "justify-between"}`}
      >
        {isConfirming || isSuccessfull ? null : (
          <h2 className="text-[#696F79] font-medium text-sm">Akarabox</h2>
        )}
        <div className="flex gap-4">
          {isConfirming || isSuccessfull ? null : paywith == "stablecoin" ? (
            <TokensDropDown></TokensDropDown>
          ) : (
            <CurrencyDropDown></CurrencyDropDown>
          )}
          <button
            className="px-2 py-1 border border-[#E2E3E7] hover:border-black text-[#545454] rounded-md dark:border-[#242425] dark:hover:border-white"
            onClick={() => toggleTheme()}
          >
            {theme == "light" ? Icons.moon : Icons.sunIcon}
          </button>
        </div>
      </div>
      <div className="w-full flex gap-1 mt-1">
        <span className=" text-black dark:text-white">
          {isConfirming || isSuccessfull ? "Amount you sent" : "Pay"}
        </span>
        <span className=" text-[#0259D6]  dark:text-[#4893FF] font-semibold">
          USD 5,000
        </span>
      </div>
      <hr className="mt-3 dark:border-[#242425]" />
      {children}
      <div className="w-full flex items-center justify-center absolute bottom-6 left-0">
        <span className="dark:text-white text-black text-xs">
          Powered by LINK
        </span>
      </div>
    </div>
  );
};
