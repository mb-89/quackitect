// The environment a Go test runs under, which the test verb hands a named Go
// test. The check's own Go gate stands in Go.
// [[spec/design_output/index#the-compiler-it-needs]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { goEnvOf } from "../../src/scripts/cli-go.js";

test("the run takes no C compiler and no tag", () => {
  const held = goEnvOf();
  assert.equal(held.CGO_ENABLED, "0");
  assert.equal(held.CC, undefined);
  assert.doesNotMatch(String(held.GOFLAGS ?? ""), /sqlite_fts5/);
});
