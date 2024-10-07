"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface WalletContextType {
  walletConnected: boolean;
  setWalletConnected: React.Dispatch<React.SetStateAction<boolean>>;
  walletAddress: string;
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletConnected, setWalletConnected] = useState(true);
  const [walletAddress, setWalletAddress] = useState(
    "asdkasdskhHHKFHBJ)(!#Jl;jdajsdkasdjk"
  );

  // On mount, read the preferred theme from localStorage

  return (
    <WalletContext.Provider
      value={{
        walletConnected,
        setWalletAddress,
        setWalletConnected,
        walletAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the ThemeContext
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
