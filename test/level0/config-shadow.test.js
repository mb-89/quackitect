// The config slice in shadow: the verb's answer and the config module's meet
// key by key, and each key they answer apart makes one row. The JavaScript
// readers still answer what the readers golden file holds.
// [[spec/tickets/cfg-topic-holds-one-resolver]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import env from "../../src/quack/testdata/readers.env.json" with { type: "json" };
import golden from "../../src/quack/testdata/readers.golden.json" with { type: "json" };
import local from "../../src/quack/testdata/readers.local.json" with { type: "json" };
import schema from "../../src/quack/testdata/readers.schema.json" with { type: "json" };
import tracked from "../../src/quack/testdata/readers.tracked.json" with {
  type: "json",
};
import {
  FIXTURE,
  GOLDEN,
  goldenOf,
  READERS,
  readersOf,
  TESTDATA,
} from "../../src/scripts/config-golden.js";
import {
  answeredOf,
  mismatchesOf,
  RUN_TIMEOUT_MS,
  saidOf,
  shadowRun,
} from "../../src/scripts/config-shadow.js";

// The fixture and the golden file, seeded into a fake disk where the writer reads them. [[spec/tickets/cfg-topic-holds-one-resolver]]
const files = fakeDisk({
  [join(TESTDATA, FIXTURE.tracked)]: JSON.stringify(tracked),
  [join(TESTDATA, FIXTURE.local)]: JSON.stringify(local),
  [join(TESTDATA, FIXTURE.schema)]: JSON.stringify(schema),
  [join(TESTDATA, FIXTURE.env)]: JSON.stringify(env),
  [GOLDEN]: JSON.stringify(golden),
});

const ROWS = [
  { key: "a.x", value: 1, layer: "spec/config/level0.json" },
  { key: "a.y", value: "t", layer: ".se/.runtime/config.json" },
  { key: "a.z", value: true, layer: "SE_A_Z" },
];

test("a key both readers answer alike makes no row", () => {
  const answered = {
    "a.x": { value: 1, layer: "spec/config/level0.json" },
    "a.y": { value: "t", layer: ".se/.runtime/config.json" },
    "a.z": { value: true, layer: "SE_A_Z" },
  };
  assert.deepEqual(mismatchesOf(ROWS, answered), []);
});

test("a key answered apart by value, by layer or by one side alone makes one row each", () => {
  const answered = {
    "a.x": { value: 2, layer: "spec/config/level0.json" },
    "a.y": { value: "t", layer: "spec/config/level0.json" },
    "b.q": { value: 0, layer: "spec/config/level0.json" },
  };
  const rows = mismatchesOf(ROWS, answered);
  assert.deepEqual(
    rows.map((one) => one.key),
    ["a.x", "a.y", "a.z", "b.q"],
  );
  assert.deepEqual(rows[0], {
    key: "a.x",
    old: 1,
    new: 2,
    oldLayer: "spec/config/level0.json",
    newLayer: "spec/config/level0.json",
  });
  assert.equal(rows[2].new, undefined);
  assert.equal(rows[3].old, undefined);
});

test("a wanted key narrows the rows to itself", () => {
  const rows = mismatchesOf(ROWS, {}, new Set(["a.y"]));
  assert.deepEqual(
    rows.map((one) => one.key),
    ["a.y"],
  );
});

test("a row says the key and both answers", () => {
  const [one] = mismatchesOf(
    ROWS,
    { "a.x": { value: 2, layer: "L" } },
    new Set(["a.x"]),
  );
  assert.match(
    saidOf(one),
    /^config in shadow: a\.x reads 1 in spec\/config\/level0\.json, and 2 in L/,
  );
});

// The doors a shadow run takes, each a fake: the slice's mode, the binary's presence, what it prints, and the rows the log keeps. [[spec/tickets/cfg-topic-holds-one-resolver]]
function doorsOf(mode, printed, standing = true) {
  const said = [];
  const ran = [];
  return {
    said,
    ran,
    doors: {
      settings: { ask: async (key) => (key === "migration.config" ? mode : undefined) },
      files: { exists: () => standing },
      proc: {
        run: (argv) => {
          ran.push(argv);
          return { exitCode: 0, stdout: printed, stderr: "" };
        },
      },
      log: { say: async (...row) => said.push(row) },
      root: "/root",
      binary: "/root/se-index",
    },
  };
}

test("a shadow run writes one shadow row a key the module answers apart", async () => {
  const { doors, said, ran } = doorsOf(
    "shadow",
    JSON.stringify({ "a.x": { value: 2, layer: "spec/config/level0.json" } }),
  );
  const found = await shadowRun(doors, ROWS, new Set(["a.x"]));
  assert.deepEqual(ran, [["/root/se-index", "config"]]);
  assert.equal(found.length, 1);
  assert.equal(said.length, 1);
  const [level, kind, line, more] = said[0];
  assert.equal(level, "info");
  assert.equal(kind, "shadow");
  assert.match(line, /^config in shadow: a\.x/);
  assert.equal(more.slice, "config");
  assert.equal(more.key, "a.x");
});

test("a binary that fails to run writes nothing, and the run carries a timeout", async () => {
  const { doors, said } = doorsOf("shadow", "{}");
  let init = null;
  doors.proc.run = (_argv, given) => {
    init = given;
    throw new Error("spawn EACCES");
  };
  assert.deepEqual(await shadowRun(doors, ROWS), []);
  assert.deepEqual(said, []);
  assert.equal(init.timeoutMs, RUN_TIMEOUT_MS);
});

test("a slice standing old, or a binary standing nowhere, runs nothing", async () => {
  const old = doorsOf("old", "{}");
  assert.deepEqual(await shadowRun(old.doors, ROWS), []);
  assert.deepEqual(old.ran, []);
  const missing = doorsOf("shadow", "{}", false);
  assert.deepEqual(await shadowRun(missing.doors, ROWS), []);
  assert.deepEqual(missing.ran, []);
});

test("what quack config prints parses, and anything else reads as nothing", () => {
  assert.deepEqual(answeredOf('{"a.x": {"value": 1, "layer": "T"}}'), {
    "a.x": { value: 1, layer: "T" },
  });
  assert.equal(answeredOf(""), null);
  assert.equal(answeredOf("[1]"), null);
  assert.equal(answeredOf("no JSON"), null);
});

test("the JavaScript readers answer what the readers golden file holds", async () => {
  const said = await readersOf(files);
  const held = goldenOf(files).readers ?? {};
  for (const name of Object.values(READERS)) {
    assert.ok(
      held[name],
      `the golden file holds no section for ${name}: run node test/level0/config-golden.js`,
    );
    assert.deepEqual(
      JSON.parse(JSON.stringify(said[name])),
      held[name],
      `${name} answers apart from the golden file: run node test/level0/config-golden.js, and read the difference at the merge`,
    );
  }
});
