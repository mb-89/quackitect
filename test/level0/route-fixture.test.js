// The extension reads a ticket's route with a reader of its own, because it
// bundles alone. One fixture holds that reader to the pull's, so the two name
// the same leaves.
// [[spec/tickets/a-count-meets-the-lint]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { stepsIn } from "../../src/extension/lib/lens.js";
import { frontOf } from "../../src/engine/group.js";
import { leavesOf } from "../../src/scripts/pull-route.js";

const ROUTES = {
  flat: ["- name: do", "  does: makes it"],
  nested: [
    "- name: design",
    "  steps:",
    "    - name: draft",
    "      evidence:",
    "        - name: approach",
    "          form: text",
    "    - name: review",
    "      evidence:",
    "        - name: verdict",
    "          form: verdict",
    "- name: implement",
    "  steps:",
    "    - name: change",
  ],
  keyFirst: ["- by: anyone", "  name: do", "- name: verdict"],
  quoted: ['- name: "do"', "- name: 'check'"],
};

const ticket = (rows) =>
  ["---", "kind: [[ticket]]", "state: open", "steps:", ...rows.map((one) => `  ${one}`), "---", "", "# Ask", "", "A thing.", ""].join("\n");

// [[spec/tickets/a-count-meets-the-lint]]
for (const [name, rows] of Object.entries(ROUTES)) {
  test(`the extension's reader names the leaves the pull names: ${name}`, () => {
    const text = ticket(rows);
    assert.deepEqual(
      stepsIn(text)
        .filter((one) => one.leaf)
        .map((one) => one.path),
      leavesOf(frontOf(text)).map((one) => one.path),
    );
  });
}
