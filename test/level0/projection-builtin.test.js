// The config commands over a default file that leaves keys to their built-in
// values. The schema names every key, so every key takes its command.
// [[spec/tickets/the-config-schema-gets-generated]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { COMMANDS, writesOf } from "../../.claude/skills/level0/lib/projection.js";

const SOURCE = "spec/config/level0.json";
const SCHEMA = "spec/config/level0.schema.json";

const ENTRY = {
  name: "the config commands",
  shape: COMMANDS,
  target: ".claude/commands",
  from: SOURCE,
  schema: SCHEMA,
  wrap: "frontmatter",
};

const SAID = {
  type: "object",
  properties: {
    stop: {
      type: "object",
      properties: { enabled: { type: "boolean", default: true } },
    },
    helper: {
      type: "object",
      properties: { find: { type: "string", default: "haiku" } },
    },
  },
};

test("a key at its built-in keeps its command", () => {
  const drawn = writesOf(
    ENTRY,
    new Map([
      [SOURCE, JSON.stringify({ stop: { enabled: false } })],
      [SCHEMA, JSON.stringify(SAID)],
    ]),
  );
  assert.ok(
    drawn.has(".claude/commands/se-config-helper-find.md"),
    "a key the file leaves to its built-in still takes its command",
  );
  assert.ok(drawn.has(".claude/commands/se-config-stop-enabled-true.md"));
});
