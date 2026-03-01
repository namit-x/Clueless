import type { Metadata } from "next";
import { Geist, Geist_Mono as GeistMono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/NavBar"; 
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = GeistMono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
