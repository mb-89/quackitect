// The cage's words and choices under new: the events the door decides, the post it takes, the step its effects answer, the guard, and the refusal. [[spec/tickets/a-down-index-refuses-calls]]

import assert from "node:assert/strict";
import test from "node:test";
import {
  doors,
  guarded,
  postOf,
  recovers,
  refusedText,
  stepOf,
} from "../../.claude/skills/level0/hooks/cage.js";
import { guidanceHere, onAgentSpawn } from "../../src/bridge/guidance.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import LAYERS from "../replay/cage/layer-cases.json" with { type: "json" };

// The events the bridge's DOORS table named before the bridge left, each one the door decides now. [[spec/tickets/the-bridge-server-leaves]]
const BRIDGE_EVENTS = [
  "session.start",
  "prompt.context",
  "prompt.submit",
  "classic.MessageDisplay",
  "agent.spoke",
  "session.compact",
  "session.end",
  "session.measure",
  "turn.said",
  "turn.complete",
  "classic.Stop",
  "agent.spawn",
  "tool.describe",
  "tool.call",
  "agent.answered",
];

// [[spec/tickets/the-brief-leaves-the-bridge]]
test("the door decides the tool call, the Stop and the prompt, and leaves an event no table names", () => {
  assert.equal(doors("tool.call"), true);
  assert.equal(doors("classic.Stop"), true);
  assert.equal(doors("prompt.context"), true);
  assert.equal(doors("engine.create"), false);
});

// [[spec/tickets/the-brief-leaves-the-bridge]]
test("the door decides every event the bridge's DOORS table names", () => {
  const left = BRIDGE_EVENTS.filter((event) => !doors(event));
  assert.deepEqual(left, [], `the bridge still keeps ${left.join(", ")}`);
});

test("the post goes to the standing port with its token as a bearer", () => {
  const post = postOf(
    { port: 7001, token: "t0k" },
    "tool.call",
    { tool: "Bash" },
    "/tree",
    {
      fill: 9,
    },
  );
  assert.equal(post.where, "http://127.0.0.1:7001/hook");
  assert.equal(post.init.headers.authorization, "Bearer t0k");
  assert.deepEqual(JSON.parse(post.init.body), {
    event: "tool.call",
    e: { tool: "Bash" },
    root: "/tree",
    fill: 9,
  });
});

test("an event effect answers the rewritten event", () => {
  assert.deepEqual(
    stepOf(
      { effects: [{ kind: "event", result: { text: "first, then the prompt" } }] },
      "prompt.submit",
      {
        asks: true,
        served: false,
      },
    ),
    { answer: { event: { text: "first, then the prompt" } } },
  );
});

test("a clear effect answers the clear prompt, and the turn passes", () => {
  assert.deepEqual(
    stepOf(
      { effects: [{ kind: "clear", text: "read the handover" }] },
      "turn.complete",
      {
        asks: true,
        served: false,
      },
    ),
    { answer: { pass: true, clear: { prompt: "read the handover" } } },
  );
});

test("a result's text answers as a deny, its result as the tool result, and a block holds the Stop", () => {
  const plain = { asks: true, served: false };
  assert.deepEqual(
    stepOf({ effects: [{ kind: "result", text: "no" }] }, "tool.call", plain),
    {
      answer: { deny: "no" },
    },
  );
  assert.deepEqual(
    stepOf(
      { effects: [{ kind: "result", result: { result: "a line" } }] },
      "tool.call",
      plain,
    ),
    { answer: { result: "a line" } },
  );
  assert.deepEqual(
    stepOf({ effects: [{ kind: "block", text: "say it" }] }, "classic.Stop", plain),
    {
      answer: { block: "say it" },
    },
  );
});

test("rows ask back once, and an after rides as context", () => {
  const rows = { effects: [{ kind: "rows", call: "s1.2" }] };
  assert.deepEqual(stepOf(rows, "tool.call", { asks: true, served: false }), {
    rows: "s1.2",
  });
  assert.deepEqual(stepOf(rows, "tool.call", { asks: false, served: false }), {});
  const after = { effects: [{ kind: "pass" }, { kind: "after", text: "a note" }] };
  assert.deepEqual(stepOf(after, "classic.Stop", { asks: true, served: false }), {
    after: ["a note"],
  });
});

// [[spec/tickets/level0-tools-leave-the-bridge]]
test("stepOf hands no call to the bridge", () => {
  for (const served of [true, false]) {
    const step = stepOf({ effects: [{ kind: "pass" }] }, "tool.call", {
      asks: true,
      served,
    });
    assert.equal(
      step.bridge,
      undefined,
      `a call the door passes, served ${served}, goes to the bridge`,
    );
  }
});

test("an after on the prompt context answers as named blocks, and a named after on a call opens on its name", () => {
  const plain = { asks: true, served: false };
  const named = {
    effects: [
      { kind: "pass" },
      { kind: "after", name: "level0-tools", text: "the tools" },
      { kind: "after", name: "level0-canary", text: "the canary" },
    ],
  };
  assert.deepEqual(stepOf(named, "prompt.context", plain), {
    blocks: [
      { name: "level0-tools", text: "the tools" },
      { name: "level0-canary", text: "the canary" },
    ],
  });
  assert.deepEqual(stepOf(named, "tool.call", plain), {
    after: ["# level0-tools\nthe tools", "# level0-canary\nthe canary"],
  });
});

