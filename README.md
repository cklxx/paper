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
