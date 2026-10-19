import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Sora } from "next/font/google";
import assets from "@/lib/asset-manifest.json";
import "./tekcroft.css";
import "./responsive.css";
import "./perf.css";
import "./footer-lock.css";
/* Source of truth for type + spacing tokens; also appended to page CSS via scripts/_apply-site-consistency.mjs */
import "./site-consistency.css";
/* Shared burger menu (card design) — all pages */
import "./mobile-menu.css";
/* Shared under-hero stats strip (#proof-v2) — one design site-wide */
import "./stats-strip.css";
/* Shared comparison-table highlighted-column halo (.vs-halo) */
import "./vs-halo-lock.css";
/* Contrast + touch-target fixes only — does not alter layout or CTA primary fill */
import "./a11y-lock.css";

/* Self-hosted via next/font — same families/weights, no render-blocking Google CSS */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: true,
  preload: true,
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-sora",
  adjustFontFallback: true,
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tekcroft.com"),
  title: {
    default: "Tekcroft",
    template: "%s",
  },
  icons: {
    icon: [
      { url: "/favicon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0096D5",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${inter.variable} ${sora.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Nav logo is above-the-fold but not LCP — avoid competing with hero preload */}
        <link
          rel="preload"
          as="image"
          href="/images/logo-white.webp"
          type="image/webp"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        {/* Below-fold comparison halo — defer past hydration */}
        <Script src={assets.vsHalo} strategy="lazyOnload" />
        {/* Burger menu card UI — shared; desktop mega menu still lazy via Homepage warm */}
        <Script src={assets.mm} strategy="afterInteractive" />
      </body>
    </html>
  );
}
