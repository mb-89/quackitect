// see dsp-benchmark-binding.md#responsibility
//
// NOT BUILT YET. Every function here answers neutrally so the checks fail on
// their expectation rather than on an import, which is what observe-red asks
// for: a red that reached its assertion says the design is unrealized, and a
// crash says only that the check file is broken.
import { existsSync } from "node:fs";
import { join } from "node:path";

export interface BenchmarkRun {
  iteration: string;
  rewind: string;
  tree: string;
  stop_at: string;
  ended_at: string;
  conditions: Record<string, string>;
}

export interface BindRefusal {
  refused: string;
}

/** The parent of the commit whose subject is `iteration <id>: started`. */
export function rewindPointFor(_root: string, _iteration: string): string | undefined {
  return undefined;
}

/** The iteration benchmarked longest ago, read from the reports folder — the
 *  only state a cycling run reads. */
export function leastRecentlyBenchmarked(_root: string): string | undefined {
  return undefined;
}

/** Name the rewind commit as a ref, then fetch it at depth 1. The three-way
 *  split lands here: project/spec rewound, deliverable and guidance current. */
export function standRewoundTree(
  _root: string,
  _iteration: string,
  _commit: string,
  _into: string,
): { files: number; rewound: string[]; current: string[] } {
  return { files: 0, rewound: [], current: [] };
}

/** A run binds, or it refuses. It never binds and then refuses per request. */
export function benchmarkBind(_root: string, _opts: { iteration?: string; stop_at?: string }): BenchmarkRun | BindRefusal {
  return { refused: "not built" };
}

export function benchmarkStop(_root: string, _run: BenchmarkRun): BenchmarkRun {
  return _run;
}

/** Where the reports live. One place, so the guard and the report agree. */
export function reportsDirRel(): string {
  return join("project", "spec", "benchmarks");
}

export function isBound(root: string): boolean {
  return existsSync(join(root, ".se", "benchmark.json"));
}
