import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/google-business-profile-optimization-meta.json";
import lcp from "@/lib/google-business-profile-optimization-lcp.json";
import "@/app/google-business-profile-optimization.css";

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

export default function GoogleBusinessProfileOptimizationPage() {
  const html = fs.readFileSync(
    path.join(
      process.cwd(),
      "lib",
      "google-business-profile-optimization-body.html"
    ),
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
      <Script
        src={assets.googleBusinessProfileOptimization}
        strategy="afterInteractive"
      />
    </>
  );
}
