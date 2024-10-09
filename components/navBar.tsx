import { Icons } from "@/app/icons";
import Tag from "./tag";
import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { useDevice } from "@/contexts/DeviceContext";
import { useState, useEffect } from "react";
import { UpdateTrxDetails } from "@/www";

export const NavBar = () => {
  const { isMobile } = useDevice();
  const {
    paywith,
    setPaywith,
    setIsConfirming,
    setIsSuccessful,
    setStablecoinPaymentMethod,
    setIsDrawerOpen,
    setIsExpired,
    isExpired,
    isBroken,
    data,
    loading,
    isSuccessful,
    trx,
  } = usePaymentLinkMerchantContext();

  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (loading) return;
    if (!data || data?.status == 403) {
      setTimeLeft("00:00:00");
      return;
    }
    // Replace with your API date value
    const expirationDate = new Date(data?.transactions?.timeout).getTime();

    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = expirationDate - now;

      if (difference <= 0) {
        setTimeLeft("00:00:00");
        handleTimeEnd();
        setIsExpired(true);
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      setTimeLeft(formattedTime);
    };

    updateTimeLeft(); // Initial call to set the time immediately
    const timer = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(timer); // Cleanup on component unmount
  }, [loading, data]);
  const handleTimeEnd = async () => {
    await updatePaymentLink();
  };
  const updatePaymentLink = async () => {
    if (!trx) return;
    const url = UpdateTrxDetails;
    console.log("called");
    const requestBody = {
      checkout_id: trx,
      payment_status: "expired",
      expired: true,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("API Response:", data);
    } catch (error) {
      console.error("Error calling API:", error);
    } finally {
      console.log("API call completed");
    }
  };

  if (isMobile) {
    return (
      <div className="w-[300px] h-full fixed bg-[#1E1E1E] py-5 flex flex-col justify-between  gap-20 z-10 ">
        <div className={`flex flex-col w-full gap-6 px-5 `}>
          <h1 className="text-white font-medium text-lg">PAY WITH</h1>
          <div
            className={`flex flex-col w-full gap-3 ${isExpired || isBroken ? "opacity-30" : ""}`}
          >
            <button
              className={`w-full text-start  py-3 px-6 rounded-full flex gap-2 items-center opacity-30
        ${paywith == "transfer" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
              onClick={() => {
                // hover:bg-[#4f4f4f]
                // setPaywith("transfer");
                // setIsConfirming(false);
                // setIsSuccessful(false);
                // setIsDrawerOpen(false);
              }}
            >
              <i>{Icons.transfer}</i>
              Transfer
            </button>
            <button
              className={`w-full text-start  py-3 px-6 rounded-full flex gap-2 items-center opacity-30
        ${paywith == "bank" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
              onClick={() => {
                // hover:bg-[#4f4f4f]
                // setPaywith("bank");
                // setIsConfirming(false);
                // setIsSuccessful(false);
                // setIsDrawerOpen(false);
              }}
            >
              <i>{Icons.bank}</i>
              Bank
              <Tag
                text="Coming soon"
                bgColor="bg-[#BFD9FF]"
                textColor="text-[#162255]"
              ></Tag>
            </button>
            <button className="w-full  text-start  py-3 px-6  rounded-full opacity-30 cursor-default flex gap-2 items-center text-white">
              <i>{Icons.card}</i>
              Card
              <Tag
                text="Coming soon"
                bgColor="bg-[#BFD9FF]"
                textColor="text-[#162255]"
              ></Tag>
            </button>
            <button
              className={`w-full text-start  py-3 px-6 rounded-full flex gap-2 items-center
        ${paywith == "stablecoin" && !isBroken && !isExpired && !isSuccessful ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}
        ${isExpired || isBroken || isSuccessful ? "opacity-30" : "hover:bg-[#4f4f4f]"}
        `}
              onClick={
                isExpired || isBroken || isSuccessful
                  ? () => {}
                  : () => {
                      setPaywith("stablecoin");
                      setIsConfirming(false);
                      setIsSuccessful(false);
                      setStablecoinPaymentMethod("");
                      setIsDrawerOpen(false);
                    }
              }
            >
              <i>{Icons.stableCoin}</i>
              Stablecoin
              <Tag
                text="Fastest"
                bgColor="bg-[#81F4C3]"
                textColor="text-[#03301F]"
                icon={Icons.fastest}
              ></Tag>
            </button>
          </div>
        </div>
        <div className="border-t flex flex-col px-5 border-[#888888] py-10 gap-4">
          <div className="flex items-center gap-3">
            <i className="text-[#9F9F9F]">{Icons.info}</i>
            <span className="text-[#9F9F9F] text-sm">
              For payment inquiries, contact the merchant who shared the link
              with you.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <i className="text-[#9F9F9F]">{Icons.info}</i>
            <span className="text-[#9F9F9F] text-sm ">
              Link expires in:{" "}
              <span className="font-medium text-white">
                {isSuccessful || isExpired || isBroken ? "——" : timeLeft}
              </span>
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
          <div
            className={`flex flex-col w-full gap-3 text-sm ${isExpired || isBroken ? "opacity-30" : ""}`}
          >
            <button
              className={`w-full text-start py-3 px-6 rounded-full flex opacity-30 gap-2 items-center
        ${paywith == "transfer" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
              onClick={() => {
                // hover:bg-[#4f4f4f]
                // setPaywith("transfer");
                // setIsConfirming(false);
                // setIsSuccessful(false);
              }}
            >
              <i>{Icons.transfer}</i>
              Transfer
            </button>
            <button
              className={`w-full text-start  py-3 px-6 rounded-full opacity-30 flex gap-2 items-center
        ${paywith == "bank" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
              onClick={() => {
                // hover:bg-[#4f4f4f]
                // setPaywith("bank");
                // setIsConfirming(false);
                // setIsSuccessful(false);
              }}
            >
              <i>{Icons.bank}</i>
              Bank
              <Tag
                text="Coming soon"
                bgColor="bg-[#BFD9FF]"
                textColor="text-[#4f4f4f]"
              ></Tag>
            </button>
            <button className="w-full  text-start  py-3 px-6  rounded-full opacity-30  cursor-default flex gap-2 items-center text-white">
              <i>{Icons.card}</i>
              Card
              <Tag
                text="Coming soon"
                bgColor="bg-[#BFD9FF]"
                textColor="text-[#4f4f4f]"
              ></Tag>
            </button>
            <button
              className={`w-full text-start  py-3 px-6 rounded-full flex gap-2 items-center
        ${paywith == "stablecoin" && !isExpired && !isBroken && !isSuccessful ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}
        ${isExpired || isBroken || isSuccessful ? "opacity-30" : "hover:bg-[#4f4f4f] cursor-pointer"}
        `}
              onClick={
                isExpired || isBroken || isSuccessful
                  ? () => {}
                  : () => {
                      setPaywith("stablecoin");
                      setIsConfirming(false);
                      setIsSuccessful(false);
                      setStablecoinPaymentMethod("");
                    }
              }
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
              For payment inquiries, contact the merchant who shared the link
              with you.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <i className="text-[#9F9F9F]">{Icons.info}</i>
            <span className="text-[#9F9F9F] text-[11px]">
              Link expires in:{" "}
              <span className="font-medium text-white">
                {isSuccessful || isExpired || isBroken ? "——" : timeLeft}
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }
};
