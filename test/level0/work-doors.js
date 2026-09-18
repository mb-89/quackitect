// The doors every work case drives: git answering from a table, a disk in a
// map, and a group with one child. The cases stand in the files beside this
// one, one file a topic.
// [[spec/design_output/work#the-round-trip]]

import { join } from "node:path";
import { STAMP } from "../../.claude/skills/level0/lib/runs.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { BRIEF } from "../../src/scripts/work.js";

export const ROOT = "/tree";
export const HERE = join(ROOT, BRIEF);

export function doorsSaying(answers, files = {}) {
  const said = fakeGit(answers, ROOT);
  const disk = fakeDisk(files);
  return { it: { proc: said.proc, disk, git: said, join }, outside: said, disk };
}

export function heard(what) {
  const lines = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => lines.push(said.join(" "));
  console.error = (...said) => lines.push(said.join(" "));
  try {
    return { code: what(), said: lines.join("\n") };
  } finally {
    console.log = wasLog;
    console.error = wasError;
  }
}
export const ranGit = (said) => said.ran.map((one) => one.argv.join(" "));
export const SHA = "b818c390c02737351bf1b73aba36a573d34d2ecc";

export const onBranch = (name) => ({
  "git rev-parse --abbrev-ref HEAD": { stdout: `${name}\n` },
  "git rev-parse HEAD": { stdout: `${SHA}\n` },
});

export const green = {
  [join(ROOT, STAMP)]: JSON.stringify({ sha: SHA, ok: true, clean: true, at: "now" }),
};

export const GROUP_NOTE = `---
kind: [[ticket]]
state: open
urgent: true
process: [[group]]
steps:
  - name: sync
    does: takes trunk into the branch
  - name: children
    by: children
---

# Ask

Two tickets that land as one.

# sync

# children

# Discussion

Nothing yet.
`;

export const CHILD = (group, state) => `---
kind: [[ticket]]
state: ${state}
group: ${group}
steps:
  - name: do
    does: makes the change the ask names
---

# Ask

One piece of it.

# do

# Discussion

Nothing yet.
`;

export const HAND = {
  [join(ROOT, ".se/copy.json")]: JSON.stringify({ id: "d462e994b4cef" }),
};
export const GROUP_AT = "spec/tickets/one-group.md";
export const on = (name) => join(ROOT, `spec/tickets/${name}.md`);

export const groupRemote = (note = GROUP_NOTE) => ({
  "git ls-remote --heads origin work/*": {
    stdout: "aaa\trefs/heads/work/one-group\n",
  },
  "git show origin/work/one-group:HANDOVER.md": { exitCode: 1 },
  [`git show origin/work/one-group:${GROUP_AT}`]: { stdout: note },
  "git rev-parse --abbrev-ref HEAD": { stdout: "work/one-group\n" },
  "git rev-parse HEAD": { stdout: `${SHA}\n` },
  "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
});
