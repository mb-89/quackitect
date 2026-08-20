// see dsp-benchmark-binding.md#responsibility
//
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { controlFilesPresent } from "./benchmark-guard.ts";
import { CONDITIONS, conditionsStampDirs } from "./benchmark-report.ts";
import { git } from "./gitlane.ts";
import { noteOf } from "./notes.ts";
import { SE_VERSION } from "./version.ts";

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

/** THE SUBJECT IS REWOUND AND THE MACHINE IS NOT.
 *
 *  A whole-tree rewind FAILS TO COMPILE, and the engine proved that itself
 *  rather than a reviewer noticing: an old deliverable cannot run today's
 *  checks. `project/guidance` is METHOD rather than subject, so it stays
 *  current too — that is the half the first design got wrong. */
export const REWOUND = ["project/spec"];
export const CURRENT = ["project/deliverable", "project/guidance"];

/** The parent of the commit whose subject is `iteration <id>: started`.
 *
 *  ITS LIMITS ARE FILED, not assumed:
 *  raid-asm-every-shipped-iteration-carries-a-started-commit-naming-it is
 *  deferred with its until. `markStarted` returns early when a record already
 *  carries `started:`, so a field written any other way suppresses the commit
 *  forever and the field's presence is what hides it. */
export function rewindPointFor(root: string, iteration: string): string | undefined {
  const subject = `iteration ${iteration}: started`;
  const found = git(root, "log", "--format=%H%x09%s", "--all");
  if (!found.ok) return undefined;
  const hits = found.stdout
    .split("\n")
    .map((l) => l.split("\t"))
    .filter((p) => p[1] === subject)
    .map((p) => p[0]);
  // TWO IS AS WRONG AS ZERO. Either the rewind point is unambiguous or there
  // is no rewind point, and picking one of two silently is how a benchmark
  // ends up cut at a commit nobody chose.
  if (hits.length !== 1) return undefined;
  const parent = git(root, "rev-parse", "--verify", `${hits[0]}^`);
  return parent.ok ? parent.stdout : undefined;
}

/** Every file under a tree, ignoring git's own store. */
function countFiles(dir: string): number {
  let n = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) n += countFiles(p);
    else if (statSync(p).isFile()) n += 1;
  }
  return n;
}

/** STAND THE TREE. Two commands, and the first is not optional.
 *
 *      git update-ref refs/bench/<id> <rewind-commit>
 *      git fetch --depth 1 <source> refs/bench/<id>:refs/heads/bench
 *
 *  A BARE OBJECT ID CANNOT BE FETCHED without `uploadpack.allowAnySHA1InWant`,
 *  so the rewind commit is named as a ref first.
 *
 *  THE TREE IS FETCHED, NOT EXPORTED. `git archive` leaves no `.git`, so every
 *  git verb is dead inside the result — including the ones an agent
 *  legitimately uses to read the past. A depth-1 fetch gives the working tree
 *  AND a history that simply ENDS at the rewind point, which is what makes the
 *  ceiling structural instead of checked. */
export function standRewoundTree(
  root: string,
  iteration: string,
  commit: string,
  into: string,
): { files: number; rewound: string[]; current: string[] } {
  const empty = { files: 0, rewound: [], current: [] };
  const ref = `refs/bench/${iteration}`;
  if (!git(root, "update-ref", ref, commit).ok) return empty;
  mkdirSync(into, { recursive: true });
  if (!git(into, "init", "-q").ok) return empty;
  if (!git(into, "fetch", "--depth", "1", root, `${ref}:refs/heads/bench`).ok) return empty;
  if (!git(into, "checkout", "-q", "bench").ok) return empty;
  // COUNT BEFORE THE COPY, OR THE COUNT IS OF THE COPY. This ran after the
  // loop below and therefore measured the CURRENT directories it had just
  // written, so `files > 0` was satisfied by the copy and an empty fetch
  // reported success. Reproduced against an empty root commit: 2 files, no
  // project/spec, guard passed.
  const fetched = countFiles(into);
  // THE MACHINE AND THE METHOD COME FORWARD, over whatever the old commit had.
  for (const rel of CURRENT) {
    const src = join(root, rel);
    if (!existsSync(src)) continue;
    const dst = join(into, rel);
    rmSync(dst, { recursive: true, force: true });
    cpSync(src, dst, { recursive: true });
  }
  return { files: fetched, rewound: [...REWOUND], current: [...CURRENT] };
}

/** THE ITERATION BENCHMARKED LONGEST AGO, read from the reports folder.
 *
 *  RUNS CYCLE RATHER THAN REPEATING, and the reports folder is the ONLY
 *  scheduler state there is — no clock, no queue, no separate ledger. That is
 *  the single backward crossing in the element matrix, and it is read BEFORE
 *  the binding opens: a run that has already bound cannot change which
 *  iteration it is.
 *
 *  AN ITERATION NEVER BENCHMARKED SORTS FIRST. Absence is older than any date,
 *  so a fresh archive cycles through everything once before repeating. */
