import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dart Bites Kitchen"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-geist">{children}</body>
    </html>
  );
}
