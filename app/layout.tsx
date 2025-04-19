import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/Components/ui/Providers"; // ✅ Updated path
import "./globals.css";
import Navbar from "@/Components/ui/Navbar";
import { Toaster } from "sonner"; // ✅ Import Toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Service Booking Platform",
  description: "Find and book nearby service providers",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Toaster richColors position="top-center" /> {/* ✅ Add here */}
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
