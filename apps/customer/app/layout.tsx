import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "../lib/cart-store";

export const metadata: Metadata = {
  title: "Dart Bites",
  description: "Authentic street flavors. Zero fluff. Just bold energy served daily.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#FFE600"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-primary chalkboard-bg min-h-screen">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
