import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/seo-audit-services-meta.json";
import lcp from "@/lib/seo-audit-services-lcp.json";
import "@/app/seo-audit-services.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
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

export default function SeoAuditServicesPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "seo-audit-services-body.html"),
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
      <Script src={assets.seoAuditServices} strategy="afterInteractive" />
    </>
  );
}
