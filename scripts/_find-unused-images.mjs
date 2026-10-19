/**
 * Find image files under public/ with zero references in the repo
 * (excluding the image binary itself, .next, node_modules, lighthouse dumps).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(ROOT, "public");

const IMG_EXT = new Set([
  ".webp",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".avif",
]);

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "agent-transcripts",
  "terminals",
]);

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

function collectImages() {
  const files = walkFiles(PUB);
  return files
    .filter((f) => IMG_EXT.has(path.extname(f).toLowerCase()))
    .map((f) => {
      const rel = path.relative(PUB, f).replace(/\\/g, "/");
      const urlPath = "/" + rel; // /images/... or /favicon...
      const base = path.basename(f);
      const stem = base.replace(/\.[^.]+$/, "");
      return { abs: f, rel, urlPath, base, stem, bytes: fs.statSync(f).size };
    });
}

function isSearchableText(file) {
  const ext = path.extname(file).toLowerCase();
  if (
    [
      ".html",
      ".tsx",
      ".ts",
      ".js",
      ".jsx",
      ".mjs",
      ".cjs",
      ".css",
      ".scss",
      ".json",
      ".md",
      ".txt",
      ".svg", // may reference other assets
      ".xml",
      ".webmanifest",
    ].includes(ext)
  )
    return true;
  // skip binary images themselves
  if (IMG_EXT.has(ext)) return false;
  return false;
}

function loadCorpus() {
  const files = walkFiles(ROOT).filter((f) => {
    if (!isSearchableText(f)) return false;
    // skip lighthouse / audit dumps that only echo network URLs
    const rel = path.relative(ROOT, f).replace(/\\/g, "/");
    if (rel.startsWith("scripts/_lh-")) return false;
    if (rel === "scripts/_img-inventory.json") return false;
    if (rel === "scripts/_unused-images-report.json") return false;
    // public hashed JS may embed paths — KEEP searching those
    return true;
  });

  const chunks = [];
  for (const f of files) {
    try {
      chunks.push(fs.readFileSync(f, "utf8"));
    } catch {
      /* ignore */
    }
  }
  return chunks.join("\n");
}

const images = collectImages();
const corpus = loadCorpus();

const unused = [];
const used = [];
const review = [];

for (const img of images) {
  // Match full URL path, basename, or stem (for dynamic hash patterns be careful)
  const needles = [
    img.urlPath,
    img.rel,
    img.base,
  ];

  // Also match without leading slash variants
  if (img.rel.startsWith("images/")) {
    needles.push(img.rel.slice("images/".length));
  }

  let hit = false;
  for (const n of needles) {
    if (n && corpus.includes(n)) {
      hit = true;
      break;
    }
  }

  // Stem-only match for hashed assets: e.g. "ais-cta-" prefix family
  // If stem ends with -<10 hex>, also search the prefix without hash
  const hashStem = img.stem.match(/^(.*)-([a-f0-9]{8,12})$/i);
  if (!hit && hashStem) {
    const prefix = hashStem[1] + "-";
    // Count how many files share this prefix — if code references the prefix
    // pattern or a sibling with different hash, keep
    if (corpus.includes(prefix) || corpus.includes(hashStem[1])) {
      // Could be a stale hashed sibling. Only keep if EXACT base is referenced
      // OR if JSON/maps mention this exact hash
      if (corpus.includes(img.stem) || corpus.includes(hashStem[2])) {
        hit = true;
      } else {
        // Exact basename not found; likely orphaned after re-hash
        // Double-check: any reference to full path with this hash
        if (corpus.includes(hashStem[2])) hit = true;
        else {
          review.push({
            ...img,
            reason:
              "hashed sibling prefix appears in code but this exact hash/file is not referenced — likely orphan",
          });
          continue;
        }
      }
    }
  }

  if (hit) used.push(img);
  else unused.push({ ...img, reason: "no filename/path/stem reference in searchable source" });
}

// Promote review orphans that are clearly unused (exact base never appears)
const deleteList = [...unused];
for (const r of review) {
  if (!corpus.includes(r.base) && !corpus.includes(r.urlPath)) {
    deleteList.push({
      ...r,
      reason:
        "orphaned content-hashed asset; exact basename/url never referenced",
    });
  }
}

const report = {
  totalImages: images.length,
  used: used.length,
  unusedConfirmed: deleteList.length,
  reviewKept: review.filter((r) => !deleteList.some((d) => d.abs === r.abs))
    .length,
  deleteList: deleteList.map((d) => ({
    path: "public/" + d.rel,
    bytes: d.bytes,
    kb: +(d.bytes / 1024).toFixed(1),
    reason: d.reason,
  })),
  reviewCandidates: review
    .filter((r) => !deleteList.some((d) => d.abs === r.abs))
    .map((r) => ({
      path: "public/" + r.rel,
      bytes: r.bytes,
      reason: r.reason,
    })),
};

fs.writeFileSync(
  path.join(ROOT, "scripts", "_unused-images-report.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const mb = deleteList.reduce((s, d) => s + d.bytes, 0) / (1024 * 1024);
console.log(
  JSON.stringify(
    {
      totalImages: report.totalImages,
      used: report.used,
      unusedConfirmed: report.unusedConfirmed,
      reviewKept: report.reviewKept,
      deleteMB: +mb.toFixed(2),
      sample: report.deleteList.slice(0, 40).map((d) => d.path),
    },
    null,
    2
  )
);
