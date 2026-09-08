// The voice rules, tested. Run with: ./RUNME.sh test
//
// Every case here is pure: the parsing, the exemption rule and the refusal. The
// rules themselves drive the real Vale, and those cases stand in test/contract.

import assert from "node:assert/strict";
import { test } from "node:test";
import { refusal, taught } from "../../.claude/skills/level0/lib/refuse.js";
import { fromJson, lintText, unreasoned } from "../../.claude/skills/level0/lib/vale.js";

test("a finding is read out of Vale's JSON", () => {
  const found = fromJson(
    JSON.stringify({
      "notes.md": [
        {
          Check: "VoiceVale.Antithesis",
          Line: 3,
          Span: [14, 24],
          Match: "rather than",
          Message: "Say what is.",
          Severity: "error",
          Action: { Name: "" },
        },
      ],
    }),
  );
  assert.deepEqual(found, [
    {
      file: "notes.md",
      rule: "Antithesis",
      line: 3,
      column: 14,
      said: "rather than",
      message: "Say what is.",
      severity: "error",
      fixable: false,
    },
  ]);
});

test("output that is not JSON answers no finding", () => {
  assert.deepEqual(fromJson("vale: something went wrong"), []);
});

test("an exemption naming a reason passes, and one naming none is refused", () => {
  const with_ =
    "<!-- because: the phrase is being quoted -->\n<!-- vale VoiceVale.Antithesis = NO -->\nIt is a door rather than a window.";
  assert.deepEqual(unreasoned(with_), []);

  const without =
    "<!-- vale VoiceVale.Antithesis = NO -->\nIt is a door rather than a window.";
  const found = unreasoned(without);
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "ExemptionCarriesAReason");
  assert.equal(found[0].line, 1);
});

test("a linter that cannot run degrades the call", async () => {
  const said = await lintText("anything", "notes.md", {
    run: async () => {
      throw new Error("vale is not here");
    },
  });
  assert.equal(said.ran, false);
  assert.deepEqual(said.found, []);
});

test("the refusal asks the writer to hold the rule for the rest of the turn", () => {
  const said = taught([{ rule: "Antithesis" }, { rule: "ShoutedLead" }]);
  assert.match(said, /Hold Antithesis and ShoutedLead for the rest of this turn/);
});

test("a refusal names the file, the line, the phrase and the rule", () => {
  const said = refusal("spec/notes.md", [
    {
      rule: "Antithesis",
      line: 3,
      column: 14,
      said: "rather than",
      message: "Say what is.",
      severity: "error",
    },
  ]);
  assert.match(said, /spec\/notes\.md:3:14 {2}Antithesis/);
  assert.match(said, /wrote: rather than/);
  assert.match(said, /Say what is\./);
});
