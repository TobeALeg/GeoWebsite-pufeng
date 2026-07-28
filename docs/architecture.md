# Architecture

## module architecture

```text
src/data/site-content.json
  → src/lib/site.ts
  → src/pages/[...slug].astro
  → src/components/moduleMap.ts
  → Pufeng Astro components
  → dist/ static website
```

## data flow

- `site-content.json` 是页面内容正本。
- Astro 在构建期展开全部路由并输出静态 HTML。
- `public/` 中的图片、视频、robots、llms、sitemap 和 Schema 原样进入 `dist/`。
- 构建不访问 GEO 仓库、租户仓库、数据库或远程接口。

### analytics

```text
production Environment Variables
  → BaseLayout 输出 Umami tracker
  → 自动 page view / 声明式业务事件
  → 自托管 Umami
```

- 只有 `PUBLIC_UMAMI_SCRIPT_URL` 与 `PUBLIC_UMAMI_WEBSITE_ID` 同时配置时才加载 tracker；未配置时官网保持无埋点静态运行。
- `PUBLIC_UMAMI_DOMAINS` 限制采集正式域名，默认值为 `pufengwool.com,www.pufengwool.com`，避免本地和预览流量污染。
- 第一版业务事件只有 `select_content` 与 `contact_intent`。事件参数只描述内容类型、内容标识、入口位置和联系方式，不采集姓名、电话、邮箱或表单原始值。
- `contact_intent` 代表用户点击咨询入口，不代表真实询价。只有未来后端成功接收线索后，才允许记录 `lead_generated`。

## status flow

```text
branch → Pull Request CI → main → production Environment → backup → rsync → health check
```

生产域名固定为 `https://pufengwool.com`。部署参数建议：`DEPLOY_ROOT=/var/www/pufengwool`、`DEPLOY_BACKUP_ROOT=/var/backups/pufengwool`。主机和用户由 GitHub Environment Variables 配置，SSH 私钥和固定主机指纹由 Secrets 配置。
