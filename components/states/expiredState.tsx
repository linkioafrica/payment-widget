import { Icons } from "@/app/icons";
import Image from "next/image";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useDevice } from "@/contexts/DeviceContext";
import { ChangePaymentMethod } from "../changePaymentMethod";

export const ExpiredState = () => {
  const { setPaywith } = usePaymentLinkMerchantContext();
  const { isMobile } = useDevice();
  if (isMobile) {
    return (
      <div>
        <div className="w-full flex h-full  min-h-80 flex-col items-center justify-center gap-5 mt-10">
          <div className="flex items-center flex-col w-full gap-3">
            <div className="bg-[#F9F1CC] dark:bg-[#141415] dark:border-[#242425] border boder-[#E2E3E7] px-6 py-6 rounded-full dark:text-[#9F9F9F]  text-black">
              <i>{Icons.expired}</i>
            </div>
            <span className="font-medium  max-w-[300px] text-center text-sm text-black dark:text-[#888888]">
              Payment link is expired. Please contact the merchant to make a new
              transaction.
            </span>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div className="w-full flex  flex-col items-center justify-center gap-5 mt-10">
          <div className="flex items-center flex-col w-full gap-3">
            <div className="bg-[#F9F1CC] dark:bg-[#141415] dark:border-[#242425] border boder-[#E2E3E7] px-6 py-6 rounded-full dark:text-[#9F9F9F]  text-black">
              <i>{Icons.expired}</i>
            </div>
            <span className="font-medium  max-w-[300px] text-center text-xs text-black dark:text-[#888888]">
              Payment link is expired. Please contact the merchant to make a new
              transaction.
            </span>
          </div>
        </div>
      </div>
    );
  }
};
