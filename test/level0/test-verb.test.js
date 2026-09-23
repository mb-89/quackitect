// The test verb over what you name: a test file under the check's spawn tally,
// and a Go folder under the Go env, through the branch's own runner.
// [[spec/design_output/pull#the-test-verb]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { goModulesOf, testVerb } from "../../src/scripts/work-test.js";

const ROOT = "/tree";
const MOD = "module quackitect/one\n";
const TALLY = "/tree/.se/run/spawns.txt";
const FILE = "test/level0/x.test.js";
const PASS = { exitCode: 0, stdout: "# tests 2\n# pass 2\n# fail 0\n" };

function tree(answers) {
  const branch = [];
  return {
    branch,
    // A git that answers a branch point, so a case sees whether the verb reads the branch. [[spec/design_output/pull#the-test-verb]]
    git: {
      run: (argv) => {
        branch.push(argv.join(" "));
        return { out: "base111" };
      },
    },
    root: ROOT,
    join,
    node: "node",
    disk: fakeDisk({
      [`${ROOT}/src/index/go.mod`]: MOD,
      [`${ROOT}/src/engine/swap/go.mod`]: MOD,
    }),
    proc: fakeProc(answers),
  };
}

function quiet(run) {
  const was = console.log;
  const said = [];
  console.log = (line) => said.push(String(line));
  try {
    return { code: run(), said: said.join("\n") };
  } finally {
    console.log = was;
  }
}

// [[spec/design_output/pull#the-test-verb]]
test("a named test file runs under the check's spawn tally, and a named Go folder runs its module", () => {
  const it = tree({
    [`node --test --test-reporter=tap ${FILE}`]: PASS,
    "go -C src/index test ./...": { exitCode: 0 },
  });

  const { code, said } = quiet(() =>
    testVerb(it, ["test", FILE, "src/index"], { SE_SPAWNS: TALLY }),
  );

  assert.equal(code, 0, said);
  assert.equal(said, "green, 2 test(s) pass in 1 file(s); green, src/index passes");
  const [node, go] = it.proc.ran;
  assert.equal(node.init.env?.SE_SPAWNS, TALLY, "the file run takes the tally");
  assert.deepEqual(go.argv, ["go", "-C", "src/index", "test", "./..."]);
  assert.match(String(go.init.env?.GOFLAGS), /sqlite_fts5/, "the Go run takes the Go env");
});

// [[spec/design_output/pull#the-test-verb]]
test("a named Go folder alone runs its module, and reads no branch", () => {
  const it = tree({ "go -C src/engine/swap test ./...": { exitCode: 0 } });

  const { code, said } = quiet(() => testVerb(it, ["test", "src/engine/swap"], {}));

  assert.equal(code, 0, said);
  assert.equal(said, "green, src/engine/swap passes");
  assert.deepEqual(it.branch, [], "a named run reads no branch point");
});

// [[spec/design_output/pull#the-test-verb]]
test("a folder names the module holding it, and a Go test names its own", () => {
  const it = tree({});
  assert.deepEqual(goModulesOf(["src/index"], it), ["src/index"]);
  assert.deepEqual(goModulesOf(["src/engine/swap/inner"], it), ["src/engine/swap"]);
  assert.deepEqual(goModulesOf(["src/index/index_test.go"], it), ["src/index"]);
  assert.deepEqual(goModulesOf(["src/bridge/wait.js", "src/bridge"], it), []);
});
