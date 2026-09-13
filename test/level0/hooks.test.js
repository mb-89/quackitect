// The hooks module, driven by a fake engine. It reaches the harness through
// the interface the engine hands it, so a fake interface stands in and the
// lines it writes come back out of memory.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { register } from "../../.claude/skills/level0/hooks/level0.js";
import { canary, HEARD } from "../../.claude/skills/level0/lib/guidance.js";
import { rowsOf } from "../../.claude/skills/level0/lib/log.js";

const NOTE = `---
kind: [[guidance]]
---

# Actionables

1. The first rule.
2. The second rule.
`;

const RULES = `- id: work-still-stands
  side: continue
  priority: 80
  decides: mechanical
  runs: work-waiting
  says: Something on your list stands unfinished, so carry on with it.

- id: the-session-is-new
  side: stop
  priority: 95
  decides: mechanical
  runs: session-is-new
  says: This session has barely started.

- id: the-work-stands-complete
  side: stop
  priority: 45
  decides: claimed
  asks: Does the work stand complete?
  says: The work stands complete, so this turn ends.

- id: the-owner-holds-this-session
  side: stop
  priority: 85
  decides: mechanical
  runs: owner-holds
  says: The owner holds this session at stopped, so this turn ends here.
`;

const CONFIG = JSON.stringify({
  judge: { enabled: false },
  stop: { enabled: true, mostInARow: 3 },
  log: { level: "info" },
});

function engine(seed = {}, taught = {}) {
  const files = new Map([
    ["spec/guidance/working.md", NOTE],
    ["spec/config/stop/level0.yml", RULES],
    ["spec/config/level0.json", CONFIG],
    ...Object.entries(seed),
  ]);
  const registered = [];
  const prompts = [];
  const said = [];
  const runs = [];
  const spawns = [];
  const commands = [];

  const $ = {
    agent: {
      spawn: async (input) => {
        spawns.push(input);
        if (!taught.spawn) throw new Error("this engine offers no agent");
        return taught.spawn(input);
      },
    },
    fs: {
      read: async (path) => {
        if (!files.has(path)) throw new Error(`no ${path}`);
        return files.get(path);
      },
      write: async (path, text) => {
        files.set(path, text);
      },
      list: async (path) =>
        [...files.keys()]
          .filter((one) => one.startsWith(`${path}/`))
          .map((one) => ({ name: one.slice(path.length + 1), kind: "file" })),
      exists: async (path) =>
        taught.exists ? Boolean(taught.exists(path)) : path === VALE,
    },
    process: {
      run: async (argv, init) => {
        runs.push({ argv: [...argv], init });
        return taught.run?.(argv, init) ?? { exitCode: 0, stdout: "", stderr: "" };
      },
    },
    model: { classify: async () => [] },
    tool: {
      register: async (spec) => {
        registered.push(spec);
        return { tool: `mcp__level0__${spec.name}` };
      },
    },
    prompt: {
      submit: async (input) => {
        prompts.push(input);
        return { text: input.text };
      },
    },
    command: {
      run: async (input) => {
        commands.push(input);
        if (!taught.command) throw new Error("this engine runs no command");
        return taught.command(input);
      },
    },
    session: { messages: async () => said },
  };

  const hooks = [];
  const on = (event, matcher, hook) =>
    hooks.push({ event, matcher: hook ? matcher : null, hook: hook ?? matcher });
  register(on, {});

  const streams = (hook) => hook?.constructor?.name === "AsyncGeneratorFunction";

  const of = (event, tool) =>
    hooks.filter(
      (one) => one.event === event && (!one.matcher || one.matcher.tool === tool),
    );

  return {
    files,
    registered,
    prompts,
    transcript: said,
    runs,
    spawns,
    commands,
    async raise(event, e, tool) {
      const chain = of(event, tool);
      // [[spec/design_output/level0#a-step-carries-the-answer]]
      if (chain.some((one) => streams(one.hook))) {
        const step = (at) =>
          async function* (given) {
            if (at >= chain.length) return given;
            return yield* chain[at].hook($, given, step(at + 1));
          };
        const running = step(0)(e);
        let said = await running.next();
        while (!said.done) said = await running.next();
        return said.value;
      }
      const step = (at) => async (given) =>
        at < chain.length ? chain[at].hook($, given, step(at + 1)) : given;
      return step(0)(e);
    },
    lines() {
      const path = [...files.keys()].find((one) => one.startsWith(".se/log/"));
      return path ? rowsOf(files.get(path)) : [];
    },
  };
}

async function started(seed, taught) {
  const it = engine(seed, taught);
  await it.raise("session.start", {});
  return it;
}

const VALE = ".se/bin/vale";

function valeSaying(found) {
  return {
    exists: (path) => path === VALE,
    run: (argv) => {
      const path = argv.find((one) => String(one).startsWith("--path="));
      if (!path) return { exitCode: 0, stdout: "", stderr: "" };
      const rows = path === "--path=level0-commit.md" ? found : [];
      return {
        exitCode: 0,
        stdout: JSON.stringify({ [path.slice("--path=".length)]: rows }),
        stderr: "",
      };
    },
  };
}

// [[spec/design_output/level0#the-gate-reads-the-answer]]
function valeOnAnswer(found) {
  return {
    exists: (path) => path === VALE,
    run: (argv) => {
      const path = argv.find((one) => String(one).startsWith("--path="));
      if (!path) return { exitCode: 0, stdout: "", stderr: "" };
      const rows = path === "--path=level0-answer.md" ? found : [];
      return {
        exitCode: 0,
        stdout: JSON.stringify({ [path.slice("--path=".length)]: rows }),
        stderr: "",
      };
    },
  };
}

const PAST = [
  {
    Check: "VoiceVale.PastTense",
    Line: 1,
    Span: [7, 9],
    Match: "was",
    Message: "Write the present tense: 'was'.",
    Severity: "error",
  },
];

const answered = { reason: "answer", answer: "", durationMs: 1, aborted: false };

// [[spec/design_output/stop#the-line-ends-a-turn]]
const STOPS = "Stop requested. Reason [the-work-stands-complete]. Nothing waits.";

// [[spec/design_output/stop#the-challenge-spends-one-allowance]]
async function endsATurn(it, answer = "done") {
  const text = `${answer}\n\n${STOPS}`;
  await it.raise("turn.complete", { ...answered, answer: text });
  await it.raise("turn.complete", { ...answered, answer: text });
}

test("a session start writes one line, and registers every tool", async () => {
  const it = await started();

  assert.deepEqual(
    it.lines().map((one) => `${one.kind} ${one.said}`),
    ["level0 session start"],
  );
  assert.deepEqual(
    it.registered.map((one) => one.name),
    ["check_answer", "mint_note", "review_branch", "log", "patch", "replace", "undo"],
  );
  assert.deepEqual(it.registered[0].inputSchema.required, ["text"]);
  assert.deepEqual(it.registered[1].inputSchema.required, ["kind", "path"]);
  assert.deepEqual(it.registered[2].inputSchema.required, ["branch"]);
});

// [[spec/design_output/log#what-a-tool-line-names]]
test("a tool call and a prompt each write one line", async () => {
  const it = await started();
  await it.raise("tool.call", { tool: "Read", file_path: "spec/guidance/voice.md" });
  await it.raise("prompt.submit", {
    text: "get to work",
    origin: { kind: "composer" },
  });

  assert.deepEqual(it.lines().slice(1), [
    {
      at: it.lines()[1].at,
      level: "info",
      kind: "tool",
      said: "spec/guidance/voice.md",
      tool: "Read",
    },
    {
      at: it.lines()[2].at,
      level: "info",
      kind: "prompt",
      said: "get to work",
      detail: "composer",
      text: "get to work",
    },
  ]);
});

// [[spec/design_output/log#a-reply-beside-its-prompt]]
test("a prompt and the answer ending its turn each carry their whole text", async () => {
  const long = "word ".repeat(40).trim();
  const it = await started();
  await it.raise("prompt.submit", { text: long, origin: { kind: "composer" } });
  await it.raise("turn.complete", { ...answered, answer: long });

  const prompt = it.lines().find((one) => one.kind === "prompt");
  const reply = it.lines().find((one) => one.kind === "reply");
  assert.equal(prompt.text, long);
  assert.equal(prompt.said.length, 80);
  assert.deepEqual(reply, { at: reply.at, level: "info", kind: "reply", said: long.slice(0, 80), text: long });
});

