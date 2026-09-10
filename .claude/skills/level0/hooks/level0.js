// LEVEL ZERO. The doors that shape what the agent writes, taken inside the
// harness process. This file holds no rule: they live in spec/config/styles
// and spec/guidance.
// [[spec/design_output/level0#the-write-door]]

import { opensATurn, reachesTheOwner, SAYS, spokeSince } from "../lib/answer.js";
import { commitIn, findings as readsCommand, verbLine } from "../lib/bash.js";
import { CODE, formatText, lintText as lintCode } from "../lib/code.js";
import { configOf, TRACKED } from "../lib/config.js";
import {
  bindsHere,
  canary,
  canaryIn,
  countsOf,
  envOf,
  forHelper,
  parse,
  standingLayer,
} from "../lib/guidance.js";
import { godMode, HEALTH, repairs } from "../lib/health.js";
import { judgeOf } from "../lib/judge.js";
import { aimOf, asLines, FOLDER, nameOf, rowOf, writes } from "../lib/log.js";
import {
  entriesIn,
  ownerOf,
  PROJECTIONS,
  readsOf,
  refusedWrite,
  writesOf,
} from "../lib/projection.js";
import { refusal, refusedCommand, taught } from "../lib/refuse.js";
import { readerAsks, readerSays, report, reviewSpec } from "../lib/review.js";
import { readRule } from "../lib/rulefile.js";
import { guesses, pathOf, surveyOf, TOOLS } from "../lib/tools.js";
import {
  claimSpec,
  decide,
  detail,
  pool,
  reprompt,
  RULES,
  todos,
  toothOf,
} from "../lib/stop.js";
import { landsOnTrunk, touchesGit } from "../lib/trunk.js";
import { lintText, PROSE } from "../lib/vale.js";

const GUIDANCE = "spec/guidance";
const COMMIT = "level0-commit.md";
const HANDOVER = ".se/HANDOVER.md";
const BRIEF = "HANDOVER.md";
const TRUNK = "main";
const JUDGED = "spec/config/styles/VoiceJudged";

const ANSWER = "level0-answer.md";
const GATHERING = 300000;
const GATHER = ["node", "src/scripts/cli.js"];

