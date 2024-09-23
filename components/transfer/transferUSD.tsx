import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";

export const TransferUSD = () => {
  const { setIsConfirming } = usePaymentLinkMerchantContext();

  return (
    <div>
      <div className="w-full flex gap-2">
        <span className="text-2xl text-black dark:text-white">Pay</span>
        <span className="text-2xl text-[#0259D6] font-semibold dark:text-[#4893FF]">
          NGN 5,000
        </span>
      </div>
      <hr className="mt-5 dark:border-[#242425]" />
      <div className="w-full flex items-center justify-center mt-10">
        <span className="text-center dark:text-[#888888] text-black text-lg font-medium">
          Transfer USD 5,000 to the details below
        </span>
      </div>
      <div className="w-full border border-[#E2E3E7] bg-[#F3F3F3] dark:bg-[#141415] dark:border-[#242425] px-5 py-7 flex flex-col gap-6 rounded-md mt-7">
        <div className="w-full flex justify-between items-center">
          <span className="text-[#696F79] dark:text-[#888888]">
            Account holder
          </span>
          <span className="text-lg dark:text-white">LINK FINANCIAL INC</span>
        </div>
        <div className="w-full flex justify-between items-center">
          <span className="text-[#696F79] dark:text-[#888888]">Bank</span>
          <span className="text-lg dark:text-white">
            Choice Financial Group
          </span>
        </div>
        <div className="w-full flex justify-between items-center">
          <span className="text-[#696F79] dark:text-[#888888] ">
            Account number
          </span>
          <div className="flex items-center text-black gap-1 dark:text-white">
            <CopyToClipboard textTobeCopied="202355911342"></CopyToClipboard>
            <span className="text-lg ">202355911342</span>
          </div>
        </div>
        <div className="w-full flex justify-between items-center">
          <span className="text-[#696F79] dark:text-[#888888]">
            Account type
          </span>
          <span className="text-lg dark:text-white">Checking</span>
        </div>
        <div className="w-full flex justify-between items-center">
          <span className="text-[#696F79] dark:text-[#888888]">
            Reference code
          </span>
          <div className="flex items-center text-black gap-1">
            <CopyToClipboard textTobeCopied="103785631491"></CopyToClipboard>
            <span className="text-lg dark:text-white">103785631491</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-8 items-center gap-5">
        <div className="text-black flex items-center gap-2 dark:text-[#9F9F9F]">
          <i>{Icons.info}</i>
          <span className="text-sm">
            Use this account for this transaction only
          </span>
        </div>
        <span className="text-[#696F79]">
          Transaction expires in{" "}
          <span className="text-[#0259D6] dark:text-[#4893FF]">29:00</span>
        </span>
      </div>
      <div className="w-full flex flex-col items-center mt-12 gap-8">
        <button
          className="w-full text-white bg-[#0E70FD] text-xl rounded-lg text-center  py-4 dark:bg-[#0E70FD]"
          onClick={() => setIsConfirming(true)}
        >
          I've sent the money
        </button>
        <span className="text-lg dark:text-[#F9F9F9]">Powered by LINK</span>
      </div>
    </div>
  );
};
