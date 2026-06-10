import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../components/LanguageProvider";
import { Navbar } from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NagarSeva - Civic Issue Reporting App",
  description: "Bilingual civic complaints resolution portal for Indian cities, compliant with DPDP Act 2023.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span>© {new Date().getFullYear()} NagarSeva. Built for Digital India.</span>
                <span>DPDP Act 2023 Compliant | Support: English & हिन्दी</span>
              </div>
            </footer>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
