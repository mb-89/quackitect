// The dispatcher's dry run: the plan it reads off origin/main and the work
// branches, and the nothing it writes.
// [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeFront } from "../../src/doors/fake/front.js";
import { fieldOf, isGroup, withField } from "../../src/engine/group.js";
import { verbs } from "../../src/scripts/cli.js";
import { dispatch, planOf } from "../../src/scripts/dispatch.js";
import { fixName } from "../../src/scripts/dispatch-write.js";
import { cutTo } from "../../src/scripts/ticket.js";
import { askFaults } from "../../src/scripts/ticket-ask-lint.js";
import { markOff } from "../../src/scripts/work.js";
import { freeNow, stuckIn } from "../../src/scripts/work-free.js";
import {
  commits,
  done,
  FIX_NAME,
  FROM,
  forPerson,
  gitRows,
  HOUR,
  held,
  loose,
  MAIN,
  NOW,
  names,
  onMain,
  planned,
  VALE,
  WORKTREE,
  WRITE_BRANCH,
  waitingOn,
  writing,
  written,
} from "./dispatch-fixtures.js";
import { semicolonVale } from "./semicolon-vale.js";
import {
  CHILD,
  doorsSaying,
  GROUP_NOTE,
  heard,
  ROOT,
  ranGit,
  remoteSaying,
} from "./work-doors.js";

test("a group whose dependencies stand closed reads ready", () => {
  const { it } = planned([
    { name: "first", note: GROUP_NOTE, merged: true },
    { name: "second", note: waitingOn("first") },
  ]);
  assert.deepEqual(names(planOf(it).ready), ["second"]);
});

test("a group waiting on an open group reads waiting, and not ready", () => {
  const { it } = planned([
    { name: "first", note: GROUP_NOTE },
    { name: "second", note: waitingOn("first") },
  ]);
  const plan = planOf(it);
  assert.deepEqual(names(plan.ready), ["first"]);
  assert.deepEqual(plan.waiting, [{ group: "second", waits: ["first"] }]);
});

test("a hold past work.staleAfter reads ready, and a fresh hold reads held", () => {
  const { it } = planned([
    { name: "left", note: held, when: NOW - 13 * HOUR },
    { name: "worked", note: held, when: NOW - HOUR },
  ]);
  const plan = planOf(it);
  assert.deepEqual(names(plan.ready), ["left"]);
  assert.deepEqual(names(plan.held), ["worked"]);
});

test("the loose agent tickets stand in the bundle, and a ticket for a person under the questions alone", () => {
  const { it } = planned([], {
    "a-loose-one": loose,
    "a-closed-one": CHILD("", "closed").replace("group: \n", ""),
    "a-question": forPerson,
  });
  const plan = planOf(it);
  assert.deepEqual(plan.bundles, [{ parent: "", tickets: ["a-loose-one"] }]);
  assert.deepEqual(plan.questions, [{ ticket: "a-question", group: "" }]);
});

test("a group at done whose branch stands behind origin/main reads as a stuck hand-over", () => {
  const { it } = planned(
    [{ name: "landing", note: done }],
    {},
    {
      "git rev-list --count origin/work/landing..origin/main": { stdout: "3\n" },
    },
  );
  const plan = planOf(it);
  assert.deepEqual(plan.stuck, [{ group: "landing", why: "behind" }]);
  assert.deepEqual(plan.ready, []);
});

test("a group at done past work.staleAfter reads as a stuck hand-over", () => {
  const { it } = planned(
    [{ name: "landing", note: done, when: NOW - 13 * HOUR }],
    {},
    {
      "git rev-list --count origin/work/landing..origin/main": { stdout: "0\n" },
    },
  );
  assert.deepEqual(planOf(it).stuck, [{ group: "landing", why: "stale" }]);
});

test("stuckIn answers behind where main holds commits the branch lacks, and nothing where it holds none", () => {
  const { it } = doorsSaying({
    "git rev-list --count origin/work/landing..origin/main": { stdout: "3\n" },
    "git rev-list --count origin/work/level..origin/main": { stdout: "0\n" },
  });
  assert.equal(stuckIn(it, { branch: "work/landing" }, 0), "behind");
  assert.equal(stuckIn(it, { branch: "work/level" }, 0), "");
});

