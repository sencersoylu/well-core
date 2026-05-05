import sharp from "sharp";
import { mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const SRC = join(ROOT, "apps/mobile/assets/atrium");
const OUT = join(ROOT, "apps/mobile/assets");

const targets = [
  { src: "atrium-icon.svg", out: "icon.png", size: 1024 },
  { src: "atrium-icon.svg", out: "adaptive-icon.png", size: 1024 },
  { src: "atrium-icon.svg", out: "splash-icon.png", size: 400, padBg: "#f6f4ef" },
  { src: "atrium-mark.svg", out: "favicon.png", size: 64 },
];

mkdirSync(OUT, { recursive: true });

for (const t of targets) {
  const buf = readFileSync(join(SRC, t.src));
  let img = sharp(buf, { density: 384 }).resize(t.size, t.size, { fit: "contain", background: t.padBg ?? { r: 0, g: 0, b: 0, alpha: 0 } });
  await img.png().toFile(join(OUT, t.out));
  console.log(`→ ${t.out} (${t.size}×${t.size})`);
}

console.log("done");
