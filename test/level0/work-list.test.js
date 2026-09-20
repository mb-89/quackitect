// The branch listing's default: what waits on somebody, and nothing closed
// or merged, until a flag asks for all of it.
// [[spec/design_output/work#a-row-per-group]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { work } from "../../src/scripts/work.js";
import {
  CHILD,
  doorsSaying,
  GROUP_NOTE,
  heard,
  remoteSaying,
  ROOT,
} from "./work-doors.js";

const closedLoose = CHILD("", "closed").replace("group: \n", "");

// [[spec/design_output/work#a-row-per-group]]
function listing(flag = []) {
  const { it } = doorsSaying(
    remoteSaying(
      [
        { branch: "work/one-group", tip: "aaa" },
        { branch: "work/landed", tip: "bbb", merged: true },
      ],
      {
        "work/one-group:spec/tickets/one-group.md": GROUP_NOTE,
        "work/one-group:spec/tickets/a-child.md": CHILD("one-group", "open"),
        "work/one-group:spec/tickets/a-done-child.md": CHILD("one-group", "closed"),
        "work/landed:spec/tickets/landed.md": GROUP_NOTE,
        "origin/main:spec/tickets/a-loose-one.md": CHILD("", "open").replace(
          "group: \n",
          "",
        ),
        "origin/main:spec/tickets/a-closed-one.md": closedLoose,
      },
    ),
  );
  return heard(() => work(ROOT, ["list", "", ...flag], it)).said;
}

test("the listing shows open work alone by default", () => {
  const said = listing();

  assert.match(said, /work\/one-group\s+todo/);
  assert.match(said, /^ {2}a-child\s+ticket\s+open/m);
  assert.match(said, /^a-loose-one\s+ticket\s+open/m);
  assert.doesNotMatch(said, /a-done-child/, "a closed child stays off the default");
  assert.doesNotMatch(
    said,
    /a-closed-one/,
    "a closed loose ticket stays off the default",
  );
  assert.doesNotMatch(said, /work\/landed/, "a merged branch stays off the default");
});

test("the listing shows everything under --all", () => {
  const said = listing(["--all"]);

  assert.match(said, /^ {2}a-done-child\s+ticket\s+closed/m);
  assert.match(said, /^a-closed-one\s+ticket\s+closed/m);
  assert.match(said, /work\/landed\s+merged/);
});
