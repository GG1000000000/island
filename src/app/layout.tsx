import type { Metadata } from "next";
import Link from "next/link";
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
        <header className="border-b border-stone-200 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-sm">
            <Link href="/" className="font-semibold text-stone-900 tracking-tight">
              Island
            </Link>
            <nav className="flex gap-4 text-stone-600">
              <Link href="/products" className="hover:text-stone-900">Products</Link>
              <Link href="/calc" className="hover:text-stone-900">Calc</Link>
              <Link href="/tap" className="hover:text-stone-900">Tap</Link>
              <Link href="/recalls" className="hover:text-stone-900">Recalls</Link>
              <Link href="/bll" className="hover:text-stone-900">BLL</Link>
              <a
                href="https://github.com/GG1000000000/island"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-900"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="max-w-4xl mx-auto w-full px-6 py-8 text-xs text-stone-500 border-t border-stone-200 mt-12">
          Built on public-domain regulatory data: EPA, FDA, OEHHA (Prop 65), CDC, WHO, EFSA, ATSDR,
          openFDA. Methodology is open. Every value links to its source. Code is open-source.
        </footer>
      </body>
    </html>
  );
}
