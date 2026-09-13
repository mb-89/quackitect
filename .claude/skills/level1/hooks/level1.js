// Level one's hook module: the pull as a tool. It registers the tool, runs the
// shell verb under it, and reads a hand-back with the judge first, because a
// shell verb reaches no model and the hook process does.
// [[spec/design_output/pull#the-five-checks]]

import { actionables } from "../../level0/lib/guidance.js";
import { chapterOf, HOLDS, leafOf } from "../../../../src/scripts/pull.js";
import { frontOf } from "../../../../src/scripts/group.js";
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

export function register(on, _options) {
  on("session.start", async ($, e, next) => {
    await $.tool.register(pullSpec());
    return next(e);
  });

  on("tool.call", { tool: PULL_CALL }, async ($, e, _next) => {
    const argv = pullArgv(e);
    if (argv.length > 2) {
      const judged = await judged($, e);
      if (judged) return { result: judged };
    }
    const ran = await $.process.run([...CLI, ...argv], { timeoutMs: RUNNING });
    return {
      result: `${ran.stdout ?? ""}${ran.stderr ?? ""}`.trim() || `exit ${ran.exitCode}`,
    };
  });
}

// [[spec/design_output/pull#the-five-checks]]
async function judged($, e) {
  const settings = await readJson($, CONFIG);
  const judge = settings?.judge ?? {};
  if (judge.enabled === false) return "";

  const hold = await holdHere($);
  if (!hold || (e.ticket && hold.ticket !== e.ticket)) return "";

  let text;
  try {
    text = await $.fs.read(hold.path);
  } catch {
    return "";
  }
  const leaf = leafOf(frontOf(text), hold.step);
  if (!leaf) return "";
  const rules = [];
  for (const path of leaf.reads) rules.push(...actionables(await readText($, `${path}.md`)));
  if (!rules.length) return "";

  const chapter = chapterOf(text, hold.step);
  const evidence = [
    ...chapter.own,
    ...[...chapter.fields].flatMap(([name, rows]) => [`${name}:`, ...rows]),
  ].join("\n");
  if (!evidence.trim()) return "";

  let said;
  try {
    said = await $.model.classify(judgeAsk(evidence, rules), LABELS, {
      model: judge.model,
    });
  } catch {
    return "";
  }
  return said === BREAKS
    ? judgeRefusal(`the judge answers ${said} over ${hold.step}`)
    : "";
}

async function holdHere($) {
  try {
    const entries = await $.fs.list(HOLDS);
    const one = entries.find((held) => held.name.endsWith(".json"));
    return one ? JSON.parse(await $.fs.read(`${HOLDS}/${one.name}`)) : null;
  } catch {
    return null;
  }
}

async function readText($, path) {
  try {
    return await $.fs.read(path);
  } catch {
    return "";
  }
}

async function readJson($, path) {
  try {
    return JSON.parse(await $.fs.read(path));
  } catch {
    return {};
  }
}
