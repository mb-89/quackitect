// The tool a hand runs over a draft before it writes. Vale stands as a fake
// here, so the read alone speaks.
// [[spec/design_output/level0#the-tool-reads-a-draft]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { PROSE_CALL, readsDraft, SPECS, TOOLS } from "../../src/bridge/prose.js";

const LONG = "This one sentence runs on past the ceiling a draft holds.";

const box = (found = []) => ({
  vale: {
    stands: () => true,
    lint: async () => ({ ran: true, found }),
  },
  disk: { exists: () => false, read: () => "" },
  root: "/tree",
});

// [[spec/design_output/level0#the-tool-reads-a-draft]]
test("a clean draft answers no finding, and the tool writes nothing", async () => {
  const said = await readsDraft(
    { path: "spec/guidance/a.md", text: "A line.\n" },
    box(),
  );

  assert.match(said, /No finding stands/);
});

// [[spec/design_output/level0#the-tool-reads-a-draft]]
test("a draft carrying a fault answers the finding, with its rule and its line", async () => {
  const found = [
    { rule: "VoiceVale.LongSentence", line: 1, column: 1, message: LONG, severity: 2 },
  ];

  const said = await readsDraft(
    { path: "spec/guidance/a.md", text: `${LONG}\n` },
    box(found),
  );

  assert.match(said, /VoiceVale\.LongSentence/);
  assert.match(said, /spec\/guidance\/a\.md/);
  assert.doesNotMatch(said, /refuse this write/, "the tool writes nothing to refuse");
});

// [[spec/design_output/level0#the-tool-reads-a-draft]]
test("the tool takes a path and a text, and refuses a call missing either", async () => {
  assert.match(await readsDraft({ text: "A line.\n" }, box()), /path/);
  assert.match(await readsDraft({ path: "spec/guidance/a.md" }, box()), /text/);
});

// [[spec/design_output/level0#the-tool-reads-a-draft]]
test("the module registers the pair the server imports for each bridge module", () => {
  const specs = SPECS();

  assert.equal(specs.length, 1);
  assert.equal(specs[0].name, "check_prose");
  assert.deepEqual(Object.keys(specs[0].inputSchema.properties).sort(), [
    "path",
    "text",
  ]);
  assert.equal(typeof TOOLS[PROSE_CALL], "function");
});
