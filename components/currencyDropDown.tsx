import { Icons } from "@/app/icons";
import { Currency } from "@/constants/currencies";
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
          src={currency.image}
          alt={"flag"}
          width={20}
          height={20}
          priority
        />
        <span className="font-semibold">{currency.name}</span>
        <i>{Icons.chevron_down}</i>
      </div>
      {dropDown && (
        <div>
          <div
            className="bg-black w-screen h-screen fixed top-0 left-0 opacity-0"
            onClick={() => setDropDown(false)}
          ></div>
          <div className="absolute left-0 w-full -bottom-1 pt-1 drop-shadow-xl z-10 border-[0.8px] dark:bg-[#101113] dark:border-[#242425] border-[#E2E3E7] translate-y-full bg-white max-h-[200px] overflow-y-auto rounded-md">
            {Currency.map((cur) => (
              <div
                className="flex items-center border-b dark:text-white dark:border-[#242425] border-[#E2E3E7] py-2 px-2 gap-2 text-black cursor-pointer hover:bg-[#a6cbfe50]"
                onClick={() => {
                  setCurrency(cur);
                  setDropDown(false);
                  setIsSuccessfull(false);
                  setIsConfirming(false);
                }}
              >
                <Image
                  src={cur.image}
                  alt={`${cur.name} flag`}
                  width={26}
                  height={26}
                  priority
                />
                <span className="font-semibold">{cur.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
