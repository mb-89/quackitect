// The Go half of the battery: the one module at the root, what the run reads,
// and the findings the formatter's list reads as.
// [[spec/design_output/index#the-compiler-it-needs]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { formatFaults, goEnvOf, goGate } from "../../src/scripts/cli-go.js";

test("the run takes no C compiler and no tag", () => {
  const held = goEnvOf();
  assert.equal(held.CGO_ENABLED, "0");
  assert.equal(held.CC, undefined);
  assert.doesNotMatch(String(held.GOFLAGS ?? ""), /sqlite_fts5/);
});

// The gate the round before this one wired, held by a case of its own. [[spec/tickets/the-colours-stand-in-config]]
test("the formatter's list reads as one finding a file, named from the root", () => {
  const said = formatFaults("src/config/probe.go\nsrc/config/other.go\n");
  assert.equal(said.length, 2);
  assert.match(said[0], /^src\/config\/probe\.go: Gofmt: /);
  assert.match(said[1], /^src\/config\/other\.go: Gofmt: /);
});

// [[spec/tickets/the-colours-stand-in-config]]
test("a formatter answering nothing leaves the check green", () => {
  assert.deepEqual(formatFaults(""), []);
  assert.deepEqual(formatFaults("\n  \n"), []);
  assert.deepEqual(formatFaults(undefined), []);
});

// A check passing with no Go passes nothing. [[spec/tickets/go-checks-need-go]]
test("the Go gate on a box with no Go answers red and names the refusal", () => {
  const said = [];
  const run = () => {
    throw new Error("spawn go ENOENT");
  };
  assert.equal(goGate({ go: "go", run, say: (line) => said.push(line) }), 1);
  assert.match(said.join("\n"), /go stands nowhere/);
});

// [[spec/tickets/go-checks-need-go]]
test("the Go gate runs the tests and the formatter at the root", () => {
  const ran = [];
  const run = (argv) => {
    ran.push(argv);
    return { exitCode: 0, stdout: "" };
  };
  assert.equal(goGate({ go: "go", run, say: () => {} }), 0);
  assert.deepEqual(ran, [
    ["go", "test", "./..."],
    ["gofmt", "-l", "src"],
  ]);
});

// A red Go test file stays apart while its ticket stands open. [[spec/design_output/pull#the-gate]]
test("the Go gate skips the red tests, and a failing run answers red before the formatter", () => {
  const ran = [];
  const run = (argv) => {
    ran.push(argv);
    return { exitCode: 1, stdout: "--- FAIL: TestA\n" };
  };
  assert.equal(
    goGate({ go: "go", run, say: () => {}, skip: ["-skip", "^(TestB)$"] }),
    1,
  );
  assert.deepEqual(ran, [["go", "test", "-skip", "^(TestB)$", "./..."]]);
});

// [[spec/design_output/index#the-compiler-it-needs]]
test("the Go gate names each file the formatter lists, and answers red", () => {
  const said = [];
  const run = (argv) => ({
    exitCode: 0,
    stdout: argv[0] === "gofmt" ? "src/q/q.go\n" : "",
  });
  assert.equal(goGate({ go: "go", run, say: (line) => said.push(line) }), 1);
  assert.match(said.join("\n"), /^src\/q\/q\.go: Gofmt: /);
});
