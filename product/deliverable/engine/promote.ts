// ENGINE PROMOTION (i12). The engine is the TOOL, not the product under test,
// and a shared judge cannot be per-iteration: if one agent's gates carry the
// review rounds and another's do not, the two iterations are judged by
// different machines and a gate stops meaning one thing. So engine changes are
// a distinct class from product changes — they land on trunk EARLY, under their
// own discipline, while everything else stays isolated in its worktree.
//
// WHY IT EXISTS: the shim spawns its engine child from TRUNK, so an iteration
// could never run the engine it was building
// (se.raid-an-iteration-cannot-run-its-own-build) — which cost real time six
// times in one day. The obvious alternative, sourcing the child from the open
// worktree, dies on parallel agents for the reason above.
//
// THE RULES, enforced here rather than remembered:
//   1. TRUNK CURRENT FIRST. Two agents promoting independently collide, so
//      trunk must not be behind its upstream (owner ruling: pull, then work in
//      your changes, then push).
//   2. THE WHOLE SUITE GREEN IN TRUNK — after the copy, before the commit. Not
//      in the worktree: in the tree that will actually run.
//   3. ENGINE FILES ONLY. A promotion is not a way to ship product, spec or
//      evidence without a close.
//   4. ALL OR NOTHING. On any failure trunk is restored exactly as it was.
//
// The honest cost: engine code reaches trunk before its iteration's gates have
// reviewed it. That is the price of a shared judge; the suite is the guard.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { Rejection } from "./errors.ts";

/** What a promotion may carry. Anything else belongs to the close. */
const PROMOTABLE = /^product\/deliverable\/(engine|bin)\/.*\.ts$|^product\/deliverable\/tests\/.*\.ts$|^product\/deliverable\/package(-lock)?\.json$/;

export interface SuiteResult {
  passed: number;
  failed: number;
  /** The names of failing tests — a refusal must say WHICH, not just how many. */
  failing?: string[];
}

export interface PromoteResult {
  promoted: string[];
  commit: string;
  tests: SuiteResult;
}

function git(root: string, args: string[]): { code: number; stdout: string; stderr: string } {
  try {
    return { code: 0, stdout: execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 }).trim(), stderr: "" };
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return { code: err.status ?? -1, stdout: (err.stdout ?? "").trim(), stderr: (err.stderr ?? "").trim() };
  }
}

/**
 * Promote engine changes from an iteration's worktree to trunk.
 * `runSuite` is injected so a test can drive this without a real suite run.
 */
