import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/homepage-meta.json";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: {
    canonical: meta.canonical,
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

export default function HomePage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "homepage-body.html"),
    "utf8"
  );

  return (
    <>
      <Homepage html={html} />
      {/* afterInteractive: body markup exists; boot can measure nav logo */}
      <Script src={assets.main} strategy="afterInteractive" />
      {meta.jsonLd.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  );
}
