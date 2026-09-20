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

// A respawn watched for a window: a child ending inside it answers its exit, and one standing past it answers no fall. [[spec/design_output/level0#a-restart-watches-its-child]]
const LIVES = [process.execPath, "-e", "setTimeout(() => {}, 3000)"];
const FALL_WAIT = 3000;
const STAND_WAIT = 200;

test("a respawn answers a fall inside the window, and none past it, in the real door and the fake alike", async () => {
  const respawned = async (door) => [
    await door.respawn(FAILS, { waitMs: FALL_WAIT }),
    await door.respawn(LIVES, { waitMs: STAND_WAIT }),
  ];
  const real = await respawned(proc());
  assert.deepEqual(real, [
    { fell: true, exitCode: 3 },
    { fell: false, exitCode: null },
  ]);
  const fake = await respawned(
    fakeProc({
      [FAILS.join(" ")]: { exitCode: 3 },
      [LIVES.join(" ")]: { stands: true },
    }),
  );
  assert.deepEqual(fake, real);
});

// The child's words outlive the door's own process, so they land in the file the caller names. [[spec/design_output/level0#a-restart-watches-its-child]]
test("a respawn writes the child's output into the file it is handed", async () => {
  const files = disk();
  const out = join(files.tempDir("respawn-"), "serve.log");
  const SAYS_AND_FALLS = [
    process.execPath,
    "-e",
    "console.error('the disk answers nothing'); process.exit(3)",
  ];
  const said = await proc().respawn(SAYS_AND_FALLS, { out, waitMs: FALL_WAIT });
  assert.equal(said.fell, true);
  assert.match(files.read(out), /the disk answers nothing/);
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
