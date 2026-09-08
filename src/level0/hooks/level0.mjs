// LEVEL ZERO. The rules that shape what the agent writes, taken inside the
// harness process rather than by a server it spawns.
//
// Nothing here waits for a build, so these rules hold on turn one of a clone
// that has never been built. That is the whole reason this is a module: a tool
// registered at session.start cannot arrive late, and six cloud sessions died
// on a lane that could.
//
// The rules live in ../lib and are pure JavaScript, so the linter and the
// language server read the same ones. This file holds the doors, no rules.

import { check, judge, applyFixes } from "../lib/check.mjs";
import { refusal, taught, line as asLine } from "../lib/refuse.mjs";
import { rules, judged } from "../lib/rules.mjs";

// Prose the rules read. A fenced block inside one of these is left alone by
// the checker itself.
const PROSE = /\.(md|markdown|txt)$/i;

export function register(on, options) {
  const held = new Set();

  on("session.start", async ($, e, next) => {
    await $.tool.register({
      name: "voice_check",
      description:
        "Checks text against the project's voice rules and answers the breaches, "
        + "one per line, with what to write instead. Takes the text, and the path it "
        + "is destined for when there is one.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "The text to check." },
          path: { type: "string", description: "Where the text is destined." },
        },
        required: ["text"],
      },
    });

    await $.tool.register({
      name: "voice_format",
      description:
        "Applies every voice fix a program can make to the text and answers the "
        + "result. A rule with no fix is left for voice_check to report.",
      inputSchema: {
        type: "object",
        properties: { text: { type: "string", description: "The text to format." } },
        required: ["text"],
      },
    });

    await $.tool.register({
      name: "voice_rules",
      description:
        "Answers the voice rules this project holds, each with why it exists and "
        + "what to write instead.",
      inputSchema: { type: "object", properties: {} },
    });

    // The stamp says the module loaded, for a probe that cannot ask the session
    // it is in. A plugin loads once per process, so a session can never see its
    // own install.
    try {
      await $.fs.writeFile(".se/level0.stamp", new Date().toISOString() + "\n");
    } catch {
      // .se is runtime state and its absence is not a fault worth refusing a
      // session over.
    }

    return next(e);
  });

  // THE WRITE DOOR. A write carrying a breach is refused with the reason, and
  // the reason teaches the rest of the turn rather than the one line.
  on("tool.call", async ($, e, next) => {
    const writing = asWrite(e);
    if (!writing) return next(e);
    if (!PROSE.test(writing.path)) return next(e);

    // The patterns run first and cost nothing. The judge spends a model call
    // per sentence, so it runs only when the patterns pass.
    let all = check(writing.text);
    if (!all.length) {
      all = await judge(writing.text, (text, labels) => $.model.classify(text, labels));
    }
    if (!all.length) return next(e);

    for (const one of all) held.add(one.rule);
    return { deny: refusal(shorten(writing.path), all) };
  });

  on("tool.call", { tool: "mcp__level0__voice_check" }, async ($, e, next) => {
    const text = String(e.text ?? "");
    const where = String(e.path ?? "the text");
    const found = check(text);
    const said = await judge(text, (t, labels) => $.model.classify(t, labels));
    const all = [...found, ...said].sort((a, b) => a.line - b.line);
    if (!all.length) return { result: "The voice rules pass this text." };
    return { result: all.map((one) => asLine(one, where)).join("\n") + "\n\n" + taught(all) };
  });

  on("tool.call", { tool: "mcp__level0__voice_format" }, async ($, e, next) => {
    return { result: applyFixes(String(e.text ?? "")) };
  });

  on("tool.call", { tool: "mcp__level0__voice_rules" }, async ($, e, next) => {
    const said = [...rules, ...judged].map(
      (r) => `${r.name}\n  why:     ${r.why}\n  instead: ${r.instead}`,
    );
    return { result: said.join("\n\n") };
  });

  // THE STANDING LAYER, INJECTED. The rules reach the model as a section of the
  // system prompt, computed here, so no file is projected into the tree and no
  // guard is needed to keep one honest.
  on("prompt.section", async ($, e, next) => {
    const said = [...rules, ...judged]
      .map((r) => `- ${r.name}: ${r.why} ${r.instead}`)
      .join("\n");
    return next({
      ...e,
      text: [e.text, "", "## The voice", "", said, "",
        "These rules are held at the write door, so a write breaking one is refused.",
      ].filter(Boolean).join("\n"),
    });
  });
}

// A tool's arguments are spread onto the event beside `tool` and `tool_use_id`,
// so the text is at `e.content` and never at `e.input.content`. Write, Edit and
// the multi-edit form each carry it under a different key, so the door reads
// all three and answers one shape.
// A refusal names the file the way a person writing it does, so the absolute
// path the tool carries is cut to its last two parts.
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
