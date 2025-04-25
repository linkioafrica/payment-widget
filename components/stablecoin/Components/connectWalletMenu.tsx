import { Icons } from "@/app/icons";
import { useDevice } from "@/contexts/DeviceContext";
import Image from "next/image";

export const ConnectWalletMenu = ({
  setStablecoinPaymentMethod,
  connectedWalletIndex,
  connectWallet,
  wallets,
  network,
}: any) => {
  const { isMobile } = useDevice();

  if (isMobile) {
    return (
      <div className="w-screen h-screen fixed top-0 left-0 flex items-center justify-center text-white">
        <div
          className="w-full h-full bg-black absolute opacity-20"
          onClick={() => setStablecoinPaymentMethod("")}
        ></div>
        <div className="w-[300px] bg-[#10141E] z-10 rounded-2xl flex flex-col px-4 py-6 items-center">
          <div className="w-full flex items-end justify-end">
            <button
              className="text-[#777777] w-[30px] h-[30px] items-center justify-center flex bg-[#1B1F2D] rounded-full "
              onClick={() => setStablecoinPaymentMethod("")}
            >
              {Icons.closeIcon}
            </button>
          </div>
          <div className="max-w-[300px] my-3">
            <h2 className=" text-xl font-semibold text-center ">
              Connect a {network} Wallet & continue
            </h2>
          </div>
          <div className="w-full flex flex-col gap-6 mt-7">
            {wallets.map((wallet: any) => (
              <div
                key={wallet.id}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={wallet.image}
                    alt={wallet.name}
                    width={20}
                    height={20}
                  />
                  <span className="text-[15px]">{wallet.name}</span>
                </div>
                {connectedWalletIndex === wallet.id ? (
                  <span className="text-green-500">Connecting...</span>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-4 py-1 rounded text-[15px]"
                    onClick={() => {
                      connectWallet(wallet.id);
                    }}
                  >
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-screen h-screen fixed top-0 left-0 flex items-center justify-center text-white">
        <div
          className="w-full h-full bg-black absolute opacity-20"
          onClick={() => setStablecoinPaymentMethod("")}
        ></div>
        <div className="w-[350px] bg-[#10141E] z-10 rounded-2xl flex flex-col px-4 py-4 items-center">
          <div className="w-full flex items-end justify-end">
            <button
              className="text-[#777777] w-[30px] h-[30px] items-center justify-center flex bg-[#1B1F2D] rounded-full "
              onClick={() => setStablecoinPaymentMethod("")}
            >
              {Icons.closeIcon}
            </button>
          </div>
          <div className="max-w-[300px] mt-3">
            <h2 className=" text-xl font-semibold text-center ">
              Connect a Solana Wallet & continue
            </h2>
          </div>
          <div className="w-full flex flex-col gap-6 mt-7">
            {wallets.map((wallet: any) => (
              <div
                key={wallet.id}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={wallet.image}
                    alt={wallet.name}
                    width={30}
                    height={30}
                  />
                  <span className="text-[17px]">{wallet.name}</span>
                </div>
                {connectedWalletIndex === wallet.id ? (
                  <span className="text-green-500">connecting...</span>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-4 py-1 rounded text-[17px]"
                    onClick={() => connectWallet(wallet.id)}
                  >
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* <div className="w-full flex justify-end mt-8">
                    <button className="flex items-center text-sm gap-3">
                      <span>More Options</span>
                      <i>{Icons.chevron_down}</i>
                    </button>
                  </div> */}
        </div>
      </div>
    );
  }
};
