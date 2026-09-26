// The pull tool's pure half. The argv it hands the shell and the question it
// puts to the judge, read with no harness standing.
// [[spec/design_output/pull#the-checks]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as lib from "../../.claude/skills/level0/lib/pull.js";
import {
  judgeAsk,
  judgeRefusal,
  PULL_CALL,
  pullSpec,
  sessionOf,
  spawnPromptIn,
} from "../../.claude/skills/level0/lib/pull.js";
// The whole module, so a name the wrapper answers nowhere yet fails an assertion. [[spec/tickets/the-judge-reads-answer-rules]]
import * as level1 from "../../.claude/skills/level0/lib/pull.js";
import { pullArgvOf } from "../../src/scripts/pull-tool.js";

// The rules a leaf hands the judge, each label naming one rule. [[spec/tickets/the-judge-reads-answer-rules]]
const RULES = [
  {
    label: "voice-1",
    note: "spec/guidance/voice",
    number: 1,
    rule: "Say what is.",
  },
  {
    label: "voice-3",
    note: "spec/guidance/voice",
    number: 3,
    rule: "Put the bottom line first.",
  },
];
// The hooks level one registers, keyed by their event. A registration carries a filter between the event and the handler, so the last argument is the handler. [[spec/design_output/pull#the-checks]]
async function hooksHere() {
  const { register } = await import("../../.claude/skills/level0/hooks/pull-tool.js");
  const held = {};
  register((event, ...rest) => {
    held[event] = rest.at(-1);
  }, {});
  return held;
}

// The harness the hook reaches: the files it writes, the tool it registers first, and the lines it says. [[spec/design_output/pull#the-hand-and-the-hold]]
function harness() {
  const wrote = new Map();
  const lines = [];
  return {
    wrote,
    lines,
    $: {
      fs: { write: async (path, text) => void wrote.set(path, text) },
      tool: { register: async () => {} },
      ui: { log: (line) => lines.push(line) },
    },
  };
}

// The engine takes one session start a module and counts them in the source. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
test("the module registers one session start, and it registers the pull tool and the read tools", async () => {
  const { register } = await import("../../.claude/skills/level0/hooks/pull-tool.js");
  const { READ_TOOLS } = await import("../../.claude/skills/level0/hooks/level0.js");
  const counts = {};
  const starts = [];
  register((event, ...rest) => {
    counts[event] = (counts[event] ?? 0) + 1;
    if (event === "session.start") starts.push(rest.at(-1));
  }, {});
  assert.equal(counts["session.start"], 1, "one start a module");

  const registered = [];
  const box = harness();
  box.$.tool.register = async (spec) => void registered.push(spec.name);
  await starts[0](
    box.$,
    { session_id: "s1", client: "claude-code" },
    async (said) => said,
  );
  assert.equal(registered[0], "pull", "the pull tool registers first");
  for (const one of READ_TOOLS) assert.ok(registered.includes(one.name), one.name);
});

// [[spec/design_output/pull#a-hand-of-its-own]]
test("the wrapper reads the prompt out of a spawn answer, and nothing out of any other", () => {
  const said =
    "spawn\n  a-child at design/review waits for a hand other than box 1.\n  Spawn a hand.\n\nYou are a hand of your own, named helper-2.\n1. Run it.";
  assert.equal(
    spawnPromptIn(said),
    "You are a hand of your own, named helper-2.\n1. Run it.",
  );
  assert.equal(spawnPromptIn("work  a-child at design/draft\n\nprose"), "");
  assert.equal(spawnPromptIn(""), "");
});

