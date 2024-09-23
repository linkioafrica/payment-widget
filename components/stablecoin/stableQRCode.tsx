import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";

export const StableQRCode = () => {
  const { setIsConfirming, setStablecoinPaymentMethod } =
    usePaymentLinkMerchantContext();

  return (
    <div>
      <div className="w-full flex gap-2">
        <span className="text-2xl text-black dark:text-white">Pay</span>
        <span className="text-2xl text-[#0259D6] font-semibold dark:text-[#4893FF]">
          R$ 28,350
        </span>
      </div>
      <hr className="mt-5 dark:border-[#242425]" />
      <div className="w-full flex items-center justify-center mt-10">
        <span className="text-center text-black text-lg font-medium max-w-[350px] dark:text-[#F9F9F9]">
          Scan the QR code below to pay with your solana wallet
        </span>
      </div>

      <div className="w-full flex flex-col items-center mt-8 gap-8">
        <Image
          src={"/assets/icons/qrCode.svg"}
          alt="QR code"
          width={200}
          height={200}
        />
        <button
          className="text-sm flex items-center text-black dark:bg-[#141415] dark:text-[#F9F9F9] bg-[#F3F3F3] border-[0.7px] dark:border-[#242425] border-[#E2E3E7] px-2 py-[2px] rounded-md"
          onClick={() => {
            setStablecoinPaymentMethod("");
          }}
        >
          <i className="">{Icons.change}</i>
          Change payment method
        </button>
        <button
          className="w-full text-white bg-[#0E70FD] text-xl rounded-lg text-center  py-4"
          onClick={() => setIsConfirming(true)}
        >
          I've sent the money
        </button>
        <span className="text-lg dark:text-[#F9F9F9]">Powered by LINK</span>
      </div>
    </div>
  );
};
