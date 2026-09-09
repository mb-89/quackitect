// Exact mutations keep ambiguous edits outside the write door.
// [[spec/design_output/copilot#the-write-door]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { mutations, patchChanges } from "../../.claude/skills/level0/lib/mutations.js";

test("replacement reads the resulting file", () => {
  assert.deepEqual(
    mutations(
      { tool: "edit", args: { path: "a.md", old_str: "old", new_str: "new" } },
      () => "an old line",
    ),
    [{ path: "a.md", text: "an new line" }],
  );
});

test("patches preserve context and decode every file", () => {
  const patch =
    "*** Begin Patch\n*** Update File: a.md\n@@\n same\n-old\n+new\n*** Add File: b.md\n+text\n*** End Patch";
  assert.deepEqual(
    patchChanges(patch, () => "same\nold\n"),
    [
      { path: "a.md", text: "same\nnew\n" },
      { path: "b.md", text: "text\n" },
    ],
  );
});

test("ambiguous and unsupported mutations refuse", () => {
  assert.throws(() => mutations({ tool: "edit_file", args: {} }, () => ""), /exact/);
  assert.throws(
    () =>
      mutations(
        { tool: "edit", args: { path: "a", old_str: "x", new_str: "y" } },
        () => "xx",
      ),
    /unique/,
  );
  assert.throws(() => patchChanges("not a patch", () => ""), /envelope/);
});

test("patches match whole lines and remove their newline", () => {
  const patch = "*** Begin Patch\n*** Update File: a.md\n@@\n-old\n*** End Patch";
  assert.deepEqual(
    patchChanges(patch, () => "old\nnext\n"),
    [{ path: "a.md", text: "next\n" }],
  );
  assert.throws(() => patchChanges(patch, () => "an old\n"), /matching lines/);
});
