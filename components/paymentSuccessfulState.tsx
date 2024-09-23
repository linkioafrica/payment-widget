import { useState } from "react";
import { SuccessAnimation } from "./successAnimation";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";

export const PaymentSuccessfulState = () => {
  const [isDone, setIsDone] = useState(false);
  const { currency, isConfirming, isSuccessfull } =
    usePaymentLinkMerchantContext();

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

      <div className="w-full mt-[100px] flex items-center flex-col min-h-[350px] ">
        <SuccessAnimation></SuccessAnimation>
        {isDone ? (
          <span className="text-[#696F79] dark:text-[#888888] mt-8 font-medium text-lg text-center max-w-[450px]">
            Payment has been completed. This link is no longer active. Need to
            make a new transaction, please contact the merchant.
          </span>
        ) : (
          <div className="flex flex-col gap-4 mt-8 ">
            <h4 className="text-3xl font-semibold dark:text-white">
              Payment Successful!
            </h4>
            <span className="text-[#696F79] dark:text-[#888888] font-medium text-lg text-center max-w-[450px]">
              You have successfully sent USD 5000.
            </span>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col items-center mt-20 gap-8">
        <button
          disabled={isDone}
          className={`w-full text-white bg-[#0E70FD] text-xl rounded-lg text-center  py-4 ${isDone ? "opacity-0" : ""}`}
          onClick={() => setIsDone(true)}
        >
          Done
        </button>
        <span className="text-lg dark:text-[#F9F9F9]">Powered by LINK</span>
      </div>
    </div>
  );
};
