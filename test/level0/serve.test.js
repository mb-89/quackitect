// The index start behind a cloud take and a desk serve, over a fake process:
// the take runs the start road once, and a desk runs the index standing.
// [[spec/design_output/level0#the-cloud-starts-the-server]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { portIn, servesDetached, serving, startOf } from "../../src/scripts/serve.js";

const ROOT = "/tree";
const INDEX_AT = join(ROOT, ".se", ".runtime", "bin", "se-index");
const HOOKS_AT = join(ROOT, ".se", ".runtime", "hooks.json");
const DOOR = '{"port":7001,"token":"t"}';

function box(answers, files = {}, cloud = true) {
  const disk = fakeDisk(files);
  const proc = fakeProc({ node: { exitCode: 1 } });
  proc.teach(startOf(ROOT), () => {
    if (!answers.start) disk.write(HOOKS_AT, DOOR);
    return { exitCode: answers.start ?? 0, stderr: answers.stderr ?? "" };
  });
  return {
    it: {
      proc,
      disk,
      clock: fakeClock(),
      env: {},
      root: ROOT,
      join,
      cloud,
      node: "node",
    },
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

const started = (proc) =>
  proc.ran.filter((one) => one.argv.join(" ") === startOf(ROOT).join(" ")).length;

// [[spec/design_output/level0#the-cloud-starts-the-server]]
test("a cloud take runs the start road once, and names the port of the hooks door", () => {
  const { it, proc } = box({});
  const { code, said } = heard(() => serving(it, 0));
  assert.equal(code, 0);
  assert.equal(started(proc), 1);
  assert.match(said, /index stands at port 7001/);
});

test("a desk and a failed take start nothing", () => {
  const desk = box({}, {}, false);
  heard(() => serving(desk.it, 0));
  assert.equal(desk.proc.ran.length, 0);
  const failed = box({});
  assert.equal(heard(() => serving(failed.it, 1)).code, 1);
  assert.equal(failed.proc.ran.length, 0);
});

test("a failed start names the last thing the start said", () => {
  const { it } = box({ start: 8, stderr: "the index door does not answer\n" });
  assert.match(
    heard(() => serving(it, 0)).said,
    /start fails: the index door does not answer/,
  );
});

// [[spec/design_output/level0#the-cloud-starts-the-server]]
test("the take runs the index standing, and no node", () => {
  assert.deepEqual(startOf(ROOT), [INDEX_AT, "standing"]);
});

test("the port reads off the pointer, and stands at the base without one", () => {
  const pointed = box(
    {},
    {
      [join(ROOT, ".se", ".runtime", "vehicle.json")]: '{"method":"/tree","port":6512}',
    },
  );
  assert.equal(portIn(pointed.it), 6512);
  assert.equal(portIn(box({}).it), 6510);
});

function desk(answer, files = {}) {
  const disk = fakeDisk(files);
  const proc = fakeProc({ node: { exitCode: 1 } });
  proc.teach([INDEX_AT, "standing"], () => {
    if (!answer.exitCode) disk.write(HOOKS_AT, DOOR);
    return answer;
  });
  return { it: { proc, disk, root: ROOT, join, node: "node" }, proc };
}

const standings = (proc) =>
  proc.ran.filter((one) =>
    one.argv.join(" ").split("\\").join("/").includes("bin/se-index standing"),
  ).length;

// [[spec/design_output/level0#a-desk-serve-returns]]
test("a desk serve runs the index standing where no door stands, and names its port", async () => {
  const { it, proc } = desk({ exitCode: 0 });
  const said = await servesDetached(it);
  assert.equal(standings(proc), 1, "one standing");
  assert.match(said, /index starts at port 7001/);
});

// [[spec/design_output/level0#a-desk-serve-returns]]
test("a desk serve over a standing door says it answers", async () => {
  const { it } = desk({ exitCode: 0 }, { [HOOKS_AT]: DOOR });
  assert.match(await servesDetached(it), /index answers at port 7001/);
});

// [[spec/design_output/level0#a-desk-serve-returns]]
test("a desk serve whose index falls names what the index said", async () => {
  const { it } = desk({ exitCode: 1, stderr: "the index door does not answer\n" });
  assert.match(await servesDetached(it), /index falls: the index door does not answer/);
});