test("a group at done, up to date and fresh, stands out of the stuck list", () => {
  const { it } = planned(
    [{ name: "landing", note: done, when: NOW - HOUR }],
    {},
    {
      "git rev-list --count origin/work/landing..origin/main": { stdout: "0\n" },
    },
  );
  assert.deepEqual(planOf(it).stuck, []);
});

test("the dry run writes no file, makes no commit and pushes nothing", () => {
  const { it, outside, disk } = planned([{ name: "first", note: GROUP_NOTE }], {
    "a-loose-one": loose,
  });
  const before = [...disk.files.keys()];
  const said = heard(() => dispatch(ROOT, ["--dry"], it));
  assert.equal(said.code, 0);
  assert.match(said.said, /work\/first/);
  assert.deepEqual([...disk.files.keys()], before);
  const writes = ranGit(outside).filter((row) =>
    /^git (-C \S+ )?(commit|push|merge|switch|reset|checkout|add|worktree)( |$)/.test(
      row,
    ),
  );
  assert.deepEqual(writes, []);
});

test("--json prints the plan as one JSON object", () => {
  const { it } = planned([{ name: "first", note: GROUP_NOTE }]);
  const said = heard(() => dispatch(ROOT, ["--dry", "--json"], it));
  assert.equal(said.code, 0);
  assert.match(said.said, /^\{.*\}$/);
  assert.deepEqual(names(JSON.parse(said.said).ready), ["first"]);
});

test("freeNow and the plan name the same ready groups", () => {
  const groups = [
    { name: "first", note: GROUP_NOTE },
    { name: "second", note: waitingOn("first") },
    { name: "third", note: GROUP_NOTE },
  ];
  const { it } = planned(groups);
  const free = freeNow(new Map(groups.map((one) => [`work/${one.name}`, one.note])));
  assert.deepEqual(
    planOf(it)
      .ready.map((one) => one.branch)
      .sort(),
    [...free].sort(),
  );
});

// The verb table carries the row `./RUNME.sh dispatch` reaches. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
test("the verb table carries dispatch", () => {
  assert.equal(typeof verbs.dispatch?.run, "function");
});

test("a child reads off its own group's branch, and another branch's older copy counts nowhere", () => {
  const moved = CHILD("first", "open");
  const { it } = doorsSaying(
    remoteSaying(
      [
        { branch: "work/first", tip: "tip-first", when: NOW },
        { branch: "work/second", tip: "tip-second", when: NOW },
      ],
      {
        "work/first:spec/tickets/first.md": GROUP_NOTE,
        "work/first:spec/tickets/a-child.md": moved,
        "work/second:spec/tickets/second.md": GROUP_NOTE,
        "work/second:spec/tickets/a-child.md": forPerson.replace(
          "state: open\n",
          "state: open\ngroup: first\n",
        ),
        "origin/main:spec/tickets/a-child.md": forPerson.replace(
          "state: open\n",
          "state: open\ngroup: first\n",
        ),
      },
    ),
  );
  it.clock = fakeClock(FROM);
  it.stale = "12h";
  assert.deepEqual(planOf(it).questions, []);
});

test("the run writes one fix group carrying fix: true, holding the loose agent tickets", () => {
  const { it, disk } = writing({ "a-loose-one": loose, "b-loose-one": loose });
  assert.equal(heard(() => dispatch(ROOT, [], it)).code, 0);
  const group = written(disk, FIX_NAME);
  assert.equal(fieldOf(group, "fix"), "true");
  assert.ok(
    isGroup(group),
    `the fix group runs the group process: ${fieldOf(group, "process")}`,
  );
  for (const name of ["a-loose-one", "b-loose-one"])
    assert.equal(
      fieldOf(written(disk, name), "group"),
      FIX_NAME,
      `${name} lands in the fix group`,
    );
});

