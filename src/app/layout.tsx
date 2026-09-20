import type { Metadata, Viewport } from "next";
import { Fraunces, Libre_Franklin } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const franklin = Libre_Franklin({
  variable: "--font-franklin",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yatzy Scoreboard",
  description: "Scoreboard for Scandinavian Yatzy",
};

export const viewport: Viewport = {
  themeColor: "#f9dde5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${franklin.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
