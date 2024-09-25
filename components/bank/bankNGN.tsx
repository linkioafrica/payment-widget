import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { SearchDropDown } from "../searchDropDown";
import { Banks } from "@/constants/banks";

export const BankNGN = () => {
  return (
    <div>
      <div className="w-full min-h-[350px] flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col gap-4 items-center justify-center">
          <div className="bg-[#F3F3F3] dark:bg-[#141415] dark:border-[#242425] border boder-[#E2E3E7] px-6 dark:text-white text-black py-6 rounded-full ">
            <i>{Icons.bankIcon}</i>
          </div>
          <span className="font-medium max-w-[300px] text-center dark:text-[#888888]">
            Choose your bank to start the payment
          </span>
        </div>
        <SearchDropDown
          placeholder="Search your bank"
          dropDownData={Banks}
          dropDownDataKey="name"
        ></SearchDropDown>
      </div>
      <div className="w-full flex flex-col items-center mt-0 gap-8">
        <button className="w-full text-white bg-[#0E70FD] text-lg rounded-lg text-center py-3">
          Next
        </button>
      </div>
    </div>
  );
};
