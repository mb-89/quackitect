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

const HERE = dirname(fileURLToPath(import.meta.url));
// The hook is invoked from wherever the host sets cwd, so the root is derived
// from this file's own location rather than trusted from the environment.
const ROOT = resolve(HERE, "..", "..", "..", "..");

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

// THE DIAL IS THE OWNER'S, AND AN UNATTENDED BOX IS THE CASE WHERE THE
// DEFAULT IS WRONG. At 0.4 a tactical gate answers `wait` for a human who is
// not there, which is how the i15 run and the first half of the i35 run both
// stopped. SE_AUTONOMY is how the owner sets it for a cloud environment, and
// the default stays where it is for everybody else.
const autonomy = process.env.SE_AUTONOMY ?? "0.4";
const r = spawnSync(process.execPath, [arrive, "--root", ROOT, "--autonomy", autonomy], { encoding: "utf8", cwd: ROOT });
const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();

if (r.error !== undefined || r.status !== 0) {
  say("[se] ARRIVAL DID NOT COMPLETE — you are not caged, and that is expected. Read project/guidance/method/cloud-runner.md.");
  if (out !== "") say(out);
  process.exit(0);
}

say(out);
say(
  "[se] THE LANE IS UP AND YOU ARE THE AGENT ON IT. Your FIRST action is se_pull with no payload — `node .se/se-call.mjs se_pull` if you have no se_ tools of your own.\n" +
    "The machine answers with one instruction: read (the document rides along; prove names its last words — read it, then pull again with form:{read:...}), fill (return the form on the next pull as form:{...}, finish with {submit:true}), choose (answer as form:{choice:...}, and only where one was offered), do (do what the guidance asks, then pull), or wait (say plainly WHICH step waits and stop — the dial alone cannot wake you).\n" +
    "You carry no hashes and choose nothing unasked. Pull, do, pull again. A pull that answers `do` and does not move wants an se_aim at where you are going. Show any banner to the user VERBATIM.",
);
