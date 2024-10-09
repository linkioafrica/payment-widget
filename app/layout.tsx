import type { Metadata } from "next";
import { Sora } from "next/font/google";

import "./globals.css";

import { PaymentLinkMerchantProvider } from "@/contexts/PaymentLinkMerchantContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import { WalletProvider } from "@/contexts/WalletContext";

const sora = Sora({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Checkout",
  description: "Merchant checkout",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.className}  antialiased`}>
        <DeviceProvider>
          <ThemeProvider>
            <WalletProvider>
              <PaymentLinkMerchantProvider>
                {children}
              </PaymentLinkMerchantProvider>
            </WalletProvider>
          </ThemeProvider>
        </DeviceProvider>
      </body>
    </html>
  );
}
