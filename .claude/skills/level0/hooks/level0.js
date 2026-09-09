// LEVEL ZERO. The doors that shape what the agent writes, taken inside the
// harness process. This file holds no rule: they live in spec/config/styles
// and spec/guidance.
// [[spec/design_output/level0#the-write-door]]

import {
  BIOME,
  biomeBin,
  CODE,
  formatText,
  lintText as lintCode,
} from "../lib/code.js";
import { bindsHere, envOf, standingLayer } from "../lib/guidance.js";
import { judgeOf } from "../lib/judge.js";
import { aimOf, asLines, FOLDER, nameOf, rowOf, writes } from "../lib/log.js";
import { refusal, taught } from "../lib/refuse.js";
import { readRule } from "../lib/rulefile.js";
import { landsOnTrunk, touchesGit } from "../lib/trunk.js";
import { lintText, VALE } from "../lib/vale.js";

const PROSE = /\.(md|markdown|txt)$/i;
const GUIDANCE = "spec/guidance";
const CONFIG = "spec/config/level0.json";
const HANDOVER = ".se/HANDOVER.md";
const BRIEF = "HANDOVER.md";
const TRUNK = "main";
const JUDGED = "spec/config/styles/VoiceJudged";

const ANSWER = "level0-answer.md";

export function register(on, _options) {
  let bin = null;
  let formatter = null;
  let standing = "";
  let config = {};
  let judge = judgeOf({});
  let handover = [];
  let waiting = false;
  let cloud = false;
  let logbook = logHere(null);

  on("session.start", async ($, e, next) => {
    bin = await linterHere($);
    if (!bin) bin = await install($);
    formatter = await formatterHere($);
    standing = await readGuidance($);
    config = await readConfig($);
    judge = judgeOf(config);
    handover = await takeHandover($);
    cloud = await onACloudBox($);
    waiting = cloud && !handover.length && (await offAWorkBranch($));

    try {
      await $.fs.writeFile(
        ".se/level0.stamp",
        `${new Date().toISOString()} vale=${bin ?? "missing"}\n`,
      );
    } catch {}

    logbook = logHere((at, text) => $.fs.writeFile(at, text), config.log?.level);
    await logbook.say("info", "level0", "session start", {
      branch: await branchNow($),
      vale: bin ?? "missing",
    });
    return next(e);
  });

  on("prompt.submit", async (_$, e, next) => {
    await logbook.say("info", "prompt", String(e.text ?? ""), {
      detail: String(e.origin?.kind ?? ""),
    });
    return next(e);
  });

  // [[spec/design_output/work#a-box-writes-its-branch]]
  on("tool.call", { tool: "Bash" }, async ($, e, next) => {
    if (!cloud) return next(e);
    const said = String(e.command ?? "");
    if (!touchesGit(said).commits && !touchesGit(said).pushes) return next(e);

    const how = landsOnTrunk(said, await branchNow($), TRUNK);
    if (!how) return next(e);

    await logbook.say("warn", "bash", `refused a ${how} landing on ${TRUNK}`, {
      tool: "Bash",
      detail: said.slice(0, 120),
    });
    return {
      deny: [
        `This box works a branch, and ${TRUNK} belongs to a person.`,
        "",
        how === "commit"
          ? `You stand on ${TRUNK}, so this commit would land there.`
          : `This pushes ${TRUNK}, which no cloud box may move.`,
        "",
        "Run `./RUNME.sh work take` to take a branch and move onto it. Every",
        "commit then lands where it belongs, and the merge stays a person's.",
      ].join("\n"),
    };
  });

  // [[spec/design_output/log#what-a-tool-line-names]]
  on("tool.call", async ($, e, next) => {
    await logbook.say("info", "tool", aimOf(e), { tool: e.tool });

    const writing = asWrite(e);
    if (!writing) return next(e);

    if (CODE.test(writing.path)) {
      return await codeDoor($, e, next, writing, formatter, logbook);
    }
    if (!PROSE.test(writing.path)) return next(e);

    const where = shorten(writing.path);
    const found = [];
    let door = "vale";

    if (bin) {
      const said = await lintText(writing.text, where, {
        bin,
        run: (argv, init) => $.process.run(argv, init),
      });
      if (said.ran) found.push(...said.found);
    }

    if (!found.length) {
      judge = judgeOf(config, await readRules($, JUDGED));
      if (judge.reads()) {
        door = "judge";
        found.push(
          ...(await judge.run(writing.text, (text, labels, opts) =>
            $.model.classify(text, labels, opts),
          )),
        );
      }
    }

    if (!found.length) {
      judge.sawClean();
      return next(e);
    }
    judge.sawBreach();
    await logbook.say("warn", door, `refused ${found.length} line(s) in ${where}`, {
      file: where,
      rule: found[0]?.rule,
      tool: e.tool,
    });
    return { deny: refusal(where, found) };
  });

  on("turn.complete", async ($, e, next) => {
    const said = await next(e);
    if (!bin || !e.answer || e.reason !== "answer") return said;

    const ran = await lintText(e.answer, ANSWER, {
      bin,
      run: (argv, init) => $.process.run(argv, init),
    });
    if (!ran.ran || !ran.found.length) return said;

    return {
      ...said,
      text: [
        said.text,
        "",
        ran.found.map((one) => `  ${one.message}`).join("\n"),
        "",
        `  ${taught(ran.found)}`,
      ]
        .filter(Boolean)
        .join("\n"),
    };
  });

  on("prompt.context", async (_$, e, next) => {
    const said = await next(e);
    const blocks = [...said.blocks];

    if (standing) {
      blocks.push({
        name: "level0-rules",
        text: [
          "# How this tree is worked",
          "",
          "These rules reach you before anything else. Vale holds the mechanical",
          "ones at the write door, so a write breaking one comes back with the",
          "reason and the line.",
          "",
          standing,
        ].join("\n"),
      });
    }

    for (const one of handover) {
      const tracked = one.path === BRIEF;
      blocks.push({
        name: tracked ? "level0-brief" : "level0-handover",
        text: [
          tracked
            ? `This branch carries its work in ${BRIEF}, which git tracks.`
            : `The last session on this box left ${HANDOVER}, which git ignores.`,
          "LEVEL ZERO HAS ALREADY DELETED THAT FILE. Its text is below and it is",
          "the only copy, so nothing carries it forward unless you write it again.",
          "",
          tracked
            ? `Before you finish: write your result and your retro into ${BRIEF}, at`
            : `Before you finish: write the next session a new ${HANDOVER}, at`,
          tracked
            ? "that same path, then run ./RUNME.sh work done, which pushes it."
            : "that same path. Say what stands, what is next, and what surprises you.",
          "",
          one.text.trim(),
        ].join("\n"),
      });
    }

    if (waiting) {
      blocks.push({
        name: "level0-take-work",
        text: [
          "YOU ARE ON A CLOUD BOX, OFF A WORK BRANCH, AND NO BRIEF REACHED YOU.",
          "",
          "This branch carries no work of its own. The work waits on branches named",
          "work/<something>, each carrying the brief that says what it is.",
          "",
          "Run this first:",
          "",
          "    ./RUNME.sh work take",
          "",
          "It takes the next branch nobody holds, moves you onto it, takes trunk",
          "into it, and prints the brief. Do what the brief says, and finish the",
          "way its own last section tells you to.",
          "",
          `EVERY COMMIT YOU MAKE BELONGS TO THAT BRANCH, AND NEVER TO ${TRUNK.toUpperCase()}.`,
          "You start on trunk and you leave it at once. Level zero refuses a",
          `commit standing on ${TRUNK}, and refuses a push naming it, so a mistake`,
          "here costs you a refusal rather than the tree.",
          "",
          "It answers that nothing stands at todo where no work waits. Say so and",
          "stop, because trunk is nobody's to work directly.",
        ].join("\n"),
      });
    }

    if (standing) {
      blocks.push({
        name: "level0-receipt",
        text: [
          "End your FIRST answer with one last line, on its own:",
          "",
          "    rules: <n>",
          "",
          "where <n> is how many numbered rules stand in the section naming how",
          "this tree is worked, counted across every heading there. Count them",
          "and write what you counted. Write this line once and never again.",
        ].join("\n"),
      });
    }

    return { ...said, blocks };
  });
}

