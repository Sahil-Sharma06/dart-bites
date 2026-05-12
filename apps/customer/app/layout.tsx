import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../lib/cart-store";

const rubik = Rubik({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dart Bites",
  description: "Fresh bites, fast pickup.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#F97316"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={rubik.className}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
