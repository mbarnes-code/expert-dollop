import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Unified Frontend - Expert Dollop",
    template: "%s | Unified Frontend",
  },
  description: "A unified frontend integrating MTG, Security, Finance, AI, and Ingestion domains",
  keywords: ["MTG", "Security", "Finance", "AI", "Data Ingestion"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
