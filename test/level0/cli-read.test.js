// What the command line reads: the version, and no reader or lint of its own.
// [[spec/tickets/the-check-lint-runs-in-go]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as read from "../../src/scripts/cli-read.js";
import { version } from "../../src/scripts/cli-read.js";

// readThrough in src/bridge/findings.js is the one road past Vale, so the command line exports no reader of its own. [[spec/tickets/go-prose-checks-stand-alone]]
test("the command line exports no prose reader beside findings.js", () => {
  assert.equal(read.readThroughTheReader, undefined);
});

// The index, links, notes and find verbs run in Go, so the command line asks the index for none of them. [[spec/tickets/read-verbs-port-to-go]]
test("the command line exports no ask of the index", () => {
  assert.equal(read.asksIndex, undefined);
});

// The check's lint runs in Go, so the command line holds no lint of its own. [[spec/tickets/the-check-lint-runs-in-go]]
test("the command line exports the version and the walk alone, and no lint", () => {
  assert.deepEqual(Object.keys(read).sort(), ["namesIn", "show", "version", "walk"]);
});

test("the version reads as text", () => {
  assert.equal(typeof version(), "string");
  assert.notEqual(version(), "", "the version names something, or the fallback");
});
