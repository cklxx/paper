import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import { findPaperById } from "../data/papers";
import { difficultyStyles, getProblemById } from "../data/problems";
import { runProblem, submitProblem } from "../api/judge";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { useProgress } from "../hooks/useProgress";

const tabStyles = (active: boolean) =>
  `px-3 py-2 text-sm rounded-md border ${
    active ? "border-white/20 bg-white/5" : "border-transparent text-muted-foreground"
  }`;

type OutputCase = {
  ok: boolean;
  args: unknown[];
  expected: unknown;
  output: unknown;
  error?: string;
};

type RunResult = {
  status: "ok" | "error" | "timeout";
  passed: number;
  failed: number;
  total: number;
  duration: number;
  output: string;
  error: string;
  cases: OutputCase[];
  limitApplied?: boolean;
};

export default function PaperProblem() {
  const { paperId, problemId } = useParams();
  const paper = paperId ? findPaperById(paperId) : undefined;
  const problem = paperId && problemId ? getProblemById(paperId, problemId) : undefined;
  const { markComplete } = useProgress();
  const [activeTab, setActiveTab] = useState<"desc" | "output">("desc");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [panelSizes, setPanelSizes] = useLocalStorageState<number[]>("pc.panels.problem", [40, 60]);

  const [code, setCode] = useLocalStorageState(
    problem ? `pc.code.${problem.id}` : "pc.code.unknown",
    problem?.starter ?? "",
  );

  const hasProblem = Boolean(problem && paper);

  const progress = useMemo(() => {
    if (!result || result.total === 0) return 0;
    return Math.round((result.passed / result.total) * 100);
  }, [result]);

  if (!hasProblem) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-muted-foreground">题目不存在。</p>
      </div>
    );
  }

  const handleRun = async () => {
    if (!paperId || !problemId) return;
    setRunning(true);
    try {
      const payload = await runProblem({ paperId, problemId, code });
      setResult(payload);
      setActiveTab("output");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!paperId || !problemId) return;
    setSubmitting(true);
    try {
      const payload = await submitProblem({ paperId, problemId, code });
      setResult(payload);
      setActiveTab("output");
      if (payload.status === "ok" && payload.failed === 0) {
        markComplete(paperId, problemId);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 top-14 z-40 bg-background">
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/10">
          <Link to={`/papers/${paperId}`} className="text-sm text-muted-foreground hover:text-foreground">
            ← 返回
          </Link>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{problem.title}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${difficultyStyles[problem.difficulty]}`}
            >
              {problem.difficulty}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="px-3 py-2 text-sm rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-60"
              type="button"
              onClick={handleRun}
              disabled={running}
            >
              {running ? "运行中..." : "运行"}
            </button>
            <button
              className="px-3 py-2 text-sm rounded-md border border-white/10 bg-white/10 hover:bg-white/20 disabled:opacity-60"
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "提交中..." : "提交"}
            </button>
          </div>
        </div>

        <PanelGroup direction="horizontal" className="flex-1" onLayout={(sizes) => setPanelSizes(sizes)}>
          <Panel defaultSize={panelSizes[0]} minSize={25} className="bg-background">
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
                <button
                  className={tabStyles(activeTab === "desc")}
                  type="button"
                  onClick={() => setActiveTab("desc")}
                >
                  说明
                </button>
                <button
                  className={tabStyles(activeTab === "output")}
                  type="button"
                  onClick={() => setActiveTab("output")}
                >
                  输出
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                {activeTab === "desc" ? (
                  <div className="space-y-4 text-sm">
                    <p className="text-muted-foreground">{problem.description}</p>
                    <div>
                      <h3 className="text-sm font-semibold">目标</h3>
                      <p className="text-muted-foreground">{problem.goal}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">约束</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {problem.constraints.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">规格</h3>
                      <div className="text-muted-foreground">
                        <div>入口函数：{problem.spec.entry}</div>
                        <div>输入：{problem.spec.input}</div>
                        <div>输出：{problem.spec.output}</div>
                        <div>时间限制：{problem.spec.timeLimitSec}s</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">公开用例</h3>
                      <div className="space-y-2 text-muted-foreground">
                        {problem.tests.map((testCase, index) => (
                          <div key={String(index)} className="border border-white/10 rounded-md p-2">
                            <div>
                              用例 {index + 1}：{testCase.note ?? ""}
                            </div>
                            <div>输入：{JSON.stringify(testCase.args)}</div>
                            <div>期望：{JSON.stringify(testCase.expected)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-sm">
                    {result ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            通过 {result.passed} / {result.total}
                          </span>
                          <span className="text-muted-foreground">{result.duration.toFixed(2)}s</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="space-y-2">
                          {result.cases.map((caseItem, index) => (
                            <div
                              key={String(index)}
                              className={`border rounded-md p-2 ${
                                caseItem.ok ? "border-emerald-500/30" : "border-rose-500/30"
                              }`}
                            >
                              <div className="text-xs text-muted-foreground">
                                用例 {index + 1} {caseItem.ok ? "通过" : "失败"}
                              </div>
                              <div>输入：{JSON.stringify(caseItem.args)}</div>
                              <div>输出：{JSON.stringify(caseItem.output)}</div>
                              <div>期望：{JSON.stringify(caseItem.expected)}</div>
                              {caseItem.error ? (
                                <pre className="mt-2 text-xs text-rose-400 whitespace-pre-wrap">
                                  {caseItem.error}
                                </pre>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">暂无运行结果。</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-white/5 hover:bg-white/10 transition" />

          <Panel defaultSize={panelSizes[1]} minSize={35} className="bg-[#1e1e1e]">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value ?? "")}
              options={{
                minimap: { enabled: false },
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
              }}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
