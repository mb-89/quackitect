// The plugin's one hook module: the bridgehead, then the pull as a tool. A
// shell verb reaches no model and no agent, and the hook process reaches both,
// so the judge and the spawn run here.
// [[spec/design_output/pull#the-checks]]

import {
  judgeAsk,
  judgeLabels,
  judgeRefusal,
  PULL_CALL,
  pullSpec,
  ruleBroken,
  SESSION,
  sessionOf,
  spawnPromptIn,
} from "../lib/pull.js";
// One plugin takes one module, so this one calls the bridgehead's register. It imports nothing, which is why the call runs this way. [[spec/design_output/work#an-experiment-decides]]
import { register as bridgehead, READ_TOOLS } from "./level0.js";

const CLI_SCRIPT = "src/scripts/cli.js";
// The script stands under the method root, which a project root holds nowhere, so the call names it whole. [[spec/design_output/vehicle#the-work-root-inherits]]
let cli = ["node", CLI_SCRIPT];
// The verb and the flag src/scripts/pull-tool.js reads, fixed while the argv behind them moves. [[spec/design_output/pull#the-hand-out]]
const PULL = ["ticket", "pull"];
const TOOL = "--tool";
const CONFIG = "spec/config/level0.json";
const RUNNING = 600000;
const JUDGE = "--judge";
const SPAWNS = 3;

export function register(on, options) {
  const method = String(options?.method ?? "").replace(/[\\/]+$/, "");
  cli = ["node", method ? `${method}/${CLI_SCRIPT}` : CLI_SCRIPT];
  // The engine takes one session start a module, so the bridgehead registers none and this one registers its read tools beside the pull. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
  bridgehead(on, options);
  on("session.start", async ($, e, next) => {
    for (const spec of [pullSpec(), ...READ_TOOLS]) {
      try {
        await $.tool.register(spec);
      } catch {}
    }
    // [[spec/design_output/pull#the-hand-and-the-hold]]
    await wrote($, sessionOf(e));
    return next(e);
  });

  on("tool.call", { tool: PULL_CALL }, async ($, e, _next) => {
    if (String(e?.ticket ?? "").trim()) {
      const said = await judged($, e);
      if (said) return { result: said };
    }
    let answer = await pulled($, e);
    // [[spec/design_output/pull#a-hand-of-its-own]]
    for (let round = 0; round < SPAWNS; round++) {
      const prompt = spawnPromptIn(answer);
      if (!prompt) break;
      const said = await spawned($, prompt);
      if (said) return { result: `${answer}\n\n${said}` };
      answer = await pulled($, {});
    }
    return { result: answer };
  });
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
async function wrote($, held) {
  if (!held.id)
    return says(
      $,
      "the session start names no session id, so the hand stands at the box",
    );
  try {
    await $.fs.write(SESSION, `${JSON.stringify(held, null, 2)}\n`);
  } catch (bad) {
    says($, `the session file stays unwritten: ${bad?.message ?? bad}`);
  }
}

function says($, line) {
  try {
    $.ui.log(line);
  } catch {}
}

// The hook hands the raw input over, and the CLI reads it into an argv, so the hook holds no verb that goes stale. [[spec/design_output/pull#the-hand-out]]
function toolCall(e) {
  return [...cli, ...PULL, TOOL, JSON.stringify(e ?? {})];
}

// The verb runs under the env the session carries, so it reads the harness keys, and the hand the shell verb reads. A hook scope holding no process hands none, and the child takes the engine's own. [[spec/tickets/doors-read-what-commands-do]]
function running() {
  const env = globalThis.process?.env;
  return env ? { timeoutMs: RUNNING, env: { ...env } } : { timeoutMs: RUNNING };
}

async function pulled($, e) {
  const ran = await $.process.run(toolCall(e), running());
  return `${ran.stdout ?? ""}${ran.stderr ?? ""}`.trim() || `exit ${ran.exitCode}`;
}

// [[spec/design_output/pull#a-hand-of-its-own]]
async function spawned($, prompt) {
  let said;
  try {
    said = await $.agent.spawn({
      prompt,
      own: true,
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

// [[spec/design_output/pull#the-checks]]
async function judged($, e) {
  const settings = await readJson($, CONFIG);
  const judge = settings?.judge ?? {};
  if (judge.enabled === false) return "";

  const ran = await $.process.run([...toolCall(e), JUDGE], running());
  const material = parsed(ran.stdout);
  if (!material?.rules?.length || !String(material.evidence ?? "").trim()) return "";

  let said;
  try {
    said = await $.model.classify(
      judgeAsk(material.evidence, material.rules),
      judgeLabels(material.rules),
      { model: judge.model },
    );
  } catch {
    return "";
  }
  const broke = ruleBroken(said, material.rules);
  return broke ? judgeRefusal(`at ${material.step}, ${broke}`) : "";
}

function parsed(text) {
  try {
    return JSON.parse(String(text ?? "").trim() || "null");
  } catch {
    return null;
  }
}

async function readJson($, path) {
  try {
    return JSON.parse(await $.fs.read(path));
  } catch {
    return {};
  }
}
