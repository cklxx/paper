# “抖音式爽刷论文” MVP 设计与落地清单

> 目标：用户 30 秒内「大概懂了论文在干嘛」，全程无压力。下面的结构可以直接搬到 Figma 画框、按周开工。

## 1. Figma 级 UI 结构

### 1.1 信息架构
```
App
 ├─ Feed（默认）          ← 左右滑卡片、上下滑换论文
 ├─ Library（我懂了）     ← 时间流列表，点击回到 5 卡刷读
 └─ Settings（极简）      ← 主题 / 字体 / 清缓存
```

### 1.2 Feed 页面框架
```
[ Safe Area Top ]
──────────────────
[ Topic Tag ]          可选（Inference / RL / Training…）
──────────────────
[ Card Content ]       大字号、宽行距、充足留白
──────────────────
[ Subtle Progress ]    · · · · · （5 张卡）
──────────────────
[ Safe Area Bottom ]
```

### 1.3 单卡模板（固定 5 张）
- 🟦 Hook（一句话暴击，≤25 字）
- 🟨 Intuition（反直觉点）
- 🟩 Method（人话步骤）
- 🟪 Trade-off（结果 & 代价，必须兼顾好与坏）
- 🟥 Who（要不要在意，✔ / ✘）

### 1.4 交互（Figma Prototype 连接）
| 手势 | 行为 |
| --- | --- |
| 上滑 | 下一篇论文 |
| 左滑 | 下一张卡 |
| 下滑 | 回看上一张卡 |
| 双击 | ❤️ 我懂了（入库到 Library） |
| 长按 | 👎 太水了（降权同类） |

### 1.5 状态与组件层级
- **Feed Frame**
  - Status Bar / Safe Area
  - Topic Tag（可隐藏）
  - Card Stack（当前卡 + 预加载下一卡）
  - Progress Dots（5 固定，随卡高亮）
  - Toast（“已收藏”“降权此类”）
- **Library Frame**
  - 列表：论文标题钩子 + 时间戳
  - 点击：打开该论文的 5 卡刷读（同 Feed 模式，禁用上滑）
- **Settings Frame**
  - 主题切换（深色默认）
  - 字体大小（3 档）
  - 数据清理（缓存/偏好）

## 2. 工程落地方案

### 2.1 前端
- React Native + Expo
- 手势：`react-native-gesture-handler`
- 动画：`react-native-reanimated`（仅卡片切换）
- 状态：`zustand` 或 `redux-toolkit`（选一，保持简单）
- 数据：`react-query` 拉取 Feed、写入反馈

### 2.2 后端
- FastAPI
- PostgreSQL（论文、卡片、用户偏好）
- Redis（Feed 队列、节流、session）

### 2.3 核心数据模型
```json
Paper {
  "paper_id": "arxiv:2406.12345",
  "title": "...",
  "topics": ["inference", "attention"],
  "cards": [Card1..Card5]
}
Card {
  "type": "hook | intuition | method | tradeoff | who",
  "text": "...",
  "source_span": "abstract / fig2 / section4",
  "confidence": 0.00
}
UserState {
  "liked_topics": [],
  "avg_cards_read": 0,
  "likes_methods": false
}
Feedback {
  "paper_id": "...",
  "action": "like | dislike | complete_cards",
  "cards_read": 0..5
}
```

### 2.4 API 草图
- `GET /feed?user_id=` → 论文列表（含 5 卡）
- `POST /feedback` → {paper_id, action, cards_read}
- `GET /library` → 我懂了列表
- `POST /library` → 收藏论文

### 2.5 LLM 生成流程（“只填模板”）
1. 输入：`abstract + conclusion + figure captions`
2. 约束：
   - 不超过 60 字/卡
   - 不出现公式/模型名/营销语
   - 必须包含反直觉点 & 代价
   - 附 `source_span` 与 `confidence`
3. 结构化输出：
```json
{
  "hook": "...",
  "intuition": "...",
  "method": ["step1", "step2", "step3"],
  "tradeoff": {"good": "...", "bad": "..."},
  "who": {"do": "...", "skip": "..."},
  "citations": ["section2", "fig1"]
}
```

### 2.6 推荐逻辑（MVP）
```
score =
  topic_match * 0.5
+ completion_rate * 0.3
+ diversity_bonus * 0.2
限制：同一 topic 连续 ≤ 3 篇；每日 ≤ 30 篇
```

### 2.7 日志与指标
- 每卡停留时长、卡数完成率、反直觉卡跳出率
- 反馈分布：双击率 / 长按率
- 推荐命中率：topic 准确度、重复率

### 2.8 执行节奏（单人）
- Week1：抓 arXiv 200 篇 → 人工+LLM 产 50 篇卡片 → 静态 Feed
- Week2：手势全链路；点赞/不感兴趣；简单推荐
- Week3：Library；每日 5 篇推送；留存验证

## 3. 10 篇论文 · 完整 5 卡示例

