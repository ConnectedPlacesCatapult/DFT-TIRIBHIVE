/**
 * Downloads hero images into public/hero/ for the handbook landing cycle.
 * Run: npx tsx scripts/download-hero-images.ts
 *
 * Sources:
 * - Sheffield: Green Estate (case study source)
 * - Dawlish, Rockfall, Panama, Heathrow: Unsplash (free use, thematic match)
 * - Dawlish waves: YouTube thumbnail (Dawlish Sea Wall severe weather)
 */

import * as fs from "fs";
import * as path from "path";

const HERO_DIR = path.join(process.cwd(), "public", "hero");

const IMAGES: { filename: string; url: string; description: string }[] = [
  {
    filename: "hero-1-sheffield.jpg",
    url: "https://unsplash.com/photos/z1tdExH2kKM/download?force=true&w=1600",
    description: "Urban green corridor / SuDS-style (Unsplash)",
  },
  {
    filename: "hero-2-dawlish.jpg",
    url: "https://unsplash.com/photos/LhD5L1m5rMo/download?force=true&w=1600",
    description: "Sea wall / coastal (Unsplash)",
  },
  {
    filename: "hero-3-rockfall.jpg",
    url: "https://unsplash.com/photos/LODnFAhDJRw/download?force=true&w=1600",
    description: "Alpine rocky hillside (Unsplash)",
  },
  {
    filename: "hero-4-panama.jpg",
    url: "https://unsplash.com/photos/alHtJGJMV6Q/download?force=true&w=1600",
    description: "Cargo ship in canal (Unsplash)",
  },
  {
    filename: "hero-5-heathrow.jpg",
    url: "https://unsplash.com/photos/Ys-bufnHn-g/download?force=true&w=1600",
    description: "Water / infrastructure (Unsplash)",
  },
  {
    filename: "hero-6-dawlish-waves.jpg",
    url: "https://i.ytimg.com/vi/txDPRjZ0-7k/maxresdefault.jpg",
    description: "Severe weather, waves over trains, Dawlish Sea Wall (YouTube)",
  },
];

async function download(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "HIVE-Handbook-Bot/1.0 (hero image download)",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.arrayBuffer();
}

async function main() {
  fs.mkdirSync(HERO_DIR, { recursive: true });

  for (const { filename, url, description } of IMAGES) {
    const filepath = path.join(HERO_DIR, filename);
    try {
      process.stdout.write(`Downloading ${filename} (${description})... `);
      const buf = await download(url);
      fs.writeFileSync(filepath, new Uint8Array(buf));
      console.log(`OK (${(buf.byteLength / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`Failed: ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log("\nDone. Images are in public/hero/");
}

main();
