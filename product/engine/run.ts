// se.run — shell execution routed through SE (§5, §10). The engine keeps
// every run's raw result in the call log (G2: the call log IS the store);
// submit references a run record instead of the agent re-typing output.
// An engine-captured result cannot be fabricated by the agent.
import { spawnSync } from "node:child_process";
import { CallLog, type CallRecord } from "./calllog.ts";

export function runCommand(log: CallLog, command: string, cwd: string): CallRecord {
  const started = Date.now();
  const r = spawnSync(command, { shell: true, cwd, encoding: "utf8", timeout: 10 * 60 * 1000 });
  const exit = r.status ?? -1;
  return log.append({
    tool: "se.run",
    args: { command, cwd },
    ok: exit === 0,
    duration_ms: Date.now() - started,
    detail: {
      command,
      exit,
      stdout: (r.stdout ?? "").slice(-20_000),
      stderr: (r.stderr ?? "").slice(-20_000),
      ...(r.error ? { spawn_error: String(r.error) } : {}),
    },
  });
}
