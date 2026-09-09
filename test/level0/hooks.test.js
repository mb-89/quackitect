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

function engine(seed = {}, box = {}) {
  const files = new Map([
    ["spec/guidance/working.md", NOTE],
    ["spec/config/stop/level0.yml", RULES],
    ["spec/config/level0.json", CONFIG],
    ...Object.entries(seed),
  ]);
  const registered = [];
  const prompts = [];

  const $ = {
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
      exists: async (path) => Boolean(box.exists?.(path)),
    },
    process: {
      run: async (argv, init) =>
        box.run?.(argv, init) ?? { exitCode: 0, stdout: "", stderr: "" },
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

async function started(seed, box) {
  const it = engine(seed, box);
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

test("a session start writes one line, and registers the claim tool", async () => {
  const it = await started();

  assert.deepEqual(
    it.lines().map((one) => `${one.door} ${one.said}`),
    ["level0 session start"],
  );
  assert.equal(it.registered.length, 1);
  assert.equal(it.registered[0].name, "claim_stop");
  assert.deepEqual(it.registered[0].inputSchema.properties.rule.enum, [
    "the-work-stands-complete",
  ]);
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
