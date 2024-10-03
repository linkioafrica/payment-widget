import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { CurrencyDropDown } from "./currencyDropDown";
import { Icons } from "@/app/icons";
import { TokensDropDown } from "./tokenDropDown";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useDevice } from "@/contexts/DeviceContext";
import Tag from "./tag";
import { NavBar } from "./navBar";
import { SkeletonLoader } from "./UI Helper/skeletonLoader";

export const PayWithModal = ({ children }: any) => {
  const { isMobile } = useDevice();

  const { theme, toggleTheme } = useTheme();
  const {
    paywith,
    isConfirming,
    isSuccessful,
    isDrawerOpen,
    setIsDrawerOpen,
    setStablecoinPaymentMethod,
    stablecoinPaymentMethod,
    loading,
    data,
  } = usePaymentLinkMerchantContext();
  if (isMobile) {
    return (
      <div className="flex-grow  bg-white dark:bg-[#101113] px-5 pt-6 pb-3 flex-col relative ">
        <div className={`flex items-center justify-between`}>
          <button onClick={() => setIsDrawerOpen(true)}>
            <i className="text-black dark:text-white">{Icons.menuIcon}</i>
          </button>
          <div className="flex gap-4">
            {isConfirming || isSuccessful ? null : paywith == "stablecoin" ? (
              <TokensDropDown></TokensDropDown>
            ) : (
              <CurrencyDropDown></CurrencyDropDown>
            )}
            <button
              className="px-2 py-2 border border-[#E2E3E7] hover:border-black text-[#545454] rounded-md dark:border-[#242425] dark:hover:border-white"
              onClick={() => toggleTheme()}
            >
              {theme == "light" ? Icons.moon : Icons.sunIcon}
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-5">
          {paywith == "stablecoin" &&
            stablecoinPaymentMethod == "qrCode" &&
            !isConfirming &&
            !isSuccessful && (
              <button
                className="mt-2 dark:text-white text-black"
                onClick={() => setStablecoinPaymentMethod("")}
              >
                <i>{Icons.chevronLeft}</i>
              </button>
            )}
          <div className="flex flex-col gap-4 ">
            {loading ? (
              <SkeletonLoader classes={"h-5 w-[80px] rounded"}></SkeletonLoader>
            ) : (
              <span className="text-[#696F79] text-lg leading-none">
                {isSuccessful || isConfirming
                  ? "Amount you sent"
                  : `${data?.transactions?.business_name}`}
              </span>
            )}
            <div className="flex items-center gap-1  font-medium">
              <span className=" text-black dark:text-white text-lg leading-none">
                Title:{"   "}
              </span>
              {loading ? (
                <SkeletonLoader
                  classes={"h-5 rounded w-[80px]"}
                ></SkeletonLoader>
              ) : (
                <span className=" text-black dark:text-white text-lg leading-none">
                  {data?.transactions?.title}
                </span>
              )}
            </div>
            <span className="text-black text-2xl dark:text-white leading-none flex items-center  gap-1">
              {isSuccessful || isConfirming ? "" : "Pay: "}
              {loading ? (
                <SkeletonLoader
                  classes={"h-6 w-[100px] rounded"}
                ></SkeletonLoader>
              ) : (
                <span className="text-[#0259D6] dark:text-[#4893FF] font-semibold">
                  {" "}
                  {data?.transactions?.currency} {data?.transactions?.amount}
                </span>
              )}
            </span>
          </div>
        </div>
        <hr className="mt-5 dark:border-[#242425]" />

        <div>{children}</div>
        {isDrawerOpen && (
          <div className="absolute top-0 h-full w-full left-0">
            <div
              className="bg-black absolute opacity-30 top-0 left-0 w-full h-full "
              onClick={() => setIsDrawerOpen(false)}
            ></div>
            <NavBar></NavBar>
          </div>
        )}
        <div className="w-full flex items-center justify-center absolute bottom-4 left-0">
          <span className="dark:text-white text-black text-sm">
            Powered by LINK
          </span>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex-grow bg-white dark:bg-[#101113] px-12 pt-6 pb-3 flex-col relative ">
        <div className={`flex items-end justify-between`}>
          {isConfirming || isSuccessful ? (
            <span className=" text-black dark:text-white">
              {" "}
              Amount you sent
            </span>
          ) : loading ? (
            <SkeletonLoader classes={"h-5 rounded w-[80px]"}> </SkeletonLoader>
          ) : (
            <h2 className="text-[#696F79] font-medium text-sm">
              {data?.transactions?.business_name}
            </h2>
          )}
          <div className="flex gap-4">
            {isConfirming || isSuccessful ? null : paywith == "stablecoin" ? (
              <TokensDropDown></TokensDropDown>
            ) : (
              <CurrencyDropDown></CurrencyDropDown>
            )}
            <button
              className="px-2 py-1 border border-[#E2E3E7] hover:border-black text-[#545454] rounded-md dark:border-[#242425] dark:hover:border-white"
              onClick={() => toggleTheme()}
            >
              {theme == "light" ? Icons.moon : Icons.sunIcon}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1 font-medium">
          <span className=" text-black dark:text-white text-sm">Title:</span>
          {loading ? (
            <SkeletonLoader classes={"h-5 rounded w-[80px]"}> </SkeletonLoader>
          ) : (
            <span className=" text-black dark:text-white text-sm">
              {data?.transactions?.title}
            </span>
          )}
        </div>

        <div className="w-full flex gap-1 mt-1">
          <span className=" text-black dark:text-white">
            {isConfirming || isSuccessful ? null : "Pay:"}
          </span>
          {loading ? (
            <SkeletonLoader classes={"h-6 rounded w-[80px]"}> </SkeletonLoader>
          ) : (
            <span className=" text-[#0259D6]  dark:text-[#4893FF] font-semibold">
              {data?.transactions?.currency} {data?.transactions?.amount}
            </span>
          )}
        </div>
        <hr className="mt-3 dark:border-[#242425]" />
        {children}
        <div className="w-full flex items-center justify-center absolute bottom-6 left-0">
          <span className="dark:text-white text-black text-xs">
            Powered by LINK
          </span>
        </div>
      </div>
    );
  }
};
