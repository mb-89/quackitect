// The check's read of the server: a box running no server reads every rule,
// and a server standing and failing its health call answers red.
// [[spec/design_output/level0#the-check-reads-the-server]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { serverHolds, serverRead } from "../../src/scripts/cli-check.js";

const WHERE = "http://127.0.0.1:6510/health";

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
