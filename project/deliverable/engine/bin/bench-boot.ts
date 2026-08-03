// WHERE DOES BOOT'S TIME GO. Run it, do not argue about it.
//
// This exists because the answer kept being INHERITED rather than measured.
// A number travelled between sessions, got quoted as a finding, and drove a
// design decision before anyone had reproduced it. Run this instead.
//
//   node engine/bin/bench-boot.ts
//
// It times the stages a boot walk is made of, separately, so the answer is
// never "boot is slow" but "this stage is, by this much".
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { freshRoot, readEverything } from "../../tests/helpers.ts";
import { compileMachineCached } from "../machines/compile.ts";
import { mainMachinePath, Session } from "../session.ts";
import { expList } from "../worktree.ts";

const ms = (): number => Number(process.hrtime.bigint() / 1000000n);

function time<T>(label: string, fn: () => T): T {
  const a = ms();
  const out = fn();
  rows.push({ stage: label, ms: ms() - a });
  return out;
}

const rows: { stage: string; ms: number }[] = [];

// THE STAGES, in the order a boot walk pays them.
const root = time("freshRoot (borrow the template)", () => freshRoot());

// One git invocation, measured on its own. Every generated container asks
// for the open records, and on Windows a process spawn is not free.
time("git --version (one bare spawn)", () => spawnSync("git", ["--version"], { encoding: "utf8", windowsHide: true }));
// A TEST ROOT IS NOT A GIT REPO, and the walk swallows that. So the cost
// here is a git process spawned, failed and thrown away — paid every time a
// generated container is asked what stands open.
time("expList (the open records, via git)", () => {
  try {
    return expList(root);
  } catch {
    return [];
  }
});

// The drawing. Cached against content, so the second call should be free —
// if it is not, the cache key is wrong and every pull recompiles.
time("compile main.canvas (cold)", () => compileMachineCached(root, mainMachinePath(root)));
time("compile main.canvas (warm)", () => compileMachineCached(root, mainMachinePath(root)));

const session = new Session(root);
session.setAutonomy(1);
session.setTarget("idle");

// THE WALK ITSELF, pull by pull. A `read` answer carries one document and
// the next arrives only once this one is proven, so the count of pulls is
// the count of documents plus the hops.
console.log(`SE_SELFTEST_SKIP=${String(process.env.SE_SELFTEST_SKIP ?? "(unset)")}\n`);

// THE ROUTE, ON ITS OWN. A `read` pull asks what the whole way to the target
// demands, and answering that expands the graph. Expanding a generated
// container REGENERATES it, and generating one asks git what stands open.
// If the cost is here, it is paid again on every single pull.
time("route to idle (1st)", () => session.route("idle"));
time("route to idle (2nd)", () => session.route("idle"));
time("route to idle (3rd)", () => session.route("idle"));
let pulls = 0;
const walkStart = ms();
for (let i = 0; i < 40; i++) {
  // READING AND WALKING ARE TIMED APART. They are different costs with
  // different fixes, and one number covering both is how this went
  // undiagnosed.
  const a = ms();
  await readEverything(session);
  const b = ms();
  const r = (await session.pull()) as { pull?: string };
  const c = ms();
  pulls++;
  rows.push({ stage: `  ${pulls}: reading`, ms: b - a });
  rows.push({ stage: `  ${pulls}: pull (${String(r.pull)})`, ms: c - b });
  if (session.active()[0] === "idle") break;
}
const walk = ms() - walkStart;

const width = Math.max(...rows.map((r) => r.stage.length));
for (const r of rows) console.log(`${r.stage.padEnd(width)}  ${String(r.ms).padStart(7)} ms`);
console.log(`${"".padEnd(width)}  ${"-".repeat(10)}`);
console.log(`${`WHOLE BOOT WALK (${pulls} pulls)`.padEnd(width)}  ${String(walk).padStart(7)} ms`);
