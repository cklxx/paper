import seedPapersJson from "../../data/paper_seeds.json" assert { type: "json" };
import type { SeedPaper } from "./types";

export const paperSeeds: SeedPaper[] = seedPapersJson as SeedPaper[];
