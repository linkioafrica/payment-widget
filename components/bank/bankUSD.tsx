import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";

export const BankUSD = () => {
  return (
    <div>
      <div className="w-full flex gap-2">
        <span className="text-2xl text-black dark:text-white">Pay</span>
        <span className="text-2xl text-[#0259D6] font-semibold dark:text-[#4893FF]">
          USD 5,000
        </span>
      </div>
      <hr className="mt-5 dark:border-[#242425]" />

      <div className="w-full min-h-[400px]  flex flex-col items-center justify-center gap-8">
        <div className="bg-[#F3F3F3] border boder-[#E2E3E7] px-6 py-6 rounded-full dark:bg-[#141415] dark:text-[#9F9F9F] text-black dark:border-[#242425]">
          <i>{Icons.plaidIcon}</i>
        </div>
        <span className="font-medium text-lg max-w-[300px]  dark:text-[#888888] text-center">
          You’ll be connecting via Plaid to make a bank transfer payment
        </span>
      </div>
      <div className="w-full flex flex-col items-center mt-8 gap-8">
        <button className="w-full text-white bg-[#0E70FD] text-xl rounded-lg text-center  py-4">
          Pay via Plaid
        </button>
        <span className="text-lg dark:text-[#F9F9F9]">Powered by LINK</span>
      </div>
    </div>
  );
};
