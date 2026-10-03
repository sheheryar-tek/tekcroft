import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";
import "@/app/contact.css";

export const metadata: Metadata = {
  title: "Privacy Policy | Tekcroft",
  description: "How Tekcroft collects, uses, and protects your information.",
  alternates: { canonical: "https://www.tekcroft.com/privacy" },
};

export default function PrivacyPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "privacy-body.html"),
    "utf8"
  );

  return (
    <>
      <Homepage html={html} />
      <Script src={assets.contact} strategy="afterInteractive" />
    </>
  );
}
