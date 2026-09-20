// The code door over a fake box: a write that grows past a ceiling comes back
// refused, and a cut to a file already past it passes. Biome stands off, so
// the ceiling alone speaks here.
// [[spec/design_output/level0#the-size-ceiling]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { codeDoor } from "../../src/bridge/code.js";
import { noteFor } from "../../src/bridge/split-ticket.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

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

test("a new file past a ceiling comes back refused, naming the function and its lines", async () => {
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
  assert.match(said.result.deny, /FunctionCeiling/);
  assert.match(said.result.deny, /long holds 5/);
  assert.equal(it.said[0][1], "write", "the log names the door");
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
  assert.match(grown.result.deny, /FileCeiling/);
});

// [[spec/design_output/level0#the-refusal-parks-the-work]]
test("a file ceiling parks the cut, and the refusal names where it stands", async () => {
  const it = box();
  const ran = [];
  it.box.root = ROOT;
  it.box.node = "node";
  it.box.proc = fakeProc({
    node: (argv) => {
      ran.push(argv);
      return { exitCode: 0 };
    },
  });

  const tall = new Array(7).fill("const one = 1;").join("\n");
  const path = at("src/a.js");
  const ask = [write(path, tall), { path, text: tall }, "src/a.js", tall, it.box];

  const said = await codeDoor(...ask);
  assert.match(said.result.deny, /FileCeiling/);
  assert.match(said.result.deny, /parks this cut/, "the refusal names the note");
  assert.equal(ran.length, 1, "the door runs the ticket verb once");

  it.disk.write(at(noteFor("src/a.js")), "---\nkind: [[ticket]]\n---\n");
  const again = await codeDoor(...ask);
  assert.match(again.result.deny, /names this cut already/);
  assert.equal(ran.length, 1, "a second refusal writes no second note");
});

// [[spec/design_output/level0#the-size-ceiling]]
test("a function ceiling alone parks nothing, because no file waits on a cut", async () => {
  const it = box();
  it.box.root = ROOT;
  it.box.proc = fakeProc({ node: () => ({ exitCode: 0 }) });

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

  assert.match(said.result.deny, /FunctionCeiling/);
  assert.doesNotMatch(said.result.deny, /parks this cut/);
});
