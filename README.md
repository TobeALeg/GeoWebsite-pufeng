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

## 推荐协作流程

官网修改统一走：**本地新分支修改 → Push → 提 Pull Request → CI 检查 → 合并到 `main` → GitHub Actions 自动部署**。

```bash
# 1. 从最新 main 创建功能分支
git switch main
git pull --ff-only
git switch -c feature/<本次修改>

# 2. 修改后完成本地验证
npm run check
npm run build
npm run verify

# 3. 提交并推送功能分支
git add <本次修改的文件>
git commit -m "说明本次修改"
git push -u origin feature/<本次修改>
```

然后在 GitHub 创建合并到 `main` 的 Pull Request。CI 会重新执行检查和构建；CI 通过并完成代码审阅后再合并。合并到 `main` 会自动触发生产部署，部署前会备份当前线上版本。

不要直接修改服务器文件，不要把密码、私钥或其他敏感信息提交进仓库。

## 内容与代码归属

- `src/data/site-content.json` 是当前官网内容正本，页面文案、模块顺序和结构修改从这里开始。
- `src/components/` 只保留濮丰实际使用的组件。
- `public/` 保存正式素材与机器可读技术资产。
- 本仓库不依赖 GEO、`core.json`、租户目录或 v2 官网生成系统。

不要从服务器或 Docker 镜像反向修改源码。所有变更都通过分支、Pull Request 和 Git 历史完成。

## 部署配置

GitHub `production` Environment 需要配置：

Secrets：`DEPLOY_SSH_PRIVATE_KEY`、`DEPLOY_KNOWN_HOSTS`。

Variables：`DEPLOY_HOST`、`DEPLOY_USER`、`DEPLOY_ROOT`、`DEPLOY_BACKUP_ROOT`、`HEALTHCHECK_URL`。

当前建议值见 `docs/architecture.md`。首次启用自动部署前，必须只读核对服务器目录、SSH 指纹和 Nginx root。
