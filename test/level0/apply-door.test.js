// The batch edit door: the tools it registers, and the specs the client reads.
// [[spec/design_output/apply#the-write-tools]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { applied, PATCH, REPLACE } from "../../.claude/skills/level0/lib/apply.js";
import { UNDO } from "../../.claude/skills/level0/lib/undo.js";
import { SPECS, TOOLS } from "../../src/bridge/apply.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { onWrite } from "../../src/bridge/write.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { named, NAMED } from "./fixtures.js";

// A box the server builds, with doors in memory and an index that answers the sweep. [[spec/design_output/apply#the-write-tools]]
function routed() {
  const disk = fakeDisk({
    "/tree/one.md": "alpha beta\n",
    "/tree/two.md": "gamma 12\n",
    ...named("/tree"),
  });
  return boxOf("/tree", "/tree", {
    disk,
    clock: fakeClock(),
    log: fakeLog(),
    proc: { run: () => ({ exitCode: 1, stdout: "", stderr: "" }) },
    index: {
      dead: () => "",
      fault: () => "",
      warm: () => ({ warmed: false }),
      ask: () => ({ files: [{ path: "one.md" }, { path: "two.md" }] }),
    },
    vale: { stands: () => false },
    biome: { stands: () => false },
  });
}

// [[spec/design_output/apply#the-write-tools]]
test("the server routes a patch with an exact and a regex op, and a replace, to the door", async () => {
  const box = routed();
  const patch = await decide(
    {
      event: "tool.call",
      e: {
        tool: `mcp__level0__${PATCH}`,
        ticket: NAMED,
        ops: [
          { file: "one.md", old: "beta", new: "delta" },
          { file: "two.md", op: "regex", pattern: "(\\d+)", replacement: "[$1]" },
        ],
      },
    },
    box,
  );
  assert.match(patch.result.result, /2 file\(s\) written/);
  assert.equal(box.disk.read("/tree/one.md"), "alpha delta\n");
  assert.equal(box.disk.read("/tree/two.md"), "gamma [12]\n");

  const replace = await decide(
    {
      event: "tool.call",
      e: {
        tool: `mcp__level0__${REPLACE}`,
        ticket: NAMED,
        pattern: "a(lpha|mma)",
        replacement: "A$1",
        glob: "*.md",
      },
    },
    box,
  );
  assert.match(replace.result.result, /2 file\(s\) written/);
  assert.equal(box.disk.read("/tree/one.md"), "Alpha delta\n");
  assert.equal(box.disk.read("/tree/two.md"), "gAmma [12]\n");
});

test("the door registers a tool for each write verb", () => {
  assert.deepEqual(
    Object.keys(TOOLS).sort(),
    [`mcp__level0__${PATCH}`, `mcp__level0__${REPLACE}`, `mcp__level0__${UNDO}`].sort(),
  );

  for (const call of Object.values(TOOLS)) assert.equal(typeof call, "function");
});

test("each spec names its tool and the shape it takes", () => {
  const said = SPECS();

  assert.deepEqual(said.map((one) => one.name).sort(), [PATCH, REPLACE, UNDO].sort());
  for (const one of said) {
    assert.ok(one.description, `${one.name} says what it does`);
    assert.equal(one.inputSchema.type, "object");
  }
});

// The box a patch lands in: a formatter that writes a trailing newline, and no Vale. [[spec/design_output/level0#the-formatter-applies-itself]]
function formatting(files) {
  return {
    method: "/tree",
    work: "/tree",
    root: "/tree",
    disk: fakeDisk(files),
    clock: fakeClock(),
    log: fakeLog(),
    vale: { stands: () => false },
    biome: {
      stands: () => true,
      format: async (text) => ({ ran: true, text: `${text.trimEnd()}\n` }),
      lint: async () => ({ ran: true, found: [] }),
    },
    projections: [],
  };
}

// [[spec/design_output/level0#the-formatter-applies-itself]]
test("a patch over code writes the text the formatter answers, so the next edit meets its mark", async () => {
  const box = formatting({ "/tree/one.js": "const a = 1;\n", ...named("/tree") });
  const said = await TOOLS[`mcp__level0__${PATCH}`](
    { ticket: NAMED, ops: [{ file: "one.js", old: "a = 1;", new: "a = 2;   " }] },
    box,
  );
  assert.match(said.result.result, /1 file\(s\) written/);
  assert.equal(box.disk.read("/tree/one.js"), "const a = 2;\n");
  const next = await onWrite(
    { tool: "Edit", file_path: "/tree/one.js", old_string: "2", new_string: "3" },
    box,
  );
  assert.equal(
    next?.result?.deny,
    undefined,
    "the mark stands on the text the disk holds",
  );
});

// A break of form the door warns on lands with the batch, and the answer names the rows. [[spec/design_output/level0#the-panel-holds-a-warning]]
test("a patch over code past a lint row writes, and the answer carries the warning", async () => {
  const box = formatting({ "/tree/one.js": "const a = 1;\n", ...named("/tree") });
  box.biome.lint = async () => ({
    ran: true,
    found: [
      {
        rule: "lint/style/useConst",
        line: 1,
        column: 1,
        message: "Use const.",
        severity: "error",
      },
    ],
  });
  const said = await TOOLS[`mcp__level0__${PATCH}`](
    { ticket: NAMED, ops: [{ file: "one.js", old: "a = 1;", new: "a = 2;" }] },
    box,
  );
  assert.match(said.result.result, /1 file\(s\) written/);
  assert.match(said.result.result, /one\.js:1 lint\/style\/useConst: Use const\./);
  assert.equal(box.disk.read("/tree/one.js"), "const a = 2;\n");
});

// [[spec/design_output/apply#bytes-in-bytes-out]]
test("an exact edit writes a dollar sign as a dollar sign", () => {
  const took = applied({ "one.md": { exists: true, text: "price\n" } }, [
    { file: "one.md", old: "price", new: "$& costs $$5 $' $`" },
  ]);
  assert.equal(took.files[0].made, "$& costs $$5 $' $`\n");
});
