# Task 1: Pufeng 独立网站仓库

## 目标

把当前 Pufeng 生产官网完整抽成独立 Astro 仓库，供独立团队维护。

## 必须满足

- 本地无需 GEO、`TENANT`、`core.json`、租户目录或 v2 系统即可运行。
- 保留当前页面、内容、视觉、SEO/GEO 技术资产和全部被引用素材。
- 只保留 Pufeng 实际使用的组件，不携带 Oxford 或 gallery/v2。
- Pull Request 自动执行类型检查、构建和产物校验。
- main 可通过独立 production Environment 部署；部署前备份，支持按 Git commit 手动回滚。
- 敏感信息不得进入仓库。

## 非目标

- 不重设计页面。
- 不重写内容。
- 不迁移 v2 官网生成系统。
- 本次不创建远程 GitHub 仓库，不直接部署服务器。
