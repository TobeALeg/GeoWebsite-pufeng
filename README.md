# Pufeng Website

濮丰服饰官网的独立源码仓库，对应生产域名 <https://pufengwool.com>。

## 本地运行

要求 Node.js 22.12 或更高版本。

```bash
npm ci
npm run dev
```

正式验证：

```bash
npm run check
npm run build
npm run verify
```

## 内容与代码归属

- `src/data/site-content.json` 是当前官网内容正本，页面文案、模块顺序和结构修改从这里开始。
- `src/components/` 只保留濮丰实际使用的组件。
- `public/` 保存正式素材与机器可读技术资产。
- 本仓库不依赖 GEO、`core.json`、租户目录或 v2 官网生成系统。

不要从服务器或 Docker 镜像反向修改源码。所有变更都通过分支、Pull Request 和 Git 历史完成。

## 部署配置

GitHub `production` Environment 需要配置：

Secrets：`DEPLOY_SSH_PRIVATE_KEY`、`DEPLOY_KNOWN_HOSTS`。

Variables：`SITE_URL`、`DEPLOY_HOST`、`DEPLOY_USER`、`DEPLOY_ROOT`、`DEPLOY_BACKUP_ROOT`、`HEALTHCHECK_URL`。

当前建议值见 `docs/architecture.md`。首次启用自动部署前，必须只读核对服务器目录、SSH 指纹和 Nginx root。
