// The prose reader, and the tool a hand runs over a draft before it writes.
// A finding the caps and the word list answer for stands down, and every
// other one stays. Vale stands as a fake here, so the read alone speaks.
// [[spec/design_output/level0#a-note-reads-clean-first]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { PROSE_CALL, readsDraft, SPECS, TOOLS } from "../../src/bridge/prose.js";

const LONG = "This one sentence runs on past the ceiling a draft holds.";

const box = (found = []) => ({
  vale: {
    stands: () => true,
    lint: async () => ({ ran: true, found }),
  },
  // The reader joins the binary under the root, so a Windows box reads back slashes. [[spec/tickets/go-prose-checks-stand-alone]]
  disk: { exists: (path) => path.replaceAll("\\", "/").endsWith(BIN), read: () => "" },
  // quack prose keeps every finding it reads, so the tool's own answer speaks. [[spec/tickets/go-prose-checks-stand-alone]]
  proc: {
    run: (_argv, { stdin }) => ({
      exitCode: 0,
      stdout: JSON.stringify({
        docs: JSON.parse(stdin).docs.map((one) => ({ kept: one.found })),
      }),
    }),
  },
  log: { say: () => {} },
  root: "/tree",
  method: "/tree",
});

// The dispatch unwraps one shape, so every case reads the answer through it. [[spec/design_output/level0#a-note-reads-clean-first]]
const answered = async (ask, it) => {
  const said = await TOOLS[PROSE_CALL](ask, it);
  assert.equal(
    typeof said?.result?.result,
    "string",
    "the answer takes the tool shape",
  );
  return said.result.result;
};

// [[spec/design_output/level0#a-note-reads-clean-first]]
test("a clean draft answers no finding, and the tool writes nothing", async () => {
  const said = await answered({ path: "spec/guidance/a.md", text: "A line.\n" }, box());

  assert.match(said, /No finding stands/);
});

// [[spec/design_output/level0#a-note-reads-clean-first]]
test("a draft carrying a fault answers the finding, with its rule and its line", async () => {
  const found = [
    { rule: "VoiceShape.Antithesis", line: 1, column: 1, message: LONG, severity: 2 },
  ];

  const said = await answered(
    { path: "spec/guidance/a.md", text: `${LONG}\n` },
    box(found),
  );

  assert.match(said, /VoiceShape\.Antithesis/);
  assert.match(said, /spec\/guidance\/a\.md/);
  assert.doesNotMatch(said, /refuse this write/, "the tool writes nothing to refuse");
});

// [[spec/design_output/level0#a-note-reads-clean-first]]
test("the tool takes a path and a text, and refuses a call missing either", async () => {
  assert.match(await answered({ text: "A line.\n" }, box()), /path/);
  assert.match(await answered({ path: "spec/guidance/a.md" }, box()), /text/);
});

// [[spec/design_output/level0#a-note-reads-clean-first]]
test("the module registers the pair the server imports for each bridge module", () => {
  const specs = SPECS();

  assert.equal(specs.length, 1);
  assert.equal(specs[0].name, "check_prose");
  assert.deepEqual(Object.keys(specs[0].inputSchema.properties).sort(), [
    "path",
    "text",
  ]);
  assert.equal(TOOLS[PROSE_CALL], readsDraft, "the pair names the handler");
});