// [[spec/design_output/pull#the-hand-out]]
test("the tool's input reads into the same words a person types", () => {
  const tool = (said, ...more) =>
    pullArgvOf(["pull", "--tool", JSON.stringify(said), ...more]);
  assert.deepEqual(tool({}), ["pull"]);
  assert.deepEqual(tool({ ticket: "a-child", verdict: "pass" }), [
    "pull",
    "a-child",
    "--pass",
  ]);
  assert.deepEqual(tool({ ticket: "a-child", verdict: "fail", reason: "thin" }), [
    "pull",
    "a-child",
    "--fail",
    "thin",
  ]);
  assert.deepEqual(tool({ ticket: "a-child", verdict: "became", reason: "a-group" }), [
    "pull",
    "a-child",
    "--became",
    "a-group",
  ]);
  assert.deepEqual(
    tool({ ticket: "a-child", verdict: "answered", reason: "a-group" }),
    ["pull", "a-child", "--answered", "a-group"],
  );
  assert.deepEqual(
    tool({ ticket: "a-child", verdict: "pass", fields: { approach: "x" } }),
    ["pull", "a-child", "--pass", "--fields", '{"approach":"x"}'],
  );
  assert.deepEqual(tool({ ticket: "a-child", verdict: "pass" }, "--judge"), [
    "pull",
    "a-child",
    "--judge",
  ]);
  assert.deepEqual(pullArgvOf(["pull", "a-child", "--pass"]), [
    "pull",
    "a-child",
    "--pass",
  ]);
  assert.deepEqual(pullArgvOf(["pull", "--tool", "not json"]), ["pull"]);
  assert.equal(PULL_CALL, "mcp__level0__pull");
  assert.equal(pullSpec().name, "pull");
  assert.deepEqual(pullSpec().inputSchema.properties.verdict.enum, [
    "pass",
    "fail",
    "became",
    "answered",
  ]);
});

// [[spec/design_output/pull#the-checks]]
test("the judge's question names each rule by its label and carries the evidence whole", () => {
  const ask = judgeAsk("The approach.\nchecked:\n- one", RULES);
  assert.match(ask, /voice-1: Say what is\.\nvoice-3: Put the bottom line first\./);
  assert.match(ask, /Evidence:\nThe approach\.\nchecked:\n- one$/);
  assert.match(
    judgeRefusal("the judge answers breaks over design/draft"),
    /^refused\n/,
  );
});

// [[spec/tickets/the-judge-reads-answer-rules]]
test("the labels the judge picks from open on follows, one label a rule after it", () => {
  assert.equal(
    typeof level1.judgeLabels,
    "function",
    "the wrapper answers judgeLabels",
  );
  assert.deepEqual(level1.judgeLabels(RULES), ["follows", "voice-1", "voice-3"]);
  assert.deepEqual(level1.judgeLabels([]), ["follows"]);
});

// [[spec/tickets/the-judge-reads-answer-rules]]
test("a label reads back to the note, the number and the rule's own line", () => {
  assert.equal(typeof level1.ruleBroken, "function", "the wrapper answers ruleBroken");
  const said = level1.ruleBroken("voice-3", RULES);
  assert.match(said, /spec\/guidance\/voice/, "the refusal names the note");
  assert.match(said, /rule 3/, "the refusal names the number");
  assert.match(said, /Put the bottom line first\./, "the refusal names the line");
});

