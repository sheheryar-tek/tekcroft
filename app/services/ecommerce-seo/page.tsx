import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import TekcroftHtml from "@/components/TekcroftHtml";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/ecommerce-seo-meta.json";
import "@/app/ecommerce-seo.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: {
    canonical: meta.canonical,
  },
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

export default function EcommerceSeoPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "ecommerce-seo-body.html"),
    "utf8"
  );

  return (
    <>
      <TekcroftHtml html={html} />
      {/* Full original page scripts (incl. mega menu) — matches source HTML */}
      <Script src={assets.ecommerceSeo} strategy="afterInteractive" />
    </>
  );
}
