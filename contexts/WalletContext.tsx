"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface WalletContextType {
  walletConnected: boolean;
  setWalletConnected: React.Dispatch<React.SetStateAction<boolean>>;
  walletAddress: string;
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>;
  connectedWalletIndex: number | null;
  setConnectedWalletIndex: React.Dispatch<React.SetStateAction<number | null>>;
  walletAdapter: any | null;
  setWalletAdapter: React.Dispatch<React.SetStateAction<any | null>>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(" ");
  const [walletAdapter, setWalletAdapter] = useState();

  const [connectedWalletIndex, setConnectedWalletIndex] = useState<
    number | null
  >(null);

  // On mount, read the preferred theme from localStorage
  return (
    <WalletContext.Provider
      value={{
        walletConnected,
        setWalletAddress,
        setWalletConnected,
        walletAddress,
        connectedWalletIndex,
        setConnectedWalletIndex,
        walletAdapter,
        setWalletAdapter,
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
