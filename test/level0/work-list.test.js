// The branch listing's default: what waits on somebody, and nothing closed
// or merged, until a flag asks for all of it.
// [[spec/design_output/work#a-row-per-group]]

import assert from "node:assert/strict";
import { join } from "node:path";
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
  return listed(flag).said;
}

function listed(flag = []) {
  const { it, disk } = doorsSaying(
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
  return { ...heard(() => work(ROOT, ["list", "", ...flag], it)), disk };
}

// The order comes off one reading of git, and no verb writes it to a file. [[spec/design_output/work#one-reading-answers-git]]
test("the queue listing reads git once, and writes no file under the runtime folder", () => {
  const { said, disk } = listed(["--queue"]);
  assert.match(said, /a-child|a-loose-one/, "the order names the open tickets");
  assert.equal(disk.exists(join(ROOT, ".se", ".runtime", "work.json")), false);
});

// The listing is the order the pull hands out, in outline order, and the unplaced stay off it. [[spec/design_output/pull#the-queue-is-an-outline]]
test("the queue listing prints the placed rows in outline order and leaves the unplaced out", () => {
  const { said } = listed(["--queue"]);
  const rows = said.split("\n").filter(Boolean);
  const places = new Map(rows.map((row) => row.trim().split(/\s+/)).map(([place, name]) => [name, place]));
  // The group stands on a cloud branch, so it and its ticket stay off this box's listing. [[spec/design_output/pull#the-queue-is-an-outline]]
  assert.equal(places.has("one-group"), false, "a group the cloud holds stands off the listing");
  assert.equal(places.has("a-child"), false, "and its ticket with it");
  assert.match(places.get("a-loose-one"), /^\d+$/, "the loose one takes a number of its own");
  assert.equal(places.has("a-done-child"), false, "a closed ticket stands off the listing");
  assert.equal(places.has("landed"), false, "a merged group stands off the listing");
  assert.equal(places.has("a-closed-one"), false, "a closed loose one stands off the listing");
});

// The work tab parses the one answer, so the flag prints it as JSON on one line. [[spec/design_output/work#one-reading-answers-git]]
test("the json listing prints the one answer as a JSON object on one line", () => {
  const { said, code } = listed(["--json"]);
  assert.equal(code, 0);
  assert.equal(said.includes("\n"), false, "the answer stands on one line");
  const answer = JSON.parse(said);
  assert.ok(Array.isArray(answer.branches), "the answer carries the branches");
  assert.ok(Array.isArray(answer.loose), "the answer carries the loose tickets");
  assert.equal(answer.branches[0].branch, "work/one-group");
  assert.ok(
    answer.loose.some((one) => one.name === "a-loose-one" && one.todo === false),
    "the loose tickets name the one on trunk",
  );
});

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
