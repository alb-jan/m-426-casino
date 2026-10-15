import type { Metadata } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casino Goldenes Ass",
  description: "Schulprojekt: Poker & Roulette mit Spielgeld – Next.js, React, TypeScript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
