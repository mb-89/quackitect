// The check's read of the server: a box running no server reads every rule,
// and a server standing and failing its health call answers red.
// [[spec/design_output/level0#the-check-reads-the-server]]

import assert from "node:assert/strict";
import { test } from "node:test";
// The whole module, so the stamp's move out of it holds. [[spec/design_output/work#the-battery-answers-first]]
import * as check from "../../src/scripts/cli-check.js";
import {
  serverHolds,
  serverLine,
  serverRead,
  skipOf,
} from "../../src/scripts/cli-check.js";
import { goTestNames } from "../../src/scripts/cli-go.js";
import { stamped } from "../../src/scripts/cli-stamp.js";

const WHERE = "http://127.0.0.1:6510/health";

// The check reads and the stamp writes, so the two stand in two files under the file ceiling. [[spec/design_output/work#the-battery-answers-first]]
test("the check answers no stamp of its own, and the stamp module answers it", () => {
  assert.equal(
    check.stamped,
    undefined,
    "cli-check.js hands the stamp to cli-stamp.js",
  );
  assert.equal(typeof stamped, "function");
});

// The doctor's hook probe stands in its own file, so the check stays under the file ceiling. [[spec/design_output/level0#the-doctor-probes-every-hook]]
test("the check answers no hook probe of its own, and cli-hooks.js answers it", () => {
  assert.equal(
    check.hooksNamed,
    undefined,
    "cli-check.js hands the hook probe to cli-hooks.js",
  );
  assert.equal(check.hookRows, undefined, "and the rows it answers");
});

// The log verb asks its slice's mode off the doors the window's verbs share. [[spec/tickets/read-topics-switch-over]]
test("the doors the log verb runs on carry the slices and the method root", () => {
  const doors = check.tuiDoors();
  assert.equal(typeof doors.slices?.log, "string");
  assert.equal(typeof doors.method, "string");
});

// A fetch door answering the health call, so the probe runs off the wire. [[spec/design_output/doors#a-fake-behaves]]
const answers = (body) => async () => ({ json: async () => body });
const silent = () => async () => {
  throw new Error("fetch failed");
};

// The console the check writes to, held so a case reads the lines back. [[spec/design_output/doors#a-fake-behaves]]
async function said(get) {
  const lines = [];
  const was = { log: console.log, error: console.error };
  console.log = (line) => lines.push(line);
  console.error = (line) => lines.push(line);
  try {
    return { code: await serverHolds(get), lines };
  } finally {
    console.log = was.log;
    console.error = was.error;
  }
}

test("a server answering well stands, and the check carries on", () => {
  const read = serverRead({ answers: true, ok: true, where: WHERE, why: "" });
  assert.equal(read.code, 0);
  assert.ok(read.line.includes(WHERE));
});

test("a server answering ill answers red, and names what it fails", () => {
  const why = "the index stands dead";
  const read = serverRead({ answers: true, ok: false, where: WHERE, why });
  assert.equal(read.code, 1);
  assert.ok(read.line.includes(why), read.line);
});

test("no server at all leaves the rules running, and says how to start one", () => {
  const read = serverRead({
    answers: false,
    ok: false,
    where: WHERE,
    why: "fetch failed",
  });
  assert.equal(read.code, 0);
  assert.ok(read.line.includes("./RUNME.sh serve"), read.line);
});

test("the probe over a fake door answers what the read says", async () => {
  assert.equal((await said(answers({ ok: true }))).code, 0);

  const ill = await said(answers({ ok: false, dead: "the index stands dead" }));
  assert.equal(ill.code, 1);
  assert.ok(ill.lines.join("\n").includes("the index stands dead"));

  const none = await said(silent());
  assert.equal(none.code, 0);
  assert.ok(none.lines.join("\n").includes("./RUNME.sh serve"));
});

// A person asking after a fall reads the doctor, so its wording stands held. [[spec/tickets/the-bridge-says-it-falls]]
test("the doctor names a bridge standing down, and one standing up", async () => {
  assert.match(await serverLine(silent()), /^none at http/, "a bridge standing down");
  assert.match(
    await serverLine(answers({ ok: true })),
    /^stands at http/,
    "and a bridge answering",
  );
});

// A red Go file stands apart as a red JavaScript one does. [[spec/design_output/pull#the-gate]]
test("the Go run skips every test a red Go file names, and nothing where no Go file stands red", () => {
  const files = {
    "src/q/a_test.go":
      "package q\n\nfunc TestOne(t *testing.T) {}\n\nfunc helper() {}\n\nfunc TestTwo(t *testing.T) {}\n",
    "src/q/b_test.go": "package q\n\nfunc TestOne(t *testing.T) {}\n",
  };
  const read = (path) => files[path];
  assert.deepEqual(
    skipOf(["src/q/a_test.go", "src/q/b_test.go", "test/level0/x.test.js"], read),
    ["-skip", "^(TestOne|TestTwo)$"],
  );
  assert.deepEqual(
    skipOf(["src/q/b_test.go, test/level0/x.test.js,src/q/a_test.go"], read),
    ["-skip", "^(TestOne|TestTwo)$"],
    "a ticket's line of red files, commas between",
  );
  assert.deepEqual(skipOf(["test/level0/x.test.js"], read), []);
  assert.deepEqual(
    skipOf(["src/q/gone_test.go"], () => {
      throw new Error("gone");
    }),
    [],
  );
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

// [[spec/tickets/level0-runs-whole-on-the-door]]
test("the check is red where level zero does not run whole on a fresh box, and says why", async () => {
  const said = [];
  const shouted = [];
  const red = async (_root, _it, say) => {
    say("FAIL rules: the context read hands the client no block");
    return 1;
  };
  const green = async (_root, _it, say) => {
    say("PASS rules: the context read hands the client level0-canary");
    return 0;
  };

  assert.equal(
    await check.level0Runs(red, "linux", (one) => said.push(one), (one) => shouted.push(one)),
    1,
  );
  assert.match(shouted.join("\n"), /FAIL rules/);
  assert.match(shouted.join("\n"), /this tree is red/);
  assert.equal(await check.level0Runs(green, "linux", (one) => said.push(one), () => {}), 0);
  assert.match(said.join("\n"), /PASS rules/);
  let ran = false;
  const untouched = async () => {
    ran = true;
    return 1;
  };
  assert.equal(await check.level0Runs(untouched, "win32", () => {}, () => {}), 0);
  assert.equal(ran, false, "a Windows box runs no dry session");
});

// [[spec/tickets/level0-runs-whole-on-the-door]]
test("the battery runs level zero on a fresh box before the rules", async () => {
  const { partsOf } = await import("../../src/scripts/check-verb.js");
  const names = partsOf([]).map(([name]) => name);
  assert.ok(names.includes("level0"), names.join(" "));
  assert.ok(names.indexOf("level0") < names.indexOf("rules"));
});
