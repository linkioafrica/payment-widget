import { CircularLoader } from "./circularLoader";
import { useEffect, useState } from "react";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";

export const LoadingState = () => {
  const { setIsConfirming, setIsSuccessfull, isConfirming, isSuccessfull } =
    usePaymentLinkMerchantContext();

  const [secondsRemaining, setSecondsRemaining] = useState(14 * 60 + 59); // 14:59 in seconds

  useEffect(() => {
    setTimeout(() => {
      setIsSuccessfull(true);
      setIsConfirming(false);
    }, 1500);

    if (secondsRemaining > 0) {
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer); // Clean up the timer on unmount
    } else {
      setIsSuccessfull(false);
      setIsConfirming(false);
    }
  }, [secondsRemaining, setIsSuccessfull, setIsConfirming]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes}:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}`;
  };

  return (
    <div>
      <div className="w-full mt-3 flex items-center flex-col">
        <span className="font-semibold text-[13px] max-w-[450px] text-center text-black dark:text-[#F9F9F9]">
          We’re waiting to confirm your payment. This can take a few minutes...
        </span>
        <CircularLoader classes="mt-10"></CircularLoader>
        <span className="text-[#696F79] mt-12 text-xs">
          Confirming transaction{" "}
          <span className="text-[#0259D6]">{formatTime(secondsRemaining)}</span>
        </span>
      </div>
    </div>
  );
};
