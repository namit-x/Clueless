import type { Metadata } from "next";
import Navbar from "@/components/NavBar"; 
import Footer from "@/components/Footer";

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
    // <html lang="en">
      <div
        className="antialiased"
      >
        <Navbar />
        {children}
        <Footer />
      </div>
    // </html>
  );
}