test("a turn ending with no answer writes no reply", async () => {
  const it = await started();
  await it.raise("turn.complete", { ...answered, reason: "aborted", answer: "half" });
  await it.raise("turn.complete", { ...answered, answer: "" });

  assert.deepEqual(
    it.lines().filter((one) => one.kind === "reply"),
    [],
  );
});

// [[spec/design_output/stop#every-decision-writes-a-line]]
test("a turn end writes one stop line", async () => {
  const it = await started();
  await endsATurn(it);

  const said = it.lines().filter((one) => one.kind === "stop");
  assert.equal(said.length, 2, "the challenge writes one, and the vote the other");
  assert.equal(said[1].said, "the turn ends");
  assert.match(said[1].detail, /^stop=the-session-is-new@95 continue=none@0 inARow=0$/);
  assert.equal(it.prompts.length, 1, "the challenge alone reaches the agent");
});

// [[spec/design_output/stop#holding-a-turn-open]]
test("a held branch carries the turn once the session stops being new", async () => {
  const it = await started({
    "HANDOVER.md": "---\nstatus: held\n---\n\n# The brief\n",
  });
  for (let i = 0; i < 10; i++) {
    await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  }
  await endsATurn(it, "a step is done");

  const said = it.lines().filter((one) => one.kind === "stop");
  assert.equal(said[1].said, "the turn goes on");
  assert.match(said[1].detail, /continue=work-still-stands@80 inARow=1$/);
  assert.equal(it.prompts.length, 2, "the challenge, and the vote holding it open");
  assert.match(it.prompts[1].text, /^Something on your list stands unfinished/);
  assert.match(it.prompts[1].text, /Stop requested\. Reason \[<id>\]/);
});

// [[spec/design_output/extension#the-hold-is-one-rule]]
test("the hold at stopped ends a turn the standing work would carry", async () => {
  const it = await started({ "HANDOVER.md": "---\nstatus: held\n---\n\n# The brief\n" });
  for (let i = 0; i < 10; i++) {
    await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  }
  it.files.set(".se/config.json", JSON.stringify({ stop: { hold: "stopped" } }));
  await endsATurn(it, "a step is done");

  const said = it.lines().filter((one) => one.kind === "stop");
  assert.equal(said[1].said, "the turn ends");
  assert.match(said[1].detail, /^stop=the-owner-holds-this-session@85/);
  assert.equal(it.prompts.length, 1, "the challenge alone reaches the agent");
});

test("the hold at running leaves the vote as it stands", async () => {
  const it = await started({ "HANDOVER.md": "---\nstatus: held\n---\n\n# The brief\n" });
  for (let i = 0; i < 10; i++) {
    await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  }
  it.files.set(".se/config.json", JSON.stringify({ stop: { hold: "running" } }));
  await it.raise("turn.complete", { ...answered, answer: "a step is done" });

  assert.equal(it.lines().filter((one) => one.kind === "stop")[0].said, "the turn goes on");
});

// [[spec/design_output/extension#the-ask-is-a-line]]
test("the ask stands in the block, and the turn's end writes it back to quiet", async () => {
  const it = await started();
  it.files.set(".se/config.json", JSON.stringify({ ask: { wanted: "full" } }));

  const said = await it.raise("prompt.context", { blocks: [] });
  const block = said.blocks.find((one) => one.name === "level0-owner-asks");
  assert.match(block.text, /The owner asks for a full report/);

  await it.raise("turn.complete", { ...answered, answer: "done" });
  assert.equal(JSON.parse(it.files.get(".se/config.json")).ask.wanted, "quiet");
  assert.equal(
    (await it.raise("prompt.context", { blocks: [] })).blocks.find(
      (one) => one.name === "level0-owner-asks",
    ),
    undefined,
  );
});

// [[spec/design_output/level0#the-layer-after-a-compaction]]
const PROBING = {
  run: (argv) => ({
    exitCode: 0,
    stdout: String(argv[2]).includes("SE_PROBE_COMPACT")
      ? JSON.stringify({ SE_PROBE_COMPACT: "1" })
      : "{}",
    stderr: "",
  }),
  command: () => ({}),
};

const SENTENCE = canary({ rules: 2, notes: 1, stop: true });

test("every read of the context writes one line naming its blocks and its reason", async () => {
  const it = await started();

  await it.raise("prompt.context", { blocks: [] });
  await it.raise("prompt.context", { blocks: [] });

  const lines = it.lines().filter((one) => one.kind === "context");
  assert.deepEqual(
    lines.map((one) => one.reason),
    ["first", "re-read"],
  );
  assert.equal(lines[0].said, "2 block(s) reach the session");
  assert.equal(lines[0].detail, "level0-rules level0-canary");
});

test("a compaction writes one line naming what fired it and what it keeps", async () => {
  const it = await started();

  await it.raise("session.compact", { trigger: "manual", messages: [1, 2, 3] });

  const line = it.lines().find((one) => one.kind === "compact");
  assert.equal(line.said, "a compaction runs");
  assert.equal(line.trigger, "manual");
  assert.equal(line.messages, 3);
});

test("the variable makes the first turn compact and ask for the canary again", async () => {
  const it = await started({}, PROBING);
  await it.raise("prompt.context", { blocks: [] });

  await it.raise("turn.complete", { ...answered, answer: SENTENCE });

  assert.deepEqual(it.commands, [{ command: "compact" }]);
  assert.deepEqual(
    it.prompts.map((one) => one.text),
    ["Say the canary line again, on its own, and nothing else."],
  );
});

test("no variable leaves an ordinary session compacting on nobody's word", async () => {
  const it = await started();
  await it.raise("prompt.context", { blocks: [] });

  await it.raise("turn.complete", { ...answered, answer: SENTENCE });

  assert.deepEqual(it.commands, []);
  assert.deepEqual(it.prompts, []);
});

test("the re-read under the probe asks the agent for the canary a second time", async () => {
  const it = await started({}, PROBING);
  await it.raise("prompt.context", { blocks: [] });

  const said = await it.raise("prompt.context", { blocks: [] });

  assert.match(
    said.blocks.find((one) => one.name === "level0-probe-asks-again").text,
    /End your next answer with the canary line above/,
  );

  const plain = await started();
  await plain.raise("prompt.context", { blocks: [] });
  const again = await plain.raise("prompt.context", { blocks: [] });
  assert.equal(
    again.blocks.find((one) => one.name === "level0-probe-asks-again"),
    undefined,
  );
});

test("the answer after the compaction writes the canary line the verb reads", async () => {
  const it = await started({}, PROBING);
  await it.raise("prompt.context", { blocks: [] });
  await it.raise("turn.complete", { ...answered, answer: SENTENCE });
  await it.raise("prompt.context", { blocks: [] });

  await it.raise("turn.complete", { ...answered, answer: `again\n\n${SENTENCE}` });

  assert.deepEqual(
    it.lines().filter((one) => one.said === HEARD.same).length,
    2,
  );
});

test("a quiet ask and a running hold put no block in front of the agent", async () => {
  const it = await started();
  const said = await it.raise("prompt.context", { blocks: [] });
  assert.equal(
    said.blocks.find((one) => one.name === "level0-owner-asks"),
    undefined,
  );
});

// [[spec/design_output/config#the-schema-says-the-type]]
test("a session start says which field the config lacks", async () => {
  const it = await started({
    "spec/config/level0.schema.json": JSON.stringify({
      type: "object",
      required: ["stop"],
      properties: {
        stop: {
          type: "object",
          required: ["enabled", "mostInARow", "hardestWord"],
          properties: {
            enabled: { type: "boolean" },
            mostInARow: { type: "number" },
            hardestWord: { type: "string" },
          },
        },
      },
    }),
  });

  const said = it.lines().filter((one) => one.kind === "config");
  assert.deepEqual(
    said.map((one) => one.said),
    ["stop.hardestWord is missing"],
  );
});

// [[spec/design_output/config#the-three-layers]]
test("a write to the per-box file reaches the next turn end", async () => {
  const it = await started({ "HANDOVER.md": "---\nstatus: held\n---\n\n# The brief\n" });
  for (let i = 0; i < 10; i++) {
    await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  }
  it.files.set(".se/config.json", JSON.stringify({ stop: { mostInARow: 1 } }));

  for (const step of ["one step", "another step", "a third step"]) {
    await it.raise("turn.complete", { ...answered, answer: `${step}\n\n${STOPS}` });
  }

  const said = it.lines().filter((one) => one.kind === "stop");
  assert.deepEqual(
    said.map((one) => one.said),
    [
      "the turn goes on",
      "the turn goes on",
      "carried enough turns in a row",
      "the turn ends",
    ],
    "the challenge opens, and the per-box file cuts the carry to one",
  );
});

