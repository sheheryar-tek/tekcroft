import type { Metadata, Viewport } from "next";
import meta from "@/lib/homepage-meta.json";
import "./tekcroft.css";
import "./perf.css";

const fontHref =
  "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap";

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
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* LCP: hero photograph must win the first network race */}
        <link
          rel="preload"
          as="image"
          href="/images/hero-1.webp"
          type="image/webp"
          fetchPriority="high"
        />
        <link rel="preload" as="image" href="/images/logo-white.webp" type="image/webp" />
        <link rel="preload" as="style" href={fontHref} />
        <link rel="stylesheet" href={fontHref} />
        {meta.jsonLd.map((data, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
