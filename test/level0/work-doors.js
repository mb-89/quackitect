// The doors every work case drives: git answering from a table, a disk in a
// map, and a group with one child. The cases stand in the files beside this
// one, one file a topic.
// [[spec/design_output/work#the-round-trip]]

import { join } from "node:path";
import { STAMP } from "../../.claude/skills/level0/lib/runs.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { TICKETS } from "../../src/engine/group.js";
import { REF_FORMAT } from "../../src/scripts/work-read.js";

export const ROOT = "/tree";

export function doorsSaying(answers, files = {}) {
  const said = fakeGit(answers, ROOT);
  const disk = fakeDisk(files);
  // A case names its own environment, so the box running it changes no answer. [[spec/guidance/code/testing]]
  return {
    it: { proc: said.proc, disk, git: said, join, env: {} },
    outside: said,
    disk,
  };
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
  [join(ROOT, ".se/.runtime/copy.json")]: JSON.stringify({ id: "d462e994b4cef" }),
};
export const GROUP_AT = "spec/tickets/one-group.md";
export const on = (name) => join(ROOT, `spec/tickets/${name}.md`);

// A tree entry carries the object's name as bytes, and this many stand for it. [[spec/design_output/work#the-listing-reads-git-once]]
const NAME_FILLER = "x".repeat(20);
const TREE_AT = `:${TICKETS}`;

// The three reads a listing runs, and an object stands under `<branch>:<path>`. [[spec/design_output/work#the-listing-reads-git-once]]
export function remoteSaying(refs, objects = {}) {
  const rows = refs
    .map((one) => `origin/${one.branch} ${one.tip} ${one.when ?? 0}`)
    .join("\n");
  const landed = refs
    .filter((one) => one.merged)
    .map((one) => `  origin/${one.branch}`)
    .join("\n");
  const named = new Map(refs.map((one) => [one.tip, one.branch]));
  return {
    [`git for-each-ref --format=${REF_FORMAT} refs/remotes/origin/work/`]: {
      stdout: rows ? `${rows}\n` : "",
    },
    "git branch -r --merged origin/main": {
      stdout: landed ? `  origin/main\n${landed}\n` : "  origin/main\n",
    },
    "git branch -r --points-at origin/main": { stdout: "  origin/main\n" },
    "git cat-file --batch": (_argv, init) => ({
      stdout: batchSaying(init.stdin, objects, named),
    }),
  };
}

// [[spec/design_output/work#the-listing-reads-git-once]]
function batchSaying(stdin, objects, named) {
  const out = [];
  for (const ask of String(stdin ?? "")
    .split("\n")
    .filter(Boolean)) {
    const held = payloadOf(ask, objects, named);
    if (held === null) {
      out.push(`${ask} missing\n`);
      continue;
    }
    const kind = ask.endsWith(TREE_AT) ? "tree" : "blob";
    out.push(`${SHA} ${kind} ${held.length}\n${held}\n`);
  }
  return out.join("");
}

// [[spec/design_output/work#the-listing-reads-git-once]]
function payloadOf(ask, objects, named) {
  const cut = ask.indexOf(":");
  const where = named.get(ask.slice(0, cut)) ?? ask.slice(0, cut);
  const path = ask.slice(cut + 1);
  if (path === TICKETS) {
    const names = Object.keys(objects)
      .filter((key) => key.startsWith(`${where}:${TICKETS}/`))
      .map((key) => key.slice(`${where}:${TICKETS}/`.length));
    return names.map((name) => `100644 ${name}\0${NAME_FILLER}`).join("");
  }
  const said = objects[`${where}:${path}`];
  return said === undefined ? null : asBytes(said);
}

// A payload reads a character a byte, the way a raw run answers. [[spec/design_output/doors#a-raw-run-keeps-bytes]]
const asBytes = (said) => Buffer.from(String(said), "utf8").toString("latin1");

export const groupRemote = (note = GROUP_NOTE, more = {}) => ({
  ...remoteSaying([{ branch: "work/one-group", tip: "aaa", when: more.when ?? 0 }], {
    [`work/one-group:${GROUP_AT}`]: note,
    ...(more.objects ?? {}),
  }),
  "git ls-remote --heads origin work/*": {
    stdout: "aaa\trefs/heads/work/one-group\n",
  },
  [`git show origin/work/one-group:${GROUP_AT}`]: { stdout: note },
  "git rev-parse --abbrev-ref HEAD": { stdout: "work/one-group\n" },
  "git rev-parse HEAD": { stdout: `${SHA}\n` },
  "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
  "git fetch --prune origin": { stdout: "" },
});
