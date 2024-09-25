import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useEffect, useState } from "react";

export const TransferUSD = () => {
  const { setIsConfirming } = usePaymentLinkMerchantContext();

  const [secondsRemaining, setSecondsRemaining] = useState(29 * 60 + 59); // 29:59 in seconds

  useEffect(() => {
    if (secondsRemaining > 0) {
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer); // Clean up timer on unmount
    }
  }, [secondsRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes}:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}`;
  };

  return (
    <div>
      <div className="w-full flex items-center justify-center mt-5">
        <span className="text-center dark:text-white text-black text-[17px] font-medium">
          Transfer USD 5,000 to the details below
        </span>
      </div>
      <div className="w-full border border-[#E2E3E7] bg-[#F3F3F3] dark:bg-[#141415] dark:border-[#242425] px-3 py-5 flex flex-col gap-3 rounded-md mt-5">
        <div className="w-full flex justify-between items-center">
          <span className="text-[#696F79] dark:text-[#888888]">
            Account holder
          </span>
          <span className="dark:text-white">LINK FINANCIAL INC</span>
        </div>
        <div className="w-full flex justify-between items-center">
          <span className="text-[#696F79] dark:text-[#888888]">Bank</span>
          <span className="dark:text-white">Choice Financial Group</span>
        </div>
        <div className="w-full flex justify-between items-center">
          <span className="text-[#696F79] dark:text-[#888888]">
            Account number
          </span>
          <div className="flex items-center text-black gap-1 dark:text-white">
            <CopyToClipboard textTobeCopied="202355911342"></CopyToClipboard>
            <span className="dark:text-white">202355911342</span>
          </div>
        </div>
        <div className="w-full flex justify-between items-center">
          <span className="text-[#696F79] dark:text-[#888888]">
            Account type
          </span>
          <span className="dark:text-white">Checking</span>
        </div>
        <div className="w-full flex justify-between items-center">
          <span className="text-[#696F79] dark:text-[#888888]">
            Reference code
          </span>
          <div className="flex items-center text-black gap-1">
            <CopyToClipboard textTobeCopied="103785631491"></CopyToClipboard>
            <span className="dark:text-white">103785631491</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-4 items-center gap-2">
        <div className="text-black flex items-center gap-1 dark:text-[#9F9F9F]">
          <i>{Icons.info}</i>
          <span className="text-xs">
            Use this account for this transaction only
          </span>
        </div>
        <span className="text-sm text-[#696F79]">
          Transaction expires in{" "}
          <span className="text-[#0259D6] dark:text-[#4893FF]">
            {formatTime(secondsRemaining)}
          </span>
        </span>
      </div>
      <div className="w-full flex flex-col items-center mt-4 gap-8">
        <button
          className="w-full text-white bg-[#0E70FD] text-lg rounded-lg text-center py-3 dark:bg-[#0E70FD]"
          onClick={() => setIsConfirming(true)}
        >
          I've sent the money
        </button>
      </div>
    </div>
  );
};
