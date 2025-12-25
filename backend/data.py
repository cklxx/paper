from .models import Card, Paper


def _method(steps: list[str]) -> Card:
    return {"type": "method", "steps": steps}  # type: ignore[return-value]


def _hook(text: str) -> Card:
    return {"type": "hook", "text": text}  # type: ignore[return-value]


def _intuition(text: str) -> Card:
    return {"type": "intuition", "text": text}  # type: ignore[return-value]


def _tradeoff(good: str, bad: str) -> Card:
    return {"type": "tradeoff", "good": good, "bad": bad}  # type: ignore[return-value]


def _who(do: str, skip: str) -> Card:
    return {"type": "who", "do": do, "skip": skip}  # type: ignore[return-value]


sample_papers: list[Paper] = [
    Paper(
        id="transformer-circuits",
        title="Transformer Circuits",
        topic="Inference",
        cards=[
            _hook("Transformer 里藏着可拆的思维线路。"),
            _intuition("直觉：注意力全局随机；作者：特定头负责特定推理链。"),
            _method(
                [
                    "标记重复出现的注意力模式",
                    "把它们当“电路”拆出来",
                    "用来解释输出",
                ]
            ),
            _tradeoff("可解释性↑", "复杂任务电路重叠，拆不干净"),
            _who("做模型解释/安全", "只关心下游指标"),
        ],
    ),
    Paper(
        id="flashattention",
        title="FlashAttention",
        topic="Training",
        cards=[
            _hook("真慢的不是算力，是显存来回搬。"),
            _intuition("直觉：算子本身慢；作者：IO 是瓶颈。"),
            _method(["块化注意力", "在 SRAM 里完成算子", "减少 DRAM 往返"]),
            _tradeoff("吞吐大涨", "需要硬件友好实现"),
            _who("GPU 推理/训练优化", "CPU-only 轻量场景"),
        ],
    ),
    Paper(
        id="speculative-decoding",
        title="Speculative Decoding",
        topic="Inference",
        cards=[
            _hook("推理慢，因为一次只敢猜一个 token。"),
            _intuition("直觉：大模型要谨慎；作者：小模型先粗猜，大模型批验证。"),
            _method(["小模型并行猜多 token", "大模型一次性批判对", "只重算错的部分"]),
            _tradeoff("延迟↓", "依赖先验模型，场景切换要重训小模型"),
            _who("要求低延迟", "只离线跑批"),
        ],
    ),
]


def get_papers() -> list[Paper]:
    return sample_papers


def find_paper(paper_id: str) -> Paper | None:
    for paper in sample_papers:
        if paper.id == paper_id:
            return paper
    return None
