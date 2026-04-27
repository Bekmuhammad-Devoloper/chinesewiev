#!/usr/bin/env node
/**
 * public/assets ichidagi rasmlarni kichraytirib, faylni almashtiradi.
 * Maqsad: 3-4 MB JPG'larni 100-300 KB'ga tushirish.
 *
 * Foydalanish:
 *   node scripts/optimize-assets.mjs            # asosiy ishga tushirish
 *   node scripts/optimize-assets.mjs --dry      # nima o'zgarishini ko'rsatish
 */
import { readdir, stat, readFile, writeFile, rename } from "node:fs/promises";
import { join, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, "..", "public", "assets");

const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1600;
const JPG_QUALITY = 80;
const PNG_QUALITY = 80;
const SKIP_BELOW_BYTES = 200 * 1024;

const dryRun = process.argv.includes("--dry");

const exts = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const skipNames = new Set(["logo.png", "hero-bg.png", "hero-overlay.png"]);

async function* walk(dir) {
  for (const name of await readdir(dir)) {
    if (name === "words") continue;
    const full = join(dir, name);
    const s = await stat(full);
    if (s.isDirectory()) yield* walk(full);
    else yield { path: full, size: s.size };
  }
}

function fmt(bytes) {
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + "MB";
  return (bytes / 1024).toFixed(0) + "KB";
}

let totalBefore = 0;
let totalAfter = 0;
let processed = 0;
let skipped = 0;

for await (const file of walk(ASSETS_DIR)) {
  const ext = extname(file.path).toLowerCase();
  if (!exts.has(ext)) continue;
  const name = basename(file.path);
  if (skipNames.has(name)) {
    skipped++;
    continue;
  }
  if (file.size < SKIP_BELOW_BYTES) {
    skipped++;
    continue;
  }

  const buf = await readFile(file.path);
  const meta = await sharp(buf).metadata();
  const needsResize =
    (meta.width && meta.width > MAX_WIDTH) ||
    (meta.height && meta.height > MAX_HEIGHT);

  let pipeline = sharp(buf, { failOn: "none" }).rotate();
  if (needsResize) {
    pipeline = pipeline.resize({
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  let out;
  if (ext === ".jpg" || ext === ".jpeg") {
    out = await pipeline.jpeg({ quality: JPG_QUALITY, mozjpeg: true }).toBuffer();
  } else if (ext === ".png") {
    out = await pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 }).toBuffer();
  } else if (ext === ".webp") {
    out = await pipeline.webp({ quality: 82 }).toBuffer();
  } else continue;

  if (out.length >= file.size) {
    skipped++;
    continue;
  }

  totalBefore += file.size;
  totalAfter += out.length;
  processed++;

  console.log(
    `${dryRun ? "[dry] " : ""}${name.padEnd(60)} ${fmt(file.size).padStart(8)} -> ${fmt(out.length).padStart(8)}  (-${(((file.size - out.length) / file.size) * 100).toFixed(0)}%)`
  );

  if (!dryRun) {
    const tmp = file.path + ".tmp";
    await writeFile(tmp, out);
    await rename(tmp, file.path);
  }
}

console.log(`\nProcessed: ${processed}, skipped: ${skipped}`);
if (processed > 0) {
  console.log(
    `Total before: ${fmt(totalBefore)}, after: ${fmt(totalAfter)}, saved: ${fmt(totalBefore - totalAfter)} (-${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0)}%)`
  );
}
