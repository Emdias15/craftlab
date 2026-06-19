import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CraftLab.ed — Cada Nó tem uma história.",
  description: "Anilhas escutistas, porta-chaves e acessórios em corda feitos à mão. Cada Nó tem uma história. Envio para todo o país.",
  keywords: ["anilha escutista", "artesanato escutista", "corda", "feito à mão", "Portugal", "macramé", "porta-chaves"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="bg-warm-white text-earth font-sans antialiased flex min-h-screen flex-col">
        {children}
      </body>
    </html>
  );
}
