// The plugin's one hook module: the bridgehead, then the pull as a tool. A
// shell verb reaches no model and no agent, and the hook process reaches both,
// so the judge and the spawn run here.
// [[spec/design_output/pull#the-checks]]

// One plugin takes one module, so this one calls the bridgehead's register. It imports nothing, which is why the call runs this way. [[spec/design_output/work#an-experiment-decides]]
import { READ_TOOLS, register as bridgehead } from "./level0.js";
import { configOf, SCHEMA, TRACKED } from "../lib/config.js";
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

const CLI_SCRIPT = "src/scripts/cli.js";
// The script stands under the method root, which a project root holds nowhere, so the call names it whole. [[spec/design_output/vehicle#the-work-root-inherits]]
let cli = ["node", CLI_SCRIPT];
// The tracked files the judge reads its switch from, the method root's under the work root's own. [[spec/design_output/vehicle#the-work-root-inherits]]
let tracked = [TRACKED];
let schema = SCHEMA;
// The verb and the flag src/scripts/pull-tool.js reads, fixed while the argv behind them moves. [[spec/design_output/pull#the-hand-out]]
const PULL = ["ticket", "pull"];
const TOOL = "--tool";
const ENABLED = "judge.enabled";
const MODEL = "judge.model";
const RUNNING = 600000;
const JUDGE = "--judge";
const BACKGROUND =
  "The hand works in the background. Take the next item, and pull again once it answers.";

export function register(on, options) {
  const method = String(options?.method ?? "").replace(/[\\/]+$/, "");
  cli = ["node", method ? `${method}/${CLI_SCRIPT}` : CLI_SCRIPT];
  tracked = method ? [`${method}/${TRACKED}`, TRACKED] : [TRACKED];
  schema = method ? `${method}/${SCHEMA}` : SCHEMA;
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
    const answer = await pulled($, e);
    // The hand works in the background, and the lead takes the next item. [[spec/tickets/the-hook-awaits-the-spawn]]
    const prompt = spawnPromptIn(answer);
    if (!prompt) return { result: answer };
    const said = (await spawned($, prompt)) || BACKGROUND;
    return { result: `${answer}\n\n${said}` };
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

async function pulled($, e) {
  const ran = await $.process.run(toolCall(e), { timeoutMs: RUNNING });
  return `${ran.stdout ?? ""}${ran.stderr ?? ""}`.trim() || `exit ${ran.exitCode}`;
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

// The switch reads through the one resolver, so the per-box file a slash command writes beats the tracked one. [[spec/design_output/pull#the-checks]]
async function judged($, e) {
  const settings = configOf({ tracked, schema, read: async (path) => $.fs.read(path) });
  if ((await settings.ask(ENABLED)) === false) return "";

  const ran = await $.process.run([...toolCall(e), JUDGE], { timeoutMs: RUNNING });
  const material = parsed(ran.stdout);
  if (!material?.rules?.length || !String(material.evidence ?? "").trim()) return "";

  let said;
  try {
    said = await $.model.classify(
      judgeAsk(material.evidence, material.rules),
      judgeLabels(material.rules),
      { model: await settings.ask(MODEL) },
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
