# paper

“抖音式爽刷论文”产品的设计与落地方案见：

- [docs/mvp-execution-plan.md](docs/mvp-execution-plan.md)

## 开发脚手架

前端采用 React + Vite + TypeScript，内置 ESLint、Vitest、Playwright：

```bash
npm install
npm run dev      # 本地开发
npm run build    # 构建
npm run lint     # 代码检查
npm test         # 单元测试（Vitest）
npm run e2e      # 端到端测试（Playwright）
```

## 后端 API 脚手架（FastAPI）

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# API 调试
curl http://localhost:8000/papers
```

### 数据与爬虫

- 示例数据来自 `data/paper_seeds.json`，经变体展开得到 650 篇带来源标注的示例论文。
- FastAPI 暴露了 `/crawl` 接口：`POST /crawl {"url": "...", "topic": "..."}` 会抓取网页正文，自动转写成 5 张卡片并写入本地 SQLite（默认 `backend/papers.db`，可通过 `PAPER_DB_PATH` 覆盖）。

### 一键脚本

- 开发模式：`./scripts/dev.sh` 会装好依赖并同时拉起 `uvicorn --reload` 与前端 `vite dev`。
- 部署验证：`./scripts/deploy.sh` 会执行 `npm ci && npm run build` 后分别启动后端（多进程）与前端 `vite preview` 服务。按 `Ctrl+C` 即可退出并清理进程。

## GitHub Pages 纯前端部署

- 本仓库已内置 GitHub Actions 工作流，会在 `main` 分支推送或手动触发时运行 ESLint、Vitest，并经 `npm run build:github-pages` 生成静态站点后自动发布到 GitHub Pages。
- Vite 的 GitHub Pages 构建会自动根据仓库名设定 `base` 前缀（缺省为 `/paper/`），确保静态资源路径正确。
- 本地验证与产出 GitHub Pages 版本：

```bash
npm run build:github-pages
```

构建结果位于 `dist/`，可直接发布到 GitHub Pages。