// [[spec/design_output/log#where-the-writer-stands]]
function logHere(writeFile, at) {
  const rows = [];
  const stamp = () => new Date().toISOString();
  const id = Math.random().toString(16).slice(2).padEnd(8, "0").slice(0, 8);
  const path = `${FOLDER}/${nameOf(stamp(), id)}`;

  return {
    path,
    lines: () => rows.map((one) => ({ ...one })),
    async say(level, door, said, more) {
      const row = rowOf(stamp(), level, door, said, more);
      if (!writes(at, row.level)) return row;
      rows.push(row);
      if (!writeFile) return row;
      try {
        await writeFile(path, asLines(rows));
      } catch {}
      return row;
    },
  };
}

// [[spec/design_output/work#two-handovers]]
async function takeHandover($) {
  const said = [];
  for (const path of [HANDOVER, BRIEF]) {
    let text = "";
    try {
      text = await $.fs.readFile(path);
    } catch {
      continue;
    }
    if (!text.trim()) continue;
    said.push({ path, text });
    await erase($, path);
  }
  return said;
}

async function erase($, path) {
  const windows = path.split("/").join("\\");
  for (const argv of [
    ["rm", "-f", path],
    ["cmd", "/c", "del", "/q", windows],
  ]) {
    try {
      const ran = await $.process.run(argv, { timeoutMs: 10000 });
      if (ran.exitCode === 0) return;
    } catch {}
  }
}

