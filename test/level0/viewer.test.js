// The viewer's build, over a fake box. The fake go writes the binary it is asked
// for, so each case reads back what a real build leaves behind.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { SOURCE, STAMP, viewerOf } from "../../src/scripts/viewer.js";

const ROOT = "/box";
const EXE = `${ROOT}/.se/bin/logview`;
const BUILD = `go build -o ${EXE} .`;

const source = () =>
  fakeDisk({
    [`${ROOT}/${SOURCE}/main.go`]: "package main",
    [`${ROOT}/${SOURCE}/go.mod`]: "module quackitect/viewer",
    [`${ROOT}/${SOURCE}/ui_test.go`]: "package main",
  });

const goWrites = (disk) =>
  fakeProc({
    [BUILD]: (argv) => {
      disk.write(argv[3], "binary");
      return { exitCode: 0 };
    },
  });

test("a box with no binary builds one in the viewer's folder and stamps its source", () => {
  const disk = source();
  const proc = goWrites(disk);
  assert.deepEqual(viewerOf({ disk, proc, root: ROOT }), { exe: EXE, why: "" });
  assert.equal(proc.ran.length, 1);
  assert.equal(proc.ran[0].init.cwd, `${ROOT}/${SOURCE}`);
  assert.match(disk.read(`${ROOT}/${STAMP}`), /^[0-9a-f]{16}\n$/);
});

test("an unchanged source runs the binary it has and builds nothing", () => {
  const disk = source();
  const proc = goWrites(disk);
  viewerOf({ disk, proc, root: ROOT });
  assert.deepEqual(viewerOf({ disk, proc, root: ROOT }), { exe: EXE, why: "" });
  assert.equal(proc.ran.length, 1);
});

test("a changed source builds again", () => {
  const disk = source();
  const proc = goWrites(disk);
  viewerOf({ disk, proc, root: ROOT });
  disk.write(`${ROOT}/${SOURCE}/main.go`, "package main // moved");
  viewerOf({ disk, proc, root: ROOT });
  assert.equal(proc.ran.length, 2);
});

test("a changed test file leaves the binary standing", () => {
  const disk = source();
  const proc = goWrites(disk);
  viewerOf({ disk, proc, root: ROOT });
  disk.write(`${ROOT}/${SOURCE}/ui_test.go`, "package main // moved");
  viewerOf({ disk, proc, root: ROOT });
  assert.equal(proc.ran.length, 1);
});

test("a failed build with no binary answers no viewer and says why", () => {
  const disk = source();
  const proc = fakeProc({ [BUILD]: { exitCode: 1, stderr: "main.go:1: syntax error\n" } });
  assert.deepEqual(viewerOf({ disk, proc, root: ROOT }), {
    exe: "",
    why: "main.go:1: syntax error",
  });
  assert.equal(disk.exists(`${ROOT}/${STAMP}`), false);
});

test("a failed build over an old binary runs the old one and says why", () => {
  const disk = source();
  disk.write(EXE, "old binary");
  const proc = fakeProc({ [BUILD]: { exitCode: 1, stderr: "main.go:1: syntax error" } });
  const said = viewerOf({ disk, proc, root: ROOT });
  assert.equal(said.exe, EXE);
  assert.match(said.why, /^the build fails, so the last one runs: main\.go:1: syntax error$/);
});

test("a box with no go answers no viewer and names the missing program", () => {
  const disk = source();
  const proc = fakeProc({
    [BUILD]: () => {
      throw new Error("spawnSync go ENOENT");
    },
  });
  assert.deepEqual(viewerOf({ disk, proc, root: ROOT }), { exe: "", why: "spawnSync go ENOENT" });
});

test("a Windows box builds logview.exe", () => {
  const disk = source();
  const proc = fakeProc({
    [`go build -o ${EXE}.exe .`]: (argv) => {
      disk.write(argv[3], "binary");
      return { exitCode: 0 };
    },
  });
  assert.equal(viewerOf({ disk, proc, root: ROOT, windows: true }).exe, `${EXE}.exe`);
});
