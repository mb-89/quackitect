// The reply probe's reading over log rows and the client's answer, the verb
// over a fake client, and the bridgehead writing the call a marked prompt arms.
// [[spec/tickets/the-reply-probe-runs]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { REPLY_PROBE } from "../../.claude/skills/level0/lib/guidance.js";
import { rowOf, SESSION } from "../../.claude/skills/level0/lib/log.js";
import { PROMPT_WHY } from "../../src/bridge/answer.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { probeReply, readsReply } from "../../src/scripts/probe-reply.js";

// The unit tests share one process, and the hook module holds the session in module state, so these cases take a module of their own. [[spec/tickets/the-tests-start-fewer-processes]]
const { register } = await import(
  "../../.claude/skills/level0/hooks/level0.js?probe-reply"
);

const AT = "2026-09-27T08:00:00.000Z";
const ROOT = "/tree";
const LOG = `${ROOT}/${SESSION}`;

const called = (fields) =>
  rowOf(AT, "info", "bridge", REPLY_PROBE.event, { detail: JSON.stringify(fields) });

test("a call whose text field carries the message's line names that field", () => {
  const read = readsReply([called({ tool: "Read", text: `${REPLY_PROBE.says}.` })], "");
  assert.deepEqual(read.carries, ["text"]);
  assert.equal(read.fields.tool, "Read");
  assert.match(read.why, /carries the message's text on text/);
});

test("a call carrying the line on no field says no field carries it", () => {
  const read = readsReply([called({ tool: "Read", input: "README.md" })], "");
  assert.deepEqual(read.carries, []);
  assert.equal(read.why, "no field of the call carries the message's text");
});

test("an answer quoting the warning as the prompt's first line reads warned, and one quoting the probe reads not", () => {
  assert.equal(
    readsReply([], `"${PROMPT_WHY}, and nothing has answered it yet."`).warned,
    true,
  );
  assert.equal(readsReply([], `"${REPLY_PROBE.marker}."`).warned, false);
});

function run(disk, answer) {
  const lines = [];
  const was = console.log;
  const wasError = console.error;
  console.log = (...said) => lines.push(said.join(" "));
  console.error = (...said) => lines.push(said.join(" "));
  try {
    const code = probeReply(
      ROOT,
      { disk, join: (...parts) => parts.join("/"), proc: { run: answer } },
      "claude",
    );
    return { code, said: lines.join("\n") };
  } finally {
    console.log = was;
    console.error = wasError;
  }
}

test("the verb prints the call's fields and exits 0 where the run writes the probe row", () => {
  const disk = fakeDisk({
    [LOG]: `${JSON.stringify(called({ tool: "Read", old: "x" }))}\n`,
  });
  const { code, said } = run(disk, () => {
    disk.write(
      LOG,
      `${disk.read(LOG)}${JSON.stringify(called({ tool: "Read", text: REPLY_PROBE.says }))}\n`,
    );
    return { exitCode: 0, stdout: `"${PROMPT_WHY}, and nothing has answered it yet."` };
  });
  assert.equal(code, 0);
  assert.match(said, /text {9}se-probe-reply writes this line/);
  assert.doesNotMatch(said, /old/);
  assert.match(said, /opening on the warning: yes/);
});

// The rows the run adds read past a line two writers tore. [[spec/design_output/log#every-writer-appends]]
test("the verb reads the probe row past a torn line the run leaves", () => {
  const disk = fakeDisk({ [LOG]: "" });
  const { code } = run(disk, () => {
    disk.write(LOG, `{"at":"2026\n${JSON.stringify(called({ tool: "Read", text: REPLY_PROBE.says }))}\n`);
    return { exitCode: 0, stdout: "" };
  });
  assert.equal(code, 0);
});

test("the verb exits 1 and says why where the run writes no probe row", () => {
  const disk = fakeDisk({ [LOG]: "" });
  const { code, said } = run(disk, () => ({ exitCode: 0, stdout: "" }));
  assert.equal(code, 1);
  assert.match(said, /loads no function hooks/);
});

function bridgehead(files) {
  const hooks = {};
  register(
    (event, hook) => {
      hooks[event] = hook;
    },
    { method: ROOT },
  );
  const $ = {
    fs: {
      read: async (rel) => files.read(`${ROOT}/${rel}`),
      exists: async (rel) => files.exists(`${ROOT}/${rel}`),
      write: async (rel, text) => files.write(`${ROOT}/${rel}`, text),
    },
    // The bridgehead appends its row through node, and the append lands in the log the case reads. [[spec/tickets/a-down-index-refuses-calls]]
    process: {
      run: async (argv) => {
        if (argv[0] !== "node" || !String(argv[2]).includes("appendFileSync"))
          return { exitCode: 1 };
        files.append(`${ROOT}/${argv[3]}`, String(argv[4]));
        return { exitCode: 0 };
      },
    },
    http: {
      fetch: async () => {
        throw new Error("Unable to connect");
      },
    },
    session: { messages: async () => [] },
    ui: { log: () => {} },
  };
  const fire = (event, e) =>
    hooks["*"](
      $,
      e,
      Object.assign(async (one) => one, { event }),
    );
  return fire;
}

test("the bridgehead writes the first call after a marked prompt into the log, and no call after", async () => {
  const files = fakeDisk({ [LOG]: "" });
  const fire = bridgehead(files);
  await fire("prompt.submit", { text: REPLY_PROBE.opens });
  await fire("tool.call", { tool: "Read", text: REPLY_PROBE.says });
  await fire("tool.call", { tool: "Bash" });
  const rows = files
    .read(LOG)
    .split("\n")
    .filter(Boolean)
    .map((one) => JSON.parse(one));
  const probed = rows.filter((one) => one.said === REPLY_PROBE.event);
  assert.equal(probed.length, 1);
  assert.equal(JSON.parse(probed[0].detail).text, REPLY_PROBE.says);
});

test("the bridgehead writes no probe row after a prompt carrying no marker", async () => {
  const files = fakeDisk({ [LOG]: "" });
  const fire = bridgehead(files);
  await fire("prompt.submit", { text: "Say hello." });
  await fire("tool.call", { tool: "Read" });
  // register resets the fall, so the fall's own row lands, and no probe row does. [[spec/tickets/a-down-index-refuses-calls]]
  const rows = files
    .read(LOG)
    .split("\n")
    .filter(Boolean)
    .map((one) => JSON.parse(one));
  assert.deepEqual(
    rows.filter((one) => one.said === REPLY_PROBE.event),
    [],
  );
});
