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

## status flow

```text
branch → Pull Request CI → main → production Environment → backup → rsync → health check
```

生产域名固定为 `https://pufengwool.com`。部署参数建议：`DEPLOY_ROOT=/var/www/pufengwool`、`DEPLOY_BACKUP_ROOT=/var/backups/pufengwool`。主机和用户由 GitHub Environment Variables 配置，SSH 私钥和固定主机指纹由 Secrets 配置。
