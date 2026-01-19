# PaperCode 题目工作台设计（中文）

## 概览
在现有 Vite + React 前端与 FastAPI 后端基础上，新增 `/papers/:paperId/problems/:problemId` 题目工作台。
页面布局、交互与原站 1:1 对齐，所有文案为简短清晰中文。后端使用本地 Python 子进程执行代码，
提供运行/提交能力，并返回结构化评测结果。

## 目标
- 复刻原站题目页结构、交互、视觉与状态反馈。
- 支持本地 Python 代码运行/提交，严格用例评测。
- 代码与面板配置持久化到 localStorage。
- 完成状态回写到论文任务列表。

## 非目标
- 不做远程判题或多用户协作。
- 暂不支持多语言（仅 Python）。
- 不接入外部 API、模型或云资源。

## 架构与数据流
- 前端：React Router 渲染题目页；静态题库模块提供题目、用例、模板。
- 后端：FastAPI 新增 `POST /api/run` 与 `POST /api/submit`。
- 数据流：前端发送 `paperId`、`problemId`、`code` → 后端执行 → 返回结果 → 前端渲染输出并更新完成状态。

## 题库模型
- `Problem`：id、paperId、标题、难度、类型、描述、规格、模板代码、测试用例。
- `Spec`：入口函数名、输入输出类型、时间限制。
- `TestCase`：输入、期望输出、说明。
- 公开展示全部用例，运行仅执行前 N 个用例，提交执行全部用例。

## 后端评测
- 为每次请求创建临时目录，写入 `solution.py` 与 `runner.py`。
- 使用 `python -I runner.py` 执行，限制：
  - 超时 2s（可调），内存软限制（resource）。
  - 仅允许临时目录读写，不访问网络。
- 结果格式：
  - `status`: "ok" | "error" | "timeout"
  - `passed`/`failed`/`total`/`duration`
  - `output` 与 `error`
- 运行执行前 N 个用例；提交执行全部用例。

## 前端交互与布局
- 顶部固定导航，下方为全屏工作区。
- 双栏可拖拽分割（`react-resizable-panels`），宽度持久化。
- 左侧：题目标题、难度徽章、返回按钮；选项卡（说明/输出）。
- 右侧：Monaco 编辑器（Python），顶部运行/提交按钮。
- 运行/提交显示 loading、进度条与结果徽章；错误展示 stdout/stderr。
- 通过提交后，将 `pc.progress` 标记为完成并在论文任务列表显示绿勾。

## 本地存储
- `pc.code.<problemId>`：代码草稿
- `pc.panels.problem`：分割宽度
- `pc.progress`：完成状态

## 错误处理
- 语法/运行错误：显示 stderr，status=error。
- 超时：status=timeout，并提示超时原因。
- 结果解析失败：视为错误并返回原始输出。

## 测试策略
- 后端：单元测试 runner 解析；接口测试 run/submit。
- 前端：最小烟测（路由、按钮状态、输出渲染）。