// [[spec/tickets/level0-tools-leave-the-bridge]]
test("a harness read passes while the door stands down, and a level zero call stands guarded", () => {
  assert.equal(guarded("tool.call", { tool: "Read" }), false);
  assert.equal(guarded("tool.call", { tool: "mcp__level0__find" }), true);
  assert.equal(guarded("tool.call", { tool: "Bash", command: "ls" }), true);
  assert.equal(guarded("classic.Stop", {}), false);
});

test("the command the refusal names passes, so a box with no index brings it back", () => {
  const bash = (command) => guarded("tool.call", { tool: "Bash", command });
  assert.equal(bash("./RUNME.sh serve"), false);
  assert.equal(bash("./RUNME.sh doctor"), false);
  assert.equal(
    bash("./RUNME.sh serve; rm -rf x"),
    true,
    "a chain behind it stays guarded",
  );
  assert.equal(bash("./RUNME.sh serve && rm -rf x"), true);
  assert.equal(bash("./RUNME.sh serve --inspect"), false);
  assert.equal(bash("./RUNME.sh check"), true);
});

// [[spec/tickets/the-cage-survives-its-index]]
test("the commands that bring the index back and save the work pass while the door stands down, and the rest stay guarded", () => {
  const passes = [
    "./RUNME.sh serve",
    "./RUNME.sh doctor --deep",
    "./RUNME.sh index standing",
    "cd /home/user/tree && ./RUNME.sh serve",
    "pkill -f .se/.runtime/bin/se-index",
    "pkill -9 -f /home/user/tree/.se/.runtime/bin/se-index",
    "git status",
    "git status --short",
    "git log --oneline -5",
    "git add -A",
    "git add spec/tickets/a.md src/b.js",
    "git commit -m 'a-name: lands; the rest waits'",
    'git commit -am "a-name: lands\n\nthe body"',
    "git push -u origin work/a-name",
    "git push origin HEAD:work/a-name",
  ];
  const refuses = [
    "ls",
    "./RUNME.sh check",
    "./RUNME.sh index standing --wipe",
    "./RUNME.sh serve | tee x",
    "cd x && ls",
    "cd x && ./RUNME.sh serve && rm -rf x",
    "pkill -f se-index",
    "pkill node",
    "kill 1",
    "git status; rm -rf x",
    "git log --output=x",
    "git -c core.pager=sh log",
    "git add $(rm -rf x)",
    "git commit --amend -m x",
    "git commit --no-verify -m x",
    "git commit -m",
    'git commit -m "$(rm -rf x)"',
    "git push",
    "git push origin main",
    "git push origin HEAD",
    "git push --force origin work/a-name",
    "git push origin +work/a-name",
    "git push origin work/a-name:main",
    "git push origin --delete work/a-name",
    "git reset --hard",
    "git commit -m 'open",
  ];
  for (const command of passes) assert.equal(recovers(command), true, command);
  for (const command of refuses) assert.equal(recovers(command), false, command);
});

test("the refusal names the call, the alarm and the command that clears it", () => {
  const text = refusedText({ tool: "Bash" });
  assert.match(text, /Bash/);
  assert.match(text, /session\/alarms/);
  assert.match(text, /\.\/RUNME\.sh serve/);
});

// The spawn door's layer builders write every row's wrapped prompt, and the Go door reads the same table. [[spec/tickets/spawn-answers-off-the-door]]
// A named after on a describe answers the field it names, the shape the bridge's describe answer takes. [[spec/tickets/describe-answers-off-the-door]]
test("a named after on a describe answers the description", () => {
  const said = stepOf(
    { effects: [{ kind: "after", name: "description", text: "the line" }] },
    "tool.describe",
    {},
  );
  assert.deepEqual(said, { answer: { after: { description: "the line" } } });
});

// An unnamed after on a describe names no field, so it rides as context. [[spec/tickets/describe-answers-off-the-door]]
test("an unnamed after on a describe rides as context", () => {
  const said = stepOf(
    { effects: [{ kind: "after", text: "the line" }] },
    "tool.describe",
    {},
  );
  assert.deepEqual(said, { after: ["the line"] });
});

test("the JavaScript layer matches the case table", () => {
  const built = LAYERS.cases.map((one) => {
    const disk = fakeDisk(
      Object.fromEntries(
        Object.entries(one.files).map(([path, text]) => [`/tree/${path}`, text]),
      ),
    );
    const box = { disk, method: "/tree", work: "/tree", env: {}, log: { say() {} } };
    const said = onAgentSpawn({ kind: one.kind, prompt: one.prompt }, box);
    const layers = guidanceHere(disk, "/tree", "/tree", {}).layers;
    return {
      name: one.name,
      layer: said.pass ? "none" : layers[one.kind] ? one.kind : "helper",
      pass: Boolean(said.pass),
      wrapped: said.pass ? "" : said.event.prompt,
    };
  });
  assert.deepEqual(
    built,
    LAYERS.cases.map(({ name, layer, pass, wrapped }) => ({
      name,
      layer,
      pass,
      wrapped,
    })),
  );
});

// A Go answer for the report tool reaches the harness as the tool's result. [[spec/tickets/log-report-stop-in-go]]
test("the step hands a Go report answer on as the tool's result", () => {
  const text = "The line stands in the log under port.";
  assert.deepEqual(
    stepOf({ effects: [{ kind: "result", result: { result: text } }] }, "tool.call", {
      asks: true,
      served: true,
    }),
    { answer: { result: text } },
  );
});
