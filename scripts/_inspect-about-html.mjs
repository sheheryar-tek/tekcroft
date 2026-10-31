import fs from "fs";

const p = "C:/Users/Super/Downloads/about-us-hero-variants (6).html";
const html = fs.readFileSync(p, "utf8");
console.log("bytes", html.length);

const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
console.log(
  "style blocks",
  styles.length,
  styles.map((s) => s[1].length)
);

const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)];
console.log(
  "inline scripts",
  scripts.length,
  scripts.map((s) => s[1].length)
);

const imgs = [...html.matchAll(/src="([^"]+)"/gi)].map((m) => m[1]);
const kinds = {};
for (const s of imgs) {
  const k = s.startsWith("data:")
    ? "data:" + (s.match(/^data:([^;]+)/)?.[1] || "?")
    : s.slice(0, 60);
  kinds[k] = (kinds[k] || 0) + 1;
}
console.log("src kinds", kinds);

const sections = [...html.matchAll(/<(section|header|footer|main)[^>]*\bid=["']([^"']+)["']/gi)].map(
  (m) => m[1] + "#" + m[2]
);
console.log("ids", sections);

const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
console.log("body len", bodyMatch ? bodyMatch[1].length : 0);

const fonts = [...html.matchAll(/font-family\s*:\s*([^;}{]+)/gi)].map((m) =>
  m[1].trim().slice(0, 80)
);
console.log("unique fonts", [...new Set(fonts)].slice(0, 25));

const links = [...html.matchAll(/<link[^>]+>/gi)].map((m) => m[0].slice(0, 160));
console.log("links", links);

// title / h1 sample
const title = html.match(/<title>([^<]*)<\/title>/i)?.[1];
const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "").trim();
console.log("title", title);
console.log("h1", h1?.slice(0, 120));

// class names that look like about variants
const aboutClasses = [
  ...html.matchAll(/\b(class|id)="([^"]*(?:about|ab-|hero|story|team|value)[^"]*)"/gi),
]
  .map((m) => m[2])
  .slice(0, 40);
console.log("about-ish", [...new Set(aboutClasses)].slice(0, 40));
