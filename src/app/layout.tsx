import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TRPCReactProvider } from "@/core/trpc/client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevNexus - Development Workstation",
  description: "A visually immersive, local-first development workstation",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
