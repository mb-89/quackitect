// se.run — shell execution routed through SE (§5, §10). The engine keeps
// every run's raw result in the call log (G2: the call log IS the store);
// submit references a run record instead of the agent re-typing output.
// An engine-captured result cannot be fabricated by the agent.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { CallLog, type CallRecord } from "./calllog.ts";
import { readJsonFile } from "./jsonio.ts";
import { layout } from "./layout.ts";

export interface RunHandle {
  ref: string;
}

export type RunState =
  | { status: "running" }
  | { status: "done"; ok: boolean; exit: number; stdout: string; stderr: string };

/**
 * Start a command in the background and return a handle within the 1s law.
 * The detached wrapper writes its own done-file, so completion survives an
 * engine hot-restart; runStatus reads the file, never a callback.
 */
export function startRun(root: string, log: CallLog, command: string, cwd: string): RunHandle {
  const ref = `run-${randomBytes(6).toString("hex")}`;
  const dir = join(layout.seDir(root), "runs");
  mkdirSync(dir, { recursive: true });
  const doneFile = join(dir, `${ref}.json`);
  const script = [
    `const {spawnSync}=require("node:child_process");`,
    `const {writeFileSync}=require("node:fs");`,
    `const r=spawnSync(process.argv[1],{shell:true,cwd:process.argv[2],encoding:"utf8",timeout:600000});`,
    `writeFileSync(process.argv[3],JSON.stringify({ok:(r.status??-1)===0,exit:r.status??-1,stdout:(r.stdout??"").slice(-20000),stderr:(r.stderr??"").slice(-20000)}));`,
  ].join("");
  const env = { ...process.env };
  delete env.SE_SESSION_FILE;
  const child = spawn(process.execPath, ["-e", script, command, cwd, doneFile], { detached: true, stdio: "ignore", env });
  child.unref();
  log.append({ tool: "se.run.start", args: { command, cwd, run: ref }, ok: true, duration_ms: 0 });
  return { ref };
}

export function runStatus(root: string, ref: string): RunState {
  const doneFile = join(layout.seDir(root), "runs", `${ref}.json`);
  if (!existsSync(doneFile)) return { status: "running" };
  return { status: "done", ...readJsonFile<{ ok: boolean; exit: number; stdout: string; stderr: string }>(doneFile) };
}

export function runCommand(log: CallLog, command: string, cwd: string): CallRecord {
  const started = Date.now();
  // The session file is the shim↔engine contract; commands the engine runs
  // (verify batteries) must not inherit the running session's admission.
  const env = { ...process.env };
  delete env.SE_SESSION_FILE;
  const r = spawnSync(command, { shell: true, cwd, encoding: "utf8", timeout: 10 * 60 * 1000, env });
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
