"use client";

import { useState } from "react";
import { Icons } from "./icons";
import Image from "next/image";
import Tag from "@/components/tag";
import { CurrencyDropDown } from "@/components/currencyDropDown";
export default function Home() {
  const [paywith, setPaywith] = useState("transfer");

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center py-20">
      <div className="w-[950px] flex font-sora">
        {/* Left Panel Pay With */}
        <div className="w-[350px] bg-[#1E1E1E] py-5 flex flex-col justify-between rounded-l-lg gap-20 ">
          <div className="flex flex-col w-full gap-8 px-10 ">
            <h1 className="text-white font-medium text-xl">PAY WITH</h1>
            <div className="flex flex-col w-full gap-4">
              <button
                className={`w-full text-start  hover:bg-[#4f4f4f] py-4 px-6 text-lg rounded-full flex gap-3 items-center  ${paywith == "transfer" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
                onClick={() => setPaywith("transfer")}
              >
                <i>{Icons.transfer}</i>
                Transfer
              </button>
              <button
                className={`w-full text-start  hover:bg-[#4f4f4f] py-4 px-6 text-lg rounded-full flex gap-3 items-center  ${paywith == "bank" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
                onClick={() => setPaywith("bank")}
              >
                <i>{Icons.bank}</i>
                Bank
              </button>
              <button className="w-full  text-start   py-4 px-6 text-lg rounded-full cursor-default flex gap-3 items-center text-white">
                <i>{Icons.card}</i>
                Card
                <Tag
                  text="Comming soon"
                  bgColor="bg-[#BFD9FF]"
                  textColor="text-[#4f4f4f]"
                ></Tag>
              </button>
              <button
                className={`w-full text-start  hover:bg-[#4f4f4f] py-4 px-6 text-lg rounded-full flex gap-3 items-center  ${paywith == "stablecoin" ? "text-[#A6CAFE] bg-[#4f4f4f] " : "text-white"}`}
                onClick={() => setPaywith("stablecoin")}
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
          <div className="border-t flex flex-col px-10 border-[#888888] py-10 gap-8">
            <div className="flex items-center gap-3">
              <i className="text-[#9F9F9F]">{Icons.info}</i>
              <span className="text-[#9F9F9F] text-sm">
                Available methods change according to currency.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <i className="text-[#9F9F9F]">{Icons.info}</i>
              <span className="text-[#9F9F9F] text-sm">
                Available methods change according to currency.
              </span>
            </div>
          </div>
        </div>
        {/* Right Panel  */}
        <div className="flex-grow bg-white px-12 py-10 flex-col">
          <div className="flex items-start justify-between">
            <h2 className="text-xl text-[#696F79] font-medium">Akarabox</h2>
            <div className="flex gap-4">
              <CurrencyDropDown></CurrencyDropDown>
              <button className="px-2 py-1 border border-[#E2E3E7] hover:border-black text-[#545454] rounded-md">
                {Icons.moon}
              </button>
            </div>
          </div>
          <div className="w-full flex gap-2">
            <span className="text-2xl text-black">Pay</span>
            <span className="text-2xl text-[#0259D6] font-semibold">
              R$ 28,350
            </span>
          </div>
          <hr className="mt-5" />
          <div className="w-full flex items-center justify-center mt-10">
            <span className="text-center text-black text-lg font-medium">
              Transfer R$ 28,350 to the PIX key below
            </span>
          </div>
          <div className="w-full flex flex-col mt-9 gap-1">
            <span className="text-[#696F79]">PIX key</span>
            <div className="w-full border-[0.8px]  border-[#E2E3E7] text-black px-3 py-4 flex justify-between items-center rounded-lg bg-[#F3F3F3]">
              <span>11754090-d0cf-4b1b-9d45-6669b695f5f3</span>
              <i>{Icons.copy}</i>
            </div>
          </div>
          <div className="w-full flex flex-col items-center mt-8 gap-8"> 
            <Image
              src={"/assets/images/qrCode/BRLTransfer.svg"}
              alt="QR code"
              width={200}
              height={200}
            />
            <span className="text-sm text-[#696F79] ">
              Scan this QR code to pay with your PIX account
            </span>
            <button className="w-full text-white bg-[#0E70FD] text-xl rounded-lg text-center  py-4">
              I've sent the money
            </button>
            <span className="text-lg">Powered by LINK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
