// The test verb over what you name: a test file under the check's spawn tally,
// and a Go folder under the Go env, through the branch's own runner.
// [[spec/design_output/pull#the-test-verb]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import * as verbs from "../../src/scripts/work-test.js";

const { goPackagesOf, testVerb } = verbs;

const ROOT = "/tree";
const MOD = "module quackitect\n";
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
      [`${ROOT}/go.mod`]: MOD,
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
test("a named test file runs under the check's spawn tally, and a named Go folder runs its packages from the root", () => {
  const it = tree({
    [`node --test --test-reporter=tap ${FILE}`]: PASS,
    "go test ./src/index/...": { exitCode: 0 },
  });

  const { code, said } = quiet(() =>
    testVerb(it, ["test", FILE, "src/index"], { SE_SPAWNS: TALLY }),
  );

  assert.equal(code, 0, said);
  assert.equal(said, "green, 2 test(s) pass in 1 file(s); green, src/index passes");
  const [node, go] = it.proc.ran;
  assert.equal(node.init.env?.SE_SPAWNS, TALLY, "the file run takes the tally");
  assert.deepEqual(go.argv, ["go", "test", "./src/index/..."]);
  assert.equal(
    go.init.cwd,
    ROOT,
    "the Go run stands at the root, where the module stands",
  );
  assert.equal(go.init.env?.CGO_ENABLED, "0", "the Go run takes the Go env");
});

// [[spec/design_output/pull#the-test-verb]]
test("a named Go folder alone runs its packages, and reads no branch", () => {
  const it = tree({ "go test ./src/engine/swap/...": { exitCode: 0 } });

  const { code, said } = quiet(() => testVerb(it, ["test", "src/engine/swap"], {}));

  assert.equal(code, 0, said);
  assert.equal(said, "green, src/engine/swap passes");
  assert.deepEqual(it.branch, [], "a named run reads no branch point");
});

// [[spec/design_output/pull#the-test-verb]]
test("a folder names itself, and a Go test names the folder holding it", () => {
  const it = tree({});
  assert.deepEqual(goPackagesOf(["src/index"], it), ["src/index"]);
  assert.deepEqual(goPackagesOf(["src/engine/swap/inner"], it), [
    "src/engine/swap/inner",
  ]);
  assert.deepEqual(goPackagesOf(["src/index/index_test.go"], it), ["src/index"]);
  assert.deepEqual(goPackagesOf(["src/bridge/wait.js"], it), []);
});

const RED_TEST = "test/level0/a.test.js";
const SOURCE = "src/scripts/a.js";
const FRESH = "src/scripts/b.js";
const ASIDE = `${ROOT}/.se/.runtime/red`;
const FAILS = {
  exitCode: 1,
  stdout: "# tests 1\n# pass 0\n# fail 1\n",
  stderr: "AssertionError [ERR_ASSERTION]: the change is missing\n",
};

// A test run that reads the sources as they stand while it runs. [[spec/design_output/pull#the-test-verb]]
function redTree(answer) {
  const seen = {};
  const git = fakeGit({
    [`git show HEAD:${SOURCE}`]: { stdout: "the text at HEAD\n" },
    [`git show HEAD:${FRESH}`]: { exitCode: 128, stderr: "fatal: path not in HEAD" },
  });
  const disk = fakeDisk({
    [`${ROOT}/${SOURCE}`]: "the working text\n",
    [`${ROOT}/${FRESH}`]: "a new file\n",
  });
  git.proc.teach(["node", "--test", "--test-reporter=tap", RED_TEST], () => {
    seen.source = disk.exists(`${ROOT}/${SOURCE}`)
      ? disk.read(`${ROOT}/${SOURCE}`)
      : null;
    seen.fresh = disk.exists(`${ROOT}/${FRESH}`);
    seen.held = disk.exists(`${ASIDE}/${SOURCE}`);
    return answer;
  });
  return {
    it: { root: ROOT, join, node: "node", git, disk, proc: git.proc },
    disk,
    seen,
  };
}

