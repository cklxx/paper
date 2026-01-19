import { useCallback } from "react";
import { getProblemsForPaperId } from "../data/problems";
import { useLocalStorageState } from "./useLocalStorageState";

export type ProgressMap = Record<string, Record<string, boolean>>;

export const getProgressCounts = (
  progress: ProgressMap,
  paperId: string,
  problemIds: string[],
) => {
  const completed = problemIds.filter((id) => progress[paperId]?.[id]).length;
  return { completed, total: problemIds.length };
};

export function useProgress() {
  const [progress, setProgress] = useLocalStorageState<ProgressMap>("pc.progress", {});

  const markComplete = useCallback(
    (paperId: string, problemId: string) => {
      setProgress((current) => {
        const paperProgress = { ...(current[paperId] ?? {}) };
        paperProgress[problemId] = true;
        return { ...current, [paperId]: paperProgress };
      });
    },
    [setProgress],
  );

  const isComplete = useCallback(
    (paperId: string, problemId: string) => Boolean(progress[paperId]?.[problemId]),
    [progress],
  );

  const getCounts = useCallback(
    (paperId: string) => {
      const problems = getProblemsForPaperId(paperId);
      return getProgressCounts(
        progress,
        paperId,
        problems.map((problem) => problem.id),
      );
    },
    [progress],
  );

  return { progress, markComplete, isComplete, getCounts };
}
