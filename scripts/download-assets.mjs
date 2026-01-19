import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "public", "assets");
const fontsDir = path.join(root, "fonts");

fs.mkdirSync(fontsDir, { recursive: true });

const download = (url, dest) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", reject);
  });

const base = "https://papercode.vercel.app";
const assets = [
  `${base}/logo.jpeg`,
  `${base}/logo.ico`,
  `${base}/favicon.ico?favicon.104d8097.ico`,
  "https://grainy-gradients.vercel.app/noise.svg",
];

for (const url of assets) {
  const name = url.includes("noise.svg") ? "noise.svg" : url.split("/").pop().split("?")[0];
  await download(url, path.join(root, name));
}

const css = await fetch(`${base}/_next/static/chunks/911c2be42a6fe28c.css`).then((r) => r.text());
const fontMatches = [...css.matchAll(/media\/([a-z0-9.-]+\.woff2)/g)].map((m) => m[1]);

for (const file of new Set(fontMatches)) {
  await download(`${base}/_next/static/media/${file}`, path.join(fontsDir, file));
}
