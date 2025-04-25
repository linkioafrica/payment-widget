import { Icons } from "@/app/icons";
import Image from "next/image";
import { CopyToClipboard } from "../copyToClicpboard";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useDevice } from "@/contexts/DeviceContext";
import { ChangePaymentMethod } from "../changePaymentMethod";

export const MiniPayHome = () => {
  const { setIsConfirming } = usePaymentLinkMerchantContext();
  const { isMobile } = useDevice();
  if (isMobile) {
    return (
      <div>
        <div className="w-full flex items-center justify-start mt-3 border gap-3 border-[#E2E3E7] rounded-[7px] px-3 py-2 dark:border-[#242425] dark:text-[#F9F9F9]">
          <i className="text-black dark:text-white">{Icons.infoLarge}</i>
          <span className="text-start  text-black text-[12px] font-medium dark:text-[#F9F9F9]">
            Send only <b>CELO</b>, <b>USDC</b>, <b>USDT</b>, or <b>CUSD</b>.
            Scan the QR or paste the number into your MiniPay app to pay.
          </span>
        </div>
        <div className="w-full flex flex-col mt-4 gap-1">
          <span className="text-[#696F79] ">MiniPay Number</span>
          <div className="w-full border-[0.8px] border-[#E2E3E7] text-black px-2 py-3 flex justify-between text-sm items-center rounded-lg bg-[#F3F3F3] dark:bg-[#141415] dark:border-[#242425] dark:text-[#F9F9F9]">
            <span>+905338763421</span>
            <CopyToClipboard textTobeCopied="+905338763421"></CopyToClipboard>
          </div>
        </div>
        <div className="w-full flex flex-col items-center mt-6 gap-4">
          <Image
            src={"/assets/images/qrCode/miniPay/dummy.svg"}
            alt="QR code"
            width={150}
            height={150}
          />

          <button
            className="w-full text-white bg-[#0E70FD] rounded-lg  text-center mt-5 py-3 dark:bg-[#0E70FD]"
            onClick={() => setIsConfirming(true)}
          >
            I've sent the money
          </button>
          {/* <div className="">
            <ChangePaymentMethod></ChangePaymentMethod>
          </div> */}
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div className="w-full flex items-center justify-start mt-3 border gap-3 border-[#E2E3E7] rounded-[7px] px-3 py-2 dark:border-[#242425] dark:text-[#F9F9F9]">
          <i className="text-black dark:text-white">{Icons.infoLarge}</i>
          <span className="text-start  text-black text-[12px] font-medium dark:text-[#F9F9F9]">
            Send only <b>CELO</b>, <b>USDC</b>, <b>USDT</b>, or <b>CUSD</b>.
            Scan the QR or paste the number into your MiniPay app to pay.
          </span>
        </div>
        <div className="w-full flex flex-col mt-4 gap-1">
          <span className="text-[#696F79] text-xs">MiniPay Number</span>
          <div className="w-full border-[0.8px] border-[#E2E3E7] text-black px-2 py-3 flex justify-between text-xs items-center rounded-lg bg-[#F3F3F3] dark:bg-[#141415] dark:border-[#242425] dark:text-[#F9F9F9]">
            <span>+905338763421</span>
            <CopyToClipboard textTobeCopied="+905338763421"></CopyToClipboard>
          </div>
        </div>
        <div className="w-full flex flex-col items-center mt-5 gap-4">
          <Image
            src={"/assets/images/qrCode/MiniPay/dummy.svg"}
            alt="QR code"
            width={120}
            height={120}
          />

          <button
            className="w-full text-white bg-[#0E70FD] rounded-lg text-sm text-center mt-2 py-2 dark:bg-[#0E70FD]"
            onClick={() => setIsConfirming(true)}
          >
            I've sent the money
          </button>
        </div>
      </div>
    );
  }
};
