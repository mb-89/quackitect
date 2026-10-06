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

// A pull request against main runs the check GitHub's auto-merge waits on, and a rescue or beat push runs none. [[spec/tickets/groups-land-through-pull-requests]] [[spec/tickets/ci-skips-rescue-and-beats]]
test("the check runs on a push past rescue and beats, and on a pull request against main", () => {
  const text = disk().read(WORKFLOW);
  assert.match(
    text,
    /^on:\n {2}push:\n {4}branches-ignore: \["rescue\/\*\*", "beats\/\*\*"\]\n {2}pull_request:\n {4}branches: \[main\]$/m,
  );
});
