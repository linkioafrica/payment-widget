import { CircularLoader } from "../circularLoader";
import { useEffect, useState } from "react";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useDevice } from "@/contexts/DeviceContext";
import { useWallet } from "@/contexts/WalletContext";
import { DisconnectWallet } from "../disconnectWallet";

export const LoadingState = () => {
  const { setIsConfirming, setIsSuccessful, stablecoinPaymentMethod } =
    usePaymentLinkMerchantContext();
  const { isMobile } = useDevice();
  const [secondsRemaining, setSecondsRemaining] = useState(14 * 60 + 59); // 14:59 in seconds
  const { walletConnected } = useWallet();
  useEffect(() => {
    setTimeout(() => {
      setIsSuccessful(true);
      setIsConfirming(false);
    }, 1500);

    if (secondsRemaining > 0) {
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer); // Clean up the timer on unmount
    } else {
      setIsSuccessful(false);
      setIsConfirming(false);
    }
  }, [secondsRemaining, setIsSuccessful, setIsConfirming]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes}:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}`;
  };
  if (isMobile) {
    return (
      <div>
        <div className="w-full  flex items-center flex-col mt-10">
          <span className="font-semibold text-lg  text-center max-w-[400px] text-black dark:text-[#F9F9F9]">
            We’re waiting to confirm your payment. This can take a few
            minutes...
          </span>
          <CircularLoader classes="mt-10"></CircularLoader>
          <span className="text-[#696F79] mt-12 text-sm">
            Confirming transaction{" "}
            <span className="text-[#0259D6]">
              {formatTime(secondsRemaining)}
            </span>
          </span>
          {walletConnected && stablecoinPaymentMethod == "wallet" && (
            <div className="mt-4">
              <DisconnectWallet></DisconnectWallet>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div className="w-full mt-5 flex items-center flex-col">
          <span className="font-semibold text-[13px] max-w-[450px] text-center text-black dark:text-[#F9F9F9]">
            We’re waiting to confirm your payment. This can take a few
            minutes...
          </span>
          <CircularLoader classes="mt-10"></CircularLoader>
          <span className="text-[#696F79] mt-12 text-xs">
            Confirming transaction{" "}
            <span className="text-[#0259D6]">
              {formatTime(secondsRemaining)}
            </span>
          </span>
          {walletConnected && stablecoinPaymentMethod == "wallet" && (
            <div className="mt-4">
              <DisconnectWallet></DisconnectWallet>
            </div>
          )}
        </div>
      </div>
    );
  }
};
