import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/on-page-seo-meta.json";
import lcp from "@/lib/on-page-seo-lcp.json";
import "@/app/on-page-seo.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: meta.canonical },
  openGraph: {
    type: "website",
    siteName: "Tekcroft",
    url: meta.canonical,
    title: meta.title,
    description: meta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
  },
};

export default function OnPageSeoPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "on-page-seo-body.html"),
    "utf8"
  );

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={lcp.preload}
        type="image/webp"
        fetchPriority="high"
      />
      <Homepage html={html} />
      <Script src={assets.onPageSeo} strategy="afterInteractive" />
    </>
  );
}
