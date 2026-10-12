import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { SessionProvider } from "@/lib/authentication";

export const metadata: Metadata = {
  title: "AETHER — Contemporary Art Hotel",
  description:
    "A luxury art hotel where light, concrete and a living collection meet. Twenty-four suites, one quiet idea.",
  metadataBase: new URL("https://aether-collection.com"),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
    { media: "(prefers-color-scheme: light)", color: "#efeae1" },
  ],
};

/*
 * Runs before first paint: restores the visitor's light / dark choice
 * (or follows the system when they haven't chosen), so the very first
 * frame is already in the right theme — no flash, no shift.
 * The inline <style> below is a deliberate duplicate of the two palette
 * heads: it paints the correct colors even in the one frame before the
 * script runs, and on render-safety oddities (disabled scripting).
 */
const themeBoot = `(()=>{try{var s=localStorage.getItem("aether-theme");var l=window.matchMedia("(prefers-color-scheme: light)").matches;document.documentElement.dataset.theme=s||(l?"light":"dark");}catch(e){document.documentElement.dataset.theme="dark";}})();`;

const themeBackfill = `:root,[data-theme="dark"]{--app-bg:#121212;--app-bg-deep:#0a0a0a;--app-ink:#f8f5f0;--app-ink-dim:#e6e0d7}[data-theme="light"]{--app-bg:#efeae1;--app-bg-deep:#ded6c8;--app-ink:#17130e;--app-ink-dim:#2b241b}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeBackfill }} />
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="antialiased">
        <SessionProvider>
          <NavBar />
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
