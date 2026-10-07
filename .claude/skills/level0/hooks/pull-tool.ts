// The plugin's one hook module: the bridgehead, then the pull as a tool. A
// shell verb reaches no agent, and the hook process does, so the spawn runs
// here. The tool asks no model, so a hand-back answers the same way twice.
// [[spec/tickets/the-judge-leaves-the-code]]

import type { AgentSpawnArgs, EngineInterface, On, PluginOptions, ToolSpec } from "claude-code";
import {
  binaryOf,
  callsIndexTool,
  isIndexTool,
  RUNNING,
  registersIndexTools,
  windowsOf,
} from "../lib/index-tools.js";
import { PULL_CALL, pullSpec, SESSION, sessionOf, spawnPromptIn } from "../lib/pull.js";
// One plugin takes one module, so this one calls the bridgehead's register. It imports nothing, which is why the call runs this way. [[spec/design_output/work#an-experiment-decides]]
import { register as bridgehead } from "./level0.ts";
import { failureOf, type Spawned } from "./shape.ts";

// The scripts folder the binary's verb road takes, as RUNME.sh hands it over. [[spec/tickets/cli-js-leaves]]
const SCRIPTS = "src/scripts";
// The binary stands under the method root, which a project root holds nowhere, so the call names it whole. [[spec/design_output/vehicle#the-work-root-inherits]]
let cli = [binaryOf(".", false), "verb", `./${SCRIPTS}`];
// The verb and the flag `PullArgvOf` in src/pull/pull.go reads, fixed while the argv behind them moves. [[spec/design_output/pull#the-hand-out]]
const PULL = ["ticket", "pull"];
const TOOL = "--tool";
const BACKGROUND =
  "The hand works in the background. Take the next item, and pull again once it answers.";

export function register(on: On, options: PluginOptions): void {
  const method = String(options?.method ?? "").replace(/[\\/]+$/, "");
  const bin = binaryOf(method || ".", windowsOf(method));
  cli = [bin, "verb", `${method || "."}/${SCRIPTS}`];
  let indexTools: Awaited<ReturnType<typeof registersIndexTools>> = [];
  // The index tools answer here, before the bridgehead routes a served tool to the server. [[spec/tickets/the-hook-registers-index-tools]]
  on("tool.call", async ($, e, next) =>
    isIndexTool(e?.tool)
      ? { result: await callsIndexTool(doorsOf($), bin, indexTools, e) }
      : next(e),
  );
  // The engine takes one session start a module, so the bridgehead registers none and this one registers the pull beside the index tools. [[spec/design_output/level0#the-bridgehead-starts-it-too]] [[spec/tickets/level0-tools-leave-the-bridge]]
  bridgehead(on, options);
  on("session.start", async ($, e, next) => {
    try {
      await $.tool.register(pullSpec());
    } catch {}
    indexTools = await registersIndexTools(doorsOf($), bin);
    // [[spec/design_output/pull#the-hand-and-the-hold]]
    await wrote($, sessionOf(e));
    return next(e);
  });

  on("tool.call", { tool: PULL_CALL }, async ($, e, _next) => {
    const answer = await pulled($, e);
    // The hand works in the background, and the lead takes the next item. [[spec/tickets/the-hook-awaits-the-spawn]]
    const prompt = spawnPromptIn(answer);
    if (!prompt) return { result: answer };
    const said = (await spawned($, prompt)) || BACKGROUND;
    return { result: `${answer}\n\n${said}` };
  });
}

// The process and tool doors the index tools read, since the engine follows $ across no import. [[spec/tickets/the-hook-registers-index-tools]]
function doorsOf($: EngineInterface) {
  return {
    process: { run: (argv: readonly string[]) => $.process.run(argv) },
    tool: { register: (spec: ToolSpec) => $.tool.register(spec) },
  };
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
async function wrote($: EngineInterface, held: { readonly id?: unknown }): Promise<void> {
  if (!held.id)
    return says(
      $,
      "the session start names no session id, so the hand stands at the box",
    );
  try {
    await $.fs.write(SESSION, `${JSON.stringify(held, null, 2)}\n`);
  } catch (bad) {
    says($, `the session file stays unwritten: ${failureOf(bad)?.message ?? bad}`);
  }
}

function says($: EngineInterface, line: string): void {
  try {
    $.ui.log(line);
  } catch {}
}

// The hook hands the raw input over, and the ticket pull verb reads it into an argv, so the hook holds no verb that goes stale. [[spec/design_output/pull#the-hand-out]]
function toolCall(e: unknown): string[] {
  return [...cli, ...PULL, TOOL, JSON.stringify(e ?? {})];
}

// The verb runs under the harness keys the session carries, so it reads the hand the shell verb reads. The engine merges this env over its own, and `$.env.get` reads a key where the hook scope holds no process. [[spec/tickets/pull-env-meets-the-engine]]
// A copy of the keys `HARNESS` in src/scripts/pull-hand-of.js names, because a hook reaches no file past the plugin. The level1 case reads both. [[spec/tickets/pull-env-meets-the-engine]]
export const HARNESS_KEYS = ["CLAUDE_CODE_REMOTE", "SE_CLOUD", "CLAUDECODE"];

async function running(
  $: EngineInterface,
): Promise<{ timeoutMs: number; env?: Record<string, string> }> {
  // The engine reads each env call off the source, so every key stands spelled at its own call. [[spec/tickets/pull-env-meets-the-engine]]
  const said = [
    await envOf(() => $.env.get("CLAUDE_CODE_REMOTE")),
    await envOf(() => $.env.get("SE_CLOUD")),
    await envOf(() => $.env.get("CLAUDECODE")),
  ];
  const env: Record<string, string> = {};
  // A hook scope holding a process holds one no engine type names. [[spec/tickets/pull-env-meets-the-engine]]
  const host = globalThis as { process?: { env?: Readonly<Record<string, string | undefined>> } };
  HARNESS_KEYS.forEach((key, at) => {
    const value = said[at] ?? host.process?.env?.[key];
    if (value) env[key] = String(value);
  });
  return Object.keys(env).length ? { timeoutMs: RUNNING, env } : { timeoutMs: RUNNING };
}

async function envOf(read: () => Promise<string | undefined>): Promise<string | undefined> {
  try {
    return await read();
  } catch {
    return undefined;
  }
}

async function pulled($: EngineInterface, e: unknown): Promise<string> {
  const ran = await $.process.run(toolCall(e), await running($));
  return `${ran.stdout ?? ""}${ran.stderr ?? ""}`.trim() || `exit ${ran.exitCode}`;
}

// [[spec/design_output/pull#a-hand-of-its-own]]
async function spawned($: EngineInterface, prompt: string): Promise<string> {
  let said: Spawned;
  // The hand runs as its own and in the background, two fields the engine's spawn type names nowhere. [[spec/design_output/pull#a-hand-of-its-own]]
  const asked: AgentSpawnArgs & { own: boolean; background: boolean } = {
    prompt,
    own: true,
    background: true,
    description: "a hand of its own works one step",
    subagentType: "general-purpose",
  };
  try {
    said = await $.agent.spawn(asked);
  } catch (bad) {
    return `no hand spawns here: ${failureOf(bad)?.message ?? bad}`;
  }
  if (said?.deny) return `the spawn is refused: ${said.deny}`;
  if (said?.isError) return `the hand failed: ${said.text ?? ""}`;
  return "";
}
