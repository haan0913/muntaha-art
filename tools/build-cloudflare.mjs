import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist");

const copyEntries = [
  "index.html",
  "404.html",
  "styles.css",
  "script.js",
  "robots.txt",
  "sitemap.xml",
  "_headers",
  "_redirects",
  "content",
  "assets/brand",
];

const artworkAllowlist = [
  "barely-hanging.jpg",
  "barely-hanging-md.jpg",
  "buldak-spicy-ramen.jpg",
  "buldak-spicy-ramen-md.jpg",
  "charjon-1.jpg",
  "charjon-1-md.jpg",
  "charjon-2.jpg",
  "charjon-2-md.jpg",
  "charjon-3.jpg",
  "charjon-3-md.jpg",
  "charjon-4.jpg",
  "charjon-4-md.jpg",
  "for-them-from-me.jpg",
  "for-them-from-me-md.jpg",
  "lisbon-lemon-tree.jpg",
  "lisbon-lemon-tree-md.jpg",
  "muntaha-portrait-gallery.jpg",
  "muntaha-portrait-gallery-md.jpg",
  "spark-my-heart.jpg",
  "spark-my-heart-md.jpg",
  "speakeasy.jpg",
  "speakeasy-md.jpg",
  "speed-of-light.jpg",
  "speed-of-light-md.jpg",
  "still-david.jpg",
  "still-david-md.jpg",
  "untitled-gouache.jpg",
  "untitled-gouache-md.jpg",
];

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const entry of copyEntries) {
  const src = path.join(root, entry);
  if (await exists(src)) {
    await cp(src, path.join(out, entry), { recursive: true });
  }
}

await mkdir(path.join(out, "assets", "artwork"), { recursive: true });
for (const file of artworkAllowlist) {
  await cp(path.join(root, "assets", "artwork", file), path.join(out, "assets", "artwork", file));
}

console.log(`Cloudflare Pages output ready: ${out}`);
