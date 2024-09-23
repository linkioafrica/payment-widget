import { Icons } from "@/app/icons";
import Image from "next/image";
import { CircularLoader } from "./circularLoader";
import { useEffect } from "react";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";

export const LoadingState = () => {
  const {
    setIsConfirming,
    setIsSuccessfull,
    isConfirming,
    isSuccessfull,
    currency,
  } = usePaymentLinkMerchantContext();
  useEffect(() => {
    setTimeout(() => {
      setIsSuccessfull(true);
      setIsConfirming(false);
    }, 1500);
  });
  return (
    <div>
      <div
        className={`w-full flex gap-2 ${isConfirming || isSuccessfull ? "flex-col -mt-10" : "flex-row"}`}
      >
        <span className="text-2xl text-black dark:text-white">
          {isConfirming || isSuccessfull ? "Amount you sent" : "Pay"}
        </span>
        <span className="text-2xl text-[#0259D6] dark:text-[#4893FF] font-semibold">
          {currency.name} 5,000
        </span>
      </div>
      <hr className="mt-5 dark:border-[#242425]" />

      <div className="w-full mt-16 flex items-center flex-col">
        <span className="font-semibold text-lg max-w-[450px] text-center dark:text-[#F9F9F9]">
          We’re waiting to confirm your payment. This can take a few minutes...
        </span>
        <CircularLoader classes="mt-16"></CircularLoader>
        <span className="text-[#696F79] mt-20">
          Confirming transaction <span className="text-[#0259D6]">29:00</span>
        </span>
      </div>

      <div className="w-full flex flex-col items-center mt-20 gap-8">
        <span className="text-lg dark:text-[#F9F9F9]">Powered by LINK</span>
      </div>
    </div>
  );
};
