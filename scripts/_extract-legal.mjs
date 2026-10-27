import fs from "fs";
import path from "path";

const files = [
  {
    key: "privacy-policy",
    src: "C:/Users/Super/Downloads/tekcroft-privacy-policy (2).html",
    mainId: "privacy-policy",
  },
  {
    key: "terms-of-use",
    src: "C:/Users/Super/Downloads/tekcroft-terms-of-use (2).html",
    mainId: "terms-of-use",
  },
  {
    key: "accessibility",
    src: "C:/Users/Super/Downloads/tekcroft-accessibility (1).html",
    mainId: "accessibility",
  },
  {
    key: "sitemap",
    src: "C:/Users/Super/Downloads/tekcroft-sitemap.html",
    mainId: "sitemap",
  },
];

const outDir = path.join(process.cwd(), "scripts", "_legal-extract");
fs.mkdirSync(outDir, { recursive: true });

let heroSaved = false;

for (const f of files) {
  const html = fs.readFileSync(f.src, "utf8");
  const stylesMatch = html.match(/<style id="lp-styles">([\s\S]*?)<\/style>/);
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/);
  const scriptMatch = html.match(/<script id="lp-script">([\s\S]*?)<\/script>/);

  if (!stylesMatch || !mainMatch) {
    throw new Error("missing parts in " + f.key);
  }

  let css = stylesMatch[1];
  const heroMatch = css.match(/--hero:url\("data:image\/([^;]+);base64,([^"]+)"\)/);
  if (heroMatch && !heroSaved) {
    const mime = heroMatch[1];
    const b64 = heroMatch[2];
    const buf = Buffer.from(b64, "base64");
    const legalDir = path.join(process.cwd(), "public", "images", "legal");
    fs.mkdirSync(legalDir, { recursive: true });
    // save raw then convert via sharp later
    const rawPath = path.join(outDir, `hero-raw.${mime === "jpeg" || mime === "jpg" ? "jpg" : mime}`);
    fs.writeFileSync(rawPath, buf);
    console.log("hero raw:", rawPath, (buf.length / 1024).toFixed(1) + "KB", "mime=" + mime);
    heroSaved = true;
  }

  // replace base64 hero with path
  css = css.replace(
    /--hero:url\("data:image\/[^"]+"\)/,
    '--hero:url("/images/legal/hero.webp")'
  );

  fs.writeFileSync(path.join(outDir, `${f.key}-styles.css`), css);
  fs.writeFileSync(path.join(outDir, `${f.key}-main.html`), mainMatch[0]);
  if (scriptMatch) {
    fs.writeFileSync(path.join(outDir, `${f.key}-script.js`), scriptMatch[1]);
  }

  console.log(f.key, {
    css: css.length,
    main: mainMatch[0].length,
    script: scriptMatch ? scriptMatch[1].length : 0,
  });
}
