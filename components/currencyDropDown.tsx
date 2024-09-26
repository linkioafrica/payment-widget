import { Icons } from "@/app/icons";
import { Currency } from "@/constants/currencies";
import { fiatCurrency } from "@/constants/CurrenciesAndBanks";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import Image from "next/image";
import { useState } from "react";
export const CurrencyDropDown = () => {
  const [dropDown, setDropDown] = useState(false);
  const { setCurrency, currency, setIsSuccessfull, setIsConfirming } =
    usePaymentLinkMerchantContext();

  return (
    <div className="relative w-fit select-none">
      <div
        className="border-[0.8px] border-[#E2E3E7] text-black dark:text-white dark:bg-[#101113]  dark:border-[#242425] dark:hover:border-white px-2 py-1 flex items-center gap-2 hover:border-black cursor-pointer rounded-md"
        onClick={() => setDropDown(!dropDown)}
      >
        <Image
          src={currency.flag}
          alt={"flag"}
          width={18}
          height={18}
          priority
        />
        <span className="font-semibold text-xs">{currency.currency}</span>
        <i>{Icons.chevron_down}</i>
      </div>
      {dropDown && (
        <div>
          <div
            className="bg-black w-screen h-screen fixed top-0 left-0 opacity-0"
            onClick={() => setDropDown(false)}
          ></div>
          <div className="absolute left-0 w-full -bottom-1 pt-1 drop-shadow-xl z-10 border-[0.8px] dark:bg-[#101113] dark:border-[#242425] border-[#E2E3E7] translate-y-full bg-white max-h-[200px] overflow-y-auto rounded-md">
            {fiatCurrency
              .sort((a, b) =>
                a.status === "available" ? -1 : b.status === "available" ? 1 : 0
              )
              .map((currency) => (
                <div
                  className={`flex items-center border-b dark:text-white dark:border-[#242425] border-[#E2E3E7] py-1 px-2 gap-2 text-black cursor-pointer ${
                    currency.status === "available"
                      ? "hover:bg-[#a6cbfe50]"
                      : "opacity-30"
                  }`}
                  onClick={
                    currency.status === "available"
                      ? () => {
                          setCurrency(currency);
                          setDropDown(false);
                          setIsSuccessfull(false);
                          setIsConfirming(false);
                        }
                      : () => {}
                  }
                  key={currency.currency} // Ensure a unique key for each item
                >
                  <Image
                    src={currency.flag}
                    alt={`${currency.label} flag`}
                    width={20}
                    height={20}
                    priority
                  />
                  <span className="font-semibold text-xs">
                    {currency.currency}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
