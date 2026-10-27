import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Homepage from "@/components/Homepage";
import LegalPageScript from "@/components/LegalPageScript";
import { SITE_URL } from "@/lib/site-url";
import meta from "@/lib/privacy-policy-meta.json";
import "@/app/privacy-policy.css";
import "@/app/footer-lock.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: meta.canonical },
};

export default function PrivacyPolicyPage() {
  const html = fs
    .readFileSync(
      path.join(process.cwd(), "lib", "privacy-policy-body.html"),
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
      <LegalPageScript rootId="privacy-policy" />
    </>
  );
}
