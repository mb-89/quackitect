// The flags the test verb hands the runner: the battery's reporter loads as a
// module, so it goes as a file URL, and its destination stays a path.
// [[spec/design_output/work#the-battery-answers-first]]

import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { TEST_PARTS, testArgv } from "../../src/scripts/check-verb.js";

const AT = resolve("/tree");
const reporters = (argv) =>
  argv
    .filter((one) => one.startsWith("--test-reporter="))
    .map((one) => one.slice("--test-reporter=".length));
const destinations = (argv) =>
  argv
    .filter((one) => one.startsWith("--test-reporter-destination="))
    .map((one) => one.slice("--test-reporter-destination=".length));

// [[spec/design_output/work#the-battery-answers-first]]
test("the battery's reporter goes as a file URL, and its destination stays a path", () => {
  const argv = testArgv(AT);
  const [screen, battery] = reporters(argv);
  const [stdout, file] = destinations(argv);

  assert.equal(screen, "spec");
  assert.equal(stdout, "stdout");
  assert.match(battery, /^file:\/\//);
  assert.equal(
    fileURLToPath(battery),
    join(AT, "src", "scripts", "battery-reporter.js"),
  );
  assert.doesNotMatch(file, /^file:/);
  assert.ok(file.startsWith(AT), "the destination lands under the root");
});

// The unit files share one process and the contract files keep one each, and each part reports to a file of its own. [[spec/tickets/the-tests-start-fewer-processes]]
test("the unit part runs in one process, the contract part a process a file, each to its own report", () => {
  const [unit, contract] = TEST_PARTS.map((part) => testArgv(AT, [], part));
  const ISOLATION = "--experimental-test-isolation=none";

  assert.ok(unit.includes(ISOLATION), "the unit files share a process");
  assert.ok(!contract.includes(ISOLATION), "each contract file keeps its own");
  assert.equal(unit.at(-1), "test/level0/*.test.js");
  assert.equal(contract.at(-1), "test/contract/*.test.js");
  assert.notEqual(destinations(unit)[1], destinations(contract)[1]);
  assert.deepEqual(testArgv(AT), unit, "the unit part answers where no part is named");
});
