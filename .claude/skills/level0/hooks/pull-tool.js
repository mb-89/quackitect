// The plugin's one hook module: the forwarder, then the tools and the pull. A
// shell verb reaches no agent, and the hook process does, so the spawn runs
// here. The binary prints every tool spec and the pull's answer, so this
// module holds none of them. [[spec/tickets/the-judge-leaves-the-code]]

// One plugin takes one module, so this one calls the forwarder's register. [[spec/design_output/work#an-experiment-decides]]
import { register as forwarder } from "./level0.js";

// The binary under the method root, which serveIndexBin in src/quack/serve_verb.go names, and the scripts folder its verb road takes. [[spec/tickets/cli-js-leaves]]
const BINARY = ".se/.runtime/bin/se-index"; // src/modules/check/folders.go owns the folder
const SCRIPTS = "src/scripts";
// The tool the pull registers, as PullSpec in src/pull/pull.go names it, under the prefix every level zero tool carries. [[spec/design_output/pull#the-checks]]
const PULL_CALL = "mcp__level0__pull";
// The verb and the flags `Pulling` in src/pull/pull.go reads. [[spec/design_output/pull#the-hand-out]]
const PULL = ["ticket", "pull"];
const TOOL = "--tool";
const SPEC = "--spec";
const RUNNING = 600000;
const BACKGROUND =
  "The hand works in the background. Take the next item, and pull again once it answers.";

export function register(on, options) {
  const method = String(options?.method ?? "").replace(/[\\/]+$/, "") || ".";
  const bin = `${method}/${BINARY}${/^[A-Za-z]:/.test(method) || method.includes("\\") ? ".exe" : ""}`;
  const cli = [bin, "verb", `${method}/${SCRIPTS}`];
  forwarder(on, options);
  // The engine takes one session start a module, so the forwarder registers none, and this one registers every tool the binary lists. [[spec/design_output/level0#the-first-call-pays]]
  on("session.start", async ($, e, next) => {
    for (const spec of [
      ...(await printed($, [bin, "tools"], [])),
      await printed($, [...cli, ...PULL, SPEC], null),
    ]) {
      if (!spec?.name) continue;
      try {
        await $.tool.register({
          name: spec.name,
          description: spec.description,
          inputSchema: spec.inputSchema,
        });
      } catch {}
    }
    return next(e);
  });
  on("tool.call", { tool: PULL_CALL }, async ($, e, _next) => {
    const ran = await $.process.run([...cli, ...PULL, TOOL, JSON.stringify(e ?? {})], await running($));
    const answer = parsed(ran?.stdout) ?? { result: `${ran?.stdout ?? ""}${ran?.stderr ?? ""}`.trim() || `exit ${ran?.exitCode}` };
    // The hand works in the background, and the lead takes the next item. [[spec/tickets/the-hook-awaits-the-spawn]]
    if (!answer.spawn) return { result: answer.result };
    const said = (await spawned($, answer.spawn)) || BACKGROUND;
    return { result: `${answer.result}\n\n${said}` };
  });
}

// What the binary prints as JSON, or the value given where it fails. [[spec/design_output/level0#the-first-call-pays]]
async function printed($, argv, otherwise) {
  try {
    const ran = await $.process.run(argv);
    if (ran.exitCode !== 0) return otherwise;
    return parsed(ran.stdout) ?? otherwise;
  } catch {
    return otherwise;
  }
}

function parsed(text) {
  try {
    return JSON.parse(String(text ?? "").trim());
  } catch {
    return null;
  }
}

// The verb runs under the harness keys the session carries, so it reads the hand the shell verb reads. The engine reads each env call off the source, so every key stands spelled at its own call. [[spec/tickets/pull-env-meets-the-engine]]
export const HARNESS_KEYS = ["CLAUDE_CODE_REMOTE", "SE_CLOUD", "CLAUDECODE"];

async function running($) {
  const said = [
    await envOf(() => $.env.get("CLAUDE_CODE_REMOTE")),
    await envOf(() => $.env.get("SE_CLOUD")),
    await envOf(() => $.env.get("CLAUDECODE")),
  ];
  const env = {};
  HARNESS_KEYS.forEach((key, at) => {
    const value = said[at] ?? globalThis.process?.env?.[key];
    if (value) env[key] = String(value);
  });
  return Object.keys(env).length ? { timeoutMs: RUNNING, env } : { timeoutMs: RUNNING };
}

async function envOf(read) {
  try {
    return await read();
  } catch {
    return undefined;
  }
}

// [[spec/design_output/pull#a-hand-of-its-own]]
async function spawned($, prompt) {
  let said;
  try {
    said = await $.agent.spawn({
      prompt,
      own: true,
      background: true,
      description: "a hand of its own works one step",
      subagentType: "general-purpose",
    });
  } catch (bad) {
    return `no hand spawns here: ${bad?.message ?? bad}`;
  }
  if (said?.deny) return `the spawn is refused: ${said.deny}`;
  if (said?.isError) return `the hand failed: ${said.text ?? ""}`;
  return "";
}
