import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import meta from "@/lib/homepage-meta.json";
import "./tekcroft.css";
import "./perf.css";

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
  title: meta.title,
  description: meta.description,
  metadataBase: new URL("https://www.tekcroft.com"),
  alternates: {
    canonical: meta.canonical,
  },
  icons: {
    icon: [
      { url: "/favicon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Tekcroft",
    url: "https://www.tekcroft.com/",
    title: meta.title,
    description:
      "SEO, paid media, and AI search visibility planned as one strategy for US businesses.",
    images: [
      {
        url: "https://www.tekcroft.com/og.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description:
      "SEO, paid media, and AI search visibility planned as one strategy for US businesses.",
    images: ["https://www.tekcroft.com/og.jpg"],
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
        <link
          rel="preload"
          as="image"
          href="/images/hero-1.webp"
          type="image/webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/images/logo-white.webp"
          type="image/webp"
        />
        {meta.jsonLd.map((data, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
