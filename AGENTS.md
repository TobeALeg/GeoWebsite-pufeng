# AGENTS.md

- 始终保持本仓库可独立运行，不得重新引入 GEO、`TENANT`、租户目录或 v2 建站系统依赖。
- `src/data/site-content.json` 是官网内容正本；修改内容后必须运行 `npm run check && npm run build && npm run verify`。
- 页面或素材删除前，检查全部路由和引用；不要在迁移维护中顺手重设计现有页面。
- 持续维护 `docs/product.md` 与 `docs/architecture.md`。
- 敏感信息只放 GitHub Environment Secrets，不得写入代码或提交。
