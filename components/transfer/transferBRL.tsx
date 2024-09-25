import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";

export const TransferBRL = () => {
  const { setIsConfirming } = usePaymentLinkMerchantContext();

  return (
    <div>
      <div className="w-full flex items-center justify-center mt-5">
        <span className="text-center text-black text-[17px] font-medium dark:text-[#F9F9F9]">
          Transfer R$ 28,350 to the PIX key below
        </span>
      </div>
      <div className="w-full flex flex-col mt-5 gap-1">
        <span className="text-[#696F79] text-sm">PIX key</span>
        <div className="w-full border-[0.8px] border-[#E2E3E7] text-black px-2 py-3 flex justify-between text-sm items-center rounded-lg bg-[#F3F3F3] dark:bg-[#141415] dark:border-[#242425] dark:text-[#F9F9F9]">
          <span>11754090-d0cf-4b1b-9d45-6669b695f5f3</span>
          <CopyToClipboard textTobeCopied="11754090-d0cf-4b1b-9d45-6669b695f5f3"></CopyToClipboard>
        </div>
      </div>
      <div className="w-full flex flex-col items-center mt-4 gap-4">
        <Image
          src={"/assets/images/qrCode/BRLTransfer.svg"}
          alt="QR code"
          width={150}
          height={150}
        />
        <span className="text-xs text-[#696F79]  dark:text-[#888888]">
          Scan this QR code to pay with your PIX account
        </span>
        <button
          className="w-full text-white bg-[#0E70FD] rounded-lg text-center text-lg py-3 dark:bg-[#0E70FD]"
          onClick={() => setIsConfirming(true)}
        >
          I've sent the money
        </button>
      </div>
    </div>
  );
};