// [[spec/tickets/the-judge-reads-answer-rules]]
test("a label outside the set reads as follows, so a judge naming nothing refuses nothing", () => {
  assert.equal(typeof level1.ruleBroken, "function", "the wrapper answers ruleBroken");
  assert.equal(level1.ruleBroken("follows", RULES), "");
  assert.equal(level1.ruleBroken("voice-9", RULES), "");
  assert.equal(level1.ruleBroken("", RULES), "");
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("the library beside the hook owns the one spelling of the session file", () => {
  assert.equal(
    lib.SESSION,
    ".se/.runtime/session.json",
    "the hook imports the path, so one copy stands",
  );
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("the session file takes the id every harness this tree meets spells", () => {
  assert.equal(sessionOf({ session: { id: "s7" } }).id, "s7");
  assert.equal(sessionOf({ sessionId: "s8" }).id, "s8");
  assert.equal(sessionOf({ session_id: "s9" }).id, "s9");
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("the registered session start writes the file the library names", async () => {
  const held = await hooksHere();
  const box = harness();
  const e = { session_id: "s9", client: "claude-code" };
  await held["session.start"](box.$, e, async (said) => said);
  assert.deepEqual(JSON.parse(box.wrote.get(lib.SESSION) ?? "null"), {
    id: "s9",
    harness: "claude-code",
  });
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("an event naming no session writes nothing, and says the hand stands at the box", async () => {
  const held = await hooksHere();
  const box = harness();
  await held["session.start"](box.$, {}, async (said) => said);
  assert.equal(box.wrote.size, 0, "the fake holds no write");
  assert.match(box.lines.join("\n"), /the hand stands at the box/);
});

// The hook matches the name the plugin registers, and runs the script under the method root. [[spec/design_output/pull#the-checks]]
test("the pull hook matches the level zero call, and runs the script the method root holds", async () => {
  const { register } = await import("../../.claude/skills/level0/hooks/pull-tool.js");
  const calls = [];
  register(
    (event, ...rest) => {
      if (event === "tool.call" && rest.length > 1) calls.push(rest);
    },
    { method: "/vehicle/" },
  );
  const [filter, handler] = calls.find(([one]) => one?.tool === PULL_CALL) ?? [];
  assert.equal(filter?.tool, "mcp__level0__pull");

  const ran = [];
  const $ = {
    process: {
      run: async (argv) => {
        ran.push(argv);
        return { stdout: "wait", stderr: "", exitCode: 0 };
      },
    },
  };
  assert.deepEqual(await handler($, {}, async () => null), { result: "wait" });
  assert.deepEqual(ran[0].slice(0, 2), ["node", "/vehicle/src/scripts/cli.js"]);
});

// The pull hook over a config, answering whether the judge ran and how often it asked the model. [[spec/tickets/every-road-has-a-caller]]
async function judgeRuns(config) {
  const { register } = await import("../../.claude/skills/level0/hooks/pull-tool.js");
  const calls = [];
  register((event, ...rest) => {
    if (event === "tool.call" && rest.length > 1) calls.push(rest);
  }, {});
  const [, handler] = calls.find(([one]) => one?.tool === PULL_CALL) ?? [];
  const ran = [];
  const asked = [];
  const material = {
    ticket: "a-child",
    step: "design/draft",
    evidence: "x",
    rules: RULES,
  };
  const $ = {
    fs: { read: async () => JSON.stringify(config) },
    process: {
      run: async (argv) => {
        ran.push(argv);
        const judging = argv.includes("--judge");
        return {
          stdout: judging ? JSON.stringify(material) : "done",
          stderr: "",
          exitCode: 0,
        };
      },
    },
    model: {
      classify: async (...said) => {
        asked.push(said);
        return "follows";
      },
    },
  };
  await handler($, { ticket: "a-child", verdict: "pass" }, async () => null);
  return { judged: ran.some((argv) => argv.includes("--judge")), asked: asked.length };
}

// The judge runs where the config turns it on alone. [[spec/tickets/every-road-has-a-caller]]
test("a config naming no judge runs no judge, and true alone turns it on", async () => {
  assert.deepEqual(await judgeRuns({}), { judged: false, asked: 0 });
  assert.deepEqual(await judgeRuns({ judge: {} }), { judged: false, asked: 0 });
  assert.deepEqual(await judgeRuns({ judge: { enabled: false } }), {
    judged: false,
    asked: 0,
  });
  assert.deepEqual(await judgeRuns({ judge: { enabled: true } }), {
    judged: true,
    asked: 1,
  });
});

// [[spec/tickets/every-road-has-a-caller]]
test("the config schema declares the judge off by default", async () => {
  const { default: schema } = await import("../../spec/config/level0.schema.json", {
    with: { type: "json" },
  });
  assert.equal(schema.properties.judge?.properties?.enabled?.type, "boolean");
  assert.equal(schema.properties.judge?.properties?.enabled?.default, false);
});