> 字数压缩、无模型名，按模板可直接塞入前端。

### 1) Transformer Circuits
- 🟦 「Transformer 里藏着可拆的思维线路。」
- 🟨 直觉：注意力全局随机；作者：特定头负责特定推理链。
- 🟩 ① 标记重复出现的注意力模式 ② 把它们当“电路”拆出来 ③ 用来解释输出。
- 🟪 ✅ 可解释性↑；⚠️ 复杂任务电路重叠，拆不干净。
- 🟥 ✔ 做模型解释/安全；✘ 只关心下游指标。

### 2) Retentive Networks
- 🟦 「不用注意力也能跑长上下文。」
- 🟨 直觉：长上下文必须自注意；作者：靠可学习记忆也行。
- 🟩 ① 建一组可学习记忆槽 ② 随序列累积关键信息 ③ 用记忆槽生成输出。
- 🟪 ✅ 长度伸缩好；⚠️ 极端顺序依赖时记忆会漂。
- 🟥 ✔ 做超长文档/RAG；✘ 只处理短句子。

### 3) Attention Sink
- 🟦 「开头几个 token 会永久污染注意力。」
- 🟨 直觉：位置无偏好；作者：首 token 成“黑洞”吸注意力。
- 🟩 ① 观察首 token 贡献 ② 训练阶段插入防沉降提示 ③ 解码时重权重分配。
- 🟪 ✅ 长上下文稳了；⚠️ 需要修改推理流程，兼容性差。
- 🟥 ✔ 做长文本推理；✘ 纯短 prompt 实验。

### 4) Ring Attention
- 🟦 「长上下文慢是并行方式错了。」
- 🟨 直觉：分块算注意力就好；作者：分块顺序导致等待。
- 🟩 ① 将序列分环 ② 环内并行计算注意 ③ 环间异步传递状态。
- 🟪 ✅ 吞吐↑，延迟↓；⚠️ 环同步复杂，工程负担大。
- 🟥 ✔ 做推理加速；✘ 无法改推理堆栈。

### 5) Multi-Query Attention
- 🟦 「KV cache 爆显存是因为存了太多副本。」
- 🟨 直觉：多头要多组 KV；作者：Q 多头即可，KV 共享。
- 🟩 ① 共享 KV 记忆 ② 只为 Query 保留多头多样性 ③ 推理少存 KV。
- 🟪 ✅ 显存省，大模型可跑；⚠️ 个别任务精度掉一点。
- 🟥 ✔ 部署端推理；✘ 追求极致精度的离线训练。

### 6) FlashAttention
- 🟦 「真慢的不是算力，是显存来回搬。」
- 🟨 直觉：算子本身慢；作者：IO 是瓶颈。
- 🟩 ① 块化注意力 ② 在 SRAM 里完成算子 ③ 减少 DRAM 往返。
- 🟪 ✅ 吞吐大涨；⚠️ 需要硬件友好实现。
- 🟥 ✔ GPU 推理/训练优化；✘ CPU-only 轻量场景。

### 7) Speculative Decoding
- 🟦 「推理慢，因为一次只敢猜一个 token。」
- 🟨 直觉：大模型要谨慎；作者：小模型先粗猜，大模型批验证。
- 🟩 ① 小模型并行猜多 token ② 大模型一次性批判对 ③ 只重算错的部分。
- 🟪 ✅ 延迟↓；⚠️ 依赖先验模型，场景切换要重训小模型。
- 🟥 ✔ 要求低延迟；✘ 只离线跑批。

### 8) Grouped Query Attention (GQA)
- 🟦 「注意力头不是越多越好，很多在浪费。」
- 🟨 直觉：多头=多表达；作者：Query 分组就够，KV 可少。
- 🟩 ① 将 Query 分组 ② 每组共享一份 KV ③ 保留必要多样性降存储。
- 🟪 ✅ 显存省，速度快；⚠️ 极细粒度任务可能损失细节。
- 🟥 ✔ 长上下文 / 部署节省；✘ 精调超细粒度特征。

### 9) Tree of Thoughts
- 🟦 「推理失败不是模型笨，是路径太单一。」
- 🟨 直觉：一次生成到底；作者：多路径树状探索更稳。
- 🟩 ① 让模型生成多步想法 ② 按启发式保留分支 ③ 汇总最佳路径输出。
- 🟪 ✅ 复杂推理成功率↑；⚠️ 时间消耗大，需剪枝策略。
- 🟥 ✔ 多步推理/规划；✘ 追求极快响应。

### 10) Self-Refine
- 🟦 「模型不是不会改，是你不给第二次机会。」
- 🟨 直觉：首答即终局；作者：先答再自评自改更准。
- 🟩 ① 首次回答 ② 自评找弱点 ③ 重写改进输出。
- 🟪 ✅ 质量↑；⚠️ 延迟↑，且自评可能跑偏。
- 🟥 ✔ 高质量生成；✘ 严格低延迟场景。
