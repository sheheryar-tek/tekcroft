import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Homepage from "@/components/Homepage";
import meta from "@/lib/sitemap-meta.json";
import "@/app/sitemap.css";
import "@/app/footer-lock.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: meta.canonical },
};

export default function SitemapPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "sitemap-body.html"),
    "utf8"
  );

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/legal/hero.webp"
        type="image/webp"
        fetchPriority="high"
      />
      <Homepage html={html} />
    </>
  );
}
