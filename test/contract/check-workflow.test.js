// The check workflow runs on a Linux runner and a Windows runner, so a Windows fault shows before a merge.
// [[spec/tickets/ci-runs-a-windows-job]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";

const WORKFLOW = join(
  import.meta.dirname,
  "..",
  "..",
  ".github",
  "workflows",
  "check.yml",
);

test("the check runs on a Linux runner and a Windows runner", () => {
  const text = disk().read(WORKFLOW);
  assert.match(text, /runs-on: \$\{\{ matrix\.os \}\}/);
  assert.match(text, /os: \[ubuntu-latest, windows-latest\]/);
  assert.match(text, /fail-fast: false/);
  assert.match(text, /shell: bash/);
  assert.match(text, /key: se-bin-\$\{\{ runner\.os \}\}-/);
});

// A pull request against main runs the check GitHub's auto-merge waits on, and a branch push runs none. [[spec/tickets/groups-land-through-pull-requests]] [[spec/design_output/work#the-check-runs-once-a-head]]
test("the check runs on a push to main, and on a pull request against main", () => {
  const text = disk().read(WORKFLOW);
  assert.match(
    text,
    /^on:\n {2}push:\n {4}branches: \[main\]\n {2}pull_request:\n {4}branches: \[main\]$/m,
  );
});

// A newer head cancels a pull request's superseded run, a run on main cancels nothing, and the required check names stand. [[spec/design_output/work#the-check-runs-once-a-head]]
test("a pull request's newer head cancels its superseded run, and a run on main stands alone", () => {
  const text = disk().read(WORKFLOW);
  assert.match(
    text,
    /^ {2}group: .*format\('check-pr-\{0\}', github\.event\.pull_request\.number\) \|\| format\('check-run-\{0\}', github\.run_id\)/m,
  );
  assert.match(
    text,
    /^ {2}cancel-in-progress: \$\{\{ github\.event_name == 'pull_request' \}\}$/m,
  );
  assert.match(text, /^jobs:\n {2}check:$/m);
});
