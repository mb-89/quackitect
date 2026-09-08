// LEVEL ZERO. The rules that shape what the agent writes, taken inside the
// harness process rather than by a server it spawns.
//
// Nothing here waits for a build, so these rules hold on turn one of a clone
// that has never been built. That is the whole reason this is a module: a tool
// registered at session.start cannot arrive late, and six cloud sessions in
// earlier lines died on a lane that could.
//
// The rules live in spec/config/styles and Vale holds them. This file holds the
// doors, and it holds no rule.

import { lintText, VALE } from "../lib/vale.mjs";
import { refusal, taught } from "../lib/refuse.mjs";
import { standingLayer } from "../lib/guidance.mjs";
import { tooMuchProse, IN_AN_ANSWER, IN_A_DOCUMENT } from "../lib/shape.mjs";
import { judgeOf } from "../lib/judge.mjs";

// The prose the write door reads. Vale itself decides what inside a file is
// prose, so a fenced block and a table need no rule here.
const PROSE = /\.(md|markdown|txt)$/i;
const GUIDANCE = "spec/guidance";
const CONFIG = "spec/config/level0.json";
const HANDOVER = ".se/HANDOVER.md";

export function register(on, options) {
  // Module state survives between hooks in one session, so the linter is found
  // once and the door reads the answer.
  let bin = null;
  let standing = "";
  let config = {};
  let judge = judgeOf({});
  let handover = "";

  on("session.start", async ($, e, next) => {
    bin = await linterHere($);
    if (!bin) bin = await install($);
    standing = await readGuidance($);
    config = await readConfig($);
    judge = judgeOf(config);
    handover = await takeHandover($);

    try {
      await $.fs.writeFile(".se/level0.stamp",
        new Date().toISOString() + " vale=" + (bin ?? "missing") + "\n");
    } catch {
      // .se is runtime state, and its absence is no reason to refuse a session.
    }
    return next(e);
  });

  // THE WRITE DOOR. A write carrying a breach is refused with the reason, and
  // the reason teaches the rest of the turn.
  on("tool.call", async ($, e, next) => {
    const writing = asWrite(e);
    if (!writing) return next(e);
    if (!PROSE.test(writing.path)) return next(e);

    const where = shorten(writing.path);
    const found = [];

    // The mechanical rules first, because they cost nothing. A checker that
    // cannot run degrades the call and lets it through.
    if (bin) {
      const said = await lintText(writing.text, where, {
        bin,
        run: (argv, init) => $.process.run(argv, init),
      });
      if (said.ran) found.push(...said.found);
    }
    found.push(...tooMuchProse(writing.text, config.shape?.inADocument ?? IN_A_DOCUMENT));

    // The model last, and only when it earns the call. It spends one call per
    // span, so it runs where the patterns already passed.
    if (!found.length && judge.reads()) {
      found.push(...await judge.run(writing.text,
        (text, labels, opts) => $.model.classify(text, labels, opts)));
    }

    if (!found.length) {
      judge.sawClean();
      return next(e);
    }
    judge.sawBreach();
    return { deny: refusal(where, found) };
  });

  // THE ANSWER IS READ TOO. A wall of prose in a chat answer costs the reader
  // the same as one in a file, and the reader is the same person. This event
  // cannot refuse a turn, so the note is drawn beneath the answer.
  on("turn.complete", async ($, e, next) => {
    const said = await next(e);
    if (!e.answer || e.reason !== "answer") return said;

    const found = tooMuchProse(e.answer, config.shape?.inAnAnswer ?? IN_AN_ANSWER);
    if (!found.length) return said;

    return {
      ...said,
      text: [said.text, "", found.map((one) => "  " + one.message).join("\n"), "",
        "  " + taught(found)].filter(Boolean).join("\n"),
    };
  });

  // THE STANDING LAYER, INJECTED AND NEVER PROJECTED. Every guidance note's
  // Actionables chapter reaches the model inside the system prompt, computed
  // here at session start.
  //
  // A projection would write the same text into a file in the tree, and a guard
  // would then be needed to keep that copy honest. A copy nobody can edit needs
  // no guard.
  //
  // THE MATCHER IS NOT OPTIONAL. This event fires once for each of the two
  // dozen sections the engine assembles, so a hook without one appends the
  // rules to every section and to the empty ones as well. `output_style` is the
  // slot that carries how the agent works, which is what these rules are.
  on("prompt.section", { name: "output_style" }, async ($, e, next) => {
    if (!standing) return next(e);
    return next({
      ...e,
      text: [
        e.text,
        [
          "# How this tree is worked",
          "",
          "These rules reach you before anything else. Vale holds the mechanical",
          "ones at the write door, so a write breaking one comes back with the",
          "reason and the line.",
          "",
          standing,
        ].join("\n"),
      ].filter(Boolean).join("\n\n"),
    });
  });

  // THE RECEIPT, ASKED ONCE. This event computes the blocks the first user
  // message carries, so it fires once per conversation. The ask rides here
  // rather than in the system prompt, where it would ask on every answer.
  //
  // The agent counts the rules itself. A number handed to it proves nothing,
  // because repeating a constant is not reading.
  on("prompt.context", async ($, e, next) => {
    if (!standing && !handover) return next(e);
    const said = await next(e);
    const blocks = [...said.blocks];

    // The last session's handover, read once and already deleted. Nobody has to
    // remember to clear it, so nobody leaves a stale one.
    if (handover) {
      blocks.push({
        name: "level0-handover",
        text: [
          "The last session on this box left this handover. It is already",
          "deleted, so act on it now and leave a new one at .se/HANDOVER.md",
          "before you finish.",
          "",
          handover.trim(),
        ].join("\n"),
      });
    }

    if (!standing) return { ...said, blocks };
    return {
      ...said,
      blocks: [
        ...blocks,
        {
          name: "level0",
          text: [
            "End your FIRST answer of this conversation with one last line, on its own:",
            "",
            "    rules: <n>",
            "",
            "where <n> is how many numbered rules stand in the section naming how this",
            "tree is worked, counted across every heading there. Count them and write",
            "what you counted. Write this line once and never again in this",
            "conversation.",
          ].join("\n"),
        },
      ],
    };
  });
}

