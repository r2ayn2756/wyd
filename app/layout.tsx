import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "wyd - What You Doing",
  description: "Track your productivity time with daily, weekly, and monthly leaderboards. A minimalist time tracking app with gamified rankings.",
  keywords: ["time tracking", "productivity", "leaderboard", "work tracker", "time management"],
  authors: [{ name: "wyd Team" }],
  creator: "wyd",
  openGraph: {
    title: "wyd - What You Doing",
    description: "Track your productivity time with daily, weekly, and monthly leaderboards",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "wyd - What You Doing",
    description: "Track your productivity time with daily, weekly, and monthly leaderboards",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
