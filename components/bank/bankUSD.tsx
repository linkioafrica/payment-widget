import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";

export const BankUSD = () => {
  return (
    <div>
      <div className="w-full min-h-[350px]  flex flex-col items-center justify-center gap-4">
        <div className="bg-[#F3F3F3] border boder-[#E2E3E7] px-6 py-6 rounded-full dark:bg-[#141415] dark:text-[#9F9F9F] text-black dark:border-[#242425]">
          <i>{Icons.plaidIcon}</i>
        </div>
        <span className="font-medium  max-w-[300px]  dark:text-[#888888] text-center">
          You’ll be connecting via Plaid to make a bank transfer payment
        </span>
      </div>
      <div className="w-full flex flex-col items-center  ">
        <button className="w-full text-white bg-[#0E70FD] text-lg rounded-lg text-center  py-3">
          Pay via Plaid
        </button>
      </div>
    </div>
  );
};
