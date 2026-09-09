// The survey, over a fake box. These cases assert what a caller reads out of
// .se/tools.json, so a wrong path shows here first.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  guesses,
  installedTools,
  pathOf,
  placesFor,
  surveyOf,
  TOOLS,
  versionOf,
  WANTED,
} from "../../.claude/skills/level0/lib/tools.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { readTools, survey, whereIs, writeSurvey } from "../../src/scripts/tools.js";

const ROOT = "/box";
const BIN = `${ROOT}/.se/bin`;
const UNIX = { PATH: "/usr/bin:/bin" };

const boxWith = (paths) => fakeDisk(Object.fromEntries(paths.map((at) => [at, ""])));

test("the survey names the path and the version of a tool in .se/bin", () => {
  const files = boxWith([`${BIN}/vale`]);
  const outside = fakeProc({
    [`${BIN}/vale --version`]: { stdout: "vale version 3.20.0" },
  });

  const found = survey({ disk: files, proc: outside }, ROOT, UNIX);

  assert.deepEqual(found.vale, { path: `${BIN}/vale`, version: "3.20.0" });
});

test("the survey finds a tool on the path variable where .se/bin holds none", () => {
  const files = boxWith(["/usr/bin/git"]);
  const outside = fakeProc({
    "/usr/bin/git --version": { stdout: "git version 2.43.0" },
  });

  const found = survey({ disk: files, proc: outside }, ROOT, UNIX);

  assert.deepEqual(found.git, { path: "/usr/bin/git", version: "2.43.0" });
});

test("a tool absent from the box reads as null", () => {
  const found = survey({ disk: boxWith([]), proc: fakeProc({}) }, ROOT, UNIX);

  for (const one of WANTED) assert.equal(found[one.name], null, one.name);
});

test("a tool this tree asks no version of stands with its path alone", () => {
  const files = boxWith(["/bin/sh"]);

  const found = survey({ disk: files, proc: fakeProc({}) }, ROOT, UNIX);

  assert.deepEqual(found.sh, { path: "/bin/sh" });
});

test("a tool answering nothing about its version keeps its path", () => {
  const files = boxWith([`${BIN}/lnav`]);
  const outside = fakeProc({ [`${BIN}/lnav -V`]: { exitCode: 1, stdout: "" } });

  const found = survey({ disk: files, proc: outside }, ROOT, UNIX);

  assert.deepEqual(found.lnav, { path: `${BIN}/lnav`, version: "" });
});

test("python answers to python3 first, and to python after it", () => {
  const files = boxWith(["/usr/bin/python"]);
  const outside = fakeProc({
    "/usr/bin/python --version": { stdout: "Python 3.12.1" },
  });

  const found = survey({ disk: files, proc: outside }, ROOT, UNIX);

  assert.deepEqual(found.python, { path: "/usr/bin/python", version: "3.12.1" });
});

test("the survey writes every wanted tool into .se/tools.json", () => {
  const files = boxWith([`${BIN}/vale`]);
  const outside = fakeProc({ [`${BIN}/vale --version`]: { stdout: "3.20.0" } });

  writeSurvey({ disk: files, proc: outside }, ROOT, UNIX);
  const read = surveyOf(files.read(`${ROOT}/${TOOLS}`));

  assert.deepEqual(
    Object.keys(read),
    WANTED.map((one) => one.name),
  );
  assert.equal(pathOf(read, "vale"), `${BIN}/vale`);
});

test("the survey reaches .se/bin before any folder on the path variable", () => {
  const places = placesFor("vale", UNIX, BIN);

  assert.deepEqual(places, [`${BIN}/vale`, "/usr/bin/vale", "/bin/vale"]);
});

test("a box carrying PATHEXT splits on the semicolon and takes each ending", () => {
  const places = placesFor("node", { Path: "C:\\tools", PATHEXT: ".COM;.EXE" }, BIN);

  assert.deepEqual(places, [
    `${BIN}/node`,
    `${BIN}/node.com`,
    `${BIN}/node.exe`,
    "C:\\tools/node",
    "C:\\tools/node.com",
    "C:\\tools/node.exe",
  ]);
});

test("a version reads as the number a tool prints on its first line", () => {
  assert.equal(versionOf("v24.19.0\n"), "24.19.0");
  assert.equal(versionOf("Version: 2.5.12"), "2.5.12");
  assert.equal(versionOf("lnav 0.14.1\nbuilt somewhere"), "0.14.1");
  assert.equal(versionOf("it says nothing"), "");
});

test("a broken survey file reads as an empty box, and refuses nobody", () => {
  assert.deepEqual(surveyOf("{"), {});
  assert.deepEqual(surveyOf(""), {});
  assert.equal(pathOf(surveyOf("{}"), "vale"), "");
  assert.equal(pathOf({ vale: { version: "3.20.0" } }, "vale"), "");
});

test("a caller takes the surveyed path, and the guess where none stands", () => {
  const files = boxWith([`${BIN}/vale`, "/opt/biome"]);
  const known = { biome: { path: "/opt/biome" }, lnav: { path: "/gone/lnav" } };

  assert.equal(whereIs(files, ROOT, "biome", known), "/opt/biome");
  assert.equal(whereIs(files, ROOT, "vale", known), `${BIN}/vale`);
  assert.equal(whereIs(files, ROOT, "lnav", known), "lnav");
});

test("a guess names the Windows binary and the plain one, and nothing else", () => {
  assert.deepEqual(guesses("vale-ls"), [".se/bin/vale-ls.exe", ".se/bin/vale-ls"]);
});

test("a box with no survey file hands the caller an empty one", () => {
  assert.deepEqual(readTools(boxWith([]), ROOT), {});
});

test("the rule reads the tools the install script installs, and no format file", () => {
  const said = [
    "here() {",
    "  case $1 in",
    "    node)    have node ;;",
    `    vale)    [ -x "$bin/vale\${exe}" ] ;;`,
    `    lnav)    [ -x "$bin/lnav\${exe}" ] || have lnav ;;`,
    '    lnav-format) [ -f "$bin/.lnav-reads-this-tree" ] ;;',
    "  esac",
    "}",
  ].join("\n");

  assert.deepEqual(installedTools(said), ["node", "vale", "lnav"]);
});
