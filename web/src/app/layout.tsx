import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const display = Orbitron({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const mono = Share_Tech_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Agent Breakout — Escape the AI Office",
  description:
    "Interactive AI-security mini-game: exploit an over-permissioned agent, then watch policy enforcement stop the same attack.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
