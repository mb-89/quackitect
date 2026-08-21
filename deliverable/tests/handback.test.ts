// A LEAVING CHECK DOES NOT HOLD THE CALL, authored test-first at i51's
// author-tests.
//
// BOTH CASES ARE RED, and neither is red by accident. The serving path awaits a
// step's leaving script inline, and the verdict it produces lives in an
// in-memory map that deletes its own entry the moment the run settles — measured
// 2026-08-21 in exp-what-a-fresh-session-sees.
//
// WHY ONE CASE READS SOURCE AND THE OTHER READS THE CLASS. The first claim is
// about a call SHAPE that no runtime value exposes: an await either stands in the
// serving path or it does not. The second is about a surface, and a surface can
// be asked what it offers.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Scripts } from "../engine/sessionscript.ts";

const source = (name: string): string => readFileSync(fileURLToPath(new URL(`../engine/${name}`, import.meta.url)), "utf8");

// RED. deliverable/engine/session.ts awaits scriptRun on the tick path, so a
// step whose leaving check runs a battery freezes the pull for its whole
// duration — the defect this record exists to end.
test("the serving path does not await a step's leaving judgment", () => {
  const text = source("session.ts");
  assert.doesNotMatch(
    text,
    /await\s+this\.scripts\.scriptRun\(/,
    "the leaving judgment is awaited inline, so the call is held for as long as it runs",
  );
});

// RED. The judgment's verdict is held in a Map keyed by evidence key and the
// entry is deleted in a .finally() the moment it settles, so nothing can be
// asked where a step stands while its judgment is still being reached.
test("a step's standing can be read while its judgment is still being reached", () => {
  const offered = Object.getOwnPropertyNames(Scripts.prototype);
  assert.ok(
    offered.some((name) => /standing/i.test(name)),
    `nothing on the scripts surface answers where a step stands, so a pending verdict is attached to nothing: ${JSON.stringify(offered)}`,
  );
});
