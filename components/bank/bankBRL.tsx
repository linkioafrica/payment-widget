import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";

export const BankBRL = () => {
  const { setPaywith } = usePaymentLinkMerchantContext();
  return (
    <div>
      <div className="w-full flex  flex-col items-center justify-center gap-5 mt-14">
        <div className="flex items-center flex-col w-full gap-6">
          <div className="bg-[#F3F3F3] dark:bg-[#141415] dark:border-[#242425] border boder-[#E2E3E7] px-6 py-6 rounded-full dark:text-[#9F9F9F]  text-black">
            <i>{Icons.bankUnavilableIcon}</i>
          </div>
          <span className="font-medium  max-w-[300px] text-center dark:text-[#888888]">
            This method is unavailable for this currency.
          </span>
        </div>
        <div className="w-full flex flex-col gap-4">
          <button
            className="w-full border border-[#E2E3E7] bg-[#F9F9F9] text-lg text-center  dark:bg-transparent py-2 dark:border-[#242425] dark:hover:border-white dark:text-[#F9F9F9] rounded-[10px] hover:border-black"
            onClick={() => setPaywith("transfer")}
          >
            Pay with Transfer
          </button>
          <button
            className="w-full border border-[#E2E3E7] bg-[#F9F9F9] text-lg text-center dark:bg-transparent  dark:border-[#242425] dark:hover:border-white dark:text-[#F9F9F9]  py-2 rounded-[10px] hover:border-black"
            onClick={() => setPaywith("stablecoin")}
          >
            Pay with Stablecoin
          </button>
        </div>
      </div>
    </div>
  );
};
