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
    <div className="flex-grow bg-white dark:bg-[#101113] px-12 pt-10 pb-6 flex-col ">
      <div
        className={`flex items-start ${isConfirming || isSuccessfull ? "justify-end" : "justify-between"}`}
      >
        {isConfirming || isSuccessfull ? null : (
          <h2 className="text-xl text-[#696F79] font-medium">Akarabox</h2>
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
      {children}
    </div>
  );
};
