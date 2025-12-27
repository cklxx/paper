import { Paper } from "./papers";

export type UserFeedback = {
  userId: string;
  ratings: Record<string, number>;
};

const VARIANT_SUFFIX = /-v\d+$/;

const normalizePaperId = (paperId: string) =>
  paperId.replace(VARIANT_SUFFIX, "");

type RatingVector = Map<string, number>;

const cosineSimilarity = (left: RatingVector, right: RatingVector) => {
  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (const value of left.values()) {
    leftMagnitude += value * value;
  }

  for (const value of right.values()) {
    rightMagnitude += value * value;
  }

  for (const userId of left.keys()) {
    if (right.has(userId)) {
      dotProduct += left.get(userId)! * right.get(userId)!;
    }
  }

  if (dotProduct === 0) {
    return 0;
  }

  return dotProduct / Math.sqrt(leftMagnitude * rightMagnitude);
};

const buildItemRatings = (
  feedback: UserFeedback[],
): Map<string, RatingVector> => {
  const ratings = new Map<string, RatingVector>();

  for (const entry of feedback) {
    for (const [paperId, score] of Object.entries(entry.ratings)) {
      const normalized = normalizePaperId(paperId);
      if (!ratings.has(normalized)) {
        ratings.set(normalized, new Map());
      }
      ratings.get(normalized)!.set(entry.userId, score);
    }
  }

  return ratings;
};

const buildAverageRatings = (itemRatings: Map<string, RatingVector>) =>
  new Map(
    [...itemRatings.entries()].map(([paperId, scores]) => {
      const values = [...scores.values()];
      const average =
        values.reduce((sum, score) => sum + score, 0) / values.length;
      return [paperId, average];
    }),
  );

const setSimilarity = (
  similarities: Map<string, Map<string, number>>,
  a: string,
  b: string,
  value: number,
) => {
  if (!similarities.has(a)) {
    similarities.set(a, new Map());
  }
  similarities.get(a)!.set(b, value);
};

const buildSimilarities = (itemRatings: Map<string, RatingVector>) => {
  const similarities = new Map<string, Map<string, number>>();
  const items = [...itemRatings.keys()];

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const first = items[i];
      const second = items[j];
      const similarity = cosineSimilarity(
        itemRatings.get(first)!,
        itemRatings.get(second)!,
      );

      if (similarity > 0) {
        setSimilarity(similarities, first, second, similarity);
        setSimilarity(similarities, second, first, similarity);
      }
    }
  }

  return similarities;
};

const predictScore = (
  candidateId: string,
  activeRatings: Map<string, number>,
  similarities: Map<string, Map<string, number>>,
  averageRatings: Map<string, number>,
) => {
  const candidateSimilarities = similarities.get(candidateId);
  const weightedNeighbors = candidateSimilarities
    ? [...activeRatings.entries()]
        .map(([ratedId, rating]) => ({
          similarity: candidateSimilarities.get(ratedId) ?? 0,
          rating,
        }))
        .filter(({ similarity }) => similarity > 0)
    : [];

  if (!weightedNeighbors.length) {
    return averageRatings.get(candidateId) ?? 0;
  }

  const numerator = weightedNeighbors.reduce(
    (sum, { similarity, rating }) => sum + similarity * rating,
    0,
  );
  const normalization = weightedNeighbors.reduce(
    (sum, { similarity }) => sum + Math.abs(similarity),
    0,
  );

  if (normalization === 0) {
    return averageRatings.get(candidateId) ?? 0;
  }

  return numerator / normalization;
};

export const ACTIVE_USER_ID = "demo-owner";

export const collaborativeFeedback: UserFeedback[] = [
  {
    userId: ACTIVE_USER_ID,
    ratings: {
      "attention-is-all-you-need": 4.9,
      "retrieval-augmented-generation": 4.7,
      "graph-rag": 4.6,
      toolformer: 4.3,
      promptbreeder: 3.9,
      "sparse-autoencoders": 4.2,
    },
  },
  {
    userId: "systems-li",
    ratings: {
      "attention-is-all-you-need": 4.8,
      flashattention: 4.5,
      "jamba-hybrid": 4.6,
      "megatron-turing-nlg": 4.4,
      "mixtral-8x7b": 4.2,
    },
  },
  {
    userId: "retrieval-wang",
    ratings: {
      "retrieval-augmented-generation": 4.9,
      "atlas-retrieval": 4.5,
      "graph-rag": 4.8,
      "retro-retrieval": 4.6,
      "speculative-decoding": 4.1,
    },
  },
  {
    userId: "agent-qa",
    ratings: {
      "react-reasoning": 4.7,
      toolformer: 4.4,
      agentbench: 4.8,
      wizardlm: 4.3,
      promptbreeder: 4.2,
    },
  },
  {
    userId: "safety-luo",
    ratings: {
      "sparse-autoencoders": 4.9,
      "claude-3": 4.4,
      "self-consistency": 4.1,
      "llama-2": 4.0,
      "chain-of-thought": 4.2,
    },
  },
  {
    userId: "prompting-niu",
    ratings: {
      promptbreeder: 4.7,
      "chain-of-thought": 4.5,
      "self-consistency": 4.6,
      "alpaca-52k": 4.0,
      "flan-zero-shot": 4.3,
    },
  },
  {
    userId: "modeling-zhang",
    ratings: {
      "jamba-hybrid": 4.5,
      "mamba-ssm": 4.4,
      "mixtral-8x7b": 4.3,
      "deepseek-v2": 4.2,
      "qwen2-72b": 4.1,
    },
  },
];

export function rankPapersForUser(
  papers: Paper[],
  feedback: UserFeedback[],
  activeUserId: string,
) {
  const itemRatings = buildItemRatings(feedback);
  const itemSimilarities = buildSimilarities(itemRatings);
  const averageRatings = buildAverageRatings(itemRatings);

  const activeProfile = feedback.find(
    (entry) => entry.userId === activeUserId,
  );
  const activeRatings = new Map<string, number>();
  if (activeProfile) {
    for (const [paperId, score] of Object.entries(activeProfile.ratings)) {
      activeRatings.set(normalizePaperId(paperId), score);
    }
  }

  return [...papers]
    .map((paper) => {
      const normalizedId = normalizePaperId(paper.id);
      const existingRating = activeRatings.get(normalizedId);
      const score =
        existingRating ??
        predictScore(
          normalizedId,
          activeRatings,
          itemSimilarities,
          averageRatings,
        );
      return { paper, score };
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.paper.title.localeCompare(right.paper.title),
    )
    .map((entry) => entry.paper);
}
