import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useEffect, useState } from "react";
import { ChangePaymentMethod } from "../changePaymentMethod";
import { useDevice } from "@/contexts/DeviceContext";

export const TransferNGN = () => {
  const { setIsConfirming, setIsSuccessful } = usePaymentLinkMerchantContext();

  const [secondsRemaining, setSecondsRemaining] = useState(29 * 60 + 59); // 29:59 in seconds
  const { isMobile } = useDevice();
  useEffect(() => {
    if (secondsRemaining > 0) {
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer); // Clean up the timer on unmount
    }
  }, [secondsRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes}:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}`;
  };
  if (isMobile) {
    return (
      <div>
        <div className="w-full flex items-center justify-center mt-10">
          <span className="text-center text-black text-lg font-medium max-w-[400px] dark:text-[#F9F9F9]">
            Transfer NGN 8,000,000 to the details below
          </span>
        </div>
        <div className="w-full border border-[#E2E3E7] bg-[#F3F3F3] dark:bg-[#141415] dark:border-[#242425] px-3 py-3 flex flex-col gap-5  rounded-md mt-2">
          <div className="w-full flex justify-between items-center">
            <span className="text-[#696F79] dark:text-[#888888]">
              Account holder
            </span>
            <span className="dark:text-white text-black">LINK LTD</span>
          </div>
          <div className="w-full flex justify-between items-center">
            <span className="text-[#696F79]">Bank</span>
            <span className="dark:text-white text-black">Wema Bank</span>
          </div>
          <div className="w-full flex justify-between items-center">
            <span className="text-[#696F79] dark:text-[#888888]">
              Account number
            </span>
            <div className="flex items-center text-black gap-1 dark:text-white">
              <CopyToClipboard textTobeCopied="0256611055"></CopyToClipboard>
              <span className="dark:text-white">0256611055</span>
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <span className="text-[#696F79] dark:text-[#888888]">
              Reference code
            </span>
            <div className="flex items-center text-black gap-1">
              <CopyToClipboard textTobeCopied="103785631491"></CopyToClipboard>
              <span className="dark:text-white text-black">103785631491</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-5 items-center gap-3">
          <div className="text-black flex items-center gap-1 dark:text-[#9F9F9F]">
            <i>{Icons.info}</i>
            <span className="text-sm">
              Use this account for this transaction only
            </span>
          </div>
          <span className="text-[#696F79] text-sm">
            Transaction expires in{" "}
            <span className="text-[#0259D6]">
              {formatTime(secondsRemaining)}
            </span>
          </span>
        </div>
        <div className="w-full flex flex-col items-center mt-10 gap-4 ">
          <button
            className="w-full text-white bg-[#0E70FD] dark:bg-[#0E70FD] rounded-lg text-center py-3"
            onClick={() => {
              setIsConfirming(true);
            }}
          >
            I've sent the money
          </button>
          <div className="mt-3">
            <ChangePaymentMethod></ChangePaymentMethod>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div className="w-full flex items-center justify-center mt-5">
          <span className="text-center dark:text-white text-black text-[13px] font-medium">
            Transfer NGN 8,000,000 to the details below
          </span>
        </div>
        <div className="w-full border border-[#E2E3E7] bg-[#F3F3F3] dark:bg-[#141415] dark:border-[#242425] px-3 py-3 flex flex-col gap-[10px] text-xs rounded-md mt-3">
          <div className="w-full flex justify-between items-center">
            <span className="text-[#696F79] dark:text-[#888888]">
              Account holder
            </span>
            <span className="dark:text-white text-black">LINK LTD</span>
          </div>
          <div className="w-full flex justify-between items-center">
            <span className="text-[#696F79] dark:text-[#888888]">Bank</span>
            <span className="dark:text-white text-black">Wema Bank</span>
          </div>
          <div className="w-full flex justify-between items-center">
            <span className="text-[#696F79] dark:text-[#888888]">
              Account number
            </span>
            <div className="flex items-center text-black gap-1 dark:text-white">
              <CopyToClipboard textTobeCopied="0256611055"></CopyToClipboard>
              <span className="dark:text-white">0256611055</span>
            </div>
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
        <div className="flex flex-col mt-5 items-center gap-2">
          <div className="text-black flex items-center gap-1 dark:text-[#9F9F9F]">
            <i>{Icons.info}</i>
            <span className="text-[10px]">
              Use this account for this transaction only
            </span>
          </div>
          <span className="text-[#696F79] mt-2 text-[11px]">
            Transaction expires in{" "}
            <span className="text-[#0259D6] dark:text-[#4893FF]">
              {formatTime(secondsRemaining)}
            </span>
          </span>
        </div>
        <div className="w-full flex flex-col items-center mt-8 gap-8">
          <button
            className="w-full text-white bg-[#0E70FD] rounded-lg text-center py-2 text-sm dark:bg-[#0E70FD]"
            onClick={() => setIsConfirming(true)}
          >
            I've sent the money
          </button>
        </div>
      </div>
    );
  }
};
