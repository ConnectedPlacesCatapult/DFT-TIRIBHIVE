const fs = require("fs");
const path = require("path");

const dirPath = path.join(__dirname, "..");
const designPath = path.join(dirPath, "Example", "hive-design-directions.jsx");
const v4Path = path.join(dirPath, "Example", "hive-prototype-v4-updated.jsx");
const outPath = path.join(dirPath, "app", "hive", "page.tsx");

const design = fs.readFileSync(designPath, "utf8");
const v4 = fs.readFileSync(v4Path, "utf8");

// Split design: keep everything before Direction B and everything from Direction C onward
const dirBStart = "// ── DIRECTION B: PROTOTYPE ─────────────────────────────────────────────────────";
const dirCEndMarker = "// ── C: TERRAIN (Dark + Teal) ──────────────────────────────────────────────────";
const idxB = design.indexOf(dirBStart);
const idxC = design.indexOf(dirCEndMarker);
if (idxB === -1 || idxC === -1) throw new Error("Could not find Direction B or C markers");

const designBeforeB = design.slice(0, idxB);
const designFromC = design.slice(idxC);

// V4 block: remove first line (import), remove SECTORS const, rename HIVEPrototypeV4 to DirectionB
let v4Block = v4
  .replace(/^import \{ useState, useEffect, useRef \} from "react";\s*\n/, "")
  .replace(/\nconst SECTORS = \["Rail",?\s*"Aviation",?\s*"Maritime",?\s*"Highways"\];\n?/, "\n")
  .replace(/export default function HIVEPrototypeV4\(\)/, "function DirectionB()");

const designHead = designBeforeB.replace(/^import \{ useState, useEffect, useRef \} from "react";\s*\n/, "").trimStart();
const out = '"use client";\n\nimport { useState, useEffect, useRef } from "react";\n\n' + designHead + "\n\n" + v4Block + "\n\n" + designFromC;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out, "utf8");
console.log("Wrote", outPath);
