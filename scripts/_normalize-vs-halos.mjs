/**
 * Normalize comparison-table halos across all *-body.html files:
 * - Ensure .vs-stage has a direct-child .vs-halo
 * - Move th.c-us > .vs-badge into that .vs-halo (keep text)
 * - Leave pages that already have halo+badge intact
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIB = path.join(ROOT, "lib");

const STAR_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3.4 2.4 5.2 5.6.7-4.2 3.9 1.1 5.6-4.9-2.8-4.9 2.8 1.1-5.6L4 9.3l5.6-.7Z"/></svg>`;

function extractBadge(thHtml) {
  const m = thHtml.match(
    /<span class="vs-badge"[^>]*>([\s\S]*?)<\/span>/i
  );
  if (!m) return null;
  return { full: m[0], inner: m[1].trim() };
}

function processFile(file) {
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes("vs-stage") || !html.includes("c-us")) return false;

  let changed = false;

  // Process each vs-stage block
  html = html.replace(
    /<div class="vs-stage">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g,
    (block) => {
      // Only touch stages that contain a comparison table with c-us
      if (!/thead[\s\S]*class="c-us"/.test(block) && !/<th[^>]*class="c-us"/.test(block)) {
        return block;
      }

      let next = block;
      let badgeHtml = null;

      // Pull badge out of th.c-us if present
      next = next.replace(
        /(<th\b[^>]*class="c-us"[^>]*>)([\s\S]*?)(<\/th>)/i,
        (all, open, inner, close) => {
          const b = extractBadge(inner);
          if (!b) return all;
          badgeHtml = b.full.includes("aria-hidden")
            ? b.full
            : `<span class="vs-badge" aria-hidden="true">${b.inner}</span>`;
          const cleaned = inner.replace(
            /<span class="vs-badge"[^>]*>[\s\S]*?<\/span>/i,
            ""
          );
          changed = true;
          return open + cleaned + close;
        }
      );

      const hasHalo = /<span class="vs-halo"/.test(next);

      if (hasHalo) {
        // If halo exists but is empty / has no badge, inject badge
        next = next.replace(
          /<span class="vs-halo"[^>]*>([\s\S]*?)<\/span>/i,
          (all, inner) => {
            if (/vs-badge/.test(inner)) return all;
            if (!badgeHtml) return all;
            changed = true;
            return all.replace(
              />([\s\S]*?)<\/span>$/i,
              `>\n            ${badgeHtml}\n          </span>`
            );
          }
        );
      } else {
        // Insert halo before closing of stage (before last content after table)
        const badge =
          badgeHtml ||
          `<span class="vs-badge" aria-hidden="true">${STAR_SVG} Highlight</span>`;
        // Insert after </table>
        if (/<\/table>/.test(next)) {
          next = next.replace(
            /<\/table>/i,
            `</table>\n\n          <span class="vs-halo" aria-hidden="true">\n            ${badge}\n          </span>`
          );
          changed = true;
        }
      }

      return next;
    }
  );

  if (changed) {
    fs.writeFileSync(file, html);
    return true;
  }
  return false;
}

const files = fs
  .readdirSync(LIB)
  .filter((f) => f.endsWith("-body.html"))
  .map((f) => path.join(LIB, f));

let n = 0;
for (const f of files) {
  if (processFile(f)) {
    console.log("updated", path.basename(f));
    n++;
  }
}
console.log("files", n);
