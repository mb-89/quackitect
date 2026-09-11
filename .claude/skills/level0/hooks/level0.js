// LEVEL ZERO. The doors that shape what the agent writes, taken inside the
// harness process. This file holds no rule: they live in spec/config/styles
// and spec/guidance.
// [[spec/design_output/level0#the-write-door]]

import {
  answerAfter,
  bandOf,
  CHECK,
  checkSpec,
  gateOf,
  lastSaid,
  opensATurn,
  reachesTheOwner,
  SAYS,
  scoreOf,
  warns,
} from "../lib/answer.js";
import { commitIn, findings as readsCommand, verbLine } from "../lib/bash.js";
import { CODE, formatText, lintText as lintCode } from "../lib/code.js";
import { configOf, SCHEMA, TRACKED } from "../lib/config.js";
import { ASK, controlBlock, holds, QUIET } from "../lib/controls.js";
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
import { asked, BIN, readsAnswer, said as saidOf } from "../lib/index.js";
import { applied, filesIn, patchSpec, replaceSpec } from "../lib/apply.js";
import {
  FOLDER as UNDONE,
  journalOf,
  nameOf as undoName,
  newestOn,
  restores,
  undoSpec,
} from "../lib/undo.js";
import { judgeOf } from "../lib/judge.js";
import {
  aimOf,
  appended,
  archiveOf,
  LOG_TOOL,
  logSpec,
  rowOf,
  SESSION,
  writes,
} from "../lib/log.js";
import { isDraft, relativeTo } from "../lib/paths.js";
import {
  entriesIn,
  ownerOf,
  PROJECTIONS,
  readsOf,
  refusedWrite,
  writesOf,
} from "../lib/projection.js";
import { answerFindings, carried, refusal, refusedCommand } from "../lib/refuse.js";
import { readerAsks, readerSays, report, reviewSpec } from "../lib/review.js";
import { readRule } from "../lib/rulefile.js";
import {
  checkNote,
  END as SCHEMA_END,
  kindOf,
  refusedNote,
  SCHEMAS,
  schemasFrom,
} from "../lib/schema.js";
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
import { deeply, layered } from "../lib/layer.js";
import { MARKER, pairOf } from "../lib/vehicle.js";
import { lintText } from "../lib/vale.js";

const GUIDANCE = "spec/guidance";
const COMMIT = "level0-commit.md";
const HANDOVER = ".se/HANDOVER.md";
const BRIEF = "HANDOVER.md";
const TRUNK = "main";
const JUDGED = "spec/config/styles/VoiceJudged";

