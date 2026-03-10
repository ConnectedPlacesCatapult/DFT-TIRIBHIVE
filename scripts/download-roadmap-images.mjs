#!/usr/bin/env node
/**
 * Download TRIB roadmap static assets (background, SVG icons) for local use.
 * Run: node scripts/download-roadmap-images.mjs
 * Assets from: https://trib.org.uk/roadmap/static/media/
 */
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = "https://trib.org.uk/roadmap/static/media/";
const OUT_DIR = path.join(__dirname, "..", "public", "images", "trib", "roadmap");

const ASSETS = [
  "Background_Image.c9914350e24aa9749a4d.png",
  "Idea.8c2f15a663358d5b029e.svg",
  "Expand.f352626049d4097b4e1fe4418bd0805e.svg",
  "Collab.6a975c624411e0e820ab.svg",
  "Gov.06364c36214b79d025d5.svg",
  "Leadership.da70676960ca20b7839b.svg",
  "Leaf.01e840bfc009ef03368a.svg",
  "Policy.9585f1692c4e3d786c12.svg",
  "Legal.7a05737971bea0162fe5.svg",
  "Workforce.9d57ec999dffd788f722.svg",
  "People.4e4b20c01709360741ba.svg",
  "Tech.e2ca191950df79688850.svg",
  "Data.dbe55980f79478a19561.svg",
  "Cyber.da00fccfd662614dccfb.svg",
  "Security.4e3e2bf0560e567c663b.svg",
];

function download(url) {
  return new Promise((resolve, reject) => {
    const file = path.join(OUT_DIR, path.basename(url.split("?")[0]));
    const stream = fs.createWriteStream(file);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          download(res.headers.location).then(resolve).catch(reject);
          return;
        }
        res.pipe(stream);
        stream.on("finish", () => {
          stream.close();
          resolve(file);
        });
      })
      .on("error", (err) => {
        fs.unlink(file, () => {});
        reject(err);
      });
  });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const name of ASSETS) {
    const url = BASE + name;
    try {
      const out = await download(url);
      console.log("OK", path.basename(out));
    } catch (e) {
      console.error("FAIL", name, e.message);
    }
  }
  console.log("Done. Roadmap images in public/images/trib/roadmap/");
}

main();
