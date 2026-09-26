// The viewer's build, over a fake box. The fake go writes the binary it is asked
// for, so each case reads back what a real build leaves behind.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { SOURCE, STAMP, viewerOf } from "../../src/scripts/tui-build.js";

const ROOT = "/box";
const EXE = `${ROOT}/.se/.runtime/bin/logview`;
const BUILD = `go build -o ${EXE}.new .`;

const source = () =>
  fakeDisk({
    [`${ROOT}/${SOURCE}/main.go`]: "package main",
    [`${ROOT}/${SOURCE}/go.mod`]: "module quackitect/tui",
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

// [[spec/design_output/tui#the-verb-builds-it]]
test("a build lands beside the running binary, and the old one steps aside by rename", () => {
  const disk = source();
  disk.write(EXE, "old binary");
  const proc = goWrites(disk);
  assert.deepEqual(viewerOf({ disk, proc, root: ROOT }), { exe: EXE, why: "" });
  assert.equal(disk.read(EXE), "binary");
  assert.equal(disk.read(`${EXE}.old`), "old binary");
  assert.equal(disk.exists(`${EXE}.new`), false);
});

// A disk where a running window holds one file: its removal and a move onto it throw, the way Windows answers. [[spec/design_output/tui#the-verb-builds-it]]
const heldAt = (disk, held) => {
  const { remove, move } = disk;
  const refused = (path) =>
    Object.assign(new Error(`EPERM: ${path}`), { code: "EPERM" });
  disk.remove = (path) => {
    if (path === held) throw refused(path);
    remove.call(disk, path);
  };
  disk.move = (from, to) => {
    if (from === held || to === held) throw refused(to);
    move.call(disk, from, to);
  };
  return disk;
};

// [[spec/design_output/tui#the-verb-builds-it]]
test("a build lands while a window holds the binary stepped aside last", () => {
  const disk = heldAt(source(), `${EXE}.old`);
  disk.write(EXE, "running binary");
  disk.write(`${EXE}.old`, "older binary");
  const proc = goWrites(disk);
  assert.deepEqual(viewerOf({ disk, proc, root: ROOT }), { exe: EXE, why: "" });
  assert.equal(disk.read(EXE), "binary");
  assert.equal(disk.read(`${EXE}.old`), "older binary");
  assert.equal(disk.read(`${EXE}.old1`), "running binary");
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
  const proc = fakeProc({
    [BUILD]: { exitCode: 1, stderr: "main.go:1: syntax error\n" },
  });
  assert.deepEqual(viewerOf({ disk, proc, root: ROOT }), {
    exe: "",
    why: "main.go:1: syntax error",
  });
  assert.equal(disk.exists(`${ROOT}/${STAMP}`), false);
});

test("a failed build over an old binary runs the old one and says why", () => {
  const disk = source();
  disk.write(EXE, "old binary");
  const proc = fakeProc({
    [BUILD]: { exitCode: 1, stderr: "main.go:1: syntax error" },
  });
  const said = viewerOf({ disk, proc, root: ROOT });
  assert.equal(said.exe, EXE);
  assert.match(
    said.why,
    /^the build fails, so the last one runs: main\.go:1: syntax error$/,
  );
});

test("a box with no go answers no viewer and names the missing program", () => {
  const disk = source();
  const proc = fakeProc({
    [BUILD]: () => {
      throw new Error("spawnSync go ENOENT");
    },
  });
  assert.deepEqual(viewerOf({ disk, proc, root: ROOT }), {
    exe: "",
    why: "spawnSync go ENOENT",
  });
});

test("a Windows box builds logview.exe", () => {
  const disk = source();
  const proc = fakeProc({
    [`go build -o ${EXE}.exe.new .`]: (argv) => {
      disk.write(argv[3], "binary");
      return { exitCode: 0 };
    },
  });
  assert.equal(viewerOf({ disk, proc, root: ROOT, windows: true }).exe, `${EXE}.exe`);
});

// [[spec/design_output/tui#the-verb-builds-it]]
test("a move in the shared module rebuilds the viewer", () => {
  const disk = source();
  const proc = goWrites(disk);
  disk.write(`${ROOT}/src/yaml/yaml.go`, "package yaml");
  viewerOf({ disk, proc, root: ROOT });
  const ran = proc.ran.length;
  viewerOf({ disk, proc, root: ROOT });
  assert.equal(proc.ran.length, ran, "a tree standing still runs no second build");
  disk.write(`${ROOT}/src/yaml/yaml.go`, "package yaml // moved");
  viewerOf({ disk, proc, root: ROOT });
  assert.equal(proc.ran.length, ran + 1, "a move in the shared module builds again");
});

// A tab stands under a folder of its own, and a move there rebuilds the viewer the way a move at the root does. [[spec/design_output/tui#the-packages-the-window-holds]]
test("a move under a package of the window rebuilds the viewer", () => {
  const disk = source();
  const proc = goWrites(disk);
  disk.write(`${ROOT}/${SOURCE}/work/work.go`, "package work");
  viewerOf({ disk, proc, root: ROOT });
  const ran = proc.ran.length;
  viewerOf({ disk, proc, root: ROOT });
  assert.equal(proc.ran.length, ran, "a tree standing still runs no second build");
  disk.write(`${ROOT}/${SOURCE}/work/work.go`, "package work // moved");
  viewerOf({ disk, proc, root: ROOT });
  assert.equal(proc.ran.length, ran + 1, "a move under a package builds again");
});

// A case file under a package stays out of the stamp, the way one at the root does. [[spec/design_output/tui#the-verb-builds-it]]
test("a changed case file under a package leaves the binary standing", () => {
  const disk = source();
  const proc = goWrites(disk);
  disk.write(`${ROOT}/${SOURCE}/work/work_test.go`, "package work");
  viewerOf({ disk, proc, root: ROOT });
  const ran = proc.ran.length;
  disk.write(`${ROOT}/${SOURCE}/work/work_test.go`, "package work // moved");
  viewerOf({ disk, proc, root: ROOT });
  assert.equal(proc.ran.length, ran, "a case file under a package builds nothing");
});
