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

## Umami 埋点

埋点通过构建期环境变量启用：

- `PUBLIC_UMAMI_SCRIPT_URL`：自托管 Umami 的 tracker 地址。
- `PUBLIC_UMAMI_WEBSITE_ID`：Umami 中濮丰站点的公开标识。
- `PUBLIC_UMAMI_DOMAINS`：允许采集的正式域名，默认只包含主域和 `www`。

本地可复制 `.env.example` 为 `.env`。没有同时配置 tracker 地址和 Website ID 时，构建产物不会加载埋点脚本。

当前只采集自动页面访问、关键内容点击和咨询意向。`contact_intent` 只是电话、邮箱或联系区入口点击，不等同于真实询价。

自托管服务通过 GitHub Actions 的 `Operate Umami` 手动工作流维护：

- `inspect`：只读检查 Docker、Nginx、Certbot、磁盘和端口。
- `deploy`：备份已有数据库，创建或更新 Umami 与 PostgreSQL；初始化管理员和站点成功后才启用 Nginx HTTP 反向代理，并输出公开的 Website ID。
- `status`：检查容器、heartbeat 和站点配置。
- `enable-tls`：DNS 生效后申请或更新 HTTPS。
- `backup`：将 PostgreSQL 逻辑备份写入服务器 `/var/backups/pufeng-umami`。

首次部署前，需要在 production Environment 新增 Secret `UMAMI_ADMIN_PASSWORD`，且至少 16 个字符。部署脚本会在服务器生成数据库密码和 `APP_SECRET`，并将全部运行凭据保存在服务器 `/opt/pufeng-umami/.env`；除管理员密码进入 GitHub Secret 外，其他值不得复制进仓库或 GitHub Variables。

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

Variables：`DEPLOY_HOST`、`DEPLOY_USER`、`DEPLOY_ROOT`、`DEPLOY_BACKUP_ROOT`、`HEALTHCHECK_URL`、`PUBLIC_UMAMI_SCRIPT_URL`、`PUBLIC_UMAMI_WEBSITE_ID`、`PUBLIC_UMAMI_DOMAINS`。

当前建议值见 `docs/architecture.md`。首次启用自动部署前，必须只读核对服务器目录、SSH 指纹和 Nginx root。
