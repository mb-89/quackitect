// The server start behind a cloud take, over a fake process: a silent port
// records one start, an answering port records none, and a desk starts nothing.
// [[spec/design_output/level0#the-cloud-starts-the-server]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { START } from "../../.claude/skills/level0/hooks/level0.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { portIn, probeOf, serving, startOf } from "../../src/scripts/serve.js";

const ROOT = "/tree";

function box(answers, files = {}, cloud = true) {
  const proc = fakeProc({
    [probeOf("node", 6510).join(" ")]: { exitCode: answers.probe },
    [startOf(ROOT).join(" ")]: {
      exitCode: answers.start ?? 0,
      stderr: answers.stderr ?? "",
    },
  });
  return {
    it: { proc, disk: fakeDisk(files), root: ROOT, join, cloud, node: "node" },
    proc,
  };
}

function heard(what) {
  const lines = [];
  const was = console.log;
  console.log = (...said) => lines.push(said.join(" "));
  try {
    return { code: what(), said: lines.join("\n") };
  } finally {
    console.log = was;
  }
}

// The probe runs node too, so the start is the run carrying the script. [[spec/design_output/level0#the-cloud-starts-the-server]]
const started = (proc) => proc.ran.filter((one) => one.argv.includes(START)).length;

test("a silent port starts the server once, and the line says so", () => {
  const { it, proc } = box({ probe: 1 });
  const { code, said } = heard(() => serving(it, 0));
  assert.equal(code, 0);
  assert.equal(started(proc), 1);
  assert.match(said, /starts detached at port 6510/);
});

test("an answering port starts nothing", () => {
  const { it, proc } = box({ probe: 0 });
  const { said } = heard(() => serving(it, 0));
  assert.equal(started(proc), 0);
  assert.match(said, /answers at port 6510/);
});

test("a desk and a failed take start nothing", () => {
  const desk = box({ probe: 1 }, {}, false);
  heard(() => serving(desk.it, 0));
  assert.equal(desk.proc.ran.length, 0);
  const failed = box({ probe: 1 });
  assert.equal(heard(() => serving(failed.it, 1)).code, 1);
  assert.equal(failed.proc.ran.length, 0);
});

test("a failed start names the last thing the start said", () => {
  const { it } = box({ probe: 1, start: 1, stderr: "Error: EACCES, open serve.log\n" });
  assert.match(
    heard(() => serving(it, 0)).said,
    /start fails: Error: EACCES, open serve.log/,
  );
});

// [[spec/design_output/level0#the-bridgehead-starts-it-too]]
test("the take runs the line the bridgehead runs, and no copy of it", () => {
  assert.deepEqual(startOf(ROOT), ["node", "-e", START, ROOT, ROOT]);
});

test("the port reads off the pointer, and stands at the base without one", () => {
  const pointed = box(
    { probe: 1 },
    { [join(ROOT, ".se", ".runtime", "vehicle.json")]: '{"method":"/tree","port":6512}' },
  );
  assert.equal(portIn(pointed.it), 6512);
  assert.equal(portIn(box({ probe: 1 }).it), 6510);
});
