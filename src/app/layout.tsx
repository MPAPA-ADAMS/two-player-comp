import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import MainHeader from "@/components/layout/MainHeader";

export const metadata: Metadata = {
  title: "T&A Competition",
  description: "Prepare For The Ass Wiping Of Your Life. Bitch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MainHeader />
        {children}
      </body>
    </html>
  );
}
