// The retro's collect, driven through fake doors. It copies the private folder
// into the retro's own, skips the two folders the owner names, and writes a
// manifest naming every line it takes.
// [[spec/design_input/the-agent-pulls-tickets]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { retro } from "../../src/scripts/retro.js";

const ROOT = "/tree";
const SCRATCH = "/scratch";
const TICKET = "retro-a1b2c3";
const at = (path) => join(ROOT, ...path.split("/"));
const inRetro = (path) => at(`.se/retro/${TICKET}/${path}`);

const FILES = {
  [at(".se/log/2026-09-18.jsonl")]: '{"said":"a line"}\n',
  [at(".se/tickets/a-note.md")]: "---\nkind: [[ticket]]\nstate: open\n---\n",
  [at(".se/scripts/one.mjs")]: "// a script a hand writes\n",
  [at(".se/probe/compact.json")]: '{"kept":1}\n',
  [at(".se/.runtime/index.db")]: "rows",
  [at(".se/.runtime/lsp.json")]: '{"port":1}\n',
  [at(".se/retro/older/manifest.jsonl")]: '{"path":"log"}\n',
  [`${SCRATCH}/two.mjs`]: "// a script beside the folder\n",
};

function doors(files = FILES, more = {}) {
  const said = fakeGit(
    {
      "git rev-parse HEAD": { stdout: "a1b2c3d4e5f6\n" },
      "git rev-parse --abbrev-ref HEAD": { stdout: "work/the-retro-runs\n" },
    },
    ROOT,
  );
  const disk = fakeDisk(files);
  return {
    proc: said.proc,
    disk,
    git: said,
    join,
    clock: fakeClock(),
    scratch: SCRATCH,
    node: "node",
    ...more,
  };
}

function heard(run) {
  const rows = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => rows.push(said.join(" "));
  console.error = (...said) => rows.push(said.join(" "));
  try {
    return { code: run(), said: rows.join("\n") };
  } finally {
    console.log = wasLog;
    console.error = wasError;
  }
}

// A hand mid-step writes files, and a copy of one of those tears. [[spec/design_input/the-agent-pulls-tickets]]
test("collect refuses while a hold stands under the private folder", () => {
  const it = doors({
    ...FILES,
    [at(".se/.runtime/hold/box-one-claude-code.json")]: '{"ticket":"a-child"}\n',
  });

  const { code, said } = heard(() => retro(ROOT, ["collect", TICKET], it));

  assert.equal(code, 1, "a hold standing stops the verb");
  assert.match(said, /a hand holds a ticket/);
  assert.equal(it.disk.exists(inRetro("manifest.jsonl")), false, "it writes nothing");
});

// The retro's own first leaf is a hold, so collect passes that one. [[spec/tickets/the-retro-takes-the-box]]
test("collect passes over the hold for the retro it collects for", () => {
  const it = doors({
    ...FILES,
    [at(".se/.runtime/hold/box-one-claude-code.json")]: `{"ticket":"${TICKET}"}\n`,
  });

  const { code } = heard(() => retro(ROOT, ["collect", TICKET], it));

  assert.equal(code, 0, "its own hold stops it nowhere");
  assert.equal(it.disk.exists(inRetro("manifest.jsonl")), true);
});

// [[spec/design_input/the-agent-pulls-tickets]]
test("collect copies the private folder, and skips the runtime folder and its own", () => {
  const it = doors();

  const { code } = heard(() => retro(ROOT, ["collect", TICKET], it));

  assert.equal(code, 0);
  assert.equal(
    it.disk.exists(inRetro("tickets/a-note.md")),
    true,
    "a note comes across",
  );
  assert.equal(
    it.disk.exists(inRetro("probe/compact.json")),
    true,
    "a probe comes across",
  );
  assert.equal(
    it.disk.exists(inRetro("run/index.db")),
    false,
    "the runtime folder stays",
  );
  assert.equal(
    it.disk.exists(inRetro("retro/older/manifest.jsonl")),
    false,
    "its own stays",
  );
});

// The owner rules the log out of the runtime folder, because a retro reads it. [[spec/tickets/the-retro-takes-the-box]]
test("collect copies the log, which stands outside the runtime folder", () => {
  const it = doors();

  heard(() => retro(ROOT, ["collect", TICKET], it));

  assert.equal(it.disk.exists(inRetro("log/2026-09-18.jsonl")), true);
  assert.equal(
    it.disk.read(inRetro("log/2026-09-18.jsonl")),
    FILES[at(".se/log/2026-09-18.jsonl")],
  );
});

// A hand writes a script in the folder and in the scratchpad, so collect reads both. [[spec/tickets/the-retro-takes-the-box]]
test("collect reads the scripts in the folder and in the scratchpad", () => {
  const it = doors();

  heard(() => retro(ROOT, ["collect", TICKET], it));

  assert.equal(it.disk.exists(inRetro("scripts/one.mjs")), true, "the folder inside");
  assert.equal(
    it.disk.exists(inRetro("scratch/two.mjs")),
    true,
    "the scratchpad outside",
  );
});

// [[spec/design_input/the-agent-pulls-tickets]]
test("the manifest holds one line a path, with its size and where it comes from", () => {
  const it = doors();

  heard(() => retro(ROOT, ["collect", TICKET], it));

  const rows = it.disk
    .read(inRetro("manifest.jsonl"))
    .split("\n")
    .filter(Boolean)
    .map((row) => JSON.parse(row));

  assert.ok(rows.length >= 5, "every file it copies takes a line");
  const said = rows.find((one) => String(one.path).endsWith("log/2026-09-18.jsonl"));
  assert.ok(said, "the log takes a line");
  assert.equal(typeof said.size, "number");
  assert.match(String(said.from), /\.se/);
  assert.equal(
    rows.some((one) => String(one.path).startsWith("run/")),
    false,
    "a folder it skips takes no line",
  );
});

// A file the copy refuses takes a line of its own, so the manifest names every path. [[spec/tickets/the-retro-takes-the-box]]
test("a file the copy refuses takes a manifest line naming the refusal", () => {
  const plain = doors();
  const disk = {
    ...plain.disk,
    copy(from, to) {
      if (String(from).includes("one.mjs")) throw new Error("EACCES");
      return plain.disk.copy(from, to);
    },
  };
  const it = { ...plain, disk };

  heard(() => retro(ROOT, ["collect", TICKET], it));

  const rows = disk
    .read(inRetro("manifest.jsonl"))
    .split("\n")
    .filter(Boolean)
    .map((row) => JSON.parse(row));
  const said = rows.find((one) => String(one.path).endsWith("one.mjs"));

  assert.ok(said, "the file it refuses takes a line");
  assert.match(String(said.refused), /EACCES/);
  assert.equal(said.size, undefined, "a line it refuses carries no size");
});

// [[spec/design_input/the-agent-pulls-tickets]]
test("a second run refuses, and a run carrying no manifest goes again", () => {
  const it = doors();
  heard(() => retro(ROOT, ["collect", TICKET], it));

  const again = heard(() => retro(ROOT, ["collect", TICKET], it));
  assert.equal(again.code, 0, "a gate runs this verb again, and reads the first answer");
  assert.match(again.said, /holds a whole run already/);

  it.disk.remove(inRetro("manifest.jsonl"));
  const torn = heard(() => retro(ROOT, ["collect", TICKET], it));
  assert.equal(torn.code, 0, "a folder carrying no manifest holds a torn run");
});
