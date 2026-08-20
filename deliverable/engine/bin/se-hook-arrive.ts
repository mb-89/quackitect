// se-hook-arrive — the SessionStart hook that makes a CLOUD arrival automatic.
//
// WHY IT LIVES IN THE ROOT .claude/settings.json AND NOT IN THE CAGE. The
// cage's own SessionStart hook is the right hook for Arrival B and cannot help
// Arrival A at all: `.claude/settings.json` is placed BY the arrival,
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
// see dsp-the-arrival.md#the-hook-is-invoked-from-wherever-the-host-sets
const ROOT = resolve(process.env.SE_ARRIVE_ROOT ?? join(HERE, "..", "..", ".."));

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
  say("[se] no se-arrive.ts beside this hook — read guidance/method/cloud-runner.md and arrive by hand");
  process.exit(0);
}

// see dsp-the-arrival.md#the-dial-is-the-owners
const autonomy = process.env.SE_AUTONOMY ?? "tactical";
const r = spawnSync(process.execPath, [arrive, "--root", ROOT, "--autonomy", autonomy], { encoding: "utf8", cwd: ROOT });
const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();

if (r.error !== undefined || r.status !== 0) {
  say("[se] ARRIVAL DID NOT COMPLETE — you are not caged, and that is expected. Read guidance/method/cloud-runner.md.");
  if (out !== "") say(out);
  process.exit(0);
}

say(out);
say(ARRIVED);
