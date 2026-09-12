// The process door, against the real thing. It runs one program here, so the
// suite pays that cost once and every other test takes the fake.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
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

test("the fake refuses a command nobody taught it", () => {
  assert.throws(() => fakeProc().run(["git", "status"]), /never taught/);
});

test("a run that hands its output through answers the exit code alone", () => {
  const said = proc().run(FAILS, { inherit: true });
  assert.equal(said.exitCode, 3);
  assert.equal(said.stdout, "");
});

test("the real door hands standard input to the program", () => {
  const said = proc().run(
    [process.execPath, "-e", "process.stdin.pipe(process.stdout)"],
    { stdin: "back" },
  );
  assert.equal(said.stdout, "back");
});
