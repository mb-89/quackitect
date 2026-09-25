// One reading answers both fronts. The case drives the real tools over the
// real tree, which is what puts it here.
// [[spec/design_output/lsp#one-checker-every-front-asks]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
// The whole module, so a name the reader answers nowhere yet fails an assertion. [[spec/tickets/a-claim-meets-the-view]]
import * as findings from "../../src/bridge/findings.js";
import { disk } from "../../src/doors/disk.js";
// The whole module, so a name the command line answers nowhere yet fails an assertion. [[spec/tickets/a-claim-meets-the-view]]
import * as reading from "../../src/scripts/cli-read.js";
import { privateRow, serverFaults } from "../../src/scripts/cli-served.js";

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

// The lint reads the server's list and the rules it holds nowhere yet, and each row once. [[spec/design_output/lsp#a-port-serves-the-list]]
test("the lint reads each row of the server's list once", async () => {
  assert.equal(typeof findings.linesNamed, "function", "the reader answers linesNamed");
  assert.equal(
    typeof reading.readingFor,
    "function",
    "the command line answers readingFor",
  );

  // One file proves the contract, and the language server reads it once, because a sweep over a folder costs the battery seconds and proves no more. [[spec/tickets/one-reading-proves-one-file]]
  const file = "spec/guidance/working.md";
  const served = (await serverFaults([file])) ?? [];
  const printed = await reading.readingFor([file], served);
  const alone = findings.aloneOver({ disk: files, join, root }, [file]);

  const check = findings.linesNamed(printed.found);
  assert.deepEqual(check, findings.linesNamed([...served, ...alone]));
  assert.equal(new Set(check).size, check.length, "no row reads twice");
});

// [[spec/design_output/lsp#a-port-serves-the-list]]
test("a row on a private note holds no push", () => {
  assert.equal(privateRow(".se/tickets/a-note.md"), true);
  assert.equal(privateRow(".se\\tickets\\a-note.md"), true);
  assert.equal(privateRow("spec/tickets/a-note.md"), false);
  assert.equal(privateRow(".semantic/a.md"), false);
});

// The rule the ask asks for, read off the note that ships. [[spec/tickets/a-claim-meets-the-view]]
test("the working note asks for a claim of done read in the owner's view", () => {
  assert.match(
    read("spec/guidance/working.md"),
    /read a claim of done in the owner's own view/i,
    "the note carries the rule",
  );
});