// [[spec/design_output/pull#the-test-verb]]
test("test --red sets the sources aside, answers red on an assertion, and puts them back", () => {
  const { it, disk, seen } = redTree(FAILS);
  assert.equal(typeof verbs.redTest, "function", "the red verb stands");

  const { code, said } = quiet(() => verbs.redTest(it, [RED_TEST, SOURCE, FRESH], {}));

  assert.equal(code, 0, said);
  assert.match(said, /^red, 1 test\(s\) fail on their own assertion/);
  assert.equal(seen.source, "the text at HEAD\n", "the test reads the source at HEAD");
  assert.equal(seen.fresh, false, "a source new to the change stands aside");
  assert.equal(seen.held, true, "the working text waits on disk while the test runs");
  assert.equal(disk.read(`${ROOT}/${SOURCE}`), "the working text\n");
  assert.equal(disk.read(`${ROOT}/${FRESH}`), "a new file\n");
  assert.equal(disk.exists(ASIDE), false, "nothing stays aside");
});

// [[spec/design_output/pull#the-test-verb]]
// The working texts wait on disk under .se, so a run killed mid-way loses none, and the next run puts them back first. [[spec/tickets/red-verb-meets-new-sources]]
test("test --red after a killed run puts the working texts back, a new source among them", () => {
  const { it, disk } = redTree(FAILS);
  disk.write(`${ROOT}/${SOURCE}`, "the text at HEAD\n");
  disk.remove(`${ROOT}/${FRESH}`);
  disk.makeDir(`${ASIDE}/src/scripts`);
  disk.write(`${ASIDE}/${SOURCE}`, "the working text\n");
  disk.write(`${ASIDE}/${FRESH}`, "a new file\n");
  disk.write(
    `${ASIDE}/sources.json`,
    JSON.stringify([
      { path: SOURCE, kept: true },
      { path: FRESH, kept: true },
    ]),
  );

  const { code, said } = quiet(() => verbs.redTest(it, [RED_TEST, SOURCE, FRESH], {}));

  assert.equal(code, 0, said);
  assert.equal(disk.read(`${ROOT}/${SOURCE}`), "the working text\n");
  assert.equal(disk.read(`${ROOT}/${FRESH}`), "a new file\n");
  assert.equal(disk.exists(ASIDE), false, "nothing stays aside");
});

test("test --red refuses where the test passes with the sources set aside", () => {
  const { it, disk } = redTree(PASS);
  assert.equal(typeof verbs.redTest, "function", "the red verb stands");

  const { code, said } = quiet(() => verbs.redTest(it, [RED_TEST, SOURCE, FRESH], {}));

  assert.equal(code, 1, said);
  assert.match(said, /^refused, because .*green/);
  assert.equal(disk.read(`${ROOT}/${SOURCE}`), "the working text\n");
  assert.equal(disk.read(`${ROOT}/${FRESH}`), "a new file\n");
  assert.equal(disk.exists(ASIDE), false);
});

// A hand reads the failing case off the verb's own lines, and the verdict stays last for the reader of its first word. [[spec/tickets/the-verbs-need-no-wrapper]]
test("a red run names each failing case above its verdict line, and the verdict stays last", () => {
  const stdout = [
    "ok 1 - a green case",
    "not ok 2 - a first red case",
    "  ---",
    "  error: AssertionError [ERR_ASSERTION]: it broke",
    "  ...",
    "not ok 3 - a second red case",
    "not ok 4 - a todo case # TODO the owner lands it",
    "# tests 3",
    "# pass 1",
    "# fail 2",
  ].join("\n");

  const rows = verbs
    .testSays({ exitCode: 1, stdout, stderr: "" }, ["a.test.js"])
    .split("\n");

  assert.deepEqual(rows.slice(0, -1), [
    "  not ok: a first red case",
    "  not ok: a second red case",
  ]);
  assert.match(rows.at(-1), /^assertion, 2 test\(s\) fail on their own assertion/);
});
