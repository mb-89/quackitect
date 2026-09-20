// One reading answers both fronts. The case drives the real tools over the
// real tree, so it stands here and not beside a fake.
// [[spec/design_output/lsp#one-checker-every-front-asks]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
// The whole module, so a name the reader answers nowhere yet fails an assertion. [[spec/tickets/a-claim-meets-the-view]]
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
  const standing = {
    exists: (at) => at === "/tree/node_modules/.bin/biome",
    read: () => "",
  };
  assert.equal(
    findings.biomeFor(standing, "/tree", {}),
    "/tree/node_modules/.bin/biome",
  );
});

// The line of done_when asking for a sweep the way the panel does. [[spec/tickets/a-claim-meets-the-view]]
test("each front's route answers one count over the whole tree", async () => {
  assert.equal(
    typeof findings.readingCounts,
    "function",
    "the shared reader answers readingCounts",
  );
  const said = await findings.readingCounts(root);

  assert.equal(
    said.panel.length,
    said.check.length,
    `the panel reads ${said.panel.length} and the check reads ${said.check.length}`,
  );
  const alone = (one, other) => one.filter((row) => !other.includes(row));
  assert.deepEqual(alone(said.panel, said.check), [], "the panel holds no file alone");
  assert.deepEqual(alone(said.check, said.panel), [], "the check holds no file alone");
});

// The rule the ask asks for, read off the note that ships. [[spec/tickets/a-claim-meets-the-view]]
test("the working note asks for a claim of done read in the owner's view", () => {
  assert.match(
    read("spec/guidance/working.md"),
    /read a claim of done in the owner's own view/i,
    "the note carries the rule",
  );
});
