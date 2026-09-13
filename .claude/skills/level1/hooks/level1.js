// Level one's hook module: the pull as a tool. It registers the tool, runs the
// shell verb under it, and reads a hand-back with the judge first, because a
// shell verb reaches no model and the hook process does. It imports nothing
// past its own folder, and the shell hands it the material as JSON.
// [[spec/design_output/pull#the-five-checks]]

import {
  BREAKS,
  judgeAsk,
  judgeRefusal,
  LABELS,
  PULL_CALL,
  pullArgv,
  pullSpec,
} from "../lib/pull.js";

const CLI = ["node", "src/scripts/cli.js"];
const CONFIG = "spec/config/level0.json";
const RUNNING = 600000;
const JUDGE = "--judge";

export function register(on, _options) {
  on("session.start", async ($, e, next) => {
    await $.tool.register(pullSpec());
    return next(e);
  });

  on("tool.call", { tool: PULL_CALL }, async ($, e, _next) => {
    const argv = pullArgv(e);
    if (argv.length > 2) {
      const said = await judged($, argv);
      if (said) return { result: said };
    }
    const ran = await $.process.run([...CLI, ...argv], { timeoutMs: RUNNING });
    return {
      result: `${ran.stdout ?? ""}${ran.stderr ?? ""}`.trim() || `exit ${ran.exitCode}`,
    };
  });
}

// [[spec/design_output/pull#the-five-checks]]
async function judged($, argv) {
  const settings = await readJson($, CONFIG);
  const judge = settings?.judge ?? {};
  if (judge.enabled === false) return "";

  const ran = await $.process.run([...CLI, ...argv.slice(0, 3), JUDGE], { timeoutMs: RUNNING });
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
  return said === BREAKS ? judgeRefusal(`the judge answers ${said} over ${material.step}`) : "";
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
