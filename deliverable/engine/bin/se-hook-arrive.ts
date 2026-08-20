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
import { spawn, spawnSync } from "node:child_process";
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
// IT SPAWNS THE LANE AND SHAKES ITS HAND. An earlier version only stat-ed the
// two files, and both existed on a cloud run where the lane was dead — so it
// printed "lane config is in place" over exactly the failure it was added to
// catch. A file existing proves a file exists and nothing else.
//
// WHAT IT STILL CANNOT DO is ask the CLIENT whether it attached, because the
// client built its list before any hook ran. So the agent's own check stays
// the last word, and the line below tells it so.
interface ServerSpec {
  command?: unknown;
  args?: unknown;
}

async function laneProblem(): Promise<string | undefined> {
  const mcp = join(ROOT, ".mcp.json");
  if (!existsSync(mcp)) return ".mcp.json is missing at the project root";
  let command: string;
  let args: string[];
  try {
    const parsed = JSON.parse(readFileSync(mcp, "utf8")) as { mcpServers?: Record<string, ServerSpec> };
    const se = parsed.mcpServers?.se;
    if (se === undefined) return ".mcp.json names no `se` server";
    if (typeof se.command !== "string") return ".mcp.json's `se` server names no command to spawn";
    command = se.command;
    args = Array.isArray(se.args) ? se.args.map(String) : [];
  } catch {
    return ".mcp.json is not readable JSON";
  }
  if (!existsSync(join(ROOT, ".claude", "settings.json"))) return ".claude/settings.json is missing, so the cage never lands";

  // IT WAITS FOR THE ANSWER, NEVER FOR THE EXIT. A lane that works keeps
  // running, so waiting for the process to end waits for the timeout every
  // time. An earlier version used spawnSync and would have stalled every
  // session start by three minutes while the check passed.
  //
  // THE TIMEOUT IS GENEROUS BECAUSE THE BOOT MAY INSTALL. A stdio server is
  // allowed to take as long as it likes to answer; it is not allowed to die.
  const initialize = `${JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "se-boot-check", version: "1" } },
  })}\n`;
  return await new Promise<string | undefined>((resolve) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    let settled = false;
    const finish = (verdict: string | undefined): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        child.kill();
      } catch {
        // it is already gone, which is the same outcome
      }
      resolve(verdict);
    };
    const tail = (): string => {
      const t = err.trim().split("\n").slice(-3).join(" ").slice(0, 300);
      return t === "" ? "" : ` — ${t}`;
    };
    const timer = setTimeout(() => finish(`the lane did not answer initialize within three minutes${tail()}`), 180_000);
    child.stdout.on("data", (d: Buffer) => {
      out += String(d);
      if (out.includes('"result"')) finish(undefined);
    });
    child.stderr.on("data", (d: Buffer) => {
      err += String(d);
    });
    child.on("error", (e: Error) => finish(`the lane could not be spawned: ${e.message}`));
    child.on("exit", (code) =>
      finish(out.includes('"result"') ? undefined : `the lane exited (${String(code)}) without answering initialize${tail()}`),
    );
    child.stdin.write(initialize);
  });
}

const problem = await laneProblem();
if (problem !== undefined) {
  say("");
  say("[se] THE LANE WILL NOT ATTACH.");
  say(`[se] ${problem}`);
  say("[se] The cage may still have landed, which denies every native tool and gives you nothing to replace them.");
  say("[se] NO PROJECT WORK IS LEGAL until it is fixed. Report this and stop.");
  process.exit(0);
}

say("");
say(
  "[se] the lane answered a handshake. CHECK IT YOURSELF ON YOUR FIRST TURN: if you hold no se_pull tool, the client still did not attach.",
);
say("[se] In that case stop, say which check you ran, and do not read the project any other way.");
say(ARRIVED);