test("the run makes one commit on claude/dispatch-<commit>, and no push names main", () => {
  const { it, outside } = writing({ "a-loose-one": loose });
  assert.equal(heard(() => dispatch(ROOT, [], it)).code, 0);
  assert.equal(commits(outside).length, 1);
  const pushes = gitRows(outside).filter((row) => / push( |$)/.test(row));
  assert.ok(
    pushes.some((row) => row.endsWith(`HEAD:refs/heads/${WRITE_BRANCH}`)),
    `the write branch is pushed: ${pushes.join(" | ")}`,
  );
  assert.deepEqual(
    pushes.filter((row) => /(^| |:|\/)main$/.test(row)),
    [],
    "no push names main",
  );
});

test("a second run over one main finds its branch standing and writes nothing", () => {
  const { it, outside } = writing({ "a-loose-one": loose });
  heard(() => dispatch(ROOT, [], it));
  assert.equal(heard(() => dispatch(ROOT, [], it)).code, 0);
  assert.equal(commits(outside).length, 1, "one commit over two runs");
  assert.equal(
    gitRows(outside).filter((row) => row.endsWith(`HEAD:refs/heads/${WRITE_BRANCH}`))
      .length,
    1,
    "one branch over two runs",
  );
});

test("an unmerged claude/dispatch branch stops every write, and the plan still names the workers to start", () => {
  const { it, outside } = writing(
    { "a-loose-one": loose },
    {
      groups: [{ name: "first", note: GROUP_NOTE }],
      standing: ["claude/dispatch-0ld0ld0"],
    },
  );
  const said = heard(() => dispatch(ROOT, ["--json"], it));
  assert.equal(said.code, 0);
  assert.deepEqual(commits(outside), []);
  assert.deepEqual(
    gitRows(outside).filter((row) => / push( |$)/.test(row)),
    [],
  );
  assert.match(said.said, /^\{.*\}$/);
  assert.deepEqual(names(JSON.parse(said.said).ready), ["first"]);
});

test("a merged claude/dispatch branch stops nothing", () => {
  const { it, outside } = writing(
    { "a-loose-one": loose },
    { standing: ["claude/dispatch-0ld0ld0"], merged: ["claude/dispatch-0ld0ld0"] },
  );
  assert.equal(heard(() => dispatch(ROOT, [], it)).code, 0);
  assert.equal(commits(outside).length, 1);
});

test("the run leaves a ticket for a person loose, and names it under the questions", () => {
  const { it, disk } = writing({ "a-loose-one": loose, "a-question": forPerson });
  const said = heard(() => dispatch(ROOT, ["--json"], it));
  assert.equal(said.code, 0);
  assert.equal(
    disk.exists(`${WORKTREE}/spec/tickets/a-question.md`),
    false,
    "the question stays as main holds it",
  );
  const plan = JSON.parse(said.said);
  assert.deepEqual(plan.questions, [{ ticket: "a-question", group: "" }]);
});

test("the run opens work/<name> for a ready group on main with no branch, and leaves a group with a branch alone", () => {
  const { it, outside, disk } = writing(
    { "new-group": onMain, first: onMain },
    { groups: [{ name: "first", note: GROUP_NOTE }] },
  );
  assert.equal(heard(() => dispatch(ROOT, [], it)).code, 0);
  const pushes = gitRows(outside).filter((row) => / push( |$)/.test(row));
  assert.ok(
    pushes.some((row) => row.endsWith(":refs/heads/work/new-group")),
    `work/new-group is pushed: ${pushes.join(" | ")}`,
  );
  assert.ok(
    !pushes.some((row) => row.endsWith(":refs/heads/work/first")),
    "work/first stands already",
  );
  assert.equal(
    fieldOf(written(disk, "new-group"), "cloud"),
    "true",
    "the cloud marker rides the write branch",
  );
});

test("the fix group's name holds names.words at most", () => {
  const { it, disk } = writing({ "a-loose-one": loose });
  it.words = 3;
  heard(() => dispatch(ROOT, [], it));
  const made = disk
    .list(`${WORKTREE}/spec/tickets`)
    .map((one) => one.name.replace(/\.md$/, ""))
    .filter((name) => name !== "a-loose-one");
  assert.equal(made.length, 1, `one fix group stands: ${made.join(", ")}`);
  assert.ok(made[0].split("-").length <= 3, `${made[0]} holds three words at most`);
});

