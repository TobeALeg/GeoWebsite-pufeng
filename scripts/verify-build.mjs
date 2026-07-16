import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const content = JSON.parse(fs.readFileSync(path.join(root, "src/data/site-content.json"), "utf8"));
const failures = [];

function assertFile(relative, label = relative) {
  if (!fs.existsSync(path.join(dist, relative))) failures.push(`缺少 ${label}: dist/${relative}`);
}

for (const page of content.pages ?? []) {
  const route = String(page.route ?? "/").replace(/^\/+|\/+$/g, "");
  assertFile(route ? `${route}/index.html` : "index.html", `页面 ${page.route}`);
}

const assets = new Set();
function collect(value) {
  if (typeof value === "string") {
    const match = value.match(/^\/((?:images|video)\/[^?#]+)/);
    if (match) assets.add(match[1]);
    return;
  }
  if (Array.isArray(value)) return value.forEach(collect);
  if (value && typeof value === "object") Object.values(value).forEach(collect);
}
collect(content);
for (const asset of assets) assertFile(asset, `内容引用资产 /${asset}`);

for (const file of ["robots.txt", "llms.txt", "sitemap.xml", "schema-manifest.json", "sitemap-index.xml"]) {
  assertFile(file);
}

if (fs.existsSync(path.join(dist, "gallery/index.html"))) failures.push("正式构建不得包含 /gallery");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`验证通过: ${content.pages.length} 个页面, ${assets.size} 个内容资产。`);