export function promoteEngine(
  trunk: string,
  worktree: string,
  files: string[],
  reason: string,
  opts: { runSuite?: (cwd: string) => SuiteResult } = {},
): PromoteResult {
  if (files.length === 0) {
    throw new Rejection({
      clause: "SE-C-071",
      expected: "at least one engine file to promote",
      got: "an empty promotion",
      remedy: { tool: "se_promote", args: { files: ["product/deliverable/engine/<file>.ts"], reason: "<why the running lane needs this now>" }, note: "name the files whose behaviour the lane needs before the close" },
      source: "engine/promote.ts",
    });
  }

  // RULE 3 — engine files only.
  const foreign = files.filter((f) => !PROMOTABLE.test(f.replaceAll("\\", "/")));
  if (foreign.length > 0) {
    throw new Rejection({
      clause: "SE-C-071",
      expected: "engine, bin, test or package files only",
      got: foreign.join(", "),
      remedy: { tool: "se_loop_next", args: {}, note: "product, spec and evidence ride the CLOSE — a promotion exists so the running lane gains behaviour, not so work can skip its gates" },
      source: "engine/promote.ts",
    });
  }

  // RULE 4 — capture trunk exactly, so any failure is fully reversible.
  const backup = new Map<string, string | null>();
  for (const rel of files) {
    const t = join(trunk, rel);
    backup.set(rel, existsSync(t) ? readFileSync(t, "utf8") : null);
  }
  const restore = (): void => {
    for (const [rel, content] of backup) {
      const t = join(trunk, rel);
      if (content === null) rmSync(t, { force: true });
      else writeFileSync(t, content, "utf8");
    }
  };

  try {
    // RULE 1 — trunk current. Measuring against a stale trunk proves nothing
    // about the tree that will actually run.
    const dirty = git(trunk, ["status", "--porcelain", "--", ...files]).stdout;
    if (dirty !== "") throw new Error(`trunk already has uncommitted changes in these files:\n${dirty.slice(0, 300)}`);
    const branch = git(trunk, ["rev-parse", "--abbrev-ref", "HEAD"]).stdout;
    if (git(trunk, ["fetch", "--quiet"]).code === 0) {
      const behind = git(trunk, ["rev-list", "--count", `${branch}..@{upstream}`]);
      if (behind.code === 0 && Number(behind.stdout) > 0) {
        throw new Error(`trunk is ${behind.stdout} commit(s) behind upstream — pull before promoting, or two agents collide`);
      }
    }

    for (const rel of files) {
      const src = join(worktree, rel);
      if (!existsSync(src)) throw new Error(`not in the worktree: ${rel}`);
      const dst = join(trunk, rel);
      mkdirSync(dirname(dst), { recursive: true });
      copyFileSync(src, dst);
    }

    // A promotion carrying package.json brings a DEPENDENCY with it, and the
    // suite cannot load a module that is not installed. Install AFTER the copy
    // — installing before would resolve against the old manifest and leave
    // every importer crashing, which reads as "the engine is broken" rather
    // than "the dependency is missing".
    if (files.some((f) => f.endsWith("package.json"))) {
      try {
        execFileSync("npm", ["install", "--no-audit", "--no-fund"], { cwd: join(trunk, "product", "deliverable"), encoding: "utf8", shell: true, stdio: "pipe" });
      } catch (e) {
        throw new Error(`the promoted dependencies could not be installed in trunk: ${String((e as Error).message).slice(0, 200)}`);
      }
    }

    // RULE 2 — green IN TRUNK, after the copy, before the commit.
    const tests = (opts.runSuite ?? defaultSuite)(join(trunk, "product", "deliverable"));
    if (tests.failed > 0) {
      // R19 applies to this refusal too: NAME THE FACT. "1 failing" sends the
      // caller hunting; the failing test's name sends them to the fix.
      const which = tests.failing !== undefined && tests.failing.length > 0 ? `: ${tests.failing.slice(0, 5).join("; ")}` : "";
      throw new Error(`the suite is RED in trunk (${tests.failed} failing)${which} — trunk keeps the engine it had`);
    }

    // Not join(trunk, ".git", ...): trunk's git dir is not always a directory
    // at that path (worktrees, submodules, a repo root above `trunk`), and the
    // promotion died there AFTER a green 74-second suite run. A temp file has
    // no such assumption. -F also keeps the message out of argv, where a shell
    // would tear it into pathspecs.
    const msgPath = join(tmpdir(), `se-promote-${process.pid}.txt`);
    writeFileSync(
      msgPath,
      [
        `engine promotion: ${reason}`,
        "",
        "Promoted from an open iteration's worktree so the running lane gains this",
        "behaviour now rather than at the close. The engine is a SHARED judge: it",
        "cannot be per-iteration, or parallel agents are judged by different machines.",
        "",
        `Files (${files.length}):`,
        ...files.map((f) => `  ${f}`),
        "",
        `Suite green in trunk before this commit: ${tests.passed} passed, 0 failed.`,
        "The identical content sits on the iteration branch, so its close merges cleanly.",
      ].join("\n"),
      "utf8",
    );
    git(trunk, ["add", "--", ...files]);
    const c = git(trunk, ["commit", "-F", msgPath]);
    rmSync(msgPath, { force: true });
    if (c.code !== 0) throw new Error(`the promotion could not be committed: ${c.stderr.slice(0, 200)}`);

    return { promoted: files, commit: git(trunk, ["rev-parse", "--short", "HEAD"]).stdout, tests };
  } catch (e) {
    restore();
    throw new Rejection({
      clause: "SE-C-071",
      expected: "a promotable change: trunk current, engine files only, suite green in trunk",
      got: String((e as Error).message).slice(0, 300),
      remedy: { tool: "se_run", args: { command: "cd product/deliverable && npm test" }, note: "fix it in the worktree and promote again — TRUNK IS UNCHANGED and nothing was committed" },
      source: "engine/promote.ts",
    });
  }
}

