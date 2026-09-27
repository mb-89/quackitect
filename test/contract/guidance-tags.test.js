// Guidance resolves by tags, read over this tree itself: the schemas admit the
// tags, and every note under a subfolder of spec/guidance reaches some step.
// [[spec/design_input/level-two#guidance]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { checkNote, readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { disk } from "../../src/doors/disk.js";
import { unreached } from "../../src/scripts/guidance-hand.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const schemaOf = (name) =>
  readYaml(String(files.read(join(root, "spec", "schemas", `${name}.schema.yaml`))));
const tagFaults = (faults) =>
  faults.filter((one) => /\btags\b/.test(JSON.stringify(one)));

// [[spec/design_input/level-two#guidance]]
test("the ticket schema admits tags on a step, and the guidance schema admits tags on a note", () => {
  const ticket = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\nsteps:\n  - name: do\n    tags: [code]\n    does: makes the change\n---\n\n# Ask\n\nOne thing.\n\n# do\n\n# Discussion\n`;
  const note = `---\nkind: [[guidance]]\nscope: ["a hand"]\ntags: [testing]\n---\n\n# Actionables\n\n1. Watch a test fail first.\n`;
  assert.deepEqual(tagFaults(checkNote(ticket, schemaOf("ticket"), "ticket")), []);
  assert.deepEqual(tagFaults(checkNote(note, schemaOf("guidance"), "note")), []);
});

// The battery runs this, so the check refuses a note no step reaches. [[spec/design_input/level-two#guidance]]
test("every note under a subfolder of spec/guidance reaches some step of a process", () => {
  assert.deepEqual(unreached({ disk: files, root, method: root, join }), []);
});