// [[spec/design_output/level0#guidance-a-variable-switches-on]]
async function readGuidance($) {
  try {
    const entries = await $.fs.listDir(GUIDANCE);
    const notes = [];
    const wanted = new Set();
    for (const one of entries) {
      if (!one.name.endsWith(".md")) continue;
      const text = await $.fs.readFile(`${GUIDANCE}/${one.name}`);
      notes.push({ name: one.name, text });
      for (const name of envOf(text)) wanted.add(name);
    }
    const env = await readEnv($, [...wanted]);
    return standingLayer(notes.filter((one) => bindsHere(one.text, env)));
  } catch {
    return "";
  }
}

// [[spec/design_output/work#a-box-landing-on-trunk]]
async function onACloudBox($) {
  const env = await readEnv($, ["CLAUDE_CODE_REMOTE", "SE_CLOUD"]);
  return bindsHere("---\nenv:\n  - CLAUDE_CODE_REMOTE\n  - SE_CLOUD\n---\n", env);
}

// [[spec/design_output/work#a-box-off-a-branch]] says why.
async function offAWorkBranch($) {
  return !(await branchNow($)).startsWith("work/");
}

async function branchNow($) {
  try {
    const ran = await $.process.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], {
      timeoutMs: 10000,
    });
    return (ran.stdout ?? "").trim();
  } catch {
    return "";
  }
}

async function readEnv($, names) {
  if (!names.length) return {};
  const script = `console.log(JSON.stringify(${JSON.stringify(names)}.reduce((o,n)=>(o[n]=process.env[n]??"",o),{})))`;
  try {
    const ran = await $.process.run(["node", "-e", script], { timeoutMs: 10000 });
    return JSON.parse((ran.stdout ?? "{}").trim() || "{}");
  } catch {
    return {};
  }
}

async function readRules($, folder) {
  try {
    const entries = await $.fs.listDir(folder);
    const out = [];
    for (const one of entries) {
      if (!one.name.endsWith(".yml")) continue;
      const rule = readRule(await $.fs.readFile(`${folder}/${one.name}`));
      out.push({ ...rule, name: one.name.replace(/\.yml$/, "") });
    }
    return out;
  } catch {
    return [];
  }
}

async function readConfig($) {
  try {
    return JSON.parse(await $.fs.readFile(CONFIG));
  } catch {
    return {};
  }
}

async function formatterHere($) {
  for (const path of [`${BIOME}.exe`, BIOME]) {
    try {
      if (await $.fs.exists(path)) return path;
    } catch {
      return null;
    }
  }
  return null;
}

// [[spec/design_output/level0#the-formatter-applies-itself]]
async function codeDoor($, e, next, writing, formatter, logbook) {
  if (!formatter) return next(e);
  const run = (argv, init) => $.process.run(argv, init);
  const where = shorten(writing.path);

  let text = writing.text;
  if (e.tool === "Write") {
    const put = await formatText(text, writing.path, { bin: formatter, run });
    if (put.ran) text = put.text;
  }

  const said = await lintCode(text, writing.path, { bin: formatter, run });
  const found = (said.found ?? []).filter((one) => one.severity === "error");
  if (found.length) {
    await logbook.say("warn", "write", `refused ${found.length} line(s) in ${where}`, {
      file: where,
      rule: found[0]?.rule,
      tool: e.tool,
    });
    return { deny: refusal(where, found) };
  }

  if (e.tool === "Write" && text !== writing.text) {
    return next({ ...e, content: text });
  }
  return next(e);
}

async function linterHere($) {
  for (const path of [`${VALE}.exe`, VALE]) {
    try {
      if (await $.fs.exists(path)) return path;
    } catch {
      return null;
    }
  }
  return null;
}

async function install($) {
  const ways = [
    ["sh", "src/scripts/install.sh"],
    [
      "powershell",
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      "src\\scripts\\install.ps1",
    ],
  ];
  for (const argv of ways) {
    try {
      const ran = await $.process.run(argv, { timeoutMs: 300000 });
      if (ran.exitCode === 0) {
        const found = await linterHere($);
        if (found) return found;
      }
    } catch {}
  }
  return null;
}

function shorten(path) {
  const parts = String(path).split(/[\\/]/).filter(Boolean);
  return parts.slice(-2).join("/");
}

function asWrite(e) {
  if (!e?.file_path) return undefined;
  if (e.tool === "Write") {
    return { path: String(e.file_path), text: String(e.content ?? "") };
  }
  if (e.tool === "Edit") {
    return { path: String(e.file_path), text: String(e.new_string ?? "") };
  }
  if (e.tool === "MultiEdit" && Array.isArray(e.edits)) {
    return {
      path: String(e.file_path),
      text: e.edits.map((one) => String(one?.new_string ?? "")).join("\n"),
    };
  }
  return undefined;
}
