// The plugin's one hook module: the bridgehead, then the tools and the pull. A
// shell verb reaches no agent, and the hook process does, so the spawn runs
// here. The binary prints every tool spec and the pull's answer, so this
// module holds none of them. [[spec/tickets/the-judge-leaves-the-code]]

import type { AgentSpawnArgs, EngineInterface, On, PluginOptions } from "claude-code";
import { binaryOf, windowsOf } from "./cage.ts";
// One plugin takes one module, so this one calls the bridgehead's register. It imports nothing, which is why the call runs this way. [[spec/design_output/work#an-experiment-decides]]
import { register as bridgehead } from "./level0.ts";
import { type Fields, failureOf, type Spawned } from "./shape.ts";

// The scripts folder the binary's verb road takes, as RUNME.sh hands it over. [[spec/tickets/cli-js-leaves]]
const SCRIPTS = "src/scripts";
// The tool the pull registers, as PullSpec in src/pull/pull.go names it, under the prefix every level zero tool carries. [[spec/design_output/pull#the-checks]]
const PULL_CALL = "mcp__level0__pull";
// The verb and the flags `Pulling` in src/pull/pull.go reads. [[spec/design_output/pull#the-hand-out]]
const PULL = ["ticket", "pull"];
const TOOL = "--tool";
const SPEC = "--spec";
// The longest run the pull takes, past the engine's own cap of thirty seconds, since a hand-back runs the check. [[spec/tickets/tool-call-hook-answers]]
const RUNNING = 600_000;
const BACKGROUND =
  "The hand works in the background. Take the next item, and pull again once it answers.";

// The answer `ToolAnswerOf` in src/pull/pull.go prints: the text the lead reads, and the hand's prompt apart. [[spec/tickets/level0-hooks-forward-to-go]]
type Pulled = { readonly result?: unknown; readonly spawn?: unknown };

export function register(on: On, options: PluginOptions): void {
  const method = String(options?.method ?? "").replace(/[\\/]+$/, "") || ".";
  const bin = binaryOf(method, windowsOf(method));
  const cli = [bin, "verb", `${method}/${SCRIPTS}`];
  // The hooks door answers an index tool's call and writes the session file, so this module registers the tools and the pull alone. [[spec/tickets/level0-hooks-forward-to-go]]
  bridgehead(on, options);
  // The engine takes one session start a module, so the bridgehead registers none, and this one registers every tool the binary lists. [[spec/design_output/level0#the-bridgehead-starts-it-too]] [[spec/design_output/level0#the-first-call-pays]]
  on("session.start", async ($, e, next) => {
    const listed = await printed($, [bin, "tools"], []);
    const specs = [...(Array.isArray(listed) ? listed : []), await printed($, [...cli, ...PULL, SPEC], null)];
    for (const spec of specs as (Fields | null)[]) {
      if (!spec?.name) continue;
      try {
        await $.tool.register({
          name: String(spec.name),
          description: String(spec.description ?? ""),
          inputSchema: spec.inputSchema as never,
        });
      } catch {}
    }
    return next(e);
  });

  on("tool.call", { tool: PULL_CALL }, async ($, e, _next) => {
    const ran = await $.process.run([...cli, ...PULL, TOOL, JSON.stringify(e ?? {})], await running($));
    const answer = (parsed(ran?.stdout) as Pulled | null) ?? {
      result: `${ran?.stdout ?? ""}${ran?.stderr ?? ""}`.trim() || `exit ${ran?.exitCode}`,
    };
    // The hand works in the background, and the lead takes the next item. [[spec/tickets/the-hook-awaits-the-spawn]]
    if (!answer.spawn) return { result: answer.result };
    const said = (await spawned($, String(answer.spawn))) || BACKGROUND;
    return { result: `${answer.result}\n\n${said}` };
  });
}

// What the binary prints as JSON, or the value given where it fails. [[spec/design_output/level0#the-first-call-pays]]
async function printed($: EngineInterface, argv: readonly string[], otherwise: unknown): Promise<unknown> {
  try {
    const ran = await $.process.run(argv);
    if (ran.exitCode !== 0) return otherwise;
    return parsed(ran.stdout) ?? otherwise;
  } catch {
    return otherwise;
  }
}

function parsed(text: unknown): unknown {
  try {
    return JSON.parse(String(text ?? "").trim());
  } catch {
    return null;
  }
}

// The verb runs under the harness keys the session carries, so it reads the hand the shell verb reads. The engine merges this env over its own, and `$.env.get` reads a key where the hook scope holds no process. [[spec/tickets/pull-env-meets-the-engine]]
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
