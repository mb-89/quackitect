// What the verbs past the check read off cli-check.js: the doors the log verb
// runs on and the Go test names. The check's read of the
// server stands in Go.
// [[spec/design_output/level0#the-check-reads-the-server]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as check from "../../src/scripts/cli-check.js";
import { goTestNames } from "../../src/scripts/cli-go.js";

// The log verb asks its slice's mode off the doors the window's verbs share. [[spec/tickets/read-topics-switch-over]]
test("the doors the log verb runs on carry the slices and the method root", () => {
  const doors = check.tuiDoors();
  assert.equal(typeof doors.slices?.log, "string");
  assert.equal(typeof doors.method, "string");
});

// The skip of the check and the named run of the test verb read one list of names. [[spec/design_output/pull#the-test-verb]]
test("the Go test names read each test function once, in order, and pass over a helper and a file that reads nowhere", () => {
  const files = {
    "src/q/a_test.go":
      "package q\n\nfunc TestTwo(t *testing.T) {}\n\nfunc helper() {}\n\nfunc TestOne(t *testing.T) {}\n",
    "src/q/b_test.go": "package q\n\nfunc TestOne(t *testing.T) {}\n",
  };
  const read = (path) => {
    if (!(path in files)) throw new Error("gone");
    return files[path];
  };
  assert.deepEqual(
    goTestNames(
      ["src/q/a_test.go", "src/q/b_test.go", "src/q/gone_test.go", "src/q/q.go"],
      read,
    ),
    ["TestOne", "TestTwo"],
  );
});

