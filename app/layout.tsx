import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./cart-context";
import { Header } from "./header";
import { ToastProvider } from "./toast";
import { getCurrentUser } from "@/lib/auth/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "maxopc - Small E-commerce Demo",
  description: "A small e-commerce project for showcasing and purchasing products",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-slate-50">
        <ToastProvider>
          <CartProvider>
            <Header user={user ? { username: user.username, isAdmin: user.isAdmin } : null} />
            {children}
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
