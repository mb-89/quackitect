// The dispatch workflow: a clock and a manual start run the dispatch with no
// model, off the secrets the owner stores, and the dispatch skill leaves the
// starts to it.
// [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";

const ROOT = join(import.meta.dirname, "..", "..");
const WORKFLOW = join(ROOT, ".github", "workflows", "dispatch.yml");
const SKILL = join(ROOT, ".claude", "skills", "dispatch", "SKILL.md");

// The workflow stands nowhere until tests-green lands it, so a missing file answers an assertion. [[spec/design_output/pull#a-test-proves-red]]
function read(path) {
  try {
    return disk().read(path);
  } catch {
    return "";
  }
}

test("the dispatch runs on a schedule and on a manual start", () => {
  const text = read(WORKFLOW);
  assert.match(
    text,
    /^on:\n {2}schedule:\n {4}- cron: "[^"]+"\n {2}workflow_dispatch:$/m,
  );
});

test("the dispatch reads the fire secrets, checks out on PULL_TOKEN, and fires", () => {
  const text = read(WORKFLOW);
  assert.match(text, /ROUTINE_FIRE_URL: \$\{\{ secrets\.ROUTINE_FIRE_URL \}\}/);
  assert.match(text, /ROUTINE_FIRE_TOKEN: \$\{\{ secrets\.ROUTINE_FIRE_TOKEN \}\}/);
  assert.match(text, /PULL_TOKEN: \$\{\{ secrets\.PULL_TOKEN \}\}/);
  assert.match(text, /token: \$\{\{ secrets\.PULL_TOKEN \}\}/);
  assert.match(text, /fetch-depth: 0/);
  assert.match(text, /run: \.\/RUNME\.sh dispatch --json --fire$/m);
});

// The ticket holds the work, so the Action opens no issue and holds no grant for one. [[spec/tickets/the-dispatch-opens-no-issues]]
test("the dispatch grants no issue write, and hands the fire no GITHUB_TOKEN", () => {
  const text = read(WORKFLOW);
  assert.doesNotMatch(text, /issues:\s*write/);
  assert.doesNotMatch(text, /GITHUB_TOKEN/);
});

test("the dispatch skill starts no session, and says the Action does", () => {
  const text = read(SKILL);
  assert.match(text, /\.github\/workflows\/dispatch\.yml/);
  assert.match(text, /Start no session/);
  assert.doesNotMatch(text, /cloud-sessions connector/);
  assert.doesNotMatch(text, /\.\/RUNME\.sh dispatch --json/);
});