export function leastRecentlyBenchmarked(root: string): string | undefined {
  const shipped = shippedIterations(root);
  if (shipped.length === 0) return undefined;
  const last = new Map<string, string>();
  const dir = join(root, reportsDirRel());
  if (existsSync(dir)) {
    for (const n of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const fm = noteOf(join(dir, n))?.frontmatter ?? {};
      const it = String(fm.iteration ?? "");
      const at = String(fm.ran_at ?? "");
      if (it === "") continue;
      const prev = last.get(it);
      if (prev === undefined || at > prev) last.set(it, at);
    }
  }
  return [...shipped].sort((a, b) => (last.get(a) ?? "").localeCompare(last.get(b) ?? "") || a.localeCompare(b))[0];
}

/** Every iteration the archive marks shipped — the pool a run draws from. */
function shippedIterations(root: string): string[] {
  const dir = join(root, "project", "spec", "iterations");
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const rec = join(dir, e.name, "record.md");
    // A RECORD IS A NOTE, so it goes through the door — one read and one parse
    // shared with every other reader of the same file.
    if (existsSync(rec) && String(noteOf(rec)?.frontmatter.status ?? "") === "shipped") out.push(e.name);
  }
  return out.sort();
}

/** Hash one directory the way the matrix hash does: name then content, sorted.
 *  Missing is "gone" rather than empty, so an absent directory cannot look
 *  identical to an empty one. */
function dirHash(root: string, rel: string): string {
  const abs = join(root, rel);
  if (!existsSync(abs)) return "gone";
  const h = createHash("sha256");
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.name === ".git" || e.name === "node_modules") continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        walk(p);
        continue;
      }
      if (!statSync(p).isFile()) continue;
      h.update(`${p.slice(abs.length)}\n`);
      h.update(readFileSync(p));
    }
  };
  walk(abs);
  return h.digest("hex").slice(0, 12);
}

/** THE STAMP IS A SET, and this is where it is taken.
 *
 *  The matrix hash alone covers `rigor_matrix/rows` and nothing else, so
 *  guidance, forms, items, methods and the engine all change what a walk costs
 *  without moving it. Every directory in `conditionsStampDirs` gets its own. */
export function conditionsStamp(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rel of conditionsStampDirs()) out[rel] = dirHash(root, rel);
  return out;
}

/** THE THREE CONDITIONS NO LOG HOLDS. They are written when a run BINDS,
 *  because nothing recovers them afterwards. */
function hostConditions(env: NodeJS.ProcessEnv): Record<string, string> {
  // ABSENCE STAYS ABSENT. These defaulted to "unknown", which is a non-empty
  // string and therefore passed `reportProblems` — so a report with no harness,
  // no model and no effort recorded clean, and the requirement's measure
  // ("reports missing any condition = 0") was met by three fields that were
  // missing. An empty string is what the guard is for.
  return {
    harness: env.SE_HARNESS ?? "",
    model: env.SE_MODEL ?? "",
    effort: env.SE_EFFORT ?? "",
  };
}

/** A RUN BINDS, OR IT REFUSES. It never binds and then refuses per request.
 *
 *  A run that cannot establish its own ceiling produces a report full of
 *  refusals that reads as a machine failure rather than as a guard, so the
 *  refusal happens once, at the earliest point where the cause is knowable,
 *  and it names the cause. */
export function benchmarkBind(root: string, opts: { iteration?: string; stop_at?: string }): BenchmarkRun | BindRefusal {
  const iteration = opts.iteration ?? leastRecentlyBenchmarked(root);
  if (iteration === undefined) return { refused: "no iteration to walk — the archive holds nothing shipped" };
  const rewind = rewindPointFor(root, iteration);
  if (rewind === undefined) {
    return { refused: `no rewind point for ${iteration} — no single commit names it as started, so the history cannot be cut` };
  }
  const tree = join(root, ".se", "bench", iteration);
  const stood = standRewoundTree(root, iteration, rewind, tree);
  if (stood.files === 0) return { refused: `the rewound tree for ${iteration} stood empty — the fetch did not take` };
  // THE POSITIVE CONTROL RUNS IN THE PRODUCT, not only in a test. An empty
  // fetch and a correct rewind both answer "not there" to everything, so a run
  // proves the tree HAS what the rewind was never meant to remove.
  const neighbour = shippedIterations(root).find((i) => i !== iteration);
  if (neighbour !== undefined && controlFilesPresent(tree, neighbour) === 0) {
    return {
      refused: `the rewound tree for ${iteration} holds no trace of ${neighbour} either — the control failed, so an empty fetch cannot be told from a correct rewind`,
    };
  }
  const conditions: Record<string, string> = {
    iteration,
    rewind,
    change_size: changeSizeOf(root, iteration),
    // "unpinned" and "gone" were sentinels too. An unpinned iteration and an
    // absent matrix are things a report must not quietly carry.
    se_version: SE_VERSION,
    ...hostConditions(process.env),
    ...conditionsStamp(root),
  };
  // THE MATRIX HASH IS KEPT AS ONE MEMBER OF THE SET, never as the answer. A
  // reader who wants the old field still finds it; the five directories beside
  // it are what stop the report claiming more than it knows.
  conditions.rigor_matrix_hash = conditions["project/deliverable/machines/rigor_matrix/rows"] ?? "";
  const run: BenchmarkRun = {
    iteration,
    rewind,
    tree,
    // THE WHOLE WALK IS THE DEFAULT, by owner ruling. A stop point is a
    // narrowing somebody asked for, never the normal case.
    stop_at: opts.stop_at ?? "shipped",
    ended_at: "",
    conditions,
  };
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(join(root, ".se", "benchmark.json"), JSON.stringify(run, null, 2), "utf8");
  return run;
}

