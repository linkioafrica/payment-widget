import { Icons } from "@/app/icons";
import { useDevice } from "@/contexts/DeviceContext";
import { useWallet } from "@/contexts/WalletContext";
import { truncateMiddle } from "@/functions";
import Image from "next/image";
import { useState } from "react";

export const DisconnectWallet = () => {
  const [isAcitve, setIsActive] = useState(false);
  const { isMobile } = useDevice();
  const { walletConnected, walletAddress } = useWallet();
  if (isMobile) {
    return (
      <div className="w-full items-center justify-center flex">
        <button
          className="text-sm flex items-center text-black dark:bg-[#141415] hover:border-black  gap-2 dark:hover:border-white dark:text-[#F9F9F9] bg-[#F3F3F3] border py-1 dark:border-[#242425] border-[#E2E3E7] px-2 rounded-md"
          onClick={() => {
            setIsActive(true);
          }}
        >
          {truncateMiddle(walletAddress, 5, 5)}
          {Icons.chevron_down}
        </button>
        {isAcitve && (
          <div className="w-screen h-screen fixed top-0 left-0 flex items-center justify-center text-white">
            <div
              className="w-full h-full bg-black absolute opacity-20"
              onClick={() => setIsActive(false)}
            ></div>
            <div className="w-[350px] h-[300px] bg-[#10141E] z-10 rounded-2xl flex flex-col px-4 py-4 items-center">
              <div className="w-full flex items-end justify-end">
                <button
                  className="text-[#777777] w-[30px] h-[30px] items-center justify-center flex bg-[#1B1F2D] rounded-full "
                  onClick={() => setIsActive(false)}
                >
                  {Icons.closeIcon}
                </button>
              </div>
              <div className="h-full flex flex-col justify-between">
                <div className="w-full flex justify-center flex-col items-center gap-2">
                  <Image
                    src={"/assets/icons/walletDisconnect.svg"}
                    alt="Disconnect Logo"
                    width={50}
                    height={50}
                  ></Image>
                  <h3 className="text-white font-semibold">
                    {truncateMiddle(walletAddress, 5, 5)}
                  </h3>
                </div>
                <div className="flex gap-4 text-sm ">
                  <button
                    className="w-full border text-white border-[#DEDEDE] flex items-center py-2 gap-2 px-4 rounded-lg"
                    onClick={() => setIsActive(false)}
                  >
                    {Icons.disconnect}
                    <span>Disconnect</span>
                  </button>
                  <button
                    className="w-full border whitespace-nowrap text-white border-[#DEDEDE] flex items-center py-2 gap-2 px-4 rounded-lg"
                    onClick={() => setIsActive(false)}
                  >
                    {Icons.copyOutlined}
                    <span>Copy Address</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="w-full items-center justify-center flex">
        <button
          className="text-xs flex items-center text-black dark:bg-[#141415] hover:border-black  gap-2 dark:hover:border-white dark:text-[#F9F9F9] bg-[#F3F3F3] border py-1 dark:border-[#242425] border-[#E2E3E7] px-2 rounded-md"
          onClick={() => {
            setIsActive(true);
          }}
        >
          {truncateMiddle(walletAddress, 5, 5)}
          {Icons.chevron_down}
        </button>
        {isAcitve && (
          <div className="w-screen h-screen fixed top-0 left-0 flex items-center justify-center text-white">
            <div
              className="w-full h-full bg-black absolute opacity-20"
              onClick={() => setIsActive(false)}
            ></div>
            <div className="w-[350px] h-[300px] bg-[#10141E] z-10 rounded-2xl flex flex-col px-4 py-4 items-center">
              <div className="w-full flex items-end justify-end">
                <button
                  className="text-[#777777] w-[30px] h-[30px] items-center justify-center flex bg-[#1B1F2D] rounded-full "
                  onClick={() => setIsActive(false)}
                >
                  {Icons.closeIcon}
                </button>
              </div>
              <div className="h-full flex flex-col justify-between">
                <div className="w-full flex justify-center flex-col items-center gap-2">
                  <Image
                    src={"/assets/icons/walletDisconnect.svg"}
                    alt="Discconect Logo"
                    width={50}
                    height={50}
                  ></Image>
                  <h3 className="text-white font-semibold">
                    {truncateMiddle(walletAddress, 5, 5)}
                  </h3>
                </div>
                <div className="flex gap-4 text-sm ">
                  <button
                    className="w-full border text-white border-[#DEDEDE] flex items-center py-2 gap-2 px-4 rounded-lg"
                    onClick={() => setIsActive(false)}
                  >
                    {Icons.disconnect}
                    <span>Disconnect</span>
                  </button>
                  <button
                    className="w-full border whitespace-nowrap text-white border-[#DEDEDE] flex items-center py-2 gap-2 px-4 rounded-lg"
                    onClick={() => setIsActive(false)}
                  >
                    {Icons.copyOutlined}
                    <span>Copy Address</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};
