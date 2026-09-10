// The hooks module, driven by a fake engine. It reaches the harness through
// the interface the engine hands it, so a fake interface stands in and the
// lines it writes come back out of memory.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { register } from "../../.claude/skills/level0/hooks/level0.js";
import { canary } from "../../.claude/skills/level0/lib/guidance.js";
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
    session: { messages: async () => said },
  };

  const hooks = [];
  const on = (event, matcher, hook) =>
    hooks.push({ event, matcher: hook ? matcher : null, hook: hook ?? matcher });
  register(on, {});

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
    async raise(event, e, tool) {
      let said = e;
      for (const one of of(event, tool)) {
        said = await one.hook($, e, (given) => given);
      }
      return said;
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

test("a session start writes one line, and registers both tools", async () => {
  const it = await started();

  assert.deepEqual(
    it.lines().map((one) => `${one.door} ${one.said}`),
    ["level0 session start"],
  );
  assert.deepEqual(
    it.registered.map((one) => one.name),
    ["claim_stop", "review_branch"],
  );
  assert.deepEqual(it.registered[0].inputSchema.properties.rule.enum, [
    "the-work-stands-complete",
  ]);
  assert.deepEqual(it.registered[1].inputSchema.required, ["branch"]);
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
      door: "tool",
      said: "spec/guidance/voice.md",
      tool: "Read",
    },
    {
      at: it.lines()[2].at,
      level: "info",
      door: "prompt",
      said: "get to work",
      detail: "composer",
    },
  ]);
});

// [[spec/design_output/stop#every-decision-writes-a-line]]
test("a turn end writes one stop line", async () => {
  const it = await started();
  await it.raise("turn.complete", { ...answered, answer: "done" });

  const said = it.lines().filter((one) => one.door === "stop");
  assert.equal(said.length, 1);
  assert.equal(said[0].said, "the turn ends");
  assert.match(said[0].detail, /^stop=the-session-is-new@95 continue=none@0 inARow=0$/);
  assert.deepEqual(it.prompts, []);
});

// [[spec/design_output/stop#holding-a-turn-open]]
test("a held branch carries the turn once the session stops being new", async () => {
  const it = await started({
    "HANDOVER.md": "---\nstatus: held\n---\n\n# The brief\n",
  });
  for (let i = 0; i < 10; i++) {
    await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  }
  await it.raise("turn.complete", { ...answered, answer: "a step is done" });

  const said = it.lines().filter((one) => one.door === "stop");
  assert.equal(said[0].said, "the turn goes on");
  assert.match(said[0].detail, /continue=work-still-stands@80 inARow=1$/);
  assert.equal(it.prompts.length, 1);
  assert.match(it.prompts[0].text, /^Something on your list stands unfinished/);
  assert.match(it.prompts[0].text, /- Does the work stand complete\?/);
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

  const said = it.lines().filter((one) => one.door === "config");
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

  await it.raise("turn.complete", { ...answered, answer: "one step" });
  await it.raise("turn.complete", { ...answered, answer: "another step" });

  const said = it.lines().filter((one) => one.door === "stop");
  assert.deepEqual(
    said.map((one) => one.said),
    ["the turn goes on", "carried enough turns in a row", "the turn ends"],
    "the tracked file says three, and the per-box file cuts it to one",
  );
});

// [[spec/design_output/level0#the-canary]]
test("the canary comes back whole, and a missing one writes a warning", async () => {
  const said = canary({ rules: 2, notes: 1, stop: true });

  const heard = await started();
  await heard.raise("turn.complete", { ...answered, answer: `Done.\n\n${said}` });
  assert.deepEqual(
    heard.lines().filter((one) => one.door === "level0" && one.detail),
    [
      {
        at: heard.lines()[1].at,
        level: "info",
        door: "level0",
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

test("a claim reaches the vote, and the tooth counts it once", async () => {
  const it = await started({
    "HANDOVER.md": "---\nstatus: held\n---\n\n# The brief\n",
  });
  for (let i = 0; i < 10; i++) {
    await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  }
  await it.raise(
    "tool.call",
    {
      tool: "mcp__level0__claim_stop",
      rule: "the-work-stands-complete",
      why: "pushed",
    },
    "mcp__level0__claim_stop",
  );
  await it.raise("turn.complete", { ...answered, answer: "the work stands complete" });

  const said = it.lines().filter((one) => one.door === "stop");
  assert.equal(said[0].said, "claimed the-work-stands-complete");
  assert.equal(said[1].said, "the turn goes on", "work stands over a finished piece");
  assert.match(said[1].detail, /^stop=the-work-stands-complete@45/);
});

// [[spec/design_output/level0#the-owners-prompt-comes-first]]
test("the first call of an unanswered turn refuses, and the next one passes", async () => {
  const it = await started();
  await it.raise("prompt.submit", { text: "build the door", origin: { kind: "composer" } });
  it.transcript.push({ role: "user", text: "build the door" });

  const refused = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.match(refused.deny, /^The owner asked something and nothing has answered it\./);

  it.transcript.push({ role: "assistant", text: "You want the door. I read the brief." });
  const passed = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  assert.equal(passed.deny, undefined);

  const found = it.lines().filter((one) => one.door === "answer");
  assert.deepEqual(found.map((one) => one.said), ["refused Read before an answer"]);
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

  const found = it.lines().filter((one) => one.door === "agent");
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

  const warn = it.lines().find((one) => one.door === "bash");
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

  const found = it.lines().filter((one) => one.door === "level0");
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

  const found = it.lines().filter((one) => one.door === "level0");
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
  assert.match(said.result, /^1 thing to fix, and the merge is a person's\.$/m);
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
    ".claude/commands/se-judge-enabled-false.md",
    ".claude/commands/se-judge-enabled-true.md",
    ".claude/commands/se-log-level.md",
    ".claude/commands/se-stop-enabled-false.md",
    ".claude/commands/se-stop-enabled-true.md",
    ".claude/commands/se-stop-mostInARow.md",
  ]);

  const said = it.lines().find((one) => one.door === "project");
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
    .filter((one) => one.door === "project");
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
    { tool: "Write", file_path: ".claude/commands/se-log-level.md", content: "mine\n" },
    {
      tool: "Edit",
      file_path: "/home/one/tree/.claude/commands/se-stop-enabled-true.md",
      new_string: "mine\n",
    },
  ]) {
    const said = await it.raise("tool.call", e);
    assert.match(said.deny, /is projected, so nothing may write it by hand/, e.tool);
    assert.match(said.deny, /Edit spec\/config\/level0\.json instead/, e.tool);
  }

  const said = it.lines().filter((one) => one.door === "project" && one.tool);
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
    if (path === ".claude/commands/se-log-level.md") throw new Error("read only");
    return was(path, text);
  };
  await it.raise("session.start", {});
  files.set = was;

  const said = it.lines().filter((one) => one.door === "project");
  assert.deepEqual(
    said.map((one) => `${one.level} ${one.said}`),
    ["info 5 file(s) written", "warn the box refuses a target"],
  );
  assert.equal(said[1].file, ".claude/commands/se-log-level.md");
});
