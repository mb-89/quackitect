// The routes this tree ships, read off disk. A fixture says what a route does,
// and this case says the shipped file still carries it.
// [[spec/design_output/work#a-successor-stands-on-question]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { disk } from "../../src/doors/disk.js";
import { leafOf, stepPathOf } from "../../src/scripts/pull.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const routeOf = (name) =>
  readYaml(files.read(join(root, "spec", "processes", `${name}.yaml`)));

// A desk mints a successor off this route, and `branch unblock` refuses one opening where an agent works. [[spec/design_output/work#a-successor-stands-on-question]]
test("the question route opens at a step waiting for a person", () => {
  const front = routeOf("question");
  const path = stepPathOf(front);

  assert.equal(path, "answer", "the route opens at its answer step");
  assert.equal(leafOf(front, path)?.by, "person", "and that step waits for a person");
});
