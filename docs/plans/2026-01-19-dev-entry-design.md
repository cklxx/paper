# 一键启动统一入口设计

## 背景

目前前后端同时启动依赖 `./scripts/dev.sh`，但 `npm run dev` 仅启动前端，入口不统一。

## 目标

- 统一开发入口：使用 `./scripts/dev.sh` 作为唯一的本地开发启动方式。
- 降低上手成本：开发者只需一个命令即可拉起前后端。

## 非目标

- 不新增调试器配置或前端/后端单独启动流程。
- 不改动 `dev.sh`/`deploy.sh` 的具体行为。

## 方案

- 将 `package.json` 的 `dev` 脚本改为 `./scripts/dev.sh`。
- 更新 `README.md`：在脚手架与一键脚本段落明确 `npm run dev` 为统一入口。

## 错误处理与回滚

- 由 `dev.sh` 的 `set -euo pipefail` 负责失败即中止，并通过 `trap` 清理子进程。
- 如需回滚，仅需恢复 `package.json` 中 `dev` 脚本。

## 测试与验证

- 手动执行 `npm run dev`，确认前端与后端均成功启动。