// [[spec/design_output/level0#the-canary]]
test("the canary comes back whole, and a missing one writes a warning", async () => {
  const said = canary({ rules: 2, notes: 1, stop: true });

  const heard = await started();
  await heard.raise("turn.complete", { ...answered, answer: `Done.\n\n${said}` });
  const back = heard.lines().filter((one) => one.kind === "level0" && one.detail);
  assert.deepEqual(
    back,
    [
      {
        at: back[0]?.at,
        level: "info",
        kind: "level0",
        said: "the canary comes back whole",
        detail: said,
      },
    ],
  );

  const silent = await started();
  await silent.raise("turn.complete", { ...answered, answer: "Done." });
  const found = silent.lines().find((one) => one.level === "warn");
  assert.equal(found.said, "the canary is absent from the answer");
});

// [[spec/design_output/level0#the-canary-owes-a-debt]]
test("a first answer carrying the canary leaves the session owing nothing", async () => {
  const it = await started();
  await it.raise("turn.complete", { ...answered, answer: `Done.\n\n${SENTENCE}` });
  for (let i = 0; i < 3; i++) {
    const said = await it.raise("tool.call", { tool: "Read", file_path: `${i}.md` });
    assert.equal(said.deny, undefined, "a paid session passes every call");
  }
  assert.equal(it.lines().filter((one) => one.kind === "gate").length, 0);
});

test("a first answer missing the canary warns one call, then refuses every one", async () => {
  const it = await started();
  await it.raise("turn.complete", { ...answered, answer: "Done." });

  const first = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.equal(first.deny, undefined, "the first call warns and goes on");
  assert.match(String(first.context), /owes the canary/);

  for (const file of ["b.md", "c.md"]) {
    const said = await it.raise("tool.call", { tool: "Read", file_path: file });
    assert.match(String(said.deny), /owes the canary/);
    assert.ok(said.deny.includes(SENTENCE), "the refusal names the line it owes");
  }

  assert.deepEqual(
    it.lines().filter((one) => one.kind === "gate").map((one) => [one.level, one.said]),
    [
      ["warn", "warned Read before the canary"],
      ["warn", "refused Read before the canary"],
      ["warn", "refused Read before the canary"],
    ],
  );
});

test("a later answer carrying the canary clears the debt, and calls pass again", async () => {
  const it = await started();
  await it.raise("turn.complete", { ...answered, answer: "Done." });
  await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  const refused = await it.raise("tool.call", { tool: "Read", file_path: "b.md" });
  assert.ok(refused.deny, "the debt stands before the line lands");

  await it.raise("turn.complete", { ...answered, answer: `Sorry.\n\n${SENTENCE}` });
  const after = await it.raise("tool.call", { tool: "Read", file_path: "c.md" });
  assert.equal(after.deny, undefined);
  assert.equal(
    it.lines().filter((one) => one.said === "the canary comes back whole").length,
    1,
  );
});

test("a canary carrying other counts owes the same debt as none", async () => {
  const it = await started();
  const wrong = canary({ rules: 99, notes: 9, stop: true });
  await it.raise("turn.complete", { ...answered, answer: `Done.\n\n${wrong}` });
  await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  const said = await it.raise("tool.call", { tool: "Read", file_path: "b.md" });
  assert.match(String(said.deny), /owes the canary/);
});

test("the debt reaches no subagent, and holds no question to the owner", async () => {
  const it = await started();
  await it.raise("turn.complete", { ...answered, answer: "Done." });
  for (let i = 0; i < 3; i++) {
    const helper = await it.raise("tool.call", { tool: "Read", agentId: "a1", file_path: "x.md" });
    assert.equal(helper.deny, undefined, "a helper owes no canary of its own");
    const asks = await it.raise("tool.call", { tool: "AskUserQuestion", questions: [] });
    assert.equal(asks.deny, undefined, "the door never blocks the road to the owner");
  }
});

// [[spec/design_output/stop#the-line-ends-a-turn]]
test("the line reaches the vote, and an answer without one ends nothing", async () => {
  const it = await started({
    "HANDOVER.md": "---\nstatus: held\n---\n\n# The brief\n",
  });
  for (let i = 0; i < 10; i++) {
    await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  }
  await it.raise("turn.complete", { ...answered, answer: "the work stands complete" });

  const first = it.lines().filter((one) => one.kind === "stop");
  assert.equal(first[0].said, "the turn goes on");
  assert.equal(first[0].detail, "no line", "an answer saying so ends no turn");

  await endsATurn(it, "the work stands complete");
  const said = it.lines().filter((one) => one.kind === "stop");
  assert.equal(said[said.length - 1].said, "the turn goes on");
  assert.match(
    said[said.length - 1].detail,
    /^stop=the-work-stands-complete@45/,
    "work stands over a finished piece",
  );
});

// [[spec/design_output/level0#one-warning-then-a-refusal]]
test("a response with no answer earns one warning on the next call, then a refusal", async () => {
  const it = await started();
  await it.raise("prompt.submit", { text: "build the door", origin: { kind: "composer" } });
  it.transcript.push({ role: "user", text: "build the door" });

  const first = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.equal(first.deny, undefined);
  assert.equal(first.context, undefined, "the response in flight may still carry the answer");
  await it.raise("turn.step", { turnId: "t", index: 0, answer: "", toolUses: [], stopReason: "tool_use" });

  const warned = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.equal(warned.deny, undefined);
  assert.match(warned.context.at(-1), /^The owner sent a prompt, and nothing has answered it yet\./);

  const refused = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.match(refused.deny, /^The owner sent a prompt\. The owner asked something/);

  const found = it.lines().filter((one) => one.kind === "gate");
  assert.deepEqual(found.map((one) => [one.level, one.said]), [
    ["warn", "warned Read before an answer"],
    ["warn", "refused Read before an answer"],
  ]);
});

// [[spec/design_output/level0#a-step-carries-the-answer]]
test("a step carrying text answers the prompt, and every call after it passes", async () => {
  const it = await started();
  await it.raise("prompt.submit", { text: "build the door", origin: { kind: "composer" } });
  for (let i = 0; i < 4; i++) {
    const said = await it.raise("tool.call", { tool: "Read", file_path: `${i}.md` });
    assert.equal(said.deny, undefined, "every call of the answering response passes");
  }
  await it.raise("turn.step", { turnId: "t", index: 0, answer: "You want the door. I read the brief first.", toolUses: [], stopReason: "tool_use" });
  const after = await it.raise("tool.call", { tool: "Read", file_path: "b.md" });
  assert.equal(after.deny, undefined);
  assert.equal(after.context, undefined);
  assert.equal(it.lines().filter((one) => one.kind === "gate").length, 0);
});

// [[spec/design_output/log#the-answer-under-its-prompt]]
test("the answer lands as an info line under its prompt, whole, and once", async () => {
  const it = await started();
  await it.raise("prompt.submit", { text: "build the door", origin: { kind: "composer" } });
  await it.raise("turn.step", { turnId: "t", index: 0, answer: "You want the door. I read the brief first.", toolUses: [], stopReason: "tool_use" });
  await it.raise("turn.step", { turnId: "t", index: 1, answer: "Now the hinge.", toolUses: [], stopReason: "tool_use" });

  const kinds = it.lines().map((one) => one.kind);
  assert.deepEqual(kinds.slice(1), ["prompt", "answer"]);
  const answer = it.lines().find((one) => one.kind === "answer");
  assert.equal(answer.level, "info");
  assert.equal(answer.text, "You want the door. I read the brief first.");
  assert.equal(answer.detail, "The owner sent a prompt");
});

test("an answer the transcript holds counts too, however the transcript windows", async () => {
  const it = await started();
  for (let i = 0; i < 40; i++) it.transcript.push({ role: "assistant", text: `step ${i}` });
  await it.raise("prompt.submit", { text: "and now?", origin: { kind: "composer" } });
  it.transcript.splice(0, 20);
  it.transcript.push({ role: "user", text: "and now?" });
  await it.raise("turn.step", { turnId: "t", index: 0, answer: "", toolUses: [], stopReason: "tool_use" });
  it.transcript.push({ role: "assistant", text: "Now the gate. I fix it first." });

  const said = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.equal(said.deny, undefined);
  assert.equal(said.context, undefined);
  assert.equal(it.lines().find((one) => one.kind === "answer").said, "Now the gate. I fix it first.");
});

