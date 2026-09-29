// The tracked config reads new for the keys whose readers take a Go topic.
// [[spec/tickets/readers-take-the-go-topics]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { TRACKED } from "../../.claude/skills/level0/lib/config.js";
import { disk } from "../../src/doors/disk.js";

const KEYS = ["config", "log", "guidance", "check", "prose"];

test("the tracked config reads new for every key whose reader takes a Go topic", () => {
  const tracked = JSON.parse(disk().read(join(import.meta.dirname, "../..", TRACKED)));
  for (const key of KEYS) {
    assert.equal(tracked.migration[key], "new", `migration.${key}`);
  }
});
