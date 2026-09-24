// The doctor names the browser the drawing's test drives, off the resolver the
// install asks. The wire answers nothing, so the probes end at once.
// [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { browserSays } from "../../src/scripts/browser.js";
import { doctor } from "../../src/scripts/cli-check.js";

test("the doctor prints a browser row carrying the resolver's answer", async () => {
  const printed = [];
  const log = console.log;
  const wire = globalThis.fetch;
  console.log = (line) => printed.push(String(line));
  globalThis.fetch = async () => {
    throw new Error("no wire here");
  };
  try {
    await doctor();
  } finally {
    console.log = log;
    globalThis.fetch = wire;
  }
  const row = printed.find((line) => /^browser\s/.test(line));
  assert.ok(row, "the doctor prints a browser row");
  assert.equal(row.replace(/^browser\s+/, ""), browserSays());
});
