import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";

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
    </>
  );
}
