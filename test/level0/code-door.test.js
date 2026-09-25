// The code door over a fake box: a write that grows past a ceiling lands with
// a warning, and a cut to a file already past it passes clean. Biome stands
// off, so the ceiling alone speaks here, past the one case handing in a lint.
// [[spec/design_output/level0#the-size-ceiling]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { TICKETS as NOTES } from "../../.claude/skills/level0/lib/folders.js";
import { codeDoor } from "../../src/bridge/code.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const CONFIG = JSON.stringify({ code: { functionLines: 3, fileLines: 6 } });

function box(files = {}) {
  const disk = fakeDisk({ [at("spec/config/level0.json")]: CONFIG, ...files });
  const said = [];
  return {
    disk,
    said,
    box: {
      disk,
      work: ROOT,
      method: ROOT,
      biome: { stands: () => false },
      log: { say: (...row) => said.push(row) },
    },
  };
}

const write = (path, text) => ({ tool: "Write", file_path: path, content: text });
const noteOf = (said) => String(said?.after?.context?.join("\n") ?? "");

test("a new file past a ceiling lands with a warning, naming the function and its lines", async () => {
  const it = box();
  const text = ["function long() {", "  a();", "  b();", "  c();", "}", ""].join("\n");
  const path = at("src/a.js");
  const said = await codeDoor(
    write(path, text),
    { path, text },
    "src/a.js",
    text,
    it.box,
  );
  assert.equal(said.result?.deny, undefined, "the write lands");
  assert.match(noteOf(said), /FunctionCeiling/);
  assert.match(noteOf(said), /long holds 5/);
  assert.match(noteOf(said), /the write lands/);
  assert.deepEqual(it.said[0].slice(0, 2), ["warn", "write"], "the log names the door at warn");
});

test("a write under every ceiling passes, and a cut to a file past its ceiling passes too", async () => {
  const small = ["function s() {", "  return 1;", "}", ""].join("\n");
  const path = at("src/a.js");
  const clean = await codeDoor(
    write(path, small),
    { path, text: small },
    "src/a.js",
    small,
    box().box,
  );
  assert.deepEqual(clean, { pass: true });

  const tall = Array.from({ length: 12 }, (_, i) => `const v${i} = ${i};`).join("\n");
  const shorter = Array.from({ length: 9 }, (_, i) => `const v${i} = ${i};`).join("\n");
  const it = box({ [path]: tall });
  const cut = await codeDoor(
    write(path, shorter),
    { path, text: shorter },
    "src/a.js",
    shorter,
    it.box,
  );
  assert.deepEqual(
    cut,
    { pass: true },
    "nine lines past a ceiling of six, and fewer than twelve",
  );

  const grown = await codeDoor(
    write(path, `${tall}\nconst more = 1;`),
    { path, text: tall },
    "src/a.js",
    `${tall}\nconst more = 1;`,
    it.box,
  );
  assert.match(noteOf(grown), /FileCeiling/);
});

// [[spec/design_output/level0#the-ceiling-names-the-cut]]
test("a file ceiling warning names the cut, and mints no note", async () => {
  const it = box();

  const tall = new Array(7).fill("const one = 1;").join("\n");
  const path = at("src/a.js");
  const ask = [write(path, tall), { path, text: tall }, "src/a.js", tall, it.box];

  const said = await codeDoor(...ask);
  assert.match(noteOf(said), /FileCeiling/);
  assert.match(noteOf(said), /RUNME\.sh split src\/a\.js --to/);
  assert.equal(
    it.disk.exists(at(NOTES)),
    false,
    "no note lands under the private tickets",
  );
});

// [[spec/design_output/level0#the-size-ceiling]]
test("a function ceiling alone names no cut", async () => {
  const it = box();
  const long = [
    "function s() {",
    "  const a = 1;",
    "  const b = 2;",
    "  return a;",
    "}",
    "",
  ].join("\n");
  const path = at("src/b.js");
  const said = await codeDoor(
    write(path, long),
    { path, text: long },
    "src/b.js",
    long,
    it.box,
  );

  assert.match(noteOf(said), /FunctionCeiling/);
  assert.doesNotMatch(noteOf(said), /RUNME\.sh split/);
});

// A lint error from Biome is a break of form, so the formatted text lands and the note names the row. [[spec/design_output/level0#the-panel-holds-a-warning]]
test("a Biome error lands the formatted write with a warning naming the rule", async () => {
  const it = box();
  it.box.biome = {
    stands: () => true,
    format: async (text) => ({ ran: true, text: `${text}\n` }),
    lint: async () => ({
      found: [
        { rule: "lint/style/useConst", line: 1, column: 1, message: "Use const.", severity: "error" },
      ],
    }),
  };
  const text = "let s = 1;";
  const path = at("src/c.js");
  const said = await codeDoor(write(path, text), { path, text }, "src/c.js", text, it.box);
  assert.equal(said.result?.deny, undefined, "the write lands");
  assert.equal(said.event?.content, `${text}\n`, "the formatter still applies itself");
  assert.match(noteOf(said), /src\/c\.js:1 lint\/style\/useConst: Use const\./);
});
