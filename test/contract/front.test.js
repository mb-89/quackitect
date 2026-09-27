// The front door against se-front: the fake writes what the binary writes,
// op for op, over tickets of this tree and over the marks a quote reads.
// [[spec/tickets/go-writes-the-frontmatter]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { readNote } from "../../.claude/skills/level0/lib/schema.js";
import { disk } from "../../src/doors/disk.js";
import { fakeFront } from "../../src/doors/fake/front.js";
import { front } from "../../src/doors/front.js";
import { proc } from "../../src/doors/proc.js";
import { it } from "../../src/scripts/cli-doors.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const real = front(files, proc(), root);
const fake = fakeFront();
const TICKETS = join(root, "spec", "tickets");
const SAMPLE = 25;

const VALUES = [
  "closed",
  "a: pair",
  "#4 opens",
  "[a, b]",
  "[[spec/one]]",
  "ends ",
  "",
  '"q"',
  "x\\y",
];

const stands = (() => {
  try {
    real.set("---\n---\n", "a", "b");
    return true;
  } catch {
    return false;
  }
})();
const run = stands ? test : skip;

const sample = () =>
  files
    .list(TICKETS)
    .filter((one) => one.name.endsWith(".md"))
    .slice(0, SAMPLE)
    .map((one) => files.read(join(TICKETS, one.name)));

run(
  "set, drop, entry and after write what se-front writes over tickets of this tree",
  () => {
    for (const text of sample()) {
      for (const value of VALUES) {
        assert.equal(fake.set(text, "reason", value), real.set(text, "reason", value));
      }
      assert.equal(fake.set(text, "steps", "none"), real.set(text, "steps", "none"));
      assert.equal(fake.drop(text, "record"), real.drop(text, "record"));
      const item = {
        step: "a/b",
        hand: "box: one",
        returns: 2,
        skipped: true,
        empty: "",
        answered: [{ name: "check", exit: 0, said: "a #note" }],
      };
      assert.equal(fake.entry(text, item), real.entry(text, item));
      assert.equal(fake.after(text, "d4e5f6"), real.after(text, "d4e5f6"));
    }
  },
);

run("mint writes what se-front writes off the front each ticket reads as", () => {
  for (const text of sample()) {
    const said = readNote(text).front.said ?? {};
    assert.equal(fake.mint(said), real.mint(said));
  }
});

run("the verbs' doors hand every writer the front door over se-front", () => {
  assert.equal(
    it.front.set("---\nstate: open\n---\n", "state", "a: b"),
    '---\nstate: "a: b"\n---\n',
  );
});
