import { useState } from "react";
import { SuccessAnimation } from "./successAnimation";

export const PaymentSuccessfulState = () => {
  const [isDone, setIsDone] = useState(false);

  return (
    <div>
      <div className="w-full mt-8 flex items-center flex-col min-h-[200px] ">
        <SuccessAnimation></SuccessAnimation>
        {isDone ? (
          <span className="text-[#696F79] dark:text-[#888888] mt-4  text-xs font-medium  text-center max-w-[450px]">
            Payment has been completed. This link is no longer active. Need to
            make a new transaction, please contact the merchant.
          </span>
        ) : (
          <div className="flex flex-col items-center gap-1 mt-4 ">
            <h4 className=" font-semibold dark:text-white text-black">
              Payment Successful!
            </h4>
            <span className="text-[#696F79] text-xs dark:text-[#888888] font-medium  text-center max-w-[450px]">
              You have successfully sent USD 5000.
            </span>
          </div>
        )}
      </div>

      <div className="w-full">
        <button
          disabled={isDone}
          className={`w-full text-white bg-[#0E70FD]  rounded-lg text-sm text-center  py-2 ${isDone ? "opacity-0" : ""}`}
          onClick={() => setIsDone(true)}
        >
          Done
        </button>
      </div>
    </div>
  );
};
