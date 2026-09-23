// The flags the test verb hands the runner: the battery's reporter loads as a
// module, so it goes as a file URL, and its destination stays a path.
// [[spec/design_output/work#the-battery-answers-first]]

import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { testArgv } from "../../src/scripts/cli.js";

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
