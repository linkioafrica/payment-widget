import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useDevice } from "@/contexts/DeviceContext";
import { useWallet } from "@/contexts/WalletContext";
import { DisconnectWallet } from "../disconnectWallet";

export const StableQRCode = () => {
  const { setIsConfirming, setStablecoinPaymentMethod } =
    usePaymentLinkMerchantContext();
  const { isMobile } = useDevice();
  const { walletConnected } = useWallet();
  if (isMobile) {
    return (
      <div>
        <div className="w-full flex items-center justify-center mt-8">
          <span className="text-center text-black text-lg font-medium max-w-[400px] dark:text-[#F9F9F9]">
            Scan the QR code below to pay with your solana wallet
          </span>
        </div>

        <div className="w-full flex flex-col items-center mt-4 gap-6">
          <Image
            src={"/assets/icons/qrCode.svg"}
            alt="QR code"
            width={150}
            height={150}
          />
          {/* <button
            className="text-[10px] flex items-center text-black dark:bg-[#141415] dark:text-[#F9F9F9] bg-[#F3F3F3] border-[0.7px] dark:border-[#242425] border-[#E2E3E7] px-2 py-[2px] rounded-md"
            onClick={() => {
              setStablecoinPaymentMethod("");
            }}
          >
            <i className="">{Icons.change}</i>
            Change payment method
          </button> */}
          <div className="w-full mt-7 flex flex-col gap-4">
            <button
              className="w-full text-white bg-[#0E70FD] rounded-lg  text-center py-3 "
              onClick={() => setIsConfirming(true)}
            >
              I've sent the money
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div className="w-full flex items-center justify-center mt-5">
          <span className="text-center text-black text-[13px] font-medium max-w-[350px] dark:text-[#F9F9F9]">
            Scan the QR code below to pay with your solana wallet
          </span>
        </div>

        <div className="w-full flex flex-col items-center mt-4 gap-4">
          <Image
            src={"/assets/icons/qrCode.svg"}
            alt="QR code"
            width={120}
            height={120}
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
          <div className="flex flex-col w-full gap-4 mt-0">
            <button
              className="w-full text-white bg-[#0E70FD] rounded-lg text-sm text-center py-2"
              onClick={() => setIsConfirming(true)}
            >
              I've sent the money
            </button>
          </div>
        </div>
      </div>
    );
  }
};
