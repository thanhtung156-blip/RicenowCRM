import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { APP_LANGUAGE } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ricenow CRM v1.0.0 - Quản lý suất ăn công nghiệp",
  description: "Hệ thống quản lý suất ăn, đơn hàng và công nợ cho Ricenow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={APP_LANGUAGE}>
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