// The Actionables chapter of every guidance note, and no other chapter. The
// argument behind a rule stays on disk for a reader who disagrees with it.
async function readGuidance($) {
  try {
    const entries = await $.fs.listDir(GUIDANCE);
    const notes = [];
    for (const one of entries) {
      if (!one.name.endsWith(".md")) continue;
      notes.push({ name: one.name, text: await $.fs.readFile(GUIDANCE + "/" + one.name) });
    }
    return standingLayer(notes);
  } catch {
    return "";
  }
}

// Reads the handover the last session left, then deletes it, so the next
// session never picks up a stale one. Deleting it here rather than asking the
// agent to leaves nothing for anybody to forget.
//
// The text is already in this module's own state by the time the file goes, so
// the delete costs the session nothing.
async function takeHandover($) {
  let text = "";
  try {
    text = await $.fs.readFile(HANDOVER);
  } catch {
    return "";
  }
  if (!text.trim()) return "";

  // $.fs writes and reads and does not delete, so the shell does it. A box
  // carrying neither shell keeps the file, and the next session reads it twice.
  for (const argv of [
    ["rm", "-f", HANDOVER],
    ["cmd", "/c", "del", "/q", ".se\\HANDOVER.md"],
  ]) {
    try {
      const ran = await $.process.run(argv, { timeoutMs: 10000 });
      if (ran.exitCode === 0) break;
    } catch {
      // The next way answers.
    }
  }
  return text;
}

// The switches a person owns. A missing file leaves every default standing, so
// a clone works before anybody configures it.
async function readConfig($) {
  try {
    return JSON.parse(await $.fs.readFile(CONFIG));
  } catch {
    return {};
  }
}

async function linterHere($) {
  for (const path of [VALE + ".exe", VALE]) {
    try {
      if (await $.fs.exists(path)) return path;
    } catch {
      return null;
    }
  }
  return null;
}

// Level zero installs what it needs, so a first session on a fresh clone is
// guarded without anybody having run RUNME first.
async function install($) {
  const ways = [
    ["sh", "src/scripts/install.sh"],
    ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "src\\scripts\\install.ps1"],
  ];
  for (const argv of ways) {
    try {
      const ran = await $.process.run(argv, { timeoutMs: 300000 });
      if (ran.exitCode === 0) {
        const found = await linterHere($);
        if (found) return found;
      }
    } catch {
      // A box may carry one shell and not the other. The next way answers.
    }
  }
  return null;
}


// A refusal names the file the way a person writing it does, so the absolute
// path the tool carries is cut to its last two parts.
function shorten(path) {
  const parts = String(path).split(/[\\/]/).filter(Boolean);
  return parts.slice(-2).join("/");
}

// A tool's arguments are spread onto the event beside `tool` and `tool_use_id`,
// so the text is at `e.content` and never at `e.input.content`. Write, Edit and
// the multi-edit form each carry it under a different key.
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