test("an answer written before the prompt lands counts for nothing", async () => {
  const it = await started();
  it.transcript.push({ role: "assistant", text: "An older answer." });
  await it.raise("prompt.submit", { text: "and now?", origin: { kind: "composer" } });
  it.transcript.push({ role: "user", text: "and now?" });
  await it.raise("turn.step", { turnId: "t", index: 0, answer: "", toolUses: [], stopReason: "tool_use" });

  const warned = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.ok(warned.context, "the older answer leaves the new prompt owed");
});

// [[spec/design_output/level0#what-counts-as-owed]]
test("an update the sidebar asks for mid-turn warns once and then refuses", async () => {
  const it = await started();
  await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  it.files.set(".se/config.json", JSON.stringify({ ask: { wanted: "short" } }));
  await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  await it.raise("turn.step", { turnId: "t", index: 0, answer: "", toolUses: [], stopReason: "tool_use" });

  const warned = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.match(warned.context.at(-1), /^The owner asks for a short update/);
  const refused = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.match(refused.deny, /^The owner asks for a short update\./);

  await it.raise("turn.step", { turnId: "t", index: 1, answer: "Short update: the door stands.", toolUses: [], stopReason: "tool_use" });
  const passed = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.equal(passed.deny, undefined);
});

test("a hold at stopped owes an answer, and the later demand replaces the earlier", async () => {
  const it = await started();
  await it.raise("prompt.submit", { text: "build the door", origin: { kind: "composer" } });
  await it.raise("turn.step", { turnId: "t", index: 0, answer: "", toolUses: [], stopReason: "tool_use" });

  it.files.set(".se/config.json", JSON.stringify({ stop: { hold: "stopped" } }));
  const fresh = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.equal(fresh.deny, undefined, "the new demand starts over");
  assert.equal(fresh.context, undefined, "the new demand waits for its own step");
  await it.raise("turn.step", { turnId: "t", index: 1, answer: "", toolUses: [], stopReason: "tool_use" });
  const warned = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.match(warned.context.at(-1), /^The owner holds this session at stopped/);
});

// [[spec/design_output/level0#the-owner-binds-god]]
test("god mode passes every refusal, and writes each one it passes", async () => {
  const it = await started({ ".se/config.json": JSON.stringify({ engine: { binding: "god" } }) });
  await it.raise("prompt.submit", { text: "build the door", origin: { kind: "composer" } });
  await it.raise("turn.step", { turnId: "t", index: 0, answer: "", toolUses: [], stopReason: "tool_use" });
  await it.raise("tool.call", { tool: "Read", file_path: "a.md" });

  const said = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.equal(said.deny, undefined);
  const god = it.lines().filter((one) => one.kind === "god");
  assert.deepEqual(god.map((one) => one.said), ["passed Read past a refusal"]);
  assert.match(god[0].detail, /^The owner sent a prompt\./);
});

test("out of god mode the same refusal stands", async () => {
  const it = await started({ ".se/config.json": JSON.stringify({ engine: { binding: "queue" } }) });
  await it.raise("prompt.submit", { text: "build the door", origin: { kind: "composer" } });
  await it.raise("turn.step", { turnId: "t", index: 0, answer: "", toolUses: [], stopReason: "tool_use" });
  await it.raise("tool.call", { tool: "Read", file_path: "a.md" });

  const said = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.match(said.deny, /^The owner sent a prompt\./);
  assert.equal(it.lines().filter((one) => one.kind === "god").length, 0);
});

// [[spec/design_output/private#the-door-reads-the-notes]]
const RAW_NOTE =
  "the box at /home/somebody/secrets stalls badly whenever somebody starts it twice";

test("a tracked write sharing six words with a note refuses, and quotes the run", async () => {
  const it = await started({ ".se/notes/one.md": RAW_NOTE });
  const said = await it.raise("tool.call", {
    tool: "Write",
    file_path: "spec/funnel/a.md",
    content: "Noticed: it stalls badly whenever somebody starts it twice.\n",
  });
  assert.match(said.deny ?? "", /^spec\/funnel\/a\.md carries \d+ words straight from a note/);
  assert.match(said.deny, /stalls badly whenever somebody starts it/);
  assert.match(said.deny, /\.se\/notes/);
  const line = it.lines().find((one) => one.kind === "private");
  assert.equal(line.said, "refused a run out of one.md");
  assert.equal(line.rule, "NothingPrivateTravels");
});

test("a tracked write carrying one path out of a note refuses on that word alone", async () => {
  const it = await started({ ".se/notes/one.md": RAW_NOTE });
  const said = await it.raise("tool.call", {
    tool: "Write",
    file_path: "spec/funnel/a.md",
    content: "Somebody looks under /home/somebody/secrets when there is time.\n",
  });
  assert.match(said.deny ?? "", /"\/home\/somebody\/secrets"/);
  assert.match(said.deny, /one word is enough to leak/);
  assert.equal(it.lines().find((one) => one.kind === "private").said, "refused a token out of one.md");
});

test("the handover a session leaves behind stays outside the check", async () => {
  const it = await started({ ".se/notes/one.md": RAW_NOTE });
  const said = await it.raise("tool.call", {
    tool: "Write",
    file_path: ".se/HANDOVER.md",
    content: `${RAW_NOTE}\n`,
  });
  assert.equal(said.deny, undefined);
});

test("a folder holding no note refuses nothing", async () => {
  const it = await started();
  const said = await it.raise("tool.call", {
    tool: "Write",
    file_path: "spec/funnel/a.md",
    content: "A statement authored for this tree, and shared with no note.\n",
  });
  assert.equal(said.deny, undefined);
});

const NOTE_SCHEMA = [
  "kind: design_output",
  "",
  "governs:",
  "  - spec/design_output/**",
  "",
  "frontmatter:",
  "  type: object",
  "  required:",
  "    - kind",
  "  properties:",
  "    kind:",
  "      const: design_output",
  "      x-link: true",
  "",
  "body:",
  "  headingLevel: 1",
  "  sections:",
  "    - header: Scope",
  "      required: true",
  "      description: what this note covers",
  "",
].join("\n");

const SHAPED = "---\nkind: [[design_output]]\n---\n\n# Scope\n\nThis note covers one thing.\n";
const SHAPELESS = "---\nkind: [[design_output]]\n---\n\n# Something else\n\nNo scope here.\n";

// [[spec/design_output/schema#the-door-refuses-a-departure]]
test("the door refuses a note departing from its schema, and names the fix", async () => {
  const it = await started({ "spec/schemas/design_output.schema.yaml": NOTE_SCHEMA });
  const said = await it.raise("tool.call", {
    tool: "Write",
    file_path: "spec/design_output/door.md",
    content: SHAPELESS,
  });
  assert.match(said.deny ?? "", /^The design_output schema refuses this write to spec\/design_output\/door\.md\./);
  assert.match(said.deny, /Schema\.Scope/);
  assert.match(said.deny, /\.\/RUNME\.sh mint design_output <path>/);
  assert.ok(it.lines().some((one) => one.kind === "schema"));
});

test("a note meeting its schema passes, and so does a draft", async () => {
  const it = await started({ "spec/schemas/design_output.schema.yaml": NOTE_SCHEMA });
  const shaped = await it.raise("tool.call", {
    tool: "Write",
    file_path: "spec/design_output/door.md",
    content: SHAPED,
  });
  assert.equal(shaped.deny, undefined);
  const draft = await it.raise("tool.call", {
    tool: "Write",
    file_path: "spec/design_output/_door.md",
    content: SHAPELESS,
  });
  assert.equal(draft.deny, undefined);
});

// [[spec/design_output/schema#a-folder-names-its-kind]]
test("the door refuses a kind-less file in a governed folder, and names the road", async () => {
  const it = await started({ "spec/schemas/design_output.schema.yaml": NOTE_SCHEMA });
  const said = await it.raise("tool.call", {
    tool: "Write",
    file_path: "spec/design_output/bare.md",
    content: "# A file carrying no kind\n",
  });
  assert.match(said.deny ?? "", /^spec\/schemas\/design_output\.schema\.yaml governs spec\/design_output\/bare\.md/);
  assert.match(said.deny, /Schema\.Kind/);
  assert.match(said.deny, /names no kind/);
  assert.match(said.deny, /mint_note/);
  assert.ok(it.lines().some((one) => /refused a stranger/.test(one.said)));
});

