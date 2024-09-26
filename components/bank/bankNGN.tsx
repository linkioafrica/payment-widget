import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { SearchDropDown } from "../searchDropDown";
import { AllCurrencyBanks } from "@/constants/CurrenciesAndBanks";

export const BankNGN = () => {
  return (
    <div>
      <div className="w-full min-h-[250px] flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col gap-4 items-center justify-center">
          <div className="bg-[#F3F3F3] dark:bg-[#141415] dark:border-[#242425] border border-[#E2E3E7] px-6 dark:text-white text-black py-6 rounded-full ">
            <i>{Icons.bankIcon}</i>
          </div>
          <span className="font-medium max-w-[300px] text-xs text-center dark:text-[#888888] text-black">
            Choose your bank to start the payment
          </span>
        </div>
        <SearchDropDown
          placeholder="Search your bank"
          dropDownData={
            AllCurrencyBanks.find(
              (currency) => currency.currency == currency.currency
            )?.banks
          }
          dropDownDataKey="name"
        ></SearchDropDown>
      </div>
      <div className="w-full flex flex-col items-center">
        <button className="w-full text-white bg-[#0E70FD] text-sm rounded-lg text-center py-2">
          Next
        </button>
      </div>
    </div>
  );
};
