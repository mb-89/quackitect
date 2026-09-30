// No file under src/extension spawns a process, so every ticket button
// reaches its verb through the index.
// [[spec/tickets/the-lens-calls-actions]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const EXTENSION = join(ROOT, "src", "extension");
// The packages the extension installs, which run in no path of its own. [[spec/tickets/the-lens-calls-actions]]
const INSTALLED = "node_modules";

function filesUnder(files, folder) {
  return files
    .list(folder)
    .filter((one) => one.name !== INSTALLED)
    .flatMap((one) =>
      one.kind === "dir"
        ? filesUnder(files, join(folder, one.name))
        : one.name.endsWith(".js")
          ? [join(folder, one.name)]
          : [],
    );
}

test("no file under src/extension spawns a verb", () => {
  const files = disk();
  const spawns = filesUnder(files, EXTENSION).filter((path) =>
    /\bspawn\(/.test(files.read(path)),
  );
  assert.deepEqual(spawns, []);
});
