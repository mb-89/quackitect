// se-hook-arrive — the SessionStart hook that makes a CLOUD arrival automatic.
//
// WHY IT LIVES IN THE ROOT .claude/settings.json AND NOT IN THE CAGE. The
// cage's own SessionStart hook is the right hook for Arrival B and cannot help
// Arrival A at all: `project/.claude/settings.json` is placed BY the arrival,
// so a session that has not arrived yet never reads it. The root settings file
// is committed, so it is the only hook a fresh cloud clone can fire.
//
// WHAT IT REPLACES. Prose. cloud-runner.md described five acts and every cloud
// run performed them by hand. MEASURED on the i35 run, 2026-08-17: most of an
// hour before the first se_pull, spent on a runtime, an install, a shallow
// clone with no `main`, a cage, and a hand-written JSON-RPC client. None of
// that is judgment, so none of it should be an agent's problem.
//
// IT NEVER FAILS THE SESSION. A hook that breaks a session start is worse than
// the hand-work it saves, so every ending here is a printed line and exit 0.
// An agent that reads "arrive: FAILED" still has its native tools and the card.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
// THE GREETING IS SHARED WITH THE CAGED HOOK, se-hook-start. Both used to
// carry their own copy of the pull instruction, which is two sources for one
// text (2026-08-18).
import { ARRIVED } from "../pullnotice.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
// The hook is invoked from wherever the host sets cwd, so the root is derived
// from this file's own location rather than trusted from the environment.
// SE_ARRIVE_ROOT OVERRIDES IT, AND ONLY THE SUITE USES IT. Without an override
// this hook is untestable in the one way that matters: its own tests would run
// the arrival against the REAL repository, place a cage there and start a lane
// beside the one the walk is using. That happened on 2026-08-17 — two lanes came
// up on one clone and the walk reset — and the case still went green, because it
// was checking the exit code of a run against the wrong tree.
const ROOT = resolve(process.env.SE_ARRIVE_ROOT ?? join(HERE, "..", "..", "..", ".."));

function say(line: string): void {
  process.stdout.write(`${line}\n`);
}

// THE OPT-OUT IS DELIBERATE AND LOUD. A developer opening this repository on
// their own machine has an editor that places the cage for them, and starting
// a second lane under them would fight it.
if (process.env.SE_NO_ARRIVE === "1") {
  say("[se] arrival skipped — SE_NO_ARRIVE=1");
  process.exit(0);
}

const arrive = join(HERE, "se-arrive.ts");
if (!existsSync(arrive)) {
  say("[se] no se-arrive.ts beside this hook — read project/guidance/method/cloud-runner.md and arrive by hand");
  process.exit(0);
}

// THE DIAL IS THE OWNER'S, AND THE DEFAULT IS NOW TACTICAL EVERYWHERE (owner
// ruling 2026-08-18). It used to rest at operational, and operational cannot
// enter a gate — gate-kickoff is the first gate of every iteration, so an
// unattended run stopped at the first milestone every time. That is how the
// i15 run and the first half of the i35 run both stopped.
//
// TACTICAL IS EXACTLY ENOUGH AND NO MORE. A gate is the heaviest state inside
// an iteration; retros, overhauls and seeding are strategic and stay with the
// person. SE_AUTONOMY overrides it, by NAME.
const autonomy = process.env.SE_AUTONOMY ?? "tactical";
const r = spawnSync(process.execPath, [arrive, "--root", ROOT, "--autonomy", autonomy], { encoding: "utf8", cwd: ROOT });
const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();

if (r.error !== undefined || r.status !== 0) {
  say("[se] ARRIVAL DID NOT COMPLETE — you are not caged, and that is expected. Read project/guidance/method/cloud-runner.md.");
  if (out !== "") say(out);
  process.exit(0);
}

say(out);
say(ARRIVED);
