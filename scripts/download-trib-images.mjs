#!/usr/bin/env node
/**
 * Download TRIB live site images to public/images/trib for local/deployed use.
 * Run: node scripts/download-trib-images.mjs
 */
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = "https://trib.org.uk/static/media/";
const OUT_DIR = path.join(__dirname, "..", "public", "images", "trib");

const IMAGES = [
  "roadmap.8694b7edb2a21f05066f.png",
  "HIVE.c66281bf20b95c630434.png",
  "DfT_3298_AW%20(002).3c2a74265186dc09b768.png",
  "CPC_Logo_RGB_green.2e844a0ec0f236955a2e.png",
  "MCA.ee49a64ef695f2a790ae.png",
  "Network_Rail.7f9e82f680eb52f17be1.jpg",
  "UKRI-Logo_Horiz-RGB.18cd2fdd3d8cc787ac7d.png",
  "HVM_Catapult.4512adeec38d48394518.jpg",
  "NDTP-logo-v3-HM%20Gov-Blue.1f9900163c2670069e34.jpg",
  "National_Highways.9317ede34501e1baea9b.png",
  "Adept_Master_Logo_RGB_HR.bec5bf910613036e29ae.png",
  "Innovate_UK.82d14e83727652da2230.png",
  "UKRI_EPSR_Council-Logo_Horiz-RGB.cbe3fd283578f5f43971.png",
  "DSIT_Colour_Main.f6d14a64802789dbbecd.png",
  "RSSB_MASTER_LOGO_DIGITAL_LR.2d41fffa42a484cc0019.png",
  "__sitelogo__Hi%20Res%20Logo.536f7b02f91c9dc16f81.png",
];

function download(url) {
  return new Promise((resolve, reject) => {
    const file = path.join(OUT_DIR, path.basename(url.replace(/%20/g, " ")));
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
  for (const name of IMAGES) {
    const url = BASE + name;
    try {
      const out = await download(url);
      console.log("OK", path.basename(out));
    } catch (e) {
      console.error("FAIL", name, e.message);
    }
  }
  console.log("Done. Images in public/images/trib/");
}

main();