/** The column the iteration was pinned to — the scale factor, and part of the
 *  result's name rather than a property of the run. */
function changeSizeOf(root: string, iteration: string): string {
  const pin = join(root, "project", "spec", "iterations", iteration, "machines", "seeded.json");
  if (!existsSync(pin)) return "";
  try {
    return String((JSON.parse(readFileSync(pin, "utf8")) as { change_size?: unknown }).change_size ?? "");
  } catch {
    return "";
  }
}

// THE VERSION HAS ONE SOURCE ALREADY. version.ts reads the manifest once at
// import, and it exists because the number was hardcoded in four places and
// stopped following the product. A second reader would be the fifth.

/** Ending a run records WHERE IT ACTUALLY ENDED, which is the field the whole
 *  iteration exists to collect. A run that died still leaves a result. */
export function benchmarkStop(root: string, run: BenchmarkRun, endedAt: string): BenchmarkRun {
  const done: BenchmarkRun = { ...run, ended_at: endedAt };
  const bound = join(root, ".se", "benchmark.json");
  if (existsSync(bound)) rmSync(bound, { force: true });
  // THE REF GOES WITH THE RUN. `refs/bench/<id>` is written into the LIVE repo
  // to make the rewind commit fetchable, and it used to stay there forever —
  // invisible to `git status`, so the inspection that exists to catch "a write
  // somewhere unexpected" passed straight over it.
  git(root, "update-ref", "-d", `refs/bench/${run.iteration}`);
  rmSync(run.tree, { recursive: true, force: true });
  return done;
}

/** END THE OPEN RUN, from the lane, without the caller holding the run object.
 *
 *  A RUN THAT DIED STILL LEAVES A RESULT, so this reads the bound run off disk
 *  rather than asking for it: the caller that ends a run is often not the one
 *  that opened it. */
export function benchmarkEnd(root: string, endedAt: string): Record<string, unknown> {
  const bound = join(root, ".se", "benchmark.json");
  if (!existsSync(bound)) return { refused: "no benchmark run is bound — nothing to end" };
  let run: BenchmarkRun;
  try {
    run = JSON.parse(readFileSync(bound, "utf8")) as BenchmarkRun;
  } catch {
    // THE BINDING IS UNREADABLE AND THE RUN IS STILL OVER. Refusing here would
    // leave a bound run nobody can close.
    rmSync(bound, { force: true });
    return { refused: "the bound run could not be read — the binding is cleared and the run is lost" };
  }
  const done = benchmarkStop(root, run, endedAt);
  return {
    ended: done.iteration,
    stop_at: done.stop_at,
    ended_at: done.ended_at,
    // WHERE IT WAS TOLD TO STOP AND WHERE IT ENDED ARE BOTH REPORTED, even when
    // equal — a reader cannot tell "reached the end" from "nobody recorded it"
    // when one of them is simply absent.
    reached_the_end: done.ended_at === done.stop_at,
    conditions: conditionsFor(done),
  };
}

/** Where the reports live. One place, so the guard and the report agree. */
export function reportsDirRel(): string {
  return join("project", "spec", "benchmarks");
}

export function isBound(root: string): boolean {
  return existsSync(join(root, ".se", "benchmark.json"));
}

/** The conditions a report must carry, drawn off a bound run. Named here so
 *  the binding and the report cannot drift about what the eight are. */
export function conditionsFor(run: BenchmarkRun): Record<string, string> {
  const out: Record<string, string> = {};
  for (const c of CONDITIONS) out[c] = run.conditions[c] ?? "";
  // THE STAMP SET TRAVELS WITH THEM. This used to iterate CONDITIONS alone and
  // drop every per-directory hash the binding had just computed, so a real
  // report stamped the matrix by itself — the exact claim this design calls a
  // lie in writing.
  out.stamp_covers = conditionsStampDirs()
    .map((rel) => `${rel}=${run.conditions[rel] ?? ""}`)
    .join(" ");
  return out;
}