const ANSWER = "level0-answer.md";
const GOD = "god";
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
  let owed = null;
  const seen = { ask: QUIET, hold: "running" };
  let root = "";
  let projections = [];
  let schemas = new Map();
  const list = todos();
  let tooth = toothOf();
  const gate = gateOf();

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
    root = cage.root ?? root;
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

    // [[spec/design_output/schema#the-door-refuses-a-departure]]
    schemas = schemasFrom(await readFolder($, cage.roots, SCHEMAS, SCHEMA_END));

    // [[spec/design_output/projection#who-projects-and-when]]
    projections = entriesIn(await inherited($, cage.roots, PROJECTIONS));
    if (projections.length) {
      const drawn = await projectAll($, cage.roots, projections, settings);
      await logbook.say("info", "project", `${drawn.wrote} file(s) written`, {
        ms: drawn.ms,
        detail: `${projections.length} projection(s), ${drawn.size} target(s)`,
      });
      for (const path of drawn.refused) {
        await logbook.say("warn", "project", "the box refuses a target", { file: path });
      }
    }

    // [[spec/design_output/index#the-door-answers-the-tools]]
    warms($, root);

    await $.tool.register(claimSpec(rules));
    await $.tool.register(checkSpec());
    await $.tool.register(reviewSpec());
    await $.tool.register(logSpec());
    await $.tool.register(patchSpec());
    await $.tool.register(replaceSpec());
    await $.tool.register(undoSpec());
    return next(e);
  });

  // [[spec/design_output/log#the-log-tool]]
  on("tool.call", { tool: `mcp__level0__${LOG_TOOL}` }, async (_$, e, _next) => {
    const row = await logbook.say(
      String(e.level ?? "info"),
      String(e.kind ?? "note"),
      String(e.said ?? ""),
      e.text ? { text: String(e.text) } : {},
    );
    return { result: `logged: ${row.kind} ${row.said}` };
  });

  on("prompt.submit", async ($, e, next) => {
    const from = String(e.origin?.kind ?? "");
    tooth.sawPrompt(from === "plugin");
    gate.sawPrompt(from === "plugin");
    if (opensATurn(e.origin)) owed = await owing($, "The owner sent a prompt");
    const text = String(e.text ?? "");
    await logbook.say("info", "prompt", text, { detail: from, text });

    // [[spec/design_output/level0#the-carry-rides-the-next-prompt]]
    const held = opensATurn(e.origin) ? gate.takeWaiting() : null;
    if (!held) return next(e);
    const line = carried(held.found, held.score);
    await logbook.say("info", "answer", "the findings ride this prompt", {
      detail: `score=${held.score}`,
    });
    return next({ ...e, text: [text, line].filter(Boolean).join("\n\n") });
  });

  // [[spec/design_output/log#what-a-tool-line-names]]
  // [[spec/design_output/level0#the-owner-binds-god]]
  on("tool.call", async ($, e, next) => {
    const said = await (async () => {
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
    const asked = await askedNow(settings, seen);
    if (asked) owed = await owing($, asked);
    const answers = await answerDoor($, e, {
      owed,
      off: (await settings.ask("answer.enabled")) === false,
      logbook,
    });
    if (answers.deny) return answers;
    owed = answers.owed;
    const onward = answers.warn
      ? async (given) => withContext(await next(given), answers.warn)
      : next;

    const writing = asWrite(e);
    if (!writing) return onward(e);

    // [[spec/design_output/projection#the-write-door-refuses-one]]
    const owner = ownerOf(projections, writing.path);
    if (owner) {
      const at = relativeTo(root, writing.path);
      await logbook.say("warn", "project", `refused a write to ${at}`, {
        file: at,
        tool: e.tool,
        detail: owner.name ?? owner.target,
      });
      return { deny: refusedWrite(owner, writing.path) };
    }

    const where = relativeTo(root, writing.path);

    // [[spec/design_output/schema#the-underscore-parks-a-draft]]
    if (isDraft(where)) return onward(e);

    // [[spec/design_output/schema#the-door-refuses-a-departure]]
    if (where.endsWith(".md")) {
      const whole = await wholeAfter($, e, writing);
      const kind = kindOf(whole);
      const schema = schemas.get(kind);
      const found = schema ? checkNote(whole, schema, where) : [];
      if (found.length) {
        await logbook.say("warn", "schema", `refused ${found.length} line(s) in ${where}`, {
          file: where,
          rule: found[0]?.rule,
          tool: e.tool,
        });
        return { deny: refusedNote(where, kind, found) };
      }
    }

    if (CODE.test(writing.path)) {
      return await codeDoor($, e, onward, writing, formatter, logbook, root);
    }

    const found = [];
    let kind = "vale";

    if (bin) {
      const said = await lintText(writing.text, where, {
        bin,
        run: (argv, init) => $.process.run(argv, init),
      });
      if (said.ran) found.push(...said.found);
    }

    if (!found.length) {
      judge = judgeOf(
        await judgeSettings(settings),
        await readRules($, cage.roots, JUDGED),
      );
      if (judge.reads()) {
        kind = "judge";
        found.push(
          ...(await judge.run(
            writing.text,
            (text, labels, opts) => $.model.classify(text, labels, opts),
            where,
          )),
        );
      }
    }

    if (!found.length) {
      judge.sawClean();
      return onward(e);
    }
    judge.sawBreach();
    await logbook.say("warn", kind, `refused ${found.length} line(s) in ${where}`, {
      file: where,
      rule: found[0]?.rule,
      tool: e.tool,
    });
    return { deny: refusal(where, found) };
    })();
    return godPasses(logbook, settings, e, next, said);
  });

  // [[spec/design_output/work#a-box-writes-its-branch]]
  on("tool.call", { tool: "Bash" }, async ($, e, next) => {
    const said = await (async () => {
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
    })();
    return godPasses(logbook, settings, e, next, said);
  });

  // [[spec/design_output/bash#what-the-door-reads]]
  on("tool.call", { tool: "Bash" }, async ($, e, next) => {
    const said = await (async () => {
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
    })();
    return godPasses(logbook, settings, e, next, said);
  });

  // [[spec/design_output/apply#validate-everything-then-write]]
  on("tool.call", { tool: "mcp__level0__patch" }, async ($, e, _next) => {
    const ops = Array.isArray(e.ops) ? e.ops : [];
    const took = applied(await readsFiles($, root, filesIn(ops)), ops);
    if (!took.ok) return { result: took.why };
    if (e.preview === true) return { result: wouldLand(took) };
    return { result: await lands($, root, took, String(e.on ?? ""), logbook) };
  });

  // [[spec/design_output/apply#a-pattern-matching-nothing]]
  on("tool.call", { tool: "mcp__level0__replace" }, async ($, e, _next) => {
    const swept = await sweeps($, root, e);
    if (swept.why) return { result: swept.why };

    const took = applied(swept.held, swept.ops);
    if (!took.ok) return { result: took.why };

    const hits = Object.values(took.counts).reduce((n, one) => n + one, 0);
    const wanted = e.expect_count;
    if (wanted !== undefined && Number(wanted) !== hits) {
      return { result: `the pattern matches ${hits} times, and expect_count says ${wanted}` };
    }
    if (e.preview === true) return { result: wouldLand(took) };
    return { result: await lands($, root, took, String(e.on ?? ""), logbook) };
  });

  // [[spec/design_output/apply#drift-refuses-the-restore]]
  on("tool.call", { tool: "mcp__level0__undo" }, async ($, e, _next) => {
    const said = await takesBack($, root, String(e.on ?? ""));
    await logbook.say(said.ok ? "info" : "warn", "undo", said.result.split("\n")[0], {
      detail: String(e.on ?? ""),
    });
    return { result: said.result };
  });

  // [[spec/design_output/index#the-door-answers-the-tools]]
  for (const tool of ["Grep", "Glob"]) {
    on("tool.call", { tool }, async ($, e, next) => {
      const ask = asked(e);
      if (!ask || !root) return next(e);

      const where = relativeTo(root, String(e.path ?? ""));
      if (/^([A-Za-z]:)?[\\/]/.test(where)) return next(e);
      ask.params.path = where;

      const answer = await askIndex($, root, ask);
      if (!answer) return next(e);

      await logbook.say("info", "index", `${ask.method} reads the rows`, {
        tool,
        detail: String(e.pattern ?? "").slice(0, 120),
      });
      return { result: saidOf(e, answer) };
    });
  }

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

  // [[spec/design_output/level0#the-tool-reads-a-draft]]
  on("tool.call", { tool: `mcp__level0__${CHECK}` }, async ($, e, _next) => {
    const text = String(e.text ?? "");
    if (!text.trim()) return { result: `${CHECK} takes the text of one draft.` };
    if (!bin) return { result: "No vale stands here, so the draft goes unread." };

    const ran = await lintText(text, ANSWER, {
      bin,
      run: (argv, init) => $.process.run(argv, init),
    });
    if (!ran.ran) return { result: `Vale read nothing: ${ran.why}` };

    const score = scoreOf(text, ran.found);
    const band = ran.found.length ? bandOf(score, await bands(settings)) : "clean";
    await logbook.say("info", "answer", `a draft reads ${band}`, {
      detail: `score=${score} findings=${ran.found.length}`,
    });
    return { result: answerFindings(ANSWER, { found: ran.found, score, band }) };
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

  // [[spec/design_output/level0#a-step-carries-the-answer]]
  on("turn.step", async (_$, e, next) => {
    const said = await next(e);
    if (!owed || (await settings.ask("answer.enabled")) === false) return said;
    const text = String(e.answer ?? "").trim();
    if (text) {
      await logbook.say("info", "answer", text, { text, detail: owed.why });
      owed = null;
    } else {
      owed = { ...owed, stepped: true };
    }
    return said;
  });

  on("turn.complete", async ($, e, next) => {
    const said = await next(e);
    owed = null;
    // [[spec/design_output/log#a-reply-beside-its-prompt]]
    if (e.reason === "answer" && e.answer) {
      await logbook.say("info", "reply", e.answer, { text: String(e.answer) });
    }
    if (firstTurn && e.reason === "answer") {
      firstTurn = false;
      await heardCanary(logbook, canaryIn(e.answer, sentence), sentence);
    }
    const off = (await settings.ask("stop.enabled")) === false;
    const hold = await settings.ask("stop.hold");
    const mostInARow = await settings.ask("stop.mostInARow");
    const bit = await bite($, e, {
      rules,
      tooth,
      logbook,
      mostInARow,
      ran: (name) => ranHere(name, off, hold),
    });
    await dropAsk(settings, logbook);
    if (!bin || !e.answer || e.reason !== "answer") return said;

    const ran = await lintText(e.answer, ANSWER, {
      bin,
      run: (argv, init) => $.process.run(argv, init),
    });
    if (!ran.ran) return said;

    // [[spec/design_output/level0#the-three-bands]]
    const read = gate.atTurnEnd({
      ...(await bands(settings)),
      text: e.answer,
      found: ran.found,
      mostInARow,
      toothSpoke: Boolean(bit?.sent),
    });
    await logbook.say(read.band === "clean" ? "info" : "warn", "answer", `the gate reads ${read.band}`, {
      detail: `score=${read.score} findings=${ran.found.length} inARow=${gate.inARow()}`,
    });
    if (!read.sends) return said;

    // [[spec/design_output/level0#the-re-prompt-over-the-ceiling]]
    try {
      $.prompt.submit({ text: answerFindings(ANSWER, read) }).catch(() => {});
    } catch {}
    return said;
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

    // [[spec/design_output/extension#the-ask-is-a-line]]
    const asks = controlBlock({
      hold: await settings.ask("stop.hold"),
      wanted: await settings.ask(ASK),
    });
    if (asks) blocks.push({ name: "level0-owner-asks", text: asks });

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
  function ranHere(name, off, hold) {
    if (name === "work-waiting") return list.standing() || onAHeldBranch;
    if (name === "session-is-new") return tooth.isNew();
    if (name === "stop-hook-off") return off;
    if (name === "owner-holds") return holds(hold);
    if (name === "never") return false;
    return undefined;
  }
}

// [[spec/design_output/extension#the-ask-is-a-line]]
async function dropAsk(settings, logbook) {
  const said = String((await settings.ask(ASK)) ?? QUIET);
  if (said === QUIET) return;
  await settings.write(ASK, QUIET);
  await logbook.say("info", "config", `the ask stood at ${said}, and drops to ${QUIET}`);
}

// [[spec/design_output/level0#what-the-cage-loads]]
async function loadCage($, cage) {
  const faults = [];

  cage.root = await rootHere($);
  // [[spec/design_output/vehicle#one-tree-drives-itself]]
  cage.roots = pairOf(await methodUp($, cage.root), cage.root);
  cage.settings = configHere($, cage.roots);
  cage.judge = judgeOf(await judgeSettings(cage.settings));
  cage.tooth = toothOf({ mostInARow: await cage.settings.ask("stop.mostInARow") });
  if (!cage.wired) {
    cage.logbook = logHere(
      { read: (at) => $.fs.read(at), write: (at, text) => $.fs.write(at, text) },
      await cage.settings.ask("log.level"),
    );
    await cage.logbook.rotate();
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

  const guidance = await readGuidance($, cage.roots);
  cage.standing = guidance.said;
  cage.sentence = canary({
    rules: guidance.rules,
    notes: guidance.notes,
    stop: (await cage.settings.ask("stop.enabled")) !== false,
  });
  if (!cage.standing) faults.push(`${GUIDANCE} hands over nothing`);

  // [[spec/design_output/stop#where-the-rules-live]]
  const pooled = pool(await readFolder($, cage.roots, RULES, ".yml"));
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

// [[spec/design_output/vehicle#a-marker-names-the-root]]
async function methodUp($, work) {
  let here = String(work ?? "")
    .split("\\")
    .join("/")
    .replace(/\/+$/, "");
  while (here) {
    try {
      if (await $.fs.exists(`${here}/${MARKER}`)) return here;
    } catch {
      return "";
    }
    const up = here.slice(0, here.lastIndexOf("/"));
    if (!up || up === here) return "";
    here = up;
  }
  return "";
}

// [[spec/design_output/vehicle#one-tree-drives-itself]]
function methodAt(roots, path) {
  return roots?.itself === false ? `${roots.method}/${path}` : path;
}

// [[spec/design_output/vehicle#the-work-root-inherits]]
function layersOf(roots, path) {
  return roots?.itself === false ? [`${roots.method}/${path}`, path] : [path];
}

// [[spec/design_output/level0#the-path-a-rule-reads]]
async function rootHere($) {
  try {
    const said = await $.process.run(["git", "rev-parse", "--show-toplevel"]);
    return said?.exitCode === 0 ? String(said.stdout ?? "").trim() : "";
  } catch {
    return "";
  }
}

// [[spec/design_output/projection#who-projects-and-when]]
async function projectAll($, roots, entries, settings) {
  const began = Date.now();
  const refused = [];
  let size = 0;
  let wrote = 0;

  for (const entry of entries) {
    const texts = new Map();
    for (const path of readsOf(entry)) {
      texts.set(path, await projected($, roots, path, settings));
    }
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

// [[spec/design_output/vehicle#the-work-root-inherits]]
async function projected($, roots, path, settings) {
  if (path === TRACKED) return settings.text();
  return inherited($, roots, path);
}

// [[spec/design_output/vehicle#the-work-root-inherits]]
async function inherited($, roots, path) {
  const under = await readIf($, methodAt(roots, path));
  if (roots?.itself !== false) return under;

  const over = await readIf($, path);
  if (!over.trim()) return under;
  if (!path.endsWith(".json")) return over;

  try {
    return `${JSON.stringify(deeply(JSON.parse(under || "{}"), JSON.parse(over)), null, 2)}\n`;
  } catch {
    return over;
  }
}

async function readIf($, path) {
  try {
    return String(await $.fs.read(path));
  } catch {
    return "";
  }
}

// [[spec/design_output/level0#one-warning-then-a-refusal]]
async function answerDoor($, e, it) {
  const owed = it.owed;
  if (!owed || it.off) return { owed };
  if (e.agentId || reachesTheOwner(e.tool)) return { owed };

  let said = "";
  try {
    said = answerAfter(await $.session.messages(), owed.seen);
  } catch {
    return { owed: null };
  }
  // [[spec/design_output/log#the-answer-under-its-prompt]]
  if (said) {
    await it.logbook.say("info", "answer", said, { text: said, detail: owed.why });
    return { owed: null };
  }
  if (!owed.stepped) return { owed };

  if (!owed.warned) {
    await it.logbook.say("warn", "gate", `warned ${e.tool} before an answer`, {
      tool: e.tool,
      detail: owed.why,
    });
    return { owed: { ...owed, warned: true }, warn: warns(owed.why) };
  }
  await it.logbook.say("warn", "gate", `refused ${e.tool} before an answer`, {
    tool: e.tool,
    detail: owed.why,
  });
  return { deny: `${owed.why}. ${SAYS}`, owed };
}

// [[spec/design_output/level0#what-counts-as-owed]]
async function owing($, why) {
  let seen = "";
  try {
    seen = lastSaid(await $.session.messages());
  } catch {}
  return { why, seen, warned: false, stepped: false };
}

async function askedNow(settings, seen) {
  const ask = String((await settings.ask(ASK)) ?? QUIET);
  const hold = String((await settings.ask("stop.hold")) ?? "running");
  let why = "";
  if (ask !== seen.ask && ask !== QUIET) why = `The owner asks for a ${ask} update`;
  if (hold !== seen.hold && hold === "stopped") why = "The owner holds this session at stopped";
  seen.ask = ask;
  seen.hold = hold;
  return why;
}

// [[spec/design_output/level0#the-owner-binds-god]]
async function godPasses(logbook, settings, e, next, said) {
  if (!said?.deny || (await settings.ask("engine.binding")) !== GOD) return said;
  await logbook.say("warn", "god", `passed ${e.tool} past a refusal`, {
    tool: e.tool,
    detail: String(said.deny).replace(/\s+/g, " ").slice(0, 200),
  });
  return next(e);
}

function withContext(said, text) {
  if (!said || said.deny) return said;
  return { ...said, context: [...(said.context ?? []), text] };
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
function configHere($, roots) {
  return configOf({
    tracked: layersOf(roots, TRACKED),
    schema: methodAt(roots, SCHEMA),
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
  if (e.reason !== "answer") return { sent: false };

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
  if (said.ends) return { sent: false };

  // [[spec/design_output/stop#holding-a-turn-open]]
  try {
    $.prompt.submit({ text: reprompt(said) }).catch(() => {});
  } catch {}
  return { sent: true };
}

// [[spec/design_output/level0#the-three-bands]]
async function bands(settings) {
  return {
    warnAt: await settings.ask("answer.warnAt"),
    ceiling: await settings.ask("answer.ceiling"),
  };
}

// [[spec/design_output/log#where-the-writer-stands]]
function logHere(fs, at) {
  const rows = [];
  const stamp = () => new Date().toISOString();
  const id = Math.random().toString(16).slice(2).padEnd(8, "0").slice(0, 8);
  let queue = Promise.resolve();
  const inTurn = (work) => {
    queue = queue.then(work).catch(() => {});
    return queue;
  };
  const readNow = async () => {
    try {
      return String(await fs.read(SESSION));
    } catch {
      return "";
    }
  };

  return {
    path: SESSION,
    lines: () => rows.map((one) => ({ ...one })),
    // [[spec/design_output/log#a-session-rotates-its-file]]
    async rotate() {
      if (!fs) return;
      await inTurn(async () => {
        const was = await readNow();
        if (!was.trim()) return;
        await fs.write(archiveOf(was, stamp(), id), was);
        await fs.write(SESSION, "");
      });
    },
    async say(level, kind, said, more) {
      const row = rowOf(stamp(), level, kind, said, more);
      if (!writes(at, row.level)) return row;
      rows.push(row);
      if (!fs) return row;
      await inTurn(async () => fs.write(SESSION, appended(await readNow(), row)));
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
async function readGuidance($, roots) {
  try {
    const notes = [];
    const wanted = new Set();
    for (const one of await readFolder($, roots, GUIDANCE, ".md")) {
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

// [[spec/design_output/vehicle#the-work-root-inherits]]
async function readFolder($, roots, folder, end) {
  const under = await inFolder($, methodAt(roots, folder), end);
  if (roots?.itself !== false) return under;
  return layered(under, await inFolder($, folder, end));
}

async function inFolder($, folder, end) {
  try {
    const entries = await $.fs.list(folder);
    const out = [];
    for (const one of entries) {
      if (!one.name.endsWith(end) || isDraft(one.name)) continue;
      out.push({ name: one.name, text: await $.fs.read(`${folder}/${one.name}`) });
    }
    return out;
  } catch {
    return [];
  }
}

// [[spec/design_output/vehicle#the-work-root-inherits]]
async function readRules($, roots, folder) {
  return (await readFolder($, roots, folder, ".yml")).map((one) => ({
    ...readRule(one.text),
    name: one.name.replace(/\.yml$/, ""),
  }));
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
async function codeDoor($, e, next, writing, formatter, logbook, root) {
  if (!formatter) return next(e);
  const run = (argv, init) => $.process.run(argv, init);
  const where = relativeTo(root, writing.path);

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
  const ways = [["sh", "src/scripts/install.sh"]];
  for (const argv of ways) {
    try {
      const ran = await $.process.run(argv, { timeoutMs: 300000 });
      if (ran.exitCode === 0) return true;
    } catch {}
  }
  return false;
}

// [[spec/design_output/index#the-door-answers-the-tools]]
async function whereIsIndex($, root) {
  for (const at of [`${root}/${BIN}`, `${root}/${BIN}.exe`]) {
    try {
      if (await $.fs.exists(at)) return at;
    } catch {
      return "";
    }
  }
  return "";
}

// [[spec/design_output/index#the-door-answers-the-tools]]
async function askIndex($, root, ask) {
  const at = await whereIsIndex($, root);
  if (!at) return null;

  let ran;
  try {
    ran = await $.process.run([at, "call", ask.method, JSON.stringify(ask.params)], {
      cwd: root,
      timeoutMs: 20000,
    });
  } catch {
    return null;
  }
  if (ran?.exitCode !== 0) return null;
  return readsAnswer(ran.stdout);
}

// [[spec/design_output/index#the-door-answers-the-tools]]
function warms($, root) {
  if (!root) return;
  whereIsIndex($, root)
    .then((at) =>
      at ? $.process.run([at, "standing"], { cwd: root, timeoutMs: 60000 }) : null,
    )
    .catch(() => {});
}

// [[spec/design_output/apply#bytes-in-bytes-out]]
async function readsFiles($, root, paths) {
  const held = {};
  for (const path of paths) {
    const at = inTheTree(root, path);
    if (!at) {
      held[path] = { exists: false, outside: true };
      continue;
    }
    try {
      held[path] = { exists: true, text: String(await $.fs.read(at)) };
    } catch {
      held[path] = { exists: false };
    }
  }
  return held;
}

// [[spec/design_output/apply#bytes-in-bytes-out]]
function inTheTree(root, path) {
  const said = relativeTo(root, String(path ?? "")).split("\\").join("/");
  if (!said || said.startsWith("/") || said.startsWith("../") || /^[A-Za-z]:/.test(said)) {
    return "";
  }
  return said;
}

// [[spec/design_output/apply#the-journal-holds-both-halves]]
async function lands($, root, took, on, logbook) {
  const at = new Date().toISOString();
  const entry = journalOf(at, on, "level0", took.files);
  const where = `${UNDONE}/${undoName(at)}`;

  try {
    await $.fs.write(where, `${JSON.stringify(entry, null, 2)}\n`);
  } catch (bad) {
    return `the undo journal would not write, so nothing did: ${bad?.message ?? bad}`;
  }

  const wrote = [];
  for (const one of took.files) {
    const path = inTheTree(root, one.file);
    try {
      await $.fs.write(path, one.made);
      wrote.push(one.file);
    } catch (bad) {
      return [
        `${one.file} would not write: ${bad?.message ?? bad}`,
        `The tree stands part written. Run undo to put it back, out of ${where}.`,
      ].join("\n");
    }
  }

  await logbook.say("info", "apply", `${wrote.length} file(s) written`, {
    detail: on.slice(0, 120),
    file: where,
  });
  return [
    `${wrote.length} file(s) written, and ${where} holds what they said before.`,
    ...wrote.map((one) => `  ${one} (${took.counts[one]} place(s))`),
    "",
    "Run undo to take this back while nothing else touches these files.",
  ].join("\n");
}

// [[spec/design_output/apply#drift-refuses-the-restore]]
async function takesBack($, root, on) {
  let names = [];
  try {
    names = (await $.fs.list(UNDONE)).map((one) => one.name).filter((one) => one.endsWith(".json"));
  } catch {
    return { ok: false, result: "nothing to undo: no apply journals one here" };
  }
  if (!names.length) return { ok: false, result: "nothing to undo: no apply journals one here" };

  const entries = {};
  for (const name of names) {
    try {
      entries[name] = JSON.parse(String(await $.fs.read(`${UNDONE}/${name}`)));
    } catch {}
  }

  const newest = newestOn(names, entries, on);
  if (!newest) {
    return {
      ok: false,
      result: `nothing of ${on || "this session"} to undo: an undo takes back what its own name wrote`,
    };
  }

  const held = await readsFiles($, root, newest.entry.files.map((one) => one.file));
  const said = restores(newest.entry, held);
  if (!said.ok) return { ok: false, result: said.why };

  const done = [];
  for (const one of said.writes) {
    await $.fs.write(inTheTree(root, one.file), one.text);
    done.push(`  put back ${one.file}`);
  }
  for (const path of said.removes) {
    await erase($, inTheTree(root, path));
    done.push(`  removed ${path}, which the apply made`);
  }
  await erase($, `${UNDONE}/${newest.name}`);
  return { ok: true, result: [`${done.length} file(s) come back.`, ...done].join("\n") };
}

// [[spec/design_output/apply#a-pattern-matching-nothing]]
async function sweeps($, root, e) {
  const pattern = String(e.pattern ?? "");
  const glob = String(e.glob ?? "");
  const flags = `${String(e.flags ?? "").replace(/[^ims]/g, "")}g`;

  let shape;
  try {
    shape = new RegExp(pattern, flags);
  } catch (bad) {
    return { why: `the pattern compiles to nothing: ${bad?.message ?? bad}` };
  }

  const answer = await askIndex($, root, {
    method: "grep",
    params: { pattern, glob, limit: 0 },
  });
  if (!answer) return { why: "the index answers nothing here, so the sweep has no list to work" };

  const paths = (answer.files ?? []).map((one) => one.path);
  if (!paths.length) return { why: "the pattern matches nothing under that glob" };

  const held = await readsFiles($, root, paths);
  const ops = [];
  for (const path of paths) {
    const text = held[path]?.text ?? "";
    shape.lastIndex = 0;
    if (!shape.test(text)) continue;
    ops.push({
      file: path,
      op: "regex",
      pattern,
      replacement: String(e.replacement ?? ""),
      flags: String(e.flags ?? ""),
    });
  }
  if (!ops.length) return { why: "the pattern matches nothing under that glob" };
  return { held, ops };
}

// [[spec/design_output/apply#validate-everything-then-write]]
function wouldLand(took) {
  const rows = took.files
    .map((one) => `  ${one.file} (${took.counts[one.file]} place(s))${one.born ? ", new" : ""}`)
    .sort();
  return [`${took.files.length} file(s) would change, and nothing is written.`, ...rows].join(
    "\n",
  );
}

// [[spec/design_output/schema#the-door-refuses-a-departure]]
async function wholeAfter($, e, writing) {
  if (e.tool === "Write") return writing.text;
  let was = "";
  try {
    was = String(await $.fs.read(writing.path));
  } catch {
    return writing.text;
  }
  const edits = e.tool === "MultiEdit" && Array.isArray(e.edits) ? e.edits : [e];
  let text = was;
  for (const one of edits) {
    const from = String(one?.old_string ?? "");
    const to = String(one?.new_string ?? "");
    if (!from) continue;
    text = one?.replace_all ? text.split(from).join(to) : text.replace(from, () => to);
  }
  return text;
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
