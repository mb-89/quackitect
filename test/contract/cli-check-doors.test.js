// The doors the check runs over: the Go part's quiet run, the one cloud read,
// and the plugin's imports.
// [[spec/guidance/working]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const source = disk().read(join(root, "src", "scripts", "cli-check.js"));

// Under `check --errors` the Go run stays quiet, and each failing Go test reaches the error stream. [[spec/tickets/the-verbs-need-no-wrapper]]
test("the Go part runs quiet under --errors, and names each failing Go test on the error stream", () => {
  const part =
    /export function goHolds\(quiet = false, red = \[\]\)[\s\S]*?\n}\n/.exec(
      source,
    )?.[0] ?? "";
  assert.match(part, /inherit: !quiet/, "a quiet run keeps its output");
  assert.match(part, /--- FAIL/, "and reads the failing tests off it");
  assert.match(part, /console\.error\(/, "onto the error stream");
  // [[spec/tickets/go-checks-need-go]]
  assert.match(
    part,
    /goGate\(\{[^}]*\bskip\b[^}]*\}\)/,
    "and hands the gate the skip of the red tests",
  );
});

// The cloud read and the ticket folders each stand in one module, and the readers import them. [[spec/tickets/each-fact-keeps-one-owner]]
test("every reader of the cloud asks cloudHere, and named.js builds no folder list of its own", () => {
  for (const path of [
    ["src", "scripts", "pull-push.js"],
    ["src", "bridge", "stop.js"],
  ]) {
    const text = disk().read(join(root, ...path));
    assert.doesNotMatch(
      text,
      /\binCloud\b/,
      `${path.join("/")} reads the environment itself`,
    );
    assert.match(text, /\bcloudHere\(/, `${path.join("/")} asks cloudHere`);
  }
  const named = disk().read(join(root, "src", "engine", "named.js"));
  assert.doesNotMatch(
    named,
    /const WHERE =/,
    "named.js builds no folder list of its own",
  );
});

// The hook loads the plugin alone, so a module it imports reaches no file past the plugin's folder. [[spec/tickets/each-fact-keeps-one-owner]]
test("apply.js imports its siblings alone", () => {
  const text = disk().read(
    join(root, ".claude", "skills", "level0", "lib", "apply.js"),
  );
  for (const one of text.matchAll(/from\s+"([^"]+)"/g)) {
    assert.match(
      one[1],
      /^\.\/[^/]+\.js$/,
      `${one[1]} stands past the plugin's lib folder`,
    );
  }
});

// Every name the check imports stands used past its import, so the lint reads no unused import. [[spec/tickets/cli-check-drops-known]]
test("every name cli-check.js imports stands used past its import", () => {
  const unused = [];
  for (const block of source.matchAll(/import\s*\{([^}]*)\}\s*from/g)) {
    for (const one of block[1].split(",")) {
      const name = one.trim().split(/\s+as\s+/).at(-1);
      if (name && source.match(new RegExp(`\\b${name}\\b`, "g")).length < 2) unused.push(name);
    }
  }
  assert.deepEqual(unused, []);
});
