import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";

export const BankBRL = () => {
  const { setPaywith } = usePaymentLinkMerchantContext();
  return (
    <div>
      <div className="w-full flex gap-2">
        <span className="text-2xl text-black  dark:text-white">Pay</span>
        <span className="text-2xl text-[#0259D6] font-semibold dark:text-[#4893FF]">
          USD 5,000
        </span>
      </div>
      <hr className="mt-5 dark:border-[#242425]" />

      <div className="w-full flex  flex-col items-center justify-center gap-20 mt-20">
        <div className="flex items-center flex-col w-full gap-6">
          <div className="bg-[#F3F3F3] dark:bg-[#141415] dark:border-[#242425] border boder-[#E2E3E7] px-6 py-6 rounded-full dark:text-[#9F9F9F]  text-black">
            <i>{Icons.bankUnavilableIcon}</i>
          </div>
          <span className="font-medium text-lg max-w-[300px] text-center dark:text-[#888888]">
            This method is unavailable for this currency.
          </span>
        </div>
        <div className="w-full flex flex-col gap-6">
          <button
            className="w-full border border-[#E2E3E7] bg-[#F9F9F9] text-xl text-center  dark:bg-transparent py-3 dark:border-[#242425] dark:hover:border-white dark:text-[#F9F9F9] rounded-[10px] hover:border-black"
            onClick={() => setPaywith("transfer")}
          >
            Pay with Transfer
          </button>
          <button
            className="w-full border border-[#E2E3E7] bg-[#F9F9F9] text-xl text-center dark:bg-transparent  dark:border-[#242425] dark:hover:border-white dark:text-[#F9F9F9]  py-3 rounded-[10px] hover:border-black"
            onClick={() => setPaywith("stablecoin")}
          >
            Pay with Stablecoin
          </button>
        </div>
      </div>
      <div className="w-full flex flex-col items-center mt-16 gap-8">
        <span className="text-lg dark:text-[#F9F9F9]">Powered by LINK</span>
      </div>
    </div>
  );
};
