// The read of the log files stands in Go alone: log-read.js stands nowhere,
// and no source, test or design note names it.
// [[spec/tickets/window-verbs-log-read-leaves]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const HERE = "test/contract/log-read-leaves.test.js";
const FOLDERS = ["src", "test", "spec/design_output"];
const READ = /\.(js|go|md)$/;
const NAMED = /\blog-read\.js\b/;

// Every file under the folder a reader opens, past the modules npm installs and the goldens. [[spec/tickets/window-verbs-log-read-leaves]]
function under(rel) {
  const out = [];
  let listed = [];
  try {
    listed = files.list(join(root, ...rel.split("/")));
  } catch {
    return [];
  }
  for (const one of listed) {
    if (one.name === "node_modules" || one.name === "testdata") continue;
    const path = `${rel}/${one.name}`;
    if (one.kind === "dir") out.push(...under(path));
    else if (READ.test(one.name)) out.push(path);
  }
  return out;
}

test("log-read.js stands nowhere", () => {
  assert.equal(files.exists(join(root, "src", "scripts", "log-read.js")), false);
});

test("no source, test or design note names log-read.js", () => {
  const naming = FOLDERS.flatMap(under).filter(
    (one) =>
      one !== HERE && NAMED.test(String(files.read(join(root, ...one.split("/"))))),
  );
  assert.deepEqual(naming, []);
});
