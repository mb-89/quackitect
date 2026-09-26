// The handover the tree ships, read against the owner's quoted words: a
// handover lacking that chapter draws a finding.
// [[spec/tickets/the-owners-words-travel-verbatim]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { checkNote, readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const schema = readYaml(
  disk().read(join(root, "spec", "schemas", "handover.schema.yaml")),
);
const HANDOVER = (words) =>
  `---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n\nThe gate stands green.\n\n${words}# What waits\n\n- the next ticket\n`;

test("a handover lacking the owner's words draws a finding", () => {
  const found = checkNote(HANDOVER(""), schema, ".se/HANDOVER.md");
  assert.ok(
    found.some((one) => /owner's words/i.test(one.message)),
    "the missing chapter draws a finding",
  );
  const quoted = HANDOVER(
    '# The owner\'s words\n\n- "the count reads wrong", session one, line 12\n\n',
  );
  assert.deepEqual(
    checkNote(quoted, schema, ".se/HANDOVER.md").filter((one) =>
      /owner's words/i.test(one.message),
    ),
    [],
    "a handover quoting the owner passes",
  );
});
