import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Island. The numbers, and what they mean.",
  description:
    "An open-source view of contaminant exposure and what five different agencies say about it. No proprietary score, no paywall, just the data with citations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-stone-50 text-stone-900 min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="max-w-4xl mx-auto w-full px-6 py-8 text-xs text-stone-500 border-t border-stone-200 mt-12">
          Built on public-domain regulatory data: EPA, FDA, OEHHA (Prop 65), CDC, WHO, EFSA, ATSDR,
          openFDA. Methodology is open. Every value links to its source. Code is open-source.
        </footer>
      </body>
    </html>
  );
}
