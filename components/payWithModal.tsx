import { usePaymentLinkMerchantContext } from "@/contexts/PaymentLinkMerchantContext";
import { CurrencyDropDown } from "./currencyDropDown";
import { Icons } from "@/app/icons";
import { NetworkFlagButton, TokensDropDown } from "./tokenDropDown";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useDevice } from "@/contexts/DeviceContext";
import Tag from "./tag";
import Image from "next/image";
import { NavBar } from "./navBar";
import { SkeletonLoader } from "./UI Helper/skeletonLoader";
import { spawn } from "child_process";
import axios from "axios";
import { Tokens } from "@/constants/token";
import { useSolanaPayment } from "@/hooks/useSolanaPayment";
import { useEVMPayment } from "@/hooks/useEVMPayment";
import { useXrplPayment } from "@/hooks/useXRPLPayment"; // ✅ NEW: Import XRPL

export const PayWithModal = ({ children }: any) => {
  const { isMobile } = useDevice();

  const { theme, toggleTheme } = useTheme();
  const {
    tokenAmount,
    setTokenAmount,
    paywith,
    isConfirming,
    isSuccessful,
    isDrawerOpen,
    setIsDrawerOpen,
    setStablecoinPaymentMethod,
    stablecoinPaymentMethod,
    loading,
    data,
    token,
    setToken,
    network,
    setNetwork,
    isBroken,
    conversionLoading,
    setConversionLoading,
    netAndToken,
  } = usePaymentLinkMerchantContext();

  // ✅ NEW: Get hooks for all networks
  const { quoteAmount: quoteAmountEVM } = useEVMPayment();
  const { quoteAmount: quoteAmountXrpl } = useXrplPayment();
  const { quoteAmount: quoteAmountSolana } = useSolanaPayment();

  // ✅ NEW: Get the right quoteAmount based on network
  const getQuoteAmount = () => {
    if (network?.id === 4) {
      // XRPL
      return quoteAmountXrpl;
    } else if (network?.id === 1) {
      // Solana
      return quoteAmountSolana;
    } else {
      // EVM (Base, Polygon, etc.)
      return quoteAmountEVM;
    }
  };

  // Function to get swap price
  const setSelectedTokenPrice = async () => {
    try {
      if (!token) return;
      setConversionLoading(true);

      // ✅ NEW: Call the right quoteAmount for the network
      const quoteAmount = getQuoteAmount();
      const amount = await quoteAmount();
      console.log("amount", amount);
      // Round up to 2 decimal places
      setTokenAmount(amount);
    } catch (error) {
      console.error("Error fetching swap price:", error);
    } finally {
      setConversionLoading(false);
    }
  };

  useEffect(() => {
    var inputPrice = data?.transactions?.amount;
    // console.log("amount=" + inputPrice);
    setTokenAmount(inputPrice);
    var inputTokenName = data?.transactions?.currency;
    // console.log("token=" + inputTokenName);

    netAndToken?.stables.forEach((element) => {
      if (element.name == inputTokenName) {
        setToken(element);
      }
    });
  }, [data]);

  useEffect(() => {
    // Simulate an API call or calculation to set the amount
    const fetchTokenAmount = async () => {
      setTokenAmount(0);
      await setSelectedTokenPrice();
    };
    fetchTokenAmount();
  }, [token, network]); // ✅ NEW: Add network as dependency

  if (isMobile) {
    return (
      <div className="flex-grow  bg-white dark:bg-[#101113] px-5 pt-6 pb-3 flex-col relative ">
        <div className={`flex items-center justify-between`}>
          <button onClick={() => setIsDrawerOpen(true)}>
            <i className="text-black dark:text-white">{Icons.menuIcon}</i>
          </button>
          <div className="flex gap-4">
            {paywith !== "miniPay" ? (
              isConfirming || isSuccessful ? null : paywith == "stablecoin" ? (
                <TokensDropDown disabled={isBroken}></TokensDropDown>
              ) : (
                <CurrencyDropDown></CurrencyDropDown>
              )
            ) : null}
            <div className="px-2 py-2  border border-[#E2E3E7] hover:border-black text-[#545454] rounded-md dark:border-[#242425] flex items-center justify-center dark:hover:border-white">
              <Image
                src={network.flag}
                alt={"flag"}
                width={15}
                height={15}
                priority
              />
            </div>
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
          <div className="flex flex-col gap-3 ">
            {isSuccessful || isConfirming ? (
              <span className="text-[#696F79] text-lg leading-none">
                {data?.transactions?.business_name || ""}
              </span>
            ) : null}
            {loading ? (
              <SkeletonLoader classes={"h-5 w-[80px] rounded"}></SkeletonLoader>
            ) : (
              paywith !== "miniPay" && (
                <span className="text-[#696F79] text-lg leading-none">
                  {isSuccessful || isConfirming ? (
                    <div className="flex items-center gap-1  font-medium">
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
                  ) : (
                    `${data?.transactions?.business_name || ""}`
                  )}
                </span>
              )
            )}
            {isConfirming || isSuccessful ? null : (
              <div className="flex items-center gap-1  font-medium">
                {loading ? (
                  <SkeletonLoader
                    classes={"h-5 rounded w-[80px]"}
                  ></SkeletonLoader>
                ) : (
                  <span className=" text-black dark:text-white text-lg leading-none">
                    {data?.transactions?.title || "--"}
                  </span>
                )}
              </div>
            )}
            <span className="text-black text-xl dark:text-white leading-none flex items-center  gap-1">
              {isSuccessful || isConfirming ? "" : "Pay: "}
              {loading || conversionLoading ? (
                <SkeletonLoader
                  classes={"h-6 w-[100px] rounded"}
                ></SkeletonLoader>
              ) : (
                <span className="text-[#0259D6] dark:text-[#4893FF] leading-none font-semibold">
                  {isSuccessful || isConfirming ? (
                    <span className="text-black text-lg dark:text-white font-semibold">
                      You sent:{" "}
                    </span>
                  ) : null}
                  {isBroken
                    ? "--"
                    : `${Number(tokenAmount?.toFixed(6))}
                ${token?.name} `}
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
      <div className="flex-grow bg-white dark:bg-[#101113] px-10 pt-6 pb-3 flex-col relative ">
        <div className={`flex items-end justify-between`}>
          {loading ? (
            <SkeletonLoader classes={"h-5 rounded w-[80px]"}> </SkeletonLoader>
          ) : (
            <h2 className="text-[#696F79] font-medium text-sm">
              {data?.transactions?.business_name}
            </h2>
          )}

          <div className="flex gap-4">
            {paywith == "miniPay" ? null : isConfirming ||
              isSuccessful ? null : paywith == "stablecoin" ? (
                <TokensDropDown disabled={isBroken}></TokensDropDown>
              ) : (
              <CurrencyDropDown></CurrencyDropDown>
            )}

            <NetworkFlagButton network={network}></NetworkFlagButton>

            <button
              className="px-2 py-1 border border-[#E2E3E7] hover:border-black text-[#545454] rounded-md dark:border-[#242425] dark:hover:border-white"
              onClick={() => toggleTheme()}
            >
              {theme == "light" ? Icons.moon : Icons.sunIcon}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-1 font-medium">
          {loading ? (
            <SkeletonLoader classes={"h-5 rounded w-[80px]"}> </SkeletonLoader>
          ) : (
            paywith !== "miniPay" && (
              <span className=" text-black dark:text-white text-sm">
                {data?.transactions?.title || "--"}
              </span>
            )
          )}
        </div>

        <div className="w-full flex gap-1 mt-1">
          <span className=" text-black dark:text-white">
            {isConfirming || isSuccessful ? null : "Pay: "}
          </span>
          {loading || conversionLoading ? (
            <SkeletonLoader classes={"h-6 rounded w-[80px]"}> </SkeletonLoader>
          ) : (
            <span className=" text-[#0259D6]  dark:text-[#4893FF] font-semibold">
              {isSuccessful || isConfirming ? (
                <span className="text-black  dark:text-white font-semibold">
                  You sent:{" "}
                </span>
              ) : null}

              {isBroken
                ? "--"
                : `${Number(tokenAmount?.toFixed(2) || 0)}
                ${paywith !== "miniPay" ? token?.name : ""} `}
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