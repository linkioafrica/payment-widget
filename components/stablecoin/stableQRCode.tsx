import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";

export const StableQRCode = () => {
  const { setIsConfirming, setStablecoinPaymentMethod } =
    usePaymentLinkMerchantContext();

  return (
    <div>
      <div className="w-full flex items-center justify-center mt-3">
        <span className="text-center text-black text-[13px] font-medium max-w-[350px] dark:text-[#F9F9F9]">
          Scan the QR code below to pay with your solana wallet
        </span>
      </div>

      <div className="w-full flex flex-col items-center mt-4 gap-6">
        <Image
          src={"/assets/icons/qrCode.svg"}
          alt="QR code"
          width={100}
          height={100}
        />
        <button
          className="text-[10px] flex items-center text-black dark:bg-[#141415] dark:text-[#F9F9F9] bg-[#F3F3F3] border-[0.7px] dark:border-[#242425] border-[#E2E3E7] px-2 py-[2px] rounded-md"
          onClick={() => {
            setStablecoinPaymentMethod("");
          }}
        >
          <i className="">{Icons.change}</i>
          Change payment method
        </button>
        <button
          className="w-full text-white bg-[#0E70FD] rounded-lg text-sm text-center py-2"
          onClick={() => setIsConfirming(true)}
        >
          I've sent the money
        </button>
      </div>
    </div>
  );
};