/** Exported ONLY so a test can drive the real runner — the injected `runSuite`
 * in every promotion test meant this function, the one that actually decides,
 * was the single uncovered line in the file. It is where the bug was. */
export function defaultSuite(cwd: string): SuiteResult {
  // ENUMERATE the files rather than handing the runner a directory. `node
  // --test tests/` resolved "tests" as a MODULE here and died with
  // MODULE_NOT_FOUND — which the counter then read as one failing test named
  // "tests", so every promotion refused on a runner bug while reporting a red
  // suite. A refusal that blames the wrong thing is worse than no refusal.
  const files = readdirSync(join(cwd, "tests"))
    .filter((f) => f.endsWith(".test.ts"))
    .map((f) => `tests/${f}`)
    .sort();
  if (files.length === 0) return { passed: 0, failed: 1, failing: ["no test files found — the suite cannot vouch for anything"] };
  // NODE_TEST_CONTEXT is inherited by any child, and a node test runner that
  // sees it declines to run files at all ("called recursively") — reporting
  // zero tests and zero failures, which reads as GREEN. A promotion that runs
  // no tests and calls it green is the worst failure mode this file has, so
  // the variable is cleared rather than trusted.
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  // SE_SESSION_FILE points at the LIVE session's admission. A suite that
  // inherits it is verifying against a session that is already admitted, so
  // any test asserting that an unadmitted call is refused sees the wrong
  // world. run.ts scrubs it from every spawned command for this reason; the
  // suite runner is a spawned command too.
  delete env.SE_SESSION_FILE;
  try {
    const r = countTests(execFileSync(process.execPath, ["--test", "--test-concurrency=1", ...files], { cwd, encoding: "utf8", maxBuffer: 1 << 26, env }));
    // A run that exits 0 having executed NOTHING is not a pass. Silence is not
    // evidence, and this is the only place that decides whether trunk changes.
    if (r.passed + r.failed === 0) return { passed: 0, failed: 1, failing: [`${files.length} test files were found but none RAN — the runner reported nothing`] };
    return r;
  } catch (e) {
    const counted = countTests((e as { stdout?: string }).stdout ?? "");
    // A crashed run with no counts is a FAILURE, never an unknown.
    return counted.passed + counted.failed === 0 ? { passed: 0, failed: 1, failing: ["the run crashed before reporting"] } : counted;
  }
}

function countTests(raw: string): SuiteResult {
  // Node's reporter colours its output; the escape codes sit BETWEEN the cross
  // and the test name, so any pattern written against the visible text silently
  // matches nothing. Strip them before parsing rather than pattern around them.
  const out = raw.replace(/\[[0-9;]*m/g, "");
  const pass = /pass (\d+)/.exec(out);
  const fail = /fail (\d+)/.exec(out);
  // Names after the "failing tests:" header, so each is reported once rather
  // than twice (the reporter prints failures inline and again in the summary).
  const at = out.indexOf("failing tests:");
  const tail = at === -1 ? out : out.slice(at);
  const failing = [...tail.matchAll(/✖\s+(.+?)\s*\(\d/g)].map((m) => m[1].trim());
  return { passed: Number(pass?.[1] ?? 0), failed: Number(fail?.[1] ?? 0), failing: [...new Set(failing)] };
}
