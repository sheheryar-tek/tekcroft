import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Homepage from "@/components/Homepage";
import LegalPageScript from "@/components/LegalPageScript";
import { SITE_URL } from "@/lib/site-url";
import meta from "@/lib/accessibility-meta.json";
import "@/app/accessibility.css";
import "@/app/footer-lock.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: meta.canonical },
};

export default function AccessibilityPage() {
  const html = fs
    .readFileSync(
      path.join(process.cwd(), "lib", "accessibility-body.html"),
      "utf8"
    )
    .split("__SITE_URL__")
    .join(SITE_URL);

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
      <LegalPageScript rootId="accessibility" />
    </>
  );
}
