import { Icons } from "@/app/icons";
import Tag from "./tag";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useDevice } from "@/contexts/DeviceContext";

export const NavBar = () => {
  const { isMobile } = useDevice();
  const {
    paywith,
    setPaywith,
    setIsConfirming,
    setIsSuccessful,
    setStablecoinPaymentMethod,
    setIsDrawerOpen,
  } = usePaymentLinkMerchantContext();
  if (isMobile) {
    return (
      <div className="w-[300px] h-full fixed bg-[#1E1E1E] py-5 flex flex-col justify-between  gap-20 z-10 ">
        <div className="flex flex-col w-full gap-6 px-5">
          <h1 className="text-white font-medium text-lg">PAY WITH</h1>
          <div className="flex flex-col w-full gap-3 ">
            <button
              className={`w-full text-start  hover:bg-[#4f4f4f] py-3 px-6  rounded-full flex gap-2 items-center  ${paywith == "transfer" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
              onClick={() => {
                setPaywith("transfer");
                setIsConfirming(false);
                setIsSuccessful(false);
                setIsDrawerOpen(false);
              }}
            >
              <i>{Icons.transfer}</i>
              Transfer
            </button>
            <button
              className={`w-full text-start  hover:bg-[#4f4f4f] py-3 px-6  rounded-full flex gap-2 items-center  ${paywith == "bank" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
              onClick={() => {
                setPaywith("bank");
                setIsConfirming(false);
                setIsSuccessful(false);
                setIsDrawerOpen(false);
              }}
            >
              <i>{Icons.bank}</i>
              Bank
            </button>
            <button className="w-full  text-start  py-3 px-6  rounded-full cursor-default flex gap-2 items-center text-white">
              <i>{Icons.card}</i>
              Card
              <Tag
                text="Comming soon"
                bgColor="bg-[#BFD9FF]"
                textColor="text-[#4f4f4f]"
              ></Tag>
            </button>
            <button
              className={`w-full text-start  hover:bg-[#4f4f4f] py-3 px-6  rounded-full flex gap-2 items-center  ${paywith == "stablecoin" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
              onClick={() => {
                setPaywith("stablecoin");
                setIsConfirming(false);
                setIsSuccessful(false);
                setStablecoinPaymentMethod("");
                setIsDrawerOpen(false);
              }}
            >
              <i>{Icons.stableCoin}</i>
              Stablecoin
              <Tag
                text="Fastest"
                bgColor="bg-[#81F4C3]"
                textColor="text-[#4f4f4f]"
                icon={Icons.fastest}
              ></Tag>
            </button>
          </div>
        </div>
        <div className="border-t flex flex-col px-5 border-[#888888] py-10 gap-4">
          <div className="flex items-center gap-3">
            <i className="text-[#9F9F9F]">{Icons.info}</i>
            <span className="text-[#9F9F9F] text-[11px]">
              Available methods change according to currency.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <i className="text-[#9F9F9F]">{Icons.info}</i>
            <span className="text-[#9F9F9F] text-[11px]">
              Available methods change according to currency.
            </span>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-[250px] bg-[#1E1E1E] py-5 flex flex-col justify-between rounded-l-lg gap-20 ">
        <div className="flex flex-col w-full gap-6 px-5">
          <h1 className="text-white font-medium text-lg">PAY WITH</h1>
          <div className="flex flex-col w-full gap-3 text-sm">
            <button
              className={`w-full text-start  hover:bg-[#4f4f4f] py-3 px-6  rounded-full flex gap-2 items-center  ${paywith == "transfer" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
              onClick={() => {
                setPaywith("transfer");
                setIsConfirming(false);
                setIsSuccessful(false);
              }}
            >
              <i>{Icons.transfer}</i>
              Transfer
            </button>
            <button
              className={`w-full text-start  hover:bg-[#4f4f4f] py-3 px-6  rounded-full flex gap-2 items-center  ${paywith == "bank" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
              onClick={() => {
                setPaywith("bank");
                setIsConfirming(false);
                setIsSuccessful(false);
              }}
            >
              <i>{Icons.bank}</i>
              Bank
            </button>
            <button className="w-full  text-start  py-3 px-6  rounded-full cursor-default flex gap-2 items-center text-white">
              <i>{Icons.card}</i>
              Card
              <Tag
                text="Comming soon"
                bgColor="bg-[#BFD9FF]"
                textColor="text-[#4f4f4f]"
              ></Tag>
            </button>
            <button
              className={`w-full text-start  hover:bg-[#4f4f4f] py-3 px-6  rounded-full flex gap-2 items-center  ${paywith == "stablecoin" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
              onClick={() => {
                setPaywith("stablecoin");
                setIsConfirming(false);
                setIsSuccessful(false);
                setStablecoinPaymentMethod("");
              }}
            >
              <i>{Icons.stableCoin}</i>
              Stablecoin
              <Tag
                text="Fastest"
                bgColor="bg-[#81F4C3]"
                textColor="text-[#4f4f4f]"
                icon={Icons.fastest}
              ></Tag>
            </button>
          </div>
        </div>
        <div className="border-t flex flex-col px-5 border-[#888888] py-10 gap-4">
          <div className="flex items-center gap-3">
            <i className="text-[#9F9F9F]">{Icons.info}</i>
            <span className="text-[#9F9F9F] text-[11px]">
              Available methods change according to currency.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <i className="text-[#9F9F9F]">{Icons.info}</i>
            <span className="text-[#9F9F9F] text-[11px]">
              Available methods change according to currency.
            </span>
          </div>
        </div>
      </div>
    );
  }
};