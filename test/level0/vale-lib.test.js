// The lib keeps the readers of the rules-over JSON and the prose shape, and no
// config, no styles reader and no exemption reader.
// [[spec/tickets/vale-comments-leave-the-code]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as lib from "../../.claude/skills/level0/lib/vale.js";

test("the lib exports no config, no styles reader and no exemption reader", () => {
  assert.equal("CONFIG" in lib, false);
  assert.equal("stylesIn" in lib, false);
  assert.equal("unreasoned" in lib, false);
});

test("fromJson reads the rows the rules-over verb writes, in place order", () => {
  const passive = { Check: "VoiceVale.Passive", Line: 2, Span: [4, 9], Match: "was" };
  const shouted = { Check: "VoiceShape.Shout", Line: 1, Span: [1, 4], Match: "THIS" };
  const said = JSON.stringify({
    "notes.md": [
      { ...passive, Message: "m", Severity: "warning" },
      { ...shouted, Message: "s", Severity: "error", Action: { Name: "edit" } },
    ],
  });
  assert.deepEqual(lib.fromJson(said).map(Object.values), [
    ["notes.md", "VoiceShape.Shout", 1, 1, "THIS", "s", "error", true],
    ["notes.md", "Passive", 2, 4, "was", "m", "warning", false],
  ]);
  assert.deepEqual(lib.fromJson("not json"), []);
});

test("faultIn names an answer past JSON, and nothing over JSON or silence", () => {
  assert.equal(lib.faultIn("{}"), "");
  assert.equal(lib.faultIn(""), "");
  assert.equal(
    lib.faultIn("panic: the rules broke"),
    "the rules-over verb answered something other than JSON",
  );
});
