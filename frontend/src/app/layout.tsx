import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scalezix | AI Content Quality & Factuality Checker",
  description: "Enterprise content audit platform evaluating factuality, evidence claims, repetition, tone, and search intent powered by Google Gemini and deterministic linguistic analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-50/70">
        {children}
      </body>
    </html>
  );
}
