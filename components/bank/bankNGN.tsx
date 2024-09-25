import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { SearchDropDown } from "../searchDropDown";
import { Banks } from "@/constants/banks";

export const BankNGN = () => {
  return (
    <div>
      <div className="w-full flex gap-2">
        <span className="text-2xl text-black dark:text-white">Pay</span>
        <span className="text-2xl text-[#0259D6]  dark:text-[#4893FF] font-semibold">
          USD 5,000
        </span>
      </div>
      <hr className="mt-5 dark:border-[#242425]" />

      <div className="w-full min-h-[400px]  flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col gap-8 items-center justify-center">
          <div className="bg-[#F3F3F3] dark:bg-[#141415] dark:border-[#242425] border boder-[#E2E3E7] px-6 dark:text-white text-black py-6 rounded-full ">
            <i>{Icons.bankIcon}</i>
          </div>
          <span className="font-medium text-lg max-w-[300px] text-center dark:text-[#888888]">
            Choose your bank to start the payment
          </span>
        </div>
        <SearchDropDown
          placeholder="Search your bank"
          dropDownData={Banks}
          dropDownDataKey="name"
        ></SearchDropDown>
      </div>
      <div className="w-full flex flex-col items-center mt-24 gap-8">
        <button className="w-full text-white bg-[#0E70FD] text-xl rounded-lg text-center  py-4">
          Next
        </button>
        <span className="text-lg dark:text-[#F9F9F9]">Powered by LINK</span>
      </div>
    </div>
  );
};
