// The retro usage prints one line a verb, so each verb's action reads its
// doc off the line that names it.
// [[spec/tickets/retro-usage-names-every-verb]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as retro from "../../src/scripts/retro.js";

// Every verb retro in src/scripts/retro.js answers, as RetroVerbs in src/modules/verbs/retro.go lists them. [[spec/tickets/retro-usage-names-every-verb]]
const VERBS = [
  "notes",
  "audit",
  "backlog",
  "collect",
  "timeline",
  "chapters",
  "matrix",
  "read",
  "effect",
  "classes",
  "mint",
  "new",
  "score",
];

test("the retro usage prints one line a verb, audit among them", () => {
  const lines = [];
  const log = console.log;
  console.log = (...said) => void lines.push(said.join(" "));
  try {
    retro.retro("/tree", [], {});
  } finally {
    console.log = log;
  }
  const named = lines.map((one) => one.match(/^  (\S+)/)?.[1]).filter(Boolean);
  assert.deepEqual([...named].sort(), [...VERBS].sort());
});