test("the door refuses a note of another kind in a governed folder", async () => {
  const it = await started({ "spec/schemas/design_output.schema.yaml": NOTE_SCHEMA });
  const said = await it.raise("tool.call", {
    tool: "Write",
    file_path: "spec/design_output/wrong.md",
    content: "---\nkind: [[guidance]]\n---\n\n# Scope\n\nA note of another kind.\n",
  });
  assert.match(said.deny ?? "", /reads as a guidance, and the design_output schema governs this path/);
});

test("a kind-less file outside every governed folder passes, and so does a draft inside one", async () => {
  const it = await started({ "spec/schemas/design_output.schema.yaml": NOTE_SCHEMA });
  const outside = await it.raise("tool.call", {
    tool: "Write",
    file_path: "AGENTS.md",
    content: "# Notes for this project\n",
  });
  assert.equal(outside.deny, undefined);
  const parked = await it.raise("tool.call", {
    tool: "Write",
    file_path: "spec/design_output/_bare.md",
    content: "# A draft carrying no kind\n",
  });
  assert.equal(parked.deny, undefined);
});

// [[spec/design_output/schema#the-tool-writes-the-note]]
test("the tool writes the note, and the checker passes what it writes", async () => {
  const it = await started({ "spec/schemas/design_output.schema.yaml": NOTE_SCHEMA });
  const said = await it.raise(
    "tool.call",
    {
      tool: "mcp__level0__mint_note",
      kind: "design_output",
      path: "spec/design_output/fresh.md",
      fields: { Scope: "What this note covers." },
    },
    "mcp__level0__mint_note",
  );
  assert.match(said.result, /^spec\/design_output\/fresh\.md stands, in the shape design_output names\./);
  assert.equal(
    it.files.get("spec/design_output/fresh.md"),
    "---\nkind: [[design_output]]\n---\n\n# Scope\n\nWhat this note covers.\n",
  );
  assert.ok(it.lines().some((one) => one.kind === "schema"));
});

test("a field the tool never takes leaves a placeholder, and the answer names it", async () => {
  const it = await started({ "spec/schemas/design_output.schema.yaml": NOTE_SCHEMA });
  const said = await it.raise(
    "tool.call",
    {
      tool: "mcp__level0__mint_note",
      kind: "design_output",
      path: "spec/design_output/fresh.md",
    },
    "mcp__level0__mint_note",
  );
  assert.match(said.result, /Schema\.Placeholder/);
  assert.match(it.files.get("spec/design_output/fresh.md"), /<!-- what this note covers -->/);
});

test("the tool writes nothing where a path stands already, or a kind reaches no schema", async () => {
  const it = await started({
    "spec/schemas/design_output.schema.yaml": NOTE_SCHEMA,
    "spec/design_output/door.md": SHAPED,
  });
  const stood = await it.raise(
    "tool.call",
    {
      tool: "mcp__level0__mint_note",
      kind: "design_output",
      path: "spec/design_output/door.md",
    },
    "mcp__level0__mint_note",
  );
  assert.match(stood.result, /stands already/);
  assert.equal(it.files.get("spec/design_output/door.md"), SHAPED);

  const stranger = await it.raise(
    "tool.call",
    { tool: "mcp__level0__mint_note", kind: "stranger", path: "spec/design_output/x.md" },
    "mcp__level0__mint_note",
  );
  assert.match(stranger.result, /holds no stranger/);
  assert.equal(it.files.has("spec/design_output/x.md"), false);
});

test("an edit is weighed as the whole file it leaves behind", async () => {
  const it = await started({
    "spec/schemas/design_output.schema.yaml": NOTE_SCHEMA,
    "spec/design_output/door.md": SHAPED,
  });
  const small = await it.raise("tool.call", {
    tool: "Edit",
    file_path: "spec/design_output/door.md",
    old_string: "one thing",
    new_string: "two things",
  });
  assert.equal(small.deny, undefined, "a fragment carrying no heading still leaves a shaped note");
  const breaking = await it.raise("tool.call", {
    tool: "Edit",
    file_path: "spec/design_output/door.md",
    old_string: "# Scope",
    new_string: "# Elsewhere",
  });
  assert.match(breaking.deny ?? "", /Schema\.Scope/);
});

// [[spec/design_output/log#a-session-rotates-its-file]]
test("a session start moves the last session into old, and starts the file fresh", async () => {
  const last = `${JSON.stringify({ at: "2026-09-10T08:00:00.000Z", level: "info", kind: "level0", said: "session start" })}\n`;
  const it = await started({ ".se/log/session.jsonl": last });

  const old = [...it.files.keys()].filter((one) => one.startsWith(".se/log/old/"));
  assert.equal(old.length, 1);
  assert.match(old[0], /^\.se\/log\/old\/2026-09-10T08-00-00-[0-9a-z]{8}\.jsonl$/);
  assert.equal(it.files.get(old[0]), last);
  assert.deepEqual(it.lines().map((one) => one.said), ["session start"]);
});

// [[spec/design_output/log#every-writer-appends]]
test("the hook appends, and keeps a line another writer put in the file", async () => {
  const it = await started();
  const other = JSON.stringify({ at: "x", level: "info", kind: "config", said: "stop.hold is stopped" });
  it.files.set(".se/log/session.jsonl", `${it.files.get(".se/log/session.jsonl")}${other}\n`);
  await it.raise("tool.call", { tool: "Read", file_path: "a.md" });

  assert.deepEqual(
    it.lines().map((one) => one.kind),
    ["level0", "config", "tool"],
  );
});

