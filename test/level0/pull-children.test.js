// What a group's children say: open, closed dropped, and every child naming the group.
// [[spec/design_output/pull#children-before-their-group]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { childrenSay } from "../../src/scripts/pull-children.js";
import { CHILD } from "./pull-doors.js";

test("the children say which stand open, which closed dropped, and pass over a private note and another group", () => {
  const all = [
    { name: "open", text: CHILD("open"), private: false },
    {
      name: "dropped",
      text: CHILD("closed", "design/draft", "reason: dropped\n"),
      private: false,
    },
    { name: "done", text: CHILD("closed"), private: false },
    { name: "note", text: CHILD("open"), private: true },
    {
      name: "other",
      text: CHILD("open").replace("group: one-group", "group: two-group"),
      private: false,
    },
  ];
  assert.deepEqual(childrenSay(all, "one-group"), {
    open: ["open"],
    dropped: ["dropped"],
    all: ["open", "dropped", "done"],
  });
});
