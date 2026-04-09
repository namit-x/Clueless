import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/store/provider";
import DisableDevTools from "@/components/DisableDevTools";

export const metadata: Metadata = {
  title: "ClueLess",
  description: "It is an application developed by Neuron and Zigbee Club to host the year's most interesting event, ClueLess.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
<body
        className="antialiased"
      >
        <StoreProvider>
          <DisableDevTools />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}