// [[spec/design_output/log#the-log-tool]]
test("the log tool writes the line it names, and the hook stamps the time", async () => {
  const it = await started();
  assert.ok(it.registered.some((one) => one.name === "log"));
  const said = await it.raise(
    "tool.call",
    { tool: "mcp__level0__log", kind: "status", said: "the viewer builds", text: "whole" },
    "mcp__level0__log",
  );
  assert.equal(said.result, "logged: status the viewer builds");
  const row = it.lines().find((one) => one.kind === "status");
  assert.match(row.at, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(row.text, "whole");
});

test("a prompt the plugin submits refuses nothing", async () => {
  const it = await started();
  await it.raise("prompt.submit", {
    text: "carry on",
    origin: { kind: "plugin", name: "level0" },
  });

  const said = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.equal(said.deny, undefined);
});

test("a helper's call passes, because the helper owes the owner nothing", async () => {
  const it = await started();
  await it.raise("prompt.submit", { text: "build the door", origin: { kind: "composer" } });
  it.transcript.push({ role: "user", text: "build the door" });

  const said = await it.raise("tool.call", {
    tool: "Read",
    file_path: "a.md",
    agentId: "a19eab2edc664d20a",
  });
  assert.equal(said.deny, undefined);
});

test("answer.enabled turns the door off", async () => {
  const it = await started({
    "spec/config/level0.json": JSON.stringify({
      judge: { enabled: false },
      stop: { enabled: true, mostInARow: 3 },
      answer: { enabled: false },
      log: { level: "info" },
    }),
  });
  await it.raise("prompt.submit", { text: "build the door", origin: { kind: "composer" } });
  it.transcript.push({ role: "user", text: "build the door" });

  const said = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.equal(said.deny, undefined);
});

test("the turn's end clears what the turn owed", async () => {
  const it = await started();
  await it.raise("prompt.submit", { text: "build the door", origin: { kind: "composer" } });
  it.transcript.push({ role: "user", text: "build the door" });
  await it.raise("turn.complete", { ...answered, answer: "done" });

  const said = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.equal(said.deny, undefined);
});

// [[spec/design_output/level0#the-helper-takes-the-guidance]]
test("a spawn carries the guidance the session reads, and its task after it", async () => {
  const it = await started();
  const said = await it.raise("agent.spawn", {
    subagentType: "general-purpose",
    description: "read the note",
    prompt: "Read note.txt and report what it holds.",
  });

  assert.match(said.prompt, /^# How this tree is worked/);
  assert.match(said.prompt, /1\. The first rule\./);
  assert.match(said.prompt, /# Your task\n\nRead note\.txt and report what it holds\.$/);

  const found = it.lines().filter((one) => one.kind === "agent");
  assert.deepEqual(found.map((one) => one.said), [
    "handed the guidance to general-purpose",
  ]);
});

// [[spec/design_output/bash#what-the-door-reads]]
test("the door refuses a shell write the rules reach, and passes one they miss", async () => {
  const it = await started();
  const said = await it.raise(
    "tool.call",
    { tool: "Bash", command: "cat > spec/guidance/x.md" },
    "Bash",
  );
  assert.match(said.deny, /Level zero refuses this command/);
  assert.match(said.deny, /ShellWritesNothing/);
  assert.match(said.deny, /spec\/guidance\/x\.md/);

  const warn = it.lines().find((one) => one.kind === "bash");
  assert.equal(warn.rule, "ShellWritesNothing");

  const passed = await it.raise(
    "tool.call",
    { tool: "Bash", command: "cat > .se/scratch.md" },
    "Bash",
  );
  assert.equal(passed.deny, undefined);
});

// [[spec/design_output/bash#a-commit-message-meets-voice]]
test("a commit message breaking a voice rule is refused, and a clean one commits", async () => {
  const bad = await started(undefined, valeSaying(PAST));
  const said = await bad.raise(
    "tool.call",
    { tool: "Bash", command: 'git commit -m "the door was broken"' },
    "Bash",
  );
  assert.match(said.deny, /PastTense/);

  const good = await started(undefined, valeSaying([]));
  const passed = await good.raise(
    "tool.call",
    { tool: "Bash", command: 'git commit -m "the door reads more"' },
    "Bash",
  );
  assert.equal(passed.deny, undefined);
});

test("a commit reading its message from a file meets the same rules", async () => {
  const it = await started(
    { ".se/message.txt": "the door was broken" },
    valeSaying(PAST),
  );
  const said = await it.raise(
    "tool.call",
    { tool: "Bash", command: "git commit -F .se/message.txt" },
    "Bash",
  );
  assert.match(said.deny, /PastTense/);
});

// [[spec/design_output/private#a-fixture-carries-no-shape]]
const ADDRESS = ["duck", "quacks.org"].join("@");

const DELTA = `diff --git a/spec/guidance/voice.md b/spec/guidance/voice.md
--- a/spec/guidance/voice.md
+++ b/spec/guidance/voice.md
@@ -4,0 +5 @@ kind
+Write to ${ADDRESS} where the door refuses.
`;

// [[spec/design_output/work#a-red-battery-pushes-nothing]]
function boxAtHead(head, env = {}) {
  return {
    exists: (path) => path === VALE,
    run: (argv) => {
      if (argv[0] === "node") {
        return { exitCode: 0, stdout: JSON.stringify(env), stderr: "" };
      }
      if (argv[0] === "git" && argv[1] === "rev-parse" && argv[2] === "HEAD") {
        return { exitCode: 0, stdout: `${head}\n`, stderr: "" };
      }
      return { exitCode: 0, stdout: "", stderr: "" };
    },
  };
}

function boxSaying(delta, env = {}) {
  return {
    exists: (path) => path === VALE,
    run: (argv) => {
      if (argv[0] === "node") {
        return { exitCode: 0, stdout: JSON.stringify(env), stderr: "" };
      }
      if (argv[0] === "git" && argv[1] === "diff") {
        return { exitCode: 0, stdout: delta, stderr: "" };
      }
      return { exitCode: 0, stdout: "", stderr: "" };
    },
  };
}

const privateLines = (it) =>
  it
    .lines()
    .filter((one) => one.kind === "private")
    .map((one) => one.said);

// [[spec/design_output/private#two-doors-one-check]]
test("a commit whose delta carries a private line is refused, naming the line", async () => {
  const it = await started(undefined, boxSaying(DELTA));
  const said = await it.raise(
    "tool.call",
    { tool: "Bash", command: 'git commit -m "the door reads more"' },
    "Bash",
  );

  assert.match(said.deny, /ShapeStaysHome/);
  assert.match(said.deny, /spec\/guidance\/voice.md:5:1/);
  assert.match(said.deny, new RegExp(ADDRESS));
  assert.deepEqual(privateLines(it), ["refused 1 line(s) in a commit"]);
});

test("a commit whose delta adds nothing private passes the door", async () => {
  const it = await started(undefined, boxSaying(""));
  const said = await it.raise(
    "tool.call",
    { tool: "Bash", command: 'git commit -m "the door reads more"' },
    "Bash",
  );
  assert.equal(said.deny, undefined);
});

// [[spec/design_output/stop#the-voice-skips-the-line]]
test("the draft tool reads the prose, and the stop line scores nothing", async () => {
  const read = [];
  const taught = valeOnAnswer([]);
  const it = await started(BANDED, {
    ...taught,
    run: (argv, init) => {
      if (init?.stdin !== undefined) read.push(String(init.stdin));
      return taught.run(argv, init);
    },
  });

  const line = "Stop requested. Reason [the-work-stands-complete]. Nothing waits.";
  const said = await it.raise(
    "tool.call",
    { tool: DRAFT, text: `${"word ".repeat(40).trim()}\n\n${line}` },
    DRAFT,
  );

  assert.match(String(said.result), /meets the gate clean/);
  assert.equal(read.length, 1, "the tool reads the draft once");
  assert.equal(read[0].includes("Stop requested"), false, "the line reaches Vale nowhere");
  assert.match(read[0], /^word word/, "the prose reaches it whole");
});

// [[spec/design_output/work#a-red-battery-pushes-nothing]]
test("a push to trunk takes a green battery, and a work branch takes none", async () => {
  const HEAD = "a1b2c3d4e5f6";
  const it = await started(undefined, boxAtHead(HEAD));
  const push = { tool: "Bash", command: "git push origin main" };
  const pushes = () => it.raise("tool.call", push, "Bash");
  const stamp = (said) => it.files.set(".se/check.json", JSON.stringify(said));

  assert.match(String((await pushes()).deny), /no check has run here/);

  stamp({ sha: "beef", ok: true, clean: true });
  assert.match(String((await pushes()).deny), /the check ran against beef/);

  stamp({ sha: HEAD, ok: true, clean: false });
  assert.match(String((await pushes()).deny), /over an unclean tree/);

  stamp({ sha: HEAD, ok: false, clean: true, at: "now" });
  assert.match(String((await pushes()).deny), /the check answered red/);

  stamp({ sha: HEAD, ok: true, clean: true });
  assert.equal((await pushes()).deny, undefined, "a green battery pushes trunk");

  const branch = await it.raise(
    "tool.call",
    { tool: "Bash", command: "git push origin work/a-thing" },
    "Bash",
  );
  assert.equal(branch.deny, undefined, "a work branch meets no battery");
});

// [[spec/design_output/private#the-escape]]
test("no-verify is refused on a cloud box, and the desk box writes a line", async () => {
  const cloud = await started(undefined, boxSaying("", { CLAUDE_CODE_REMOTE: "1" }));
  const said = await cloud.raise(
    "tool.call",
    { tool: "Bash", command: 'git commit --no-verify -m "the door reads more"' },
    "Bash",
  );
  assert.match(said.deny, /CommitMeetsTheDoor/);

  const desk = await started(undefined, boxSaying(""));
  const passed = await desk.raise(
    "tool.call",
    { tool: "Bash", command: 'git commit -n -m "the door reads more"' },
    "Bash",
  );
  assert.equal(passed.deny, undefined);
  assert.deepEqual(privateLines(desk), ["a commit steps past the hook"]);
});

// [[spec/design_output/bash#the-description-names-verbs]]
test("the Bash description names the verbs, and answers the same string twice", async () => {
  const it = await started();
  const e = { tool: "Bash", description: "Runs a shell command." };
  const said = await it.raise("tool.describe", e, "Bash");
  const again = await it.raise("tool.describe", e, "Bash");

  assert.equal(said.description, again.description);
  assert.match(said.description, /^Runs a shell command\./);
  assert.match(said.description, /\.\/RUNME\.sh check/);
  assert.match(said.description, /\.\/RUNME\.sh work/);
});

const NO_CAGE = { exists: () => false };

// [[spec/design_output/level0#god-mode]]
test("a cage holding nothing refuses the work, and says what fails", async () => {
  const it = await started(undefined, NO_CAGE);

  const said = await it.raise("tool.call", {
    tool: "Write",
    file_path: "spec/guidance/voice.md",
    content: "a line the door never reads",
  });

  assert.match(said.deny, /^LEVEL ZERO HOLDS NOTHING/);
  assert.match(said.deny, /no vale stands here/);
  assert.match(said.deny, /RUNME\.sh check/);

  const found = it.lines().filter((one) => one.kind === "level0");
  assert.deepEqual(found.map((one) => one.said), [
    "the cage holds nothing",
    "session start",
    "god mode refuses Write",
  ]);
});

// [[spec/design_output/level0#god-mode]]
test("god mode leaves the road open that repairs the cage", async () => {
  const it = await started(undefined, NO_CAGE);

  const mending = await it.raise("tool.call", {
    tool: "Write",
    file_path: ".claude/skills/level0/hooks/level0.js",
    content: "// the mend",
  });
  assert.equal(mending.deny, undefined);

  const reading = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.equal(reading.deny, undefined);

  const looking = await it.raise("tool.call", { tool: "Bash", command: "git status" });
  assert.equal(looking.deny, undefined);

  const landing = await it.raise("tool.call", {
    tool: "Bash",
    command: "cat > spec/guidance/voice.md",
  });
  assert.match(landing.deny, /^LEVEL ZERO HOLDS NOTHING/);
});

// [[spec/design_output/level0#god-mode]]
test("the cage clears god mode by itself once the repair lands", async () => {
  let mended = false;
  const it = await started(undefined, { exists: (path) => mended && path === VALE });

  const refused = await it.raise("tool.call", {
    tool: "Write",
    file_path: "spec/guidance/voice.md",
    content: "a line",
  });
  assert.match(refused.deny, /^LEVEL ZERO HOLDS NOTHING/);

  mended = true;
  const passed = await it.raise("tool.call", {
    tool: "Write",
    file_path: "spec/guidance/voice.md",
    content: "a line",
  });
  assert.equal(passed.deny, undefined);
  assert.equal(JSON.parse(it.files.get(".se/level0.health")).ok, true);

  const found = it.lines().filter((one) => one.kind === "level0");
  assert.deepEqual(found.map((one) => one.said), [
    "the cage holds nothing",
    "session start",
    "god mode refuses Write",
    "the cage holds again",
  ]);
});

const MATERIAL = {
  branch: "work/the-config-holds-numbers",
  ref: "origin/work/the-config-holds-numbers",
  brief: "# Hold the numbers\n",
  handback: "# It holds\n\n# Retro\n\nOne surprise.\n",
  retro: true,
  stat: " src/a.js | 2 +-\n",
  diff: "diff --git a/src/a.js\n",
  check: { ok: true, code: 0, says: "" },
};

const gathers = (said) => (argv) =>
  argv.includes("review") ? { exitCode: 0, stdout: `${said}\n` } : null;

// [[spec/design_output/review#the-tool-the-session-calls]]
test("the review tool runs the verb, spawns a reader and answers the report", async () => {
  const it = await started(
    {},
    {
      run: gathers(JSON.stringify(MATERIAL)),
      spawn: async () => ({
        model: "a-model",
        text: '{"brief":"done","beyond":"none","tests":"1 rule, 1 test","fix":1}',
      }),
    },
  );

  const said = await it.raise(
    "tool.call",
    { tool: "mcp__level0__review_branch", branch: "the-config-holds-numbers" },
    "mcp__level0__review_branch",
  );

  const ran = it.runs.find((one) => one.argv.includes("review"));
  assert.deepEqual(ran.argv, [
    "node",
    "src/scripts/cli.js",
    "work",
    "review",
    "the-config-holds-numbers",
    "--json",
  ]);
  assert.match(it.spawns[0].prompt, /Hold the numbers/, "the reader gets the brief");
  assert.match(it.spawns[0].prompt, /The first rule/, "and the rules this tree holds");
  assert.match(said.result, /^check {6}passes$/m);
  assert.match(said.result, /^retro {6}present$/m);
  assert.match(said.result, /^brief {6}done$/m);
  assert.match(said.result, /^1 thing to fix\. Run work merge once every fix lands\.$/m);
});

// [[spec/design_output/review#where-the-spawn-refuses]]
test("a spawn that refuses leaves the mechanical half standing", async () => {
  const it = await started({}, { run: gathers(JSON.stringify(MATERIAL)) });

  const said = await it.raise(
    "tool.call",
    { tool: "mcp__level0__review_branch", branch: "the-config-holds-numbers" },
    "mcp__level0__review_branch",
  );

  assert.match(said.result, /^check {6}passes$/m);
  assert.match(said.result, /^reader {5}no reader ran here: this engine offers no agent$/m);
});

test("the review tool refuses a call naming no branch", async () => {
  const it = await started();

  const said = await it.raise(
    "tool.call",
    { tool: "mcp__level0__review_branch", branch: "" },
    "mcp__level0__review_branch",
  );

  assert.match(said.result, /takes one branch name/);
  assert.deepEqual(
    it.runs.filter((one) => one.argv.includes("review")),
    [],
    "it gathers nothing",
  );
});

test("a verb that gathers nothing comes back with what it said", async () => {
  const it = await started(
    {},
    { run: () => ({ exitCode: 1, stdout: "", stderr: "work/gone stands nowhere.\n" }) },
  );

  const said = await it.raise(
    "tool.call",
    { tool: "mcp__level0__review_branch", branch: "gone" },
    "mcp__level0__review_branch",
  );

  assert.match(said.result, /gone: the verb gathered nothing/);
  assert.match(said.result, /work\/gone stands nowhere/);
  assert.deepEqual(it.spawns, [], "no reader runs on nothing");
});

// [[spec/design_output/review#where-the-spawn-refuses]]
test("a spawn the engine refuses says so, and the check still stands", async () => {
  const it = await started(
    {},
    {
      run: gathers(JSON.stringify(MATERIAL)),
      spawn: async () => ({ model: "a-model", deny: "this session spawns nothing" }),
    },
  );

  const said = await it.raise(
    "tool.call",
    { tool: "mcp__level0__review_branch", branch: "the-config-holds-numbers" },
    "mcp__level0__review_branch",
  );

  assert.match(said.result, /^check {6}passes$/m);
  assert.match(said.result, /^reader {5}the spawn is refused: this session spawns nothing$/m);
});

// [[spec/design_output/review#where-the-spawn-refuses]]
test("a reader that fails says so, and the check still stands", async () => {
  const it = await started(
    {},
    {
      run: gathers(JSON.stringify(MATERIAL)),
      spawn: async () => ({ model: "a-model", isError: true, text: "it ran out" }),
    },
  );

  const said = await it.raise(
    "tool.call",
    { tool: "mcp__level0__review_branch", branch: "the-config-holds-numbers" },
    "mcp__level0__review_branch",
  );

  assert.match(said.result, /^check {6}passes$/m);
  assert.match(said.result, /^reader {5}the reader failed: it ran out$/m);
});

const PROJECTS = JSON.stringify({
  projections: [
    {
      name: "the config commands",
      shape: "config commands",
      target: ".claude/commands",
      from: "spec/config/level0.json",
      schema: "spec/config/level0.schema.json",
      wrap: "frontmatter",
    },
  ],
});

// [[spec/design_output/projection#who-projects-and-when]]
test("a session start projects every target, and says what it costs", async () => {
  const it = await started({ "spec/config/projections.json": PROJECTS });

  const drawn = [...it.files.keys()].filter((one) => one.startsWith(".claude/commands/"));
  assert.deepEqual(drawn.sort(), [
    ".claude/commands/se-config-judge-enabled-false.md",
    ".claude/commands/se-config-judge-enabled-true.md",
    ".claude/commands/se-config-log-level.md",
    ".claude/commands/se-config-stop-enabled-false.md",
    ".claude/commands/se-config-stop-enabled-true.md",
    ".claude/commands/se-config-stop-mostInARow.md",
  ]);

  const said = it.lines().find((one) => one.kind === "project");
  assert.equal(said.said, "6 file(s) written");
  assert.equal(typeof said.ms, "number");
  assert.equal(said.detail, "1 projection(s), 6 target(s)");
});

test("a second session start writes nothing, because every target stands", async () => {
  const it = engine({ "spec/config/projections.json": PROJECTS });
  await it.raise("session.start", {});
  await it.raise("session.start", {});

  const said = [...it.files]
    .filter(([path]) => path.startsWith(".se/log/"))
    .flatMap(([, text]) => rowsOf(text))
    .filter((one) => one.kind === "project");
  assert.deepEqual(
    said.map((one) => one.said),
    ["6 file(s) written", "0 file(s) written"],
    "the second start reads every target as it stands, so it writes none",
  );
});

// [[spec/design_output/projection#the-write-door-refuses-one]]
test("the write door refuses a write to a generated command", async () => {
  const it = await started({ "spec/config/projections.json": PROJECTS });

  for (const e of [
    { tool: "Write", file_path: ".claude/commands/se-config-log-level.md", content: "mine\n" },
    {
      tool: "Edit",
      file_path: "/home/one/tree/.claude/commands/se-config-stop-enabled-true.md",
      new_string: "mine\n",
    },
  ]) {
    const said = await it.raise("tool.call", e);
    assert.match(said.deny, /is projected, so nothing may write it by hand/, e.tool);
    assert.match(said.deny, /Edit spec\/config\/level0\.json instead/, e.tool);
  }

  const said = it.lines().filter((one) => one.kind === "project" && one.tool);
  assert.equal(said.length, 2, "each refusal writes one line");
});

test("the write door passes the source a projection reads", async () => {
  const it = await started({ "spec/config/projections.json": PROJECTS });
  const said = await it.raise("tool.call", {
    tool: "Write",
    file_path: "spec/config/level0.json",
    content: "{}\n",
  });
  assert.equal(said.deny, undefined);
});

test("a target the box refuses writes one warning, and the rest still land", async () => {
  const it = engine({ "spec/config/projections.json": PROJECTS });
  const files = it.files;
  const was = files.set.bind(files);
  files.set = (path, text) => {
    if (path === ".claude/commands/se-config-log-level.md") throw new Error("read only");
    return was(path, text);
  };
  await it.raise("session.start", {});
  files.set = was;

  const said = it.lines().filter((one) => one.kind === "project");
  assert.deepEqual(
    said.map((one) => `${one.level} ${one.said}`),
    ["info 5 file(s) written", "warn the box refuses a target"],
  );
  assert.equal(said[1].file, ".claude/commands/se-config-log-level.md");
});

// [[spec/design_output/level0#the-three-bands]]
const BANDED = { "spec/config/level0.json": JSON.stringify({
  judge: { enabled: false },
  stop: { enabled: false, mostInARow: 3 },
  log: { level: "info" },
  answer: { warnAt: 5, ceiling: 15 },
}) };

const OVER = "word ".repeat(20).trim();
const UNDER = "word ".repeat(100).trim();
const CLEAN = "word ".repeat(400).trim();
const DRAFT = "mcp__level0__check_answer";

// [[spec/design_output/level0#the-re-prompt-over-the-ceiling]]
test("an answer over the ceiling meets one re-prompt, and one alone", async () => {
  const it = await started(BANDED, valeOnAnswer(PAST));
  await it.raise("turn.complete", { ...answered, answer: OVER });

  assert.equal(it.prompts.length, 1);
  assert.match(
    it.prompts[0].text,
    /^The voice rules refuse this answer\. Write it again\./,
  );
  assert.match(it.prompts[0].text, /50 findings a thousand words/);
  assert.match(it.prompts[0].text, /level0-answer\.md:1:7 {2}PastTense/);
  assert.match(it.prompts[0].text, /Hold PastTense for the rest of this turn/);

  await it.raise("turn.complete", { ...answered, answer: OVER });
  assert.equal(it.prompts.length, 1, "a second turn end inside the turn submits nothing");

  const gate = it.lines().filter((one) => one.kind === "answer");
  assert.deepEqual(
    gate.map((one) => one.said),
    ["the gate reads rewrite", "the gate reads rewrite"],
  );
  assert.match(gate[0].detail, /^score=50 findings=1 inARow=1$/);
});

// [[spec/design_output/level0#the-carry-rides-a-prompt]]
test("an answer under the ceiling rides the next prompt as one line", async () => {
  const it = await started(BANDED, valeOnAnswer(PAST));
  await it.raise("turn.complete", { ...answered, answer: UNDER });
  assert.equal(it.prompts.length, 0);

  const said = await it.raise("prompt.submit", {
    text: "carry on",
    origin: { kind: "composer" },
  });
  assert.match(
    said.text,
    /^carry on\n\nThe answer before this scored 10 findings a thousand words\./,
  );
  assert.equal(said.text.split("\n\n")[1].includes("\n"), false, "the carry is one line");

  const again = await it.raise("prompt.submit", {
    text: "carry on",
    origin: { kind: "composer" },
  });
  assert.equal(again.text, "carry on", "the findings ride once");
});

// [[spec/design_output/level0#the-three-bands]]
test("an answer under the warning meets nothing at all", async () => {
  const it = await started(BANDED, valeOnAnswer(PAST));
  await it.raise("turn.complete", { ...answered, answer: CLEAN });
  assert.equal(it.prompts.length, 0);

  const said = await it.raise("prompt.submit", {
    text: "carry on",
    origin: { kind: "composer" },
  });
  assert.equal(said.text, "carry on");
  assert.equal(
    it.lines().find((one) => one.kind === "answer").said,
    "the gate reads clean",
  );
});

// [[spec/design_output/level0#the-tool-reads-a-draft]]
test("the draft tool answers the findings of a draft", async () => {
  const it = await started(BANDED, valeOnAnswer(PAST));
  const said = await it.raise("tool.call", { tool: DRAFT, text: OVER }, DRAFT);

  assert.match(said.result, /^The voice rules refuse this answer\./);
  assert.match(said.result, /Hold PastTense for the rest of this turn/);
  assert.equal(it.prompts.length, 0, "the tool submits nothing");
});

test("the draft tool reads a clean draft clean, and an empty one back", async () => {
  const it = await started(BANDED, valeOnAnswer([]));
  const clean = await it.raise("tool.call", { tool: DRAFT, text: OVER }, DRAFT);
  assert.match(clean.result, /meets the gate clean/);

  const empty = await it.raise("tool.call", { tool: DRAFT, text: "  " }, DRAFT);
  assert.match(empty.result, /takes the text of one draft/);
});

const WORDS = "spec/vocabulary/words.yml";
const RULE = "spec/config/styles/VoiceParagraph/Vocabulary.yml";

const PARAGRAPHS = JSON.stringify({
  projections: [
    {
      name: "the paragraph rules",
      shape: "paragraph rules",
      target: "spec/config/styles/VoiceParagraph",
      from: "spec/schemas/paragraph.schema.yaml",
      wrap: "none",
    },
  ],
});

const PARAGRAPH_SCHEMA = `
kind: paragraph
layers:
  vocabulary:
    words: ${WORDS}
    exceptions: []
`;

const SEED = `words:
  - {word: door, from: tree}
  - {word: the, from: openste}
`;

const listed = (seed = SEED) => ({
  "spec/config/projections.json": PARAGRAPHS,
  "spec/schemas/paragraph.schema.yaml": PARAGRAPH_SCHEMA,
  [WORDS]: seed,
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("the word list reaches the rule at a session's start", async () => {
  const it = await started(listed());
  assert.match(it.files.get(RULE), /\bdoor\b/);
  assert.ok(!/\bhandover\b/.test(it.files.get(RULE)), "a word nobody wrote stands nowhere");
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("a write to the list re-projects, so the next write reads the new rule", async () => {
  const it = await started(listed());
  const before = it.files.get(RULE);
  assert.ok(!/\bhandover\b/.test(before));

  const grown = `${SEED}  - {word: handover, from: session, meaning: the note a branch hands on}\n`;
  const wrote = await it.raise("tool.call", {
    tool: "Write",
    file_path: WORDS,
    content: grown,
  });
  assert.equal(wrote.deny, undefined, "the list is a source, so the door passes the write");

  // The harness writes what the door passes. [[spec/funnel/a-paragraph-has-a-schema]]
  it.files.set(WORDS, grown);
  assert.equal(it.files.get(RULE), before, "the rule waits for the next call");

  await it.raise("tool.call", { tool: "Read", file_path: "anything.md" });
  assert.match(it.files.get(RULE), /\bhandover\b/, "the next call carries the new word");

  const said = it.lines().filter((one) => one.kind === "project");
  assert.match(said.at(-1).said, /^spec\/vocabulary\/words\.yml moved/);
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("a write to a file no projection reads leaves the rule alone", async () => {
  const it = await started(listed());
  const before = it.lines().filter((one) => one.kind === "project").length;

  await it.raise("tool.call", { tool: "Write", file_path: "notes.md", content: "The door.\n" });
  await it.raise("tool.call", { tool: "Read", file_path: "anything.md" });

  assert.equal(
    it.lines().filter((one) => one.kind === "project").length,
    before,
    "nothing re-projects, so no line lands",
  );
});
