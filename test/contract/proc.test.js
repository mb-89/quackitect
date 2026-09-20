// The process door, against the real thing. It runs one program here, so the
// suite pays that cost once and every other test takes the fake.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { proc } from "../../src/doors/proc.js";

const SAYS = [process.execPath, "-e", "process.stdout.write('quack')"];
const FAILS = [process.execPath, "-e", "process.exit(3)"];

const answers = (door) => [door.run(SAYS), door.run(FAILS)].map(shaped);

const shaped = (said) => ({
  exitCode: said.exitCode,
  stdout: said.stdout,
  stderr: said.stderr,
});

test("the real door answers the exit code and what the program wrote", () => {
  const said = proc().run(SAYS);
  assert.equal(said.exitCode, 0);
  assert.equal(said.stdout, "quack");
});

test("the fake answers what the real door answers", () => {
  const real = answers(proc());
  const fake = answers(
    fakeProc({
      [SAYS.join(" ")]: { stdout: "quack" },
      [FAILS.join(" ")]: { exitCode: 3 },
    }),
  );
  assert.deepEqual(fake, real);
});

// A start answers what a run answers, with the event loop free meanwhile. [[spec/design_output/lsp]]
test("a start answers what a run answers, in the real door and the fake alike", async () => {
  const started = async (door) =>
    [await door.start(SAYS), await door.start(FAILS)].map(shaped);
  const real = await started(proc());
  assert.deepEqual(real, answers(proc()));
  const fake = await started(
    fakeProc({
      [SAYS.join(" ")]: { stdout: "quack" },
      [FAILS.join(" ")]: { exitCode: 3 },
    }),
  );
  assert.deepEqual(fake, real);
});

// The tally the check names, one line a spawn, off the real door. [[spec/design_output/work#the-battery-answers-first]]
test("a door told to tally writes the program's name, one line a spawn", () => {
  const folder = disk().tempDir("tally-");
  const tally = join(folder, "spawns.txt");
  const was = process.env.SE_SPAWNS;
  process.env.SE_SPAWNS = tally;
  try {
    const door = proc();
    door.run(SAYS);
    door.run(FAILS);
    assert.deepEqual(disk().read(tally).trim().split("\n"), [
      process.execPath,
      process.execPath,
    ]);
  } finally {
    if (was === undefined) delete process.env.SE_SPAWNS;
    else process.env.SE_SPAWNS = was;
    disk().remove(folder);
  }
});

test("the fake refuses a command nobody taught it", () => {
  assert.throws(() => fakeProc().run(["git", "status"]), /never taught/);
});

test("a run that hands its output through answers the exit code alone", () => {
  const said = proc().run(FAILS, { inherit: true });
  assert.equal(said.exitCode, 3);
  assert.equal(said.stdout, "");
});

test("the real door hands a named variable to the program, and keeps the rest", () => {
  const said = proc().run(
    [
      process.execPath,
      "-e",
      "process.stdout.write(process.env.SE_SAYS + ':' + Boolean(process.env.PATH))",
    ],
    { env: { SE_SAYS: "quack" } },
  );
  assert.equal(said.stdout, "quack:true");
});

// [[spec/design_output/doors#a-raw-run-keeps-bytes]]
test("a raw run answers a character a byte, and an ordinary run answers text", () => {
  const writes = [
    process.execPath,
    "-e",
    "process.stdout.write(Buffer.from([0xc3, 0xa4]))",
  ];
  assert.equal(proc().run(writes, { raw: true }).stdout.length, 2);
  assert.equal(proc().run(writes).stdout, "ä");
});

test("the real door hands standard input to the program", () => {
  const said = proc().run(
    [process.execPath, "-e", "process.stdin.pipe(process.stdout)"],
    { stdin: "back" },
  );
  assert.equal(said.stdout, "back");
});
