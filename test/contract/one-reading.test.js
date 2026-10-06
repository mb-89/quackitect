// One reading answers both fronts. The case drives the real tools over the
// real tree, which is what puts it here.
// [[spec/design_output/lsp#one-checker-every-front-asks]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
// The whole module, so a name the reader answers nowhere yet fails an assertion. [[spec/tickets/a-claim-meets-the-view]]
import { checkNote, schemasIn } from "../../.claude/skills/level0/lib/schema.js";
import { treeOf } from "../../.claude/skills/level0/lib/tree.js";
import * as findings from "../../src/bridge/findings.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const read = (path) => files.read(join(root, ...path.split("/")));

// [[spec/tickets/a-claim-meets-the-view]]
test("one guard names Biome for both fronts, and neither front holds its own", () => {
  assert.equal(
    typeof findings.biomeFor,
    "function",
    "the shared reader answers biomeFor",
  );
  assert.doesNotMatch(
    read("src/scripts/cli-read.js"),
    /files\.exists\(biome\)\s*\?/,
    "the command line takes the shared guard, and holds none of its own",
  );
});

// [[spec/tickets/a-claim-meets-the-view]]
test("the guard hands nothing where no binary stands, and the path where one does", () => {
  assert.equal(
    typeof findings.biomeFor,
    "function",
    "the shared reader answers biomeFor",
  );
  const nowhere = { exists: () => false, read: () => "" };
  assert.equal(findings.biomeFor(nowhere, "/tree", {}), "");
  const at = "/tree/.se/.runtime/bin/biome";
  const standing = { exists: (one) => one === at, read: () => "" };
  assert.equal(findings.biomeFor(standing, "/tree", {}), at);
});

// [[spec/design_output/lsp#a-closed-ticket-is-history]]
test("a closed ticket's row leaves the lint, and an open one's stays", () => {
  const text = {
    "/tree/spec/tickets/done.md": "---\nstate: closed\n---\n",
    "/tree/spec/tickets/open.md": "---\nstate: open\n---\n",
  };
  const at = {
    root: "/tree",
    join: (...parts) => parts.join("/"),
    disk: { exists: (one) => one in text, read: (one) => text[one] },
  };
  const kept = findings.pastHistory(at, [
    { file: "spec/tickets/done.md", rule: "EveryPointerResolves" },
    { file: "spec/tickets/open.md", rule: "EveryPointerResolves" },
  ]);
  assert.deepEqual(
    kept.map((one) => one.file),
    ["spec/tickets/open.md"],
  );
});

// The schema drops returned, and the closed tickets carrying it stand as history. [[spec/tickets/every-road-has-a-caller]]
test("a closed ticket carrying when returned meets the schema, and its rows leave the check", () => {
  const tree = treeOf({ root, disk: files });
  const schemas = schemasIn(tree);
  const ticket = schemas.get("ticket");
  const carrying = tree
    .names("spec/tickets", ".md")
    .map((name) => `spec/tickets/${name}`)
    .filter((path) => /^\s+when: returned$/m.test(tree.read(path)));
  assert.ok(
    carrying.length > 0,
    "the tree holds closed tickets carrying when returned",
  );
  const rows = carrying.flatMap((path) =>
    checkNote(tree.read(path), ticket, path, schemas),
  );
  assert.ok(
    rows.some((one) => /when reads returned/.test(one.message)),
    "the schema allows returned nowhere",
  );
  const at = { root, join, disk: files };
  for (const path of carrying) {
    assert.match(tree.read(path), /^state: closed$/m, `${path} stands closed`);
  }
  assert.deepEqual(findings.pastHistory(at, rows), []);
});

// The rule the ask asks for, read off the note that ships. [[spec/tickets/a-claim-meets-the-view]]
test("the working note asks for a claim of done read in the owner's view", () => {
  assert.match(
    read("spec/guidance/working.md"),
    /read a claim of done in the owner's own view/i,
    "the note carries the rule",
  );
});
