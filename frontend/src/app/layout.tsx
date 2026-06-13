import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "UrbanPulse AI — Predictive Transit Intelligence Platform",
  description:
    "UrbanPulse AI uses machine learning and Digital Twin simulations to predict station overcrowding, recommend operator interventions, and help commuters find smarter routes — before problems occur.",
  keywords: [
    "transit AI",
    "smart city",
    "crowd prediction",
    "digital twin",
    "public transport",
    "LangGraph",
    "UrbanPulse",
  ],
  openGraph: {
    title: "UrbanPulse AI — Predictive Transit Intelligence",
    description:
      "AI-powered crowd forecasting and operator decision support for smart city transit networks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">{children}</body>
    </html>
  );
}
