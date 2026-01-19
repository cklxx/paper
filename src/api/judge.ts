const apiBase = import.meta.env.VITE_API_BASE ?? "";

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return (await response.json()) as T;
}

export type RunPayload = {
  paperId: string;
  problemId: string;
  code: string;
};

export type RunResult = {
  status: "ok" | "error" | "timeout";
  passed: number;
  failed: number;
  total: number;
  duration: number;
  output: string;
  error: string;
  cases: Array<{
    ok: boolean;
    args: unknown[];
    expected: unknown;
    output: unknown;
    error?: string;
  }>;
  limitApplied?: boolean;
};

export const runProblem = (payload: RunPayload) =>
  postJson<RunResult>("/api/run", {
    paper_id: payload.paperId,
    problem_id: payload.problemId,
    code: payload.code,
  });

export const submitProblem = (payload: RunPayload) =>
  postJson<RunResult>("/api/submit", {
    paper_id: payload.paperId,
    problem_id: payload.problemId,
    code: payload.code,
  });
