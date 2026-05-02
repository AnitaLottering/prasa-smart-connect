import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const manifestPath = resolve("dist/client/.vite/manifest.json");
let js = "assets/index.js";
let css = "assets/styles.css";

try {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as Record<
    string,
    { file: string; css?: string[] }
  >;
  const entry = Object.values(manifest).find((v) => v.file?.includes("index"));
  if (entry) {
    js = entry.file;
    css = entry.css?.[0] ?? css;
  }
} catch {
  // fallback to glob
  const { readdirSync } = await import("fs");
  const assets = readdirSync("dist/client/assets");
  js = "assets/" + (assets.find((f) => f.startsWith("index") && f.endsWith(".js")) ?? js);
  css = "assets/" + (assets.find((f) => f.endsWith(".css")) ?? css);
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PRASA Smart Connect</title>
    <link rel="stylesheet" href="/${css}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/${js}"></script>
  </body>
</html>`;

writeFileSync("dist/client/index.html", html);
console.log(`✓ Generated dist/client/index.html (js: ${js}, css: ${css})`);
