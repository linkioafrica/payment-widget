"use client";

import React, { createContext, useContext, useState } from "react";
import { createConfig, http, injected, WagmiProvider } from 'wagmi'
import { base } from 'wagmi/chains'
import { createClient } from 'viem'
import { metaMask, walletConnect } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

  const config = createConfig({
    chains: [base],
    connectors: [
      metaMask(),
      injected(),
      walletConnect({
        projectId: '3fcc6bba6f1de962d911bb5b5c3dba68',
      }),
    ],
    // client({ chain }) {
    //   return createClient({ chain, transport: http() })
    // },
    transports: {
      [base.id]: http('https://virtual.base.rpc.tenderly.co/95f3d92a-6154-41e0-a9fd-4f293822e78c')
    }
  })

  const queryClient = new QueryClient()

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
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}> 
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </WalletContext.Provider>
  );
};

// Custom hook to use the ThemeContext
export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context
};
