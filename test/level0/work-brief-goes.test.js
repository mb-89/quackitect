// The group ticket is the one brief a work branch carries, so a root handover
// beside it changes no standing. The doors these cases drive stand in
// work-doors.js beside this file.
// [[spec/design_output/work#a-brief-drains-first]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { work } from "../../src/scripts/work.js";
import {
  doorsSaying,
  GROUP_AT,
  GROUP_NOTE,
  heard,
  ROOT,
  remoteSaying,
} from "./work-doors.js";

// [[spec/design_output/work#a-brief-drains-first]]
const BOTH = remoteSaying([{ branch: "work/one-group", tip: "aaa" }], {
  [`work/one-group:${GROUP_AT}`]: GROUP_NOTE,
  "work/one-group:HANDOVER.md": "---\nstatus: held\n---\n\n# An older brief\n",
});

// [[spec/design_output/work#a-row-per-group]]
test("a branch carrying a root handover reads as the group it holds", () => {
  const { it } = doorsSaying(BOTH);

  const { code, said } = heard(() => work(ROOT, ["list"], it));

  assert.equal(code, 0);
  assert.match(said, /work\/one-group\s+group\s+todo/, "the kind reads the group");
});
