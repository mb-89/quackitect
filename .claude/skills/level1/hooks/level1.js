// Level one's hook module: the pull as a tool. A shell verb reaches no model
// and no agent, and the hook process reaches both, so the judge and the spawn
// run here.
// [[spec/design_output/pull#the-checks]]

import {
  BREAKS,
  judgeAsk,
  judgeRefusal,
  LABELS,
  PULL_CALL,
  pullSpec,
  SESSION,
  sessionOf,
  spawnPromptIn,
} from "../lib/pull.js";

const CLI = ["node", "src/scripts/cli.js"];
// The verb and the flag src/scripts/pull-tool.js reads, fixed while the argv behind them moves. [[spec/design_output/pull#the-hand-out]]
const PULL = ["ticket", "pull"];
const TOOL = "--tool";
const CONFIG = "spec/config/level0.json";
const RUNNING = 600000;
const JUDGE = "--judge";
const SPAWNS = 3;

export function register(on, _options) {
  on("session.start", async ($, e, next) => {
    await $.tool.register(pullSpec());
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
  return [...CLI, ...PULL, TOOL, JSON.stringify(e ?? {})];
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

  const ran = await $.process.run([...toolCall(e), JUDGE], { timeoutMs: RUNNING });
  const material = parsed(ran.stdout);
  if (!material?.rules?.length || !String(material.evidence ?? "").trim()) return "";

  let said;
  try {
    said = await $.model.classify(judgeAsk(material.evidence, material.rules), LABELS, {
      model: judge.model,
    });
  } catch {
    return "";
  }
  return said === BREAKS
    ? judgeRefusal(`the judge answers ${said} over ${material.step}`)
    : "";
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