test("askFaults finds nothing in the fix group's ask", () => {
  const { it, disk } = writing({ "a-loose-one": loose });
  heard(() => dispatch(ROOT, [], it));
  const text = written(disk, FIX_NAME);
  assert.match(text, /# Ask\n\n\S/, "the ask holds a line");
  assert.deepEqual(askFaults(it, `spec/tickets/${FIX_NAME}.md`, text), {
    refused: [],
    warned: [],
  });
});

test("the run removes its worktree after the push, and moves the box's own checkout nowhere", () => {
  const { it, outside } = writing({ "a-loose-one": loose });
  assert.equal(heard(() => dispatch(ROOT, [], it)).code, 0);
  const rows = gitRows(outside);
  const pushed = rows.findIndex((row) =>
    row.endsWith(`HEAD:refs/heads/${WRITE_BRANCH}`),
  );
  const removed = rows.lastIndexOf(`git worktree remove --force ${WORKTREE}`);
  assert.ok(pushed >= 0 && removed > pushed, "the worktree goes after the push");
  assert.deepEqual(
    rows.filter((row) =>
      /^git (switch|checkout|reset|merge|commit|add)( |$)/.test(row),
    ),
    [],
    "no command runs over the box's own checkout",
  );
});

test("a refused push still removes the worktree, and the run answers refused", () => {
  const { it, outside } = writing({ "a-loose-one": loose });
  outside.proc.teach(
    ["git", "-C", WORKTREE, "push", "origin", `HEAD:refs/heads/${WRITE_BRANCH}`],
    { exitCode: 1, stderr: "rejected" },
  );
  assert.equal(heard(() => dispatch(ROOT, [], it)).code, 1);
  const rows = gitRows(outside);
  const pushed = rows.findIndex((row) =>
    row.endsWith(`HEAD:refs/heads/${WRITE_BRANCH}`),
  );
  const removed = rows.lastIndexOf(`git worktree remove --force ${WORKTREE}`);
  assert.ok(
    pushed >= 0 && removed > pushed,
    "the worktree goes after the refused push",
  );
});

test("the fix group's name cuts to a cap below its own words", () => {
  assert.equal(cutTo("loose-fixes-abc", 2), "loose-fixes");
  assert.equal(fixName({ words: 2 }, MAIN), "loose-fixes");
  assert.equal(fixName({ words: 5 }, MAIN), FIX_NAME);
});

test("markOff answers the commit that opens a branch off main's tree, which the dispatch pushes", () => {
  const { it } = doorsSaying({
    "git rev-parse origin/main^{tree}": { stdout: "7ree000\n" },
    "git commit-tree 7ree000 -p origin/main -m work/new-group opens": {
      stdout: "0pen000\n",
    },
  });
  assert.equal(markOff(it, "work/new-group"), "0pen000");
});

// A group names its parent under `group`, and a parent hands no worker. [[spec/tickets/groups-hold-groups]]
const under = (parent, note = GROUP_NOTE) =>
  note.replace("state: open\n", `state: open\ngroup: ${parent}\n`);
const shut = (note) => withField(note, "state", "closed", fakeFront());
// A parent marked for the cloud, so no case here pushes a branch for it. [[spec/tickets/groups-hold-groups]]
const cloudy = (note) => note.replace("state: open\n", "state: open\ncloud: true\n");

// [[spec/tickets/groups-hold-groups]]
test("a parent reaches no worker", () => {
  const { it } = planned(
    [
      { name: "top", note: GROUP_NOTE },
      { name: "child", note: under("top") },
    ],
    { top: GROUP_NOTE, child: under("top") },
  );
  assert.deepEqual(names(planOf(it).ready), ["child"]);
});

// [[spec/tickets/groups-hold-groups]]
test("a parent closes once every child stands closed on main", () => {
  const { it } = planned([], {
    parent: GROUP_NOTE,
    "a-part": shut(under("parent")),
    "a-piece": CHILD("parent", "closed"),
    "open-parent": GROUP_NOTE,
    "b-piece": CHILD("open-parent", "open"),
  });
  assert.deepEqual(planOf(it).closes, ["parent"]);
});

// A leaf under a middle group under a grandparent waiting on a blocker. [[spec/tickets/groups-hold-groups]]
function chained(blocker) {
  const notes = {
    grand: waitingOn("blocker"),
    mid: under("grand"),
    leaf: under("mid"),
  };
  return planned(
    Object.entries(notes).map(([name, note]) => ({ name, note })),
    { blocker, ...notes },
  );
}

// [[spec/tickets/groups-hold-groups]]
test("a grandparent's open dependency holds a group back", () => {
  const plan = planOf(chained(GROUP_NOTE).it);
  assert.ok(!names(plan.ready).includes("leaf"), `ready reads ${names(plan.ready)}`);
  assert.deepEqual(
    plan.waiting.find((one) => one.group === "leaf"),
    { group: "leaf", waits: ["blocker"] },
  );
});

// [[spec/tickets/groups-hold-groups]]
test("that group comes free once the dependency closes", () => {
  const plan = planOf(chained(shut(GROUP_NOTE)).it);
  assert.deepEqual(names(plan.ready), ["leaf"]);
  assert.equal(
    plan.waiting.find((one) => one.group === "leaf"),
    undefined,
  );
});

// [[spec/tickets/groups-hold-groups]]
test("a parent's close lands once over two runs", () => {
  const { it, disk, outside } = writing({
    parent: cloudy(onMain),
    "a-piece": CHILD("parent", "closed"),
  });
  assert.equal(heard(() => dispatch(ROOT, [], it)).code, 0);
  assert.equal(heard(() => dispatch(ROOT, [], it)).code, 0);
  assert.ok(
    disk.exists(`${WORKTREE}/spec/tickets/parent.md`),
    "the close writes the parent",
  );
  assert.equal(fieldOf(written(disk, "parent"), "state"), "closed");
  assert.equal(commits(outside).length, 1, "one commit over two runs");
});

// [[spec/tickets/groups-hold-groups]]
test("each parent's loose agent tickets bundle into a fix group under it", () => {
  const { it, disk, outside } = writing({
    "a-loose-one": loose,
    parent: cloudy(onMain),
    "p-piece": CHILD("parent", "open"),
  });
  // A second fix group lints under a name of its own. [[spec/tickets/groups-hold-groups]]
  outside.proc.teach([VALE], semicolonVale());
  const said = heard(() => dispatch(ROOT, ["--json"], it));
  assert.equal(said.code, 0);
  const plan = JSON.parse(said.said);
  assert.deepEqual(
    [...plan.bundles].sort((a, b) => a.parent.localeCompare(b.parent)),
    [
      { parent: "", tickets: ["a-loose-one"] },
      { parent: "parent", tickets: ["p-piece"] },
    ],
  );
  const fixOf = (name) => {
    assert.ok(disk.exists(`${WORKTREE}/spec/tickets/${name}.md`), `${name} is written`);
    const fix = fieldOf(written(disk, name), "group");
    assert.ok(disk.exists(`${WORKTREE}/spec/tickets/${fix}.md`), `${fix} is written`);
    assert.equal(fieldOf(written(disk, fix), "fix"), "true");
    return fix;
  };
  const top = fixOf("a-loose-one");
  const nested = fixOf("p-piece");
  assert.notEqual(top, nested, "each parent takes a fix group of its own");
  assert.equal(fieldOf(written(disk, nested), "group"), "parent");
  assert.equal(fieldOf(written(disk, top), "group"), "");
});

// [[spec/tickets/groups-hold-groups]]
test("a fix group's name carries its parent last, so the cut keeps the commit", () => {
  assert.equal(fixName({}, MAIN, "big-move"), `${FIX_NAME}-big-move`);
  assert.equal(fixName({ words: 4 }, MAIN, "big-move"), `${FIX_NAME}-big`);
  assert.equal(fixName({ words: 3 }, MAIN, "big-move"), FIX_NAME);
});
