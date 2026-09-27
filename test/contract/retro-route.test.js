// The retro's own route, read off the tree: the backlog read stands after
// the audit and feeds the chapter step.
// [[spec/tickets/the-retro-reads-the-backlog]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { disk } from "../../src/doors/disk.js";

const ROUTE = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "spec",
  "processes",
  "retro.yaml",
);

// [[spec/tickets/the-retro-reads-the-backlog]]
test("the retro route holds backlog after audit", () => {
  const steps = readYaml(disk().read(ROUTE)).steps;
  const names = steps.map((one) => one.name);
  const backlog = steps[names.indexOf("backlog")];

  assert.equal(names.indexOf("backlog"), names.indexOf("audit") + 1);
  assert.equal(backlog.input, "audit");
  assert.equal(steps[names.indexOf("chapter")].input, "backlog");
  assert.match(backlog.evidence[0].says, /retro backlog/);
});
