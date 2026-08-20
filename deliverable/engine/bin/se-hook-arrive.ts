// se-hook-arrive — the SessionStart hook that makes a CLOUD arrival automatic.
//
// WHY IT LIVES IN THE ROOT .claude/settings.json. That file is COMMITTED, so
// it is the only hook a fresh cloud clone can fire. A hook placed by the
// arrival cannot help the session that performs the arrival.
//
// .mcp.json IS COMMITTED TOO, since 2026-08-20. Before that it was not, and
// only the settings file was — so a cloud clone got the cage and no lane, which
// denied every native tool and supplied nothing to replace them. Committing one
// of the pair and not the other is the whole of that failure.
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
import { existsSync, readFileSync } from "node:fs";
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

// THE VERDICT, AND IT IS THE LAST LINE ON PURPOSE.
//
// A cloud session once printed six green lines and was dead: the cage had
// landed, the lane had not, and every native tool was denied with nothing to
// replace it. Green lines for steps that succeeded are worse than useless when
// the thing they were building never arrived.
//
// WHAT THIS CAN AND CANNOT CHECK. It reads the two files the client needs. It
// CANNOT ask the client whether it attached the server, because the client has
// already built its list by the time a hook runs. So this reports the
// precondition, and names the one check only the agent can make.
function laneConfigProblem(): string | undefined {
  const mcp = join(ROOT, ".mcp.json");
  if (!existsSync(mcp)) return ".mcp.json is missing at the project root";
  try {
    const parsed = JSON.parse(readFileSync(mcp, "utf8")) as { mcpServers?: Record<string, unknown> };
    if (parsed.mcpServers?.se === undefined) return ".mcp.json names no `se` server";
  } catch {
    return ".mcp.json is not readable JSON";
  }
  if (!existsSync(join(ROOT, ".claude", "settings.json"))) return ".claude/settings.json is missing, so the cage never lands";
  return undefined;
}

const problem = laneConfigProblem();
if (problem !== undefined) {
  say("");
  say("[se] THE LANE WILL NOT ATTACH.");
  say(`[se] ${problem}`);
  say("[se] Both files are committed. A checkout missing one is the failure where the cage lands and the lane does not.");
  say("[se] NO PROJECT WORK IS LEGAL until it is fixed. Report this and stop.");
  process.exit(0);
}

say("");
say("[se] lane config is in place. CHECK IT YOURSELF ON YOUR FIRST TURN: if you hold no se_pull tool, the lane did not attach.");
say("[se] In that case stop, say which check you ran, and do not read the project any other way.");
say(ARRIVED);
