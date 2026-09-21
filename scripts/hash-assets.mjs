/**
 * Copy runtime scripts to content-hashed filenames for long-cache.
 * Writes lib/asset-manifest.json consumed by page loaders.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(ROOT, "public");

function hashFile(name) {
  const buf = fs.readFileSync(path.join(pub, name));
  const h = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
  const hashed = name.replace(/\.js$/, `.${h}.js`);
  fs.writeFileSync(path.join(pub, hashed), buf);
  const base = name.replace(/\.js$/, "");
  for (const f of fs.readdirSync(pub)) {
    if (f.startsWith(base + ".") && f.endsWith(".js") && f !== hashed && f !== name) {
      fs.unlinkSync(path.join(pub, f));
    }
  }
  return "/" + hashed;
}

const manifest = {
  main: hashFile("tekcroft-main.js"),
  mm: hashFile("tekcroft-mm.js"),
  ecommerceSeo: hashFile("tekcroft-ecommerce-seo.js"),
  seoAuditServices: hashFile("tekcroft-seo-audit-services.js"),
  technicalSeo: hashFile("tekcroft-technical-seo.js"),
  localSeo: hashFile("tekcroft-local-seo.js"),
  onPageSeo: hashFile("tekcroft-on-page-seo.js"),
  googleBusinessProfileOptimization: hashFile(
    "tekcroft-google-business-profile-optimization.js"
  ),
  mobileAppDevelopment: hashFile("tekcroft-mobile-app-development.js"),
  customSoftwareDevelopment: hashFile("tekcroft-custom-software-development.js"),
  webDesignAndDevelopment: hashFile("tekcroft-web-design-and-development.js"),
  aiChatbotDevelopment: hashFile("tekcroft-ai-chatbot-development.js"),
  contact: hashFile("tekcroft-contact.js"),
};
fs.writeFileSync(
  path.join(ROOT, "lib", "asset-manifest.json"),
  JSON.stringify(manifest, null, 2)
);
console.log(manifest);