export function register(on, _options) {
  let bin = null;
  let formatter = null;
  let standing = "";
  let sentence = "";
  let firstTurn = true;
  let settings = configOf({ read: async () => "" });
  let judge = judgeOf({});
  let handover = [];
  let waiting = false;
  let cloud = false;
  let logbook = logHere(null);
  let rules = [];
  let onAHeldBranch = false;
  let owed = false;
  let projections = [];
  const list = todos();
  let tooth = toothOf();

  // [[spec/design_output/level0#god-mode]]
  const cage = {
    health: { ok: false, why: "level zero never loads in this session", at: "" },
    wired: false,
    installed: false,
    told: "",
    logbook,
  };

  const take = () => {
    bin = cage.bin ?? null;
    formatter = cage.formatter ?? null;
    settings = cage.settings ?? settings;
    standing = cage.standing ?? "";
    sentence = cage.sentence ?? "";
    rules = cage.rules ?? [];
    judge = cage.judge ?? judge;
    tooth = cage.tooth ?? tooth;
    logbook = cage.logbook ?? logbook;
  };

  on("session.start", async ($, e, next) => {
    await ensureCage($, cage);
    take();

    handover = await takeHandover($);
    cloud = await onACloudBox($);
    waiting = cloud && !handover.length && (await offAWorkBranch($));
    onAHeldBranch = handover.some((one) => parse(one.text).front.status === "held");

    try {
      await $.fs.write(
        ".se/level0.stamp",
        `${new Date().toISOString()} vale=${bin ?? "missing"}\n`,
      );
    } catch {}

    await logbook.say("info", "level0", "session start", {
      branch: await branchNow($),
      vale: bin ?? "missing",
    });
    for (const fault of await settings.faults()) {
      await logbook.say("warn", "config", fault, { file: TRACKED });
    }

    // [[spec/design_output/projection#who-projects-and-when]]
    projections = entriesIn(await readIf($, PROJECTIONS));
    if (projections.length) {
      const drawn = await projectAll($, projections);
      await logbook.say("info", "project", `${drawn.wrote} file(s) written`, {
        ms: drawn.ms,
        detail: `${projections.length} projection(s), ${drawn.size} target(s)`,
      });
      for (const path of drawn.refused) {
        await logbook.say("warn", "project", "the box refuses a target", { file: path });
      }
    }

    await $.tool.register(claimSpec(rules));
    await $.tool.register(reviewSpec());
    return next(e);
  });

  on("prompt.submit", async (_$, e, next) => {
    const from = String(e.origin?.kind ?? "");
    tooth.sawPrompt(from === "plugin");
    if (opensATurn(e.origin)) owed = true;
    await logbook.say("info", "prompt", String(e.text ?? ""), { detail: from });
    return next(e);
  });

  // [[spec/design_output/log#what-a-tool-line-names]]
  on("tool.call", async ($, e, next) => {
    // [[spec/design_output/level0#god-mode]]
    const well = await ensureCage($, cage);
    take();

    tooth.sawCall(String(e.tool ?? ""));
    list.sawCall(e);
    await logbook.say("info", "tool", aimOf(e), { tool: e.tool });

    if (!well.ok && !repairs(e, asWrite(e))) {
      await logbook.say("warn", "level0", `god mode refuses ${e.tool}`, {
        tool: e.tool,
        detail: well.why,
      });
      return { deny: godMode(well) };
    }

    // [[spec/design_output/level0#the-owners-prompt-comes-first]]
    const answers = await answerDoor($, e, {
      owed,
      off: (await settings.ask("answer.enabled")) === false,
      logbook,
    });
    if (answers.deny) return answers;
    owed = answers.owed;

    const writing = asWrite(e);
    if (!writing) return next(e);

    // [[spec/design_output/projection#the-write-door-refuses-one]]
    const owner = ownerOf(projections, writing.path);
    if (owner) {
      await logbook.say("warn", "project", `refused a write to ${shorten(writing.path)}`, {
        file: shorten(writing.path),
        tool: e.tool,
        detail: owner.name ?? owner.target,
      });
      return { deny: refusedWrite(owner, writing.path) };
    }

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
      judge = judgeOf(await judgeSettings(settings), await readRules($, JUDGED));
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

  // [[spec/design_output/bash#what-the-door-reads]]
  on("tool.call", { tool: "Bash" }, async ($, e, next) => {
    const said = String(e.command ?? "");
    const found = readsCommand(said, await settings.ask("names.words"));
    found.push(...(await commitVoice($, said, bin)));
    if (!found.length) return next(e);

    await logbook.say("warn", "bash", `refused ${found.length} rule(s) in a command`, {
      tool: "Bash",
      rule: found[0].rule,
      detail: said.slice(0, 120),
    });
    return { deny: refusedCommand(said, found) };
  });

  // [[spec/design_output/bash#the-description-names-verbs]]
  on("tool.describe", { tool: "Bash" }, async (_$, e, next) => {
    const said = await next(e);
    const base = said && typeof said === "object" ? said : {};
    const text = String(base.description ?? e.description ?? "").trim();
    return { ...base, description: [text, verbLine()].filter(Boolean).join("\n\n") };
  });

  // [[spec/design_output/stop#the-claim-and-its-life]]
  on("tool.call", { tool: "mcp__level0__claim_stop" }, async (_$, e, _next) => {
    const said = tooth.claims(String(e.rule ?? ""), String(e.why ?? ""));
    await logbook.say("info", "stop", `claimed ${said.rule}`, {
      detail: said.why.slice(0, 120),
    });
    return { result: { ...said, counted: "at the end of this turn" } };
  });

  // [[spec/design_output/level0#the-helper-takes-the-guidance]]
  on("agent.spawn", async (_$, e, next) => {
    if (!standing) return next(e);
    await logbook.say("info", "agent", `handed the guidance to ${e.subagentType}`, {
      detail: String(e.description ?? "").slice(0, 120),
    });
    return next({ ...e, prompt: forHelper(standing, e.prompt) });
  });

  // [[spec/design_output/review#the-tool-the-session-calls]]
  on("tool.call", { tool: "mcp__level0__review_branch" }, async ($, e, _next) => {
    const name = String(e.branch ?? "").trim();
    if (!name) return { result: "review_branch takes one branch name." };

    const ran = await $.process.run([...GATHER, "work", "review", name, "--json"], {
      timeoutMs: GATHERING,
    });
    const material = materialOf(ran.stdout);
    if (!material) {
      const why = String(ran.stderr ?? "").trim() || String(ran.stdout ?? "").trim();
      await logbook.say("warn", "review", `the verb gathered nothing for ${name}`, {
        detail: why.slice(0, 200),
      });
      return { result: `${name}: the verb gathered nothing.\n\n${why}` };
    }

    const read = await readerRuns($, material, standing);
    await logbook.say("info", "review", `read ${material.branch}`, {
      branch: material.branch,
      detail: `check=${material.check?.code} retro=${material.retro} fix=${read.fix}`,
    });
    return { result: report(material, read) };
  });

  on("turn.complete", async ($, e, next) => {
    const said = await next(e);
    owed = false;
    if (firstTurn && e.reason === "answer") {
      firstTurn = false;
      await heardCanary(logbook, canaryIn(e.answer, sentence), sentence);
    }
    const off = (await settings.ask("stop.enabled")) === false;
    await bite($, e, {
      rules,
      tooth,
      logbook,
      mostInARow: await settings.ask("stop.mostInARow"),
      ran: (name) => ranHere(name, off),
    });
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

    // [[spec/design_output/level0#the-canary]]
    if (standing) {
      blocks.push({
        name: "level0-canary",
        text: [
          "End your FIRST answer with this line, on its own, word for word:",
          "",
          `    ${sentence}`,
          "",
          "It says out loud that level zero holds this session, and the numbers",
          "come from what it loaded. Write this line once and never again.",
        ].join("\n"),
      });
    }

    return { ...said, blocks };
  });

  // [[spec/design_output/stop#the-mechanical-checks]]
  function ranHere(name, off) {
    if (name === "work-waiting") return list.standing() || onAHeldBranch;
    if (name === "session-is-new") return tooth.isNew();
    if (name === "stop-hook-off") return off;
    if (name === "never") return false;
    return undefined;
  }
}

// [[spec/design_output/level0#what-the-cage-loads]]
async function loadCage($, cage) {
  const faults = [];

  cage.settings = configHere($);
  cage.judge = judgeOf(await judgeSettings(cage.settings));
  cage.tooth = toothOf({ mostInARow: await cage.settings.ask("stop.mostInARow") });
  if (!cage.wired) {
    cage.logbook = logHere(
      (at, text) => $.fs.write(at, text),
      await cage.settings.ask("log.level"),
    );
    cage.wired = true;
  }

  let known = await readSurvey($);
  cage.bin = await toolHere($, known, "vale");
  if (!cage.bin && !cage.installed) {
    cage.installed = true;
    await install($);
    known = await readSurvey($);
    cage.bin = await toolHere($, known, "vale");
  }
  if (!cage.bin) faults.push("no vale stands here, so no voice rule reads a write");
  cage.formatter = await toolHere($, known, "biome");

  const guidance = await readGuidance($);
  cage.standing = guidance.said;
  cage.sentence = canary({
    rules: guidance.rules,
    notes: guidance.notes,
    stop: (await cage.settings.ask("stop.enabled")) !== false,
  });
  if (!cage.standing) faults.push(`${GUIDANCE} hands over nothing`);

  // [[spec/design_output/stop#where-the-rules-live]]
  const pooled = pool(await readFolder($, RULES, ".yml"));
  cage.rules = pooled.rules;
  for (const name of pooled.broken) {
    await cage.logbook.say("warn", "stop", `${name} carries a rule nobody can read`, {
      file: `${RULES}/${name}`,
    });
  }

  if (faults.length) throw new Error(faults.join(", and "));
}

// [[spec/design_output/level0#god-mode]]
async function ensureCage($, cage) {
  if (cage.health.ok) return cage.health;

  try {
    await loadCage($, cage);
    cage.health = { ok: true, why: "", at: new Date().toISOString() };
  } catch (err) {
    cage.health = {
      ok: false,
      why: String(err?.message ?? err),
      at: new Date().toISOString(),
    };
  }

  try {
    await $.fs.write(HEALTH, `${JSON.stringify(cage.health, null, 2)}\n`);
  } catch {}

  if (cage.health.ok && cage.told) {
    cage.told = "";
    await cage.logbook.say("info", "level0", "the cage holds again", {
      detail: cage.health.at,
    });
  }
  if (!cage.health.ok && cage.health.why !== cage.told) {
    cage.told = cage.health.why;
    await cage.logbook.say("error", "level0", "the cage holds nothing", {
      detail: cage.health.why,
    });
  }
  return cage.health;
}

// [[spec/design_output/projection#who-projects-and-when]]
async function projectAll($, entries) {
  const began = Date.now();
  const refused = [];
  let size = 0;
  let wrote = 0;

  for (const entry of entries) {
    const texts = new Map();
    for (const path of readsOf(entry)) texts.set(path, await readIf($, path));
    for (const [path, text] of writesOf(entry, texts)) {
      size++;
      if ((await readIf($, path)) === text) continue;
      try {
        await $.fs.write(path, text);
        wrote++;
      } catch {
        refused.push(path);
      }
    }
  }
  return { ms: Date.now() - began, size, wrote, refused };
}

async function readIf($, path) {
  try {
    return String(await $.fs.read(path));
  } catch {
    return "";
  }
}

// [[spec/design_output/level0#the-owners-prompt-comes-first]]
async function answerDoor($, e, it) {
  if (!it.owed || it.off) return { owed: it.owed };
  if (e.agentId || reachesTheOwner(e.tool)) return { owed: it.owed };

  let spoke = true;
  try {
    spoke = spokeSince(await $.session.messages());
  } catch {
    spoke = true;
  }
  if (spoke) return { owed: false };

  await it.logbook.say("warn", "answer", `refused ${e.tool} before an answer`, {
    tool: e.tool,
  });
  return { deny: SAYS, owed: true };
}

// [[spec/design_output/bash#a-commit-message-meets-voice]]
async function commitVoice($, command, bin) {
  const said = commitIn(command);
  if (!said || !bin) return [];

  let text = String(said.text ?? "");
  if (said.form === "file") {
    try {
      text = await $.fs.read(said.file);
    } catch {
      return [];
    }
  }
  if (!text.trim()) return [];

  const ran = await lintText(text, COMMIT, {
    bin,
    run: (argv, init) => $.process.run(argv, init),
  });
  return ran.ran ? ran.found : [];
}

// [[spec/design_output/config#the-resolver-holds-the-layers]]
function configHere($) {
  return configOf({
    read: (path) => $.fs.read(path),
    write: (path, text) => $.fs.write(path, text),
    readEnv: (names) => readEnv($, names),
  });
}

async function judgeSettings(settings) {
  return {
    enabled: await settings.ask("judge.enabled"),
    model: await settings.ask("judge.model"),
    maxSpans: await settings.ask("judge.maxSpans"),
    warmupWrites: await settings.ask("judge.warmupWrites"),
    thenEveryNth: await settings.ask("judge.thenEveryNth"),
  };
}

// [[spec/design_output/review#what-the-reader-answers]]
function materialOf(stdout) {
  const lines = String(stdout ?? "").split(/\r?\n/).reverse();
  for (const line of lines) {
    if (!line.startsWith("{")) continue;
    try {
      const read = JSON.parse(line);
      if (read.branch) return read;
    } catch {}
  }
  return null;
}

// [[spec/design_output/review#where-the-spawn-refuses]]
async function readerRuns($, material, rules) {
  let said = null;
  try {
    said = await $.agent.spawn({
      prompt: readerAsks(material, rules),
      description: `read ${material.branch}`,
      subagentType: "general-purpose",
    });
  } catch (bad) {
    return { fix: 0, unread: `no reader ran here: ${bad?.message ?? bad}` };
  }
  if (said?.deny) return { fix: 0, unread: `the spawn is refused: ${said.deny}` };
  if (said?.isError) return { fix: 0, unread: `the reader failed: ${said.text ?? ""}` };
  return readerSays(said?.text);
}

// [[spec/design_output/level0#the-canary]]
async function heardCanary(logbook, heard, sentence) {
  if (heard.found === "same") {
    return logbook.say("info", "level0", "the canary comes back whole", {
      detail: sentence,
    });
  }
  if (heard.found === "other") {
    return logbook.say("warn", "level0", "the canary comes back with other counts", {
      detail: `said=${heard.said} holds=${sentence}`,
    });
  }
  return logbook.say("warn", "level0", "the canary is absent from the answer", {
    detail: sentence,
  });
}

// [[spec/design_output/stop#the-vote]]
async function bite($, e, it) {
  if (e.reason !== "answer") return;

  const decision = decide(it.rules, { claimed: it.tooth.claim()?.rule, ran: it.ran });
  const said = it.tooth.atTurnEnd(decision, it.mostInARow);
  const how = detail(said, said.inARow);

  for (const name of said.unknown) {
    await it.logbook.say("warn", "stop", `no check answers to ${name}`, { file: RULES });
  }
  if (said.runaway) {
    await it.logbook.say("warn", "stop", "carried enough turns in a row", {
      detail: how,
    });
  }
  await it.logbook.say(
    "info",
    "stop",
    said.ends ? "the turn ends" : "the turn goes on",
    { detail: how },
  );
  if (said.ends) return;

  // [[spec/design_output/stop#holding-a-turn-open]]
  try {
    $.prompt.submit({ text: reprompt(said) }).catch(() => {});
  } catch {}
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
      text = await $.fs.read(path);
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
    const notes = [];
    const wanted = new Set();
    for (const one of await readFolder($, GUIDANCE, ".md")) {
      notes.push(one);
      for (const name of envOf(one.text)) wanted.add(name);
    }
    const env = await readEnv($, [...wanted]);
    const here = notes.filter((one) => bindsHere(one.text, env));
    return { said: standingLayer(here), ...countsOf(here) };
  } catch {
    return { said: "", rules: 0, notes: 0 };
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

async function readFolder($, folder, end) {
  try {
    const entries = await $.fs.list(folder);
    const out = [];
    for (const one of entries) {
      if (!one.name.endsWith(end)) continue;
      out.push({ name: one.name, text: await $.fs.read(`${folder}/${one.name}`) });
    }
    return out;
  } catch {
    return [];
  }
}

async function readRules($, folder) {
  try {
    const entries = await $.fs.list(folder);
    const out = [];
    for (const one of entries) {
      if (!one.name.endsWith(".yml")) continue;
      const rule = readRule(await $.fs.read(`${folder}/${one.name}`));
      out.push({ ...rule, name: one.name.replace(/\.yml$/, "") });
    }
    return out;
  } catch {
    return [];
  }
}

// [[spec/design_output/tools#where-a-caller-looks]]
async function readSurvey($) {
  try {
    return surveyOf(await $.fs.read(TOOLS));
  } catch {
    return {};
  }
}

async function toolHere($, known, name) {
  const said = pathOf(known, name);
  for (const path of [said, ...guesses(name)]) {
    if (!path) continue;
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
      if (ran.exitCode === 0) return true;
    } catch {}
  }
  return false;
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
