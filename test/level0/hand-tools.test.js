// The hand tools: the draft check over an answer, and the mint writing a note
// under its schema.
// [[spec/design_output/level0#the-tool-reads-a-draft]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { CHECK } from "../../.claude/skills/level0/lib/answer.js";
import { MINT_TOOL, schemasFrom } from "../../.claude/skills/level0/lib/schema.js";
import { SPECS, TOOLS } from "../../src/bridge/tools.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";

test("the door registers the check and the mint", () => {
  assert.deepEqual(
    Object.keys(TOOLS).sort(),
    [`mcp__level0__${CHECK}`, `mcp__level0__${MINT_TOOL}`].sort(),
  );
});

test("the specs read the schemas the box holds", () => {
  const said = SPECS({ schemas: [{ kind: "ticket" }] });

  assert.deepEqual(said.map((one) => one.name).sort(), [CHECK, MINT_TOOL].sort());
  for (const one of said) assert.equal(one.inputSchema.type, "object");
});

test("a draft of no text comes back said", async () => {
  const said = await TOOLS[`mcp__level0__${CHECK}`]({ text: "  " }, {});

  assert.match(said.result.result, new RegExp(CHECK));
});

const NOTE_SCHEMA = `kind: note

frontmatter:
  additionalProperties: false
  required:
    - kind
  properties:
    kind:
      const: note
      x-link: true

body:
  headingLevel: 1
  extraSections: false
  sections:
    - header: Scope
      required: true
      description: what this note covers
`;

// A minted note breaking a rule of form lands, and the answer names the row. [[spec/design_output/level0#the-panel-holds-a-warning]]
test("a mint over a break of form writes the note, and the answer carries the warning", async () => {
  const disk = fakeDisk({});
  const box = {
    method: "/tree",
    work: "/tree",
    root: "/tree",
    disk,
    log: fakeLog(),
    schemas: schemasFrom([{ name: "note.schema.yaml", text: NOTE_SCHEMA }]),
    vale: {
      stands: () => true,
      lint: async () => ({
        ran: true,
        found: [{ rule: "VoiceVale.Passive", line: 5, column: 1, message: "Cut it in two.", severity: "error" }],
      }),
    },
    projections: [],
  };
  const said = await TOOLS[`mcp__level0__${MINT_TOOL}`](
    { kind: "note", path: "spec/notes/fresh.md" },
    box,
  );
  assert.equal(disk.exists("/tree/spec/notes/fresh.md"), true, "the note lands");
  assert.match(said.result.result, /VoiceVale\.Passive: Cut it in two\./);
});
