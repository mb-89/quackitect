// A bare name on a leaf in hand: a plain leaf shows again, and lands nothing.
// [[spec/design_output/pull#bare-pulls-show-the-leaf]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { pulling } from "../../src/scripts/work.js";
import { CHILD, doors, filled, heard, ROOT, ranGit, standing } from "./pull-doors.js";

// A bare name on a leaf with no verdict field shows the leaf, and lands nothing. [[spec/design_output/pull#bare-pulls-show-the-leaf]]
test("a bare name on a plain leaf prints its chapter, and the git log stays put", () => {
  const { it, outside } = doors(
    standing(filled(CHILD(), "### approach", "A small approach.")),
  );
  heard(() => pulling(ROOT, ["pull"], it));
  const before = ranGit(outside).filter((one) => one.startsWith("git commit")).length;

  const { code, said } = heard(() => pulling(ROOT, ["pull", "a-child"], it));

  assert.equal(code, 0, said);
  assert.match(said, /a-child at design\/draft/, "the leaf in hand shows");
  assert.equal(
    ranGit(outside).filter((one) => one.startsWith("git commit")).length,
    before,
    "no commit lands",
  );
});
