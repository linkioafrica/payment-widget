import { useState } from "react";
import { SuccessAnimation } from "../successAnimation";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useDevice } from "@/contexts/DeviceContext";
import { Icons } from "@/app/icons";
import { DisconnectWallet } from "../disconnectWallet";
import { useWallet } from "@/contexts/WalletContext";

export const PaymentSuccessfulState = () => {
  const [isDone, setIsDone] = useState(false);
  const { paywith, data } = usePaymentLinkMerchantContext();
  const { isMobile } = useDevice();
  const { walletConnected } = useWallet();
  if (isMobile) {
    return (
      <div>
        <div className="w-full mt-10 flex items-center flex-col  ">
          <SuccessAnimation></SuccessAnimation>
          {isDone ? (
            <span className="text-[#696F79] dark:text-[#888888] mt-4  text-sm font-medium  text-center max-w-[400px]">
              Payment has been completed. This link is no longer active. Need to
              make a new transaction, please contact the merchant.
            </span>
          ) : (
            <div className="flex flex-col items-center gap-1 mt-4 ">
              <h4 className=" font-semibold dark:text-white text-lg text-black">
                Payment Successful!
              </h4>
              <span className="text-[#696F79] text-sm dark:text-[#888888] font-medium  text-center max-w-[450px]">
                You have successfully sent {data?.transactions?.currency}{" "}
                {data?.transactions?.amount}.
              </span>
              {paywith == "stablecoin" && (
                <span className="text-[#0259D6] underline text-sm cursor-pointer">
                  View on explorer.
                </span>
              )}
            </div>
          )}
        </div>

        <div className="w-full  mt-10">
          {walletConnected && (
            <div className="mt-6 mb-6">
              <DisconnectWallet></DisconnectWallet>
            </div>
          )}
          <button
            disabled={isDone}
            className={`w-full text-white bg-[#0E70FD]  rounded-lg  text-center py-3 ${isDone ? "opacity-0" : ""}`}
            onClick={() => setIsDone(true)}
          >
            Done
          </button>
        </div>
      </div>
    );
  } else {
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
                You have successfully sent {data?.transactions?.currency}{" "}
                {data?.transactions?.amount}
              </span>
              {paywith == "stablecoin" && (
                <span className="text-[#0259D6] underline text-xs cursor-pointer">
                  View on explorer.
                </span>
              )}
            </div>
          )}
        </div>
        {walletConnected && (
          <div className="mt-6 mb-4">
            <DisconnectWallet></DisconnectWallet>
          </div>
        )}

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
  }
};
