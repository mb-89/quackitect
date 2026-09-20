// One reading answers both fronts. The case drives the real tools over the
// real tree, which is what puts it here.
// [[spec/design_output/lsp#one-checker-every-front-asks]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
// The whole module, so a name the reader answers nowhere yet fails an assertion. [[spec/tickets/a-claim-meets-the-view]]
import * as findings from "../../src/bridge/findings.js";
import { boxOf } from "../../src/bridge/server.js";
import { disk } from "../../src/doors/disk.js";
import { serverFaults } from "../../src/scripts/cli-check.js";
// The whole module, so a name the command line answers nowhere yet fails an assertion. [[spec/tickets/a-claim-meets-the-view]]
import * as reading from "../../src/scripts/cli-read.js";

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

// The line of done_when asking for a sweep the way the panel does. [[spec/tickets/a-claim-meets-the-view]]
test("each front's own route answers one list over the whole tree", async () => {
  assert.equal(typeof findings.linesNamed, "function", "the reader answers linesNamed");
  assert.equal(typeof reading.readingFor, "function", "the command line answers readingFor");

  // The two sweeps run one after the other, because two Vale runs over one tree collide. One folder proves the contract, where the whole tree costs the battery a minute under load. [[spec/tickets/a-claim-meets-the-view]]
  const folder = "spec/guidance";
  const drawn = await findings.findingsFor(boxOf(root), `${findings.FINDINGS}?path=${folder}`);
  const printed = await reading.readingFor([folder]);

  const panel = findings.linesNamed([...drawn.found, ...(serverFaults([folder]) ?? [])]);
  const check = findings.linesNamed(printed.found);

  const alone = (one, other) => one.filter((row) => !other.includes(row));
  assert.deepEqual(alone(panel, check), [], "the panel names no line alone");
  assert.deepEqual(alone(check, panel), [], "the check names no line alone");
  assert.equal(panel.length, check.length);
});

// The rule the ask asks for, read off the note that ships. [[spec/tickets/a-claim-meets-the-view]]
test("the working note asks for a claim of done read in the owner's view", () => {
  assert.match(
    read("spec/guidance/working.md"),
    /read a claim of done in the owner's own view/i,
    "the note carries the rule",
  );
});
