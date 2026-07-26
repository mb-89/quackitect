// The Stop hook — the agent's zero-token waiter (owner ruling 2026-07-26).
// The caged agent cannot run background processes (Bash is denied, MCP is
// synchronous), but the HARNESS can: when the agent ends its turn, Claude
// Code runs this hook. If the agent PARKED (se_tick {park: true} — waiting
// on the threshold, or idle with nothing to do), this process quietly
// long-polls the se server. No API calls, no tokens. When the human's
// hand moves (slider, tick, check), the hook BLOCKS the stop with a
// message — the agent wakes with the news and continues. If nothing moves
// within the budget, the stop proceeds: the agent has already told the
// user to say "continue" when they change something.
//
// Wired in workspace/.claude/settings.json (Stop hook, generous timeout).
// Env: SE_MIRROR_PORT (default 7333), SE_STOP_WAIT_MS (default 900000).

async function api(path: string): Promise<Record<string, unknown> | undefined> {
  const port = Number(process.env.SE_MIRROR_PORT ?? 7333);
  try {
    const r = await fetch(`http://localhost:${port}${path}`);
    return (await r.json()) as Record<string, unknown>;
  } catch {
    return undefined; // no server — never hold the stop hostage
  }
}

// Drain the hook payload (Claude Code pipes JSON, then closes stdin).
let raw = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) raw += chunk;
void raw;

const alive = await api("/api/alive");
if (alive === undefined || alive.status === "closed" || alive.parked !== true) {
  process.exit(0); // nothing is waiting on the machine — stop normally
}

const budget = Number(process.env.SE_STOP_WAIT_MS ?? 900_000);
const deadline = Date.now() + budget;
while (Date.now() < deadline) {
  const chunk = Math.min(30_000, deadline - Date.now());
  const a = await api(`/api/wait?ms=${chunk}`);
  if (a === undefined || a.status === "closed") process.exit(0);
  if (a.changed === true) {
    process.stdout.write(JSON.stringify({
      decision: "block",
      reason: "[se] the machine moved under you — the user's slider, tick, or check. Call se_tick with no arguments, read the new position, and continue walking. If you are still held, report and park again.",
    }));
    process.exit(0);
  }
}
process.exit(0); // budget spent — the user was told to say "continue"
