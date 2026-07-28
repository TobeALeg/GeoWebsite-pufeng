import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const content = JSON.parse(fs.readFileSync(path.join(root, "src/data/site-content.json"), "utf8"));
const failures = [];

function normalizeRoute(route) {
  const normalized = String(route ?? "/").replace(/^\/+|\/+$/g, "");
  return normalized ? `/${normalized}` : "/";
}

const expectedRoutes = new Set((content.pages ?? []).map((page) => normalizeRoute(page.route)));

function assertFile(relative, label = relative) {
  if (!fs.existsSync(path.join(dist, relative))) failures.push(`缺少 ${label}: dist/${relative}`);
}

for (const page of content.pages ?? []) {
  const route = normalizeRoute(page.route).replace(/^\//, "");
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

for (const file of [
  "robots.txt",
  "llms.txt",
  "sitemap.xml",
  "schema-manifest.json",
  "sitemap-index.xml",
]) {
  assertFile(file);
}

function routesFromUrls(text) {
  const routes = new Set();
  for (const match of text.matchAll(/https?:\/\/[^\s<>)\]"'\\,]+/g)) {
    try {
      routes.add(normalizeRoute(new URL(match[0].replace(/[.,;:]$/, "")).pathname));
    } catch {
      // 非 URL 文本由后续覆盖校验忽略。
    }
  }
  return routes;
}

for (const file of ["sitemap.xml", "llms.txt"]) {
  const filePath = path.join(dist, file);
  if (!fs.existsSync(filePath)) continue;
  const coveredRoutes = routesFromUrls(fs.readFileSync(filePath, "utf8"));
  for (const route of expectedRoutes) {
    if (!coveredRoutes.has(route)) failures.push(`${file} 未覆盖页面 ${route}`);
  }
}

const schemaPath = path.join(dist, "schema-manifest.json");
if (fs.existsSync(schemaPath)) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  for (const route of expectedRoutes) {
    const key =
      route === "/" ? "home" : route.replace(/^\//, "").replace(/^teachers\//, "teacher_detail::");
    if (!(key in schema)) failures.push(`schema-manifest.json 未覆盖页面 ${route}`);
  }
}

if (fs.existsSync(path.join(dist, "gallery/index.html")))
  failures.push("正式构建不得包含 /gallery");

const homePath = path.join(dist, "index.html");
if (fs.existsSync(homePath)) {
  const homeHtml = fs.readFileSync(homePath, "utf8");
  const umamiConfigured =
    Boolean(process.env.PUBLIC_UMAMI_SCRIPT_URL) || Boolean(process.env.PUBLIC_UMAMI_WEBSITE_ID);

  if (umamiConfigured) {
    if (!process.env.PUBLIC_UMAMI_SCRIPT_URL || !process.env.PUBLIC_UMAMI_WEBSITE_ID) {
      failures.push(
        "Umami 配置不完整: PUBLIC_UMAMI_SCRIPT_URL 与 PUBLIC_UMAMI_WEBSITE_ID 必须同时提供",
      );
    } else {
      if (!homeHtml.includes(`src="${process.env.PUBLIC_UMAMI_SCRIPT_URL}"`))
        failures.push("首页未输出配置的 Umami tracker script");
      if (!homeHtml.includes(`data-website-id="${process.env.PUBLIC_UMAMI_WEBSITE_ID}"`))
        failures.push("首页未输出配置的 Umami website id");
      if (!homeHtml.includes('data-before-send="sanitizeUmamiPayload"'))
        failures.push("首页未配置 Umami URL 参数清洗");
      if (!homeHtml.includes('data-exclude-hash="true"'))
        failures.push("首页未关闭 URL hash 采集");
    }
  } else if (homeHtml.includes("data-website-id=")) {
    failures.push("未配置 Umami 时不应输出 tracker script");
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`验证通过: ${content.pages.length} 个页面, ${assets.size} 个内容资产。`);
