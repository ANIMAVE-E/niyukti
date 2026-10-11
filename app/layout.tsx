import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Niyukti — Government Jobs",
  description: "Discover verified government and public-sector job notifications.",
  applicationName: "Niyukti",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
