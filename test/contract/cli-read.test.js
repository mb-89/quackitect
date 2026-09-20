// The lint's rows in the log, read off the source, because the lint stands on
// the real doors the way the command line's table does. The rules passing is
// the expected road, so its row stands at debug and the floor hides it.
// [[spec/design_output/log#which-door-says-what]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const source = disk().read(join(root, "src", "scripts", "cli-read.js"));

// [[spec/design_output/log#which-door-says-what]]
test("the rules passing writes at debug, and a rule breaking writes at warn", () => {
  assert.match(source, /say\("debug", "vale", `the rules pass over/);
  assert.match(
    source,
    /say\("warn", "vale", `\$\{found\.length\} line\(s\) break a rule`/,
  );
});
