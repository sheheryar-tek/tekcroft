import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";
import "@/app/contact.css";

export const metadata: Metadata = {
  title: "Blog | Tekcroft",
  description:
    "Insights on SEO, AI, and software development from Tekcroft.",
  alternates: { canonical: "https://www.tekcroft.com/blog" },
};

export default function BlogPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "blog-body.html"),
    "utf8"
  );

  return (
    <>
      <Homepage html={html} />
      <Script src={assets.contact} strategy="afterInteractive" />
    </>
  );
}
