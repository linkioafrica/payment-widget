import { Icons } from "@/app/icons";
import { useDevice } from "@/contexts/DeviceContext";
import { useWallet as walletContext } from "@/contexts/WalletContext";
import { truncateMiddle } from "@/functions";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import Image from "next/image";
import { useEffect, useState } from "react";

export const DisconnectWallet = () => {
  const [isAcitve, setIsActive] = useState(false);
  const { isMobile } = useDevice();
  const {
    walletConnected,
    setWalletConnected,
    setWalletAddress,
    walletAddress,
    connectedWalletIndex,
    setConnectedWalletIndex,
  } = walletContext();
  const { connected, disconnect } = useWallet(); // Get the wallet status
  const [isCopied, setIsCopied] = useState(false);
  const [wallet, setWallet] = useState<any>();

  const onClickDisconnect = () => {
    if (walletConnected && wallet) {
      console.log(wallet);
      wallet.disconnect();
      setWalletConnected(false);
      setConnectedWalletIndex(null);
      setWalletAddress("");
    }
    setIsActive(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  useEffect(() => {
    const wallets = [
      new PhantomWalletAdapter(), // Ensure you import your wallet adapters
      new SolflareWalletAdapter(), // Ensure you import your wallet adapters
      new TrustWalletAdapter(), // Ensure you import your wallet adapters
    ];
    if (connectedWalletIndex != null) {
      setWallet(wallets[connectedWalletIndex]);
      console.log(wallet);
    }
  }, []);
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
                  onClick={onClickDisconnect}
                >
                  {Icons.closeIcon}
                </button>
              </div>
              <div className="h-full flex flex-col justify-between w-full">
                <div className="w-full flex justify-center flex-col items-center gap-2">
                  <Image
                    src={wallet.icon}
                    alt="Disconnect Logo"
                    width={75}
                    height={75}
                  ></Image>
                  <h3 className="text-white font-semibold">
                    {truncateMiddle(walletAddress, 5, 5)}
                  </h3>
                </div>
                <div className="flex gap-4 text-sm  w-full">
                  <button
                    className="w-full border text-white border-[#DEDEDE] flex items-center py-2 gap-2 px-4 rounded-lg"
                    onClick={async () => {
                      console.log(connected, "");
                      if (connected) {
                        await disconnect();
                        console.log("Disconnected from previous wallet");
                        setWalletConnected(false);
                        setWalletAddress("");
                      }

                      setIsActive(false);
                    }}
                  >
                    {Icons.disconnect}
                    <span>Disconnect</span>
                  </button>
                  <button
                    className="w-full border whitespace-nowrap text-white border-[#DEDEDE] flex items-center py-2 gap-2 px-2 rounded-lg"
                    onClick={
                      isCopied
                        ? () => {}
                        : () => {
                            setIsCopied(true);
                            copyToClipboard(walletAddress);
                            setTimeout(() => {
                              setIsCopied(false);
                            }, 750);
                          }
                    }
                  >
                    {Icons.copyOutlined}
                    <span>{isCopied ? "Copied" : "Copy Address"}</span>
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
              <div className="h-full flex flex-col justify-between w-full">
                <div className="w-full flex justify-center flex-col items-center gap-2">
                  <Image
                    src={wallet.icon}
                    alt="Disconnect Logo"
                    width={75}
                    height={75}
                  ></Image>
                  <h3 className="text-white font-semibold">
                    {truncateMiddle(walletAddress, 5, 5)}
                  </h3>
                </div>
                <div className="flex gap-2 text-sm w-full ">
                  <button
                    className="w-full border text-white border-[#DEDEDE] flex items-center py-2 gap-2 px-2 rounded-lg"
                    onClick={onClickDisconnect}
                  >
                    {Icons.disconnect}
                    <span>Disconnect</span>
                  </button>
                  <button
                    className="w-full border whitespace-nowrap text-white border-[#DEDEDE] flex items-center py-2 gap-2 px-2 rounded-lg"
                    onClick={
                      isCopied
                        ? () => {}
                        : () => {
                            setIsCopied(true);
                            copyToClipboard(walletAddress);
                            setTimeout(() => {
                              setIsCopied(false);
                            }, 750);
                          }
                    }
                  >
                    {Icons.copyOutlined}
                    <span>{isCopied ? "Copied" : "Copy Address"}</span>
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
