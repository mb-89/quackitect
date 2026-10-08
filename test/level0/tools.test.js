// The survey reader, over a fake box. These cases assert what a caller reads out of
// .se/.runtime/tools.json, so a wrong path shows here first.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import {
  guesses,
  pathOf,
  readTools,
  surveyOf,
  TOOLS,
  whereIs,
} from "../../src/engine/tools.js";

const ROOT = "/box";
const BIN = `${ROOT}/.se/.runtime/bin`;

const boxWith = (paths) => fakeDisk(Object.fromEntries(paths.map((at) => [at, ""])));

test("a broken survey file reads as an empty box, and refuses nobody", () => {
  assert.deepEqual(surveyOf("{"), {});
  assert.deepEqual(surveyOf(""), {});
  assert.equal(pathOf(surveyOf("{}"), "vale"), "");
  assert.equal(pathOf({ vale: { version: "3.20.0" } }, "vale"), "");
});

test("a caller takes the surveyed path, and the guess where none stands", () => {
  const files = boxWith([`${BIN}/vale`, "/opt/biome"]);
  const known = { biome: { path: "/opt/biome" }, go: { path: "/gone/go" } };

  assert.equal(whereIs(files, ROOT, "biome", known), "/opt/biome");
  assert.equal(whereIs(files, ROOT, "vale", known), `${BIN}/vale`);
  assert.equal(whereIs(files, ROOT, "go", known), "go");
});

test("a guess names the Windows binary and the plain one, and nothing else", () => {
  assert.deepEqual(guesses("vale-ls"), [
    ".se/.runtime/bin/vale-ls.exe",
    ".se/.runtime/bin/vale-ls",
  ]);
});

test("a box with no survey file hands the caller an empty one", () => {
  assert.deepEqual(readTools(boxWith([]), ROOT), {});
});

test("a caller reads the survey file the Go verb writes", () => {
  const files = fakeDisk({
    [`${ROOT}/${TOOLS}`]: JSON.stringify({
      vale: { path: `${BIN}/vale`, version: "3.20.0" },
    }),
  });

  assert.equal(pathOf(readTools(files, ROOT), "vale"), `${BIN}/vale`);
});
