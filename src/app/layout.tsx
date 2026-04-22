import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "80's Forever",
  description: "La música que no tiene tiempo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${orbitron.variable} h-full`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-black text-white antialiased [font-family:var(--font-inter)]"
      >
        {children}
      </body>
    </html>
  );
}