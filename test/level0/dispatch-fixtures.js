// The doors a dispatch case runs over: the plan's branches and the run's writes.
// [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]

import { RUN } from "../../.claude/skills/level0/lib/folders.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeFront } from "../../src/doors/fake/front.js";
import { withEntry, withField, withHashAfter } from "../../src/engine/group.js";
import { TICKET_SCHEMA } from "./fixtures.js";
import { semicolonVale } from "./semicolon-vale.js";
import {
  CHILD,
  doorsSaying,
  GROUP_NOTE,
  ROOT,
  ranGit,
  remoteSaying,
} from "./work-doors.js";

export const FROM = "2026-01-02T00:00:00.000Z";
export const NOW = Math.floor(new Date(FROM).getTime() / 1000);
export const HOUR = 3600;

export const waitingOn = (name) =>
  GROUP_NOTE.replace("state: open\n", `state: open\ndepends_on: ${name}\n`);
export const held = withEntry(
  GROUP_NOTE,
  { step: "sync", hand: "box 3f9a", hash_before: "a1b2c3" },
  fakeFront(),
);
export const done = withField(
  withHashAfter(held, "d4e5f6", fakeFront()),
  "state",
  "closed",
  fakeFront(),
);
export const loose = CHILD("", "open").replace("group: \n", "");
export const forPerson = `---
kind: [[ticket]]
state: open
step: ask
steps:
  - name: ask
    does: asks the owner a question
    by: person
---

# Ask

A question for the owner.

# ask

# Discussion

Nothing yet.
`;

// Each group stands on a branch of its own, and trunk carries the loose tickets. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
export function planned(groups, trunk = {}, extra = {}) {
  const refs = groups.map((one) => ({
    branch: `work/${one.name}`,
    tip: `tip-${one.name}`,
    when: one.when ?? NOW,
    merged: one.merged,
  }));
  const objects = Object.fromEntries(
    groups.map((one) => [`work/${one.name}:spec/tickets/${one.name}.md`, one.note]),
  );
  for (const [name, note] of Object.entries(trunk))
    objects[`origin/main:spec/tickets/${name}.md`] = note;
  const doors = doorsSaying({ ...remoteSaying(refs, objects), ...extra });
  doors.it.clock = fakeClock(FROM);
  doors.it.stale = "12h";
  return { ...doors, groups };
}

export const names = (rows) => rows.map((one) => one.group).sort();

// The writes: a fix group per parent, the branches a ready group lacks, and one commit on a branch of their own. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
export const MAIN = "c0ffee1234abcdef";
const SHORT = MAIN.slice(0, 7);
export const WRITE_BRANCH = `claude/dispatch-${SHORT}`;
export const WORKTREE = `${ROOT}/${RUN}/dispatch`;
export const FIX_NAME = `loose-fixes-${SHORT}`;
export const VALE = `${ROOT}/.se/.runtime/bin/vale`;
const GROUP_PROCESS = `for: work that lands as one
steps:
  - name: children
    by: children
`;
export const onMain = GROUP_NOTE.replace("urgent: true\n", "");

// A run over one main, where the answers to the dispatch branches read what the run itself pushed. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
export function writing(trunk, { groups = [], standing = [], merged = [] } = {}) {
  const doors = planned(groups, trunk, {
    "git rev-parse origin/main": { stdout: `${MAIN}\n` },
    "git rev-parse origin/main^{tree}": { stdout: "7ree000\n" },
    "git commit-tree 7ree000 -p origin/main -m work/new-group opens": {
      stdout: "0pen000\n",
    },
    [`${VALE} --config=.vale.ini --output=JSON --no-exit --path=spec/tickets/${FIX_NAME}.md`]:
      semicolonVale(),
  });
  const pushed = () =>
    doors.outside.ran
      .map((one) => one.argv.join(" "))
      .filter((row) => row.includes("refs/heads/claude/dispatch-"))
      .map((row) => `  origin/${row.split("refs/heads/")[1]}`);
  doors.outside.proc.teach(
    ["git", "branch", "-r", "--list", "origin/claude/dispatch-*"],
    () => ({
      stdout: [...standing.map((one) => `  origin/${one}`), ...pushed()].join("\n"),
    }),
  );
  const landed = merged.map((one) => `  origin/${one}`).join("\n");
  doors.outside.proc.teach(["git", "branch", "-r", "--merged", "origin/main"], {
    stdout: `  origin/main\n${landed}\n`,
  });
  doors.disk.write(`${ROOT}/spec/schemas/ticket.schema.yaml`, TICKET_SCHEMA);
  doors.disk.write(`${ROOT}/spec/processes/group.yaml`, GROUP_PROCESS);
  doors.it.root = ROOT;
  doors.it.words = 5;
  doors.it.vale = VALE;
  return doors;
}

export const written = (disk, name) => disk.read(`${WORKTREE}/spec/tickets/${name}.md`);
// A row keys its paths with forward slashes, as the fake process does, so a case reads the same on Windows. [[spec/design_output/doors#a-fake-behaves]]
export const gitRows = (outside) =>
  ranGit(outside).map((row) => row.replaceAll("\\", "/"));
export const commits = (outside) =>
  gitRows(outside).filter((row) => /^git -C \S+ commit( |$)/.test(row));
