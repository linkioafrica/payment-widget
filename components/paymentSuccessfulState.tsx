import { useState } from "react";
import { SuccessAnimation } from "./successAnimation";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";

export const PaymentSuccessfulState = () => {
  const [isDone, setIsDone] = useState(false);
  const { currency, isConfirming, isSuccessfull } =
    usePaymentLinkMerchantContext();

  return (
    <div>
      <div className="w-full mt-20 flex items-center flex-col min-h-[250px] ">
        <SuccessAnimation></SuccessAnimation>
        {isDone ? (
          <span className="text-[#696F79] dark:text-[#888888] mt-4 font-medium  text-center max-w-[450px]">
            Payment has been completed. This link is no longer active. Need to
            make a new transaction, please contact the merchant.
          </span>
        ) : (
          <div className="flex flex-col items-center gap-1 mt-4 ">
            <h4 className="text-2xl font-semibold dark:text-white">
              Payment Successful!
            </h4>
            <span className="text-[#696F79] dark:text-[#888888] font-medium  text-center max-w-[450px]">
              You have successfully sent USD 5000.
            </span>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col items-center  gap-8">
        <button
          disabled={isDone}
          className={`w-full text-white bg-[#0E70FD] text-xl rounded-lg text-center  py-4 ${isDone ? "opacity-0" : ""}`}
          onClick={() => setIsDone(true)}
        >
          Done
        </button>
      </div>
    </div>
  );
};
