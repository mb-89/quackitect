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
      readFile: async (path) => {
        if (!files.has(path)) throw new Error(`no ${path}`);
        return files.get(path);
      },
      writeFile: async (path, text) => {
        files.set(path, text);
      },
      listDir: async (path) =>
        [...files.keys()]
          .filter((one) => one.startsWith(`${path}/`))
          .map((one) => ({ name: one.slice(path.length + 1), kind: "file" })),
      exists: async () => false,
    },
    process: {
      run: async (argv, init) => {
        runs.push({ argv: [...argv], init });
        const said = taught.run ? taught.run(argv) : null;
        return said ?? { exitCode: 0, stdout: "", stderr: "" };
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
  await it.raise("prompt.submit", { text: "get to work", origin: { kind: "composer" } });

  assert.deepEqual(
    it.lines().slice(1),
    [
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
    ],
  );
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
  const it = await started({ "HANDOVER.md": "---\nstatus: held\n---\n\n# The brief\n" });
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
  const it = await started({ "HANDOVER.md": "---\nstatus: held\n---\n\n# The brief\n" });
  for (let i = 0; i < 10; i++) {
    await it.raise("tool.call", { tool: "Read", file_path: "a.md" });
  }
  await it.raise(
    "tool.call",
    { tool: "mcp__level0__claim_stop", rule: "the-work-stands-complete", why: "pushed" },
    "mcp__level0__claim_stop",
  );
  await it.raise("turn.complete", { ...answered, answer: "the work stands complete" });

  const said = it.lines().filter((one) => one.door === "stop");
  assert.equal(said[0].said, "claimed the-work-stands-complete");
  assert.equal(said[1].said, "the turn goes on", "work stands over a finished piece");
  assert.match(said[1].detail, /^stop=the-work-stands-complete@45/);
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
