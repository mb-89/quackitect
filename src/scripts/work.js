// Work branches. A branch named work/<name> carries one piece of work: a group
// ticket at spec/tickets/<name>.md, or the brief a cloud box reads at
// HANDOVER.md while the last of them drains.
// [[spec/design_output/work#the-round-trip]]

import { overLong } from "../../.claude/skills/level0/lib/names.js";
import {
  STAMP,
  saysGreen,
  shortOf,
  stampOf,
} from "../../.claude/skills/level0/lib/runs.js";
import { TODO as PARKED } from "../../.claude/skills/level0/lib/todo.js";
import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import { USAGE } from "./branch-usage.js";
import {
  askOf,
  CLOSED,
  fieldOf,
  GROUP,
  heldIn,
  isGroup,
  OPEN,
  stepOf,
  TICKETS,
  ticketAt,
  ticketNamed,
  WORK_BRANCH,
  withEntry,
  withField,
  withHashAfter,
  withoutField,
} from "./group.js";
import { guidance } from "./guidance-verb.js";
import { handOf, pull, takeable } from "./pull.js";
import { readyToMerge, review } from "./review.js";
import { serving } from "./serve.js";
import { freeIn, staleClaim, trigger } from "./stand.js";
import { testVerb } from "./test-verb.js";
import { unblock } from "./unblock.js";
import { close, merge } from "./work-merge.js";
import {
  BRIEF,
  briefOf,
  COL,
  childrenHere,
  DONE,
  dirty,
  groupStanding,
  HELD,
  mergedHere,
  noteOf,
  push,
  setStatus,
  standingAll,
  standingIn,
  standOf,
  statusOf,
  sync,
  TODO,
  textAt,
  ticketsOn,
  URGENCY,
  urgencyOf,
  waitingOn,
  withContract,
  workBranchHere,
} from "./work-stands.js";

export * from "./work-stands.js";

export function work(root, argv, doors) {
  const it = { root, method: root, work: root, ...doors };
  const what = argv[0];
  const name = argv[1];
  const doing = {
    new: newWork,
    take,
    sync,
    done: finish,
    release,
    merge,
    close,
    read,
    review,
    list,
    // [[spec/design_output/pull#the-hand-out]]
    pull: (it, _name, argv) =>
      pull(
        {
          ...it,
          take: (group) => serving(it, take(it, group)),
          ready: () => readyToMerge(it),
        },
        argv,
      ),
    // [[spec/design_output/pull#the-work-answer]]
    guidance: (it, _name, argv) => guidance(it, (argv ?? []).slice(1), process.env),
    // [[spec/design_output/work#a-person-step-leaves]]
    unblock,
    test: (it, _name, argv) => testVerb(it, argv),
  };
  if (doing[what] && LOUD.includes(what)) {
    return tell(it, what, doing[what](it, name, argv));
  }
  if (!doing[what]) {
    for (const row of USAGE) console.log(row);
    return what ? 2 : 0;
  }
  return doing[what](it, name, argv);
}

// [[spec/design_output/work#the-routine-a-verb-names]]
export function cloud(root, argv, doors) {
  const it = { root, method: root, work: root, ...doors };
  if (argv[0] === "trigger") return trigger(it);
  console.log("Usage: ./RUNME.sh cloud <verb>\n");
  console.log("  trigger       the routine that works a branch, and what stands free");
  return argv[0] ? 2 : 0;
}

const LOUD = ["new", "take", "done", "release", "merge", "close", "pull", "unblock"];

// [[spec/design_output/log#which-door-says-what]]
function tell(it, what, code) {
  if (!it.log) return code;
  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  return it.log
    .say(code === 0 ? "info" : "warn", "work", `${what} answered ${code}`, { branch })
    .then(() => code);
}

function newWork(it, name) {
  if (!name) {
    console.error("branch new needs a name: ./RUNME.sh branch new fix-lsp");
    return 2;
  }
  if (overLong(name, it.words)) {
    console.error(`A branch name holds ${it.words} words, and ${name} holds more.`);
    return 2;
  }
  const branch = `work/${name}`;
  const path = it.join(it.root, BRIEF);

  if (!it.disk.exists(path)) {
    console.error(`Write the brief to ${BRIEF} first, saying what this work is.`);
    console.error(
      "Level zero reads it on the branch and hands it to whoever works it.",
    );
    return 2;
  }

  const on = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  if (on !== TRUNK) {
    console.error(`branch new cuts from ${TRUNK}, and this is ${on}.`);
    return 2;
  }

  const brief = setStatus(withContract(it.disk.read(path)), TODO);
  if (!it.git.run(["switch", "-c", branch]).ok) return 1;
  if (!push(it, branch, brief, "the brief")) return 1;
  it.git.run(["switch", TRUNK], true);
  it.git.run(["push", "-u", "origin", branch], true);

  console.log(`${branch} is pushed as ${TODO}, and ${BRIEF} left ${TRUNK} with it.`);
  console.log("Point a cloud agent at that branch, or let a routine take it.");
  return 0;
}

// [[spec/design_output/work#why-a-routine-needs-this]]
// A name picks one branch, which is the owner's road onto a group from a desk. [[spec/design_output/pull#the-engine-takes-the-branch]]
function take(it, name = "") {
  if (dirty(it)) return 2;

  const stand = standOf(it);
  const standing = standingAll(stand, mergedHere(it));
  const open = stand.filter((one) => standing.get(one.branch) === TODO);

  if (!open.length) {
    console.log(`No work branch stands at ${TODO}. Nothing to take.`);
    return 0;
  }

  const free = name
    ? freeIn(stand, standing).filter((one) => one.branch === `work/${name}`)
    : freeIn(stand, standing);
  if (name && !free.length) {
    console.error(
      `work/${name} stands at no free ${TODO}. Run ./RUNME.sh branch list to read where it stands.`,
    );
    return 1;
  }
  if (!free.length) {
    console.log(`Every branch at ${TODO} waits for another. Nothing to take.`);
    for (const one of open) {
      console.log(
        `  ${one.branch} waits for ${waitingOn(noteOf(one), standing).join(", ")}`,
      );
    }
    return 0;
  }

  // [[spec/design_output/work#a-brief-drains-first]]
  const held = free.filter((one) => one.brief);
  const wanted = held.length ? held : free;
  wanted.sort(
    (a, b) =>
      URGENCY.indexOf(urgencyOf(noteOf(a))) - URGENCY.indexOf(urgencyOf(noteOf(b))) ||
      a.branch.localeCompare(b.branch),
  );

  const one = wanted[0];
  if (!onBranch(it, one.branch)) return 1;
  return one.brief ? claimBrief(it, one.branch) : claimGroup(it, one);
}

// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
function onBranch(it, branch) {
  const parked = parkedFiles(it);
  for (const one of parked) it.git.run(["checkout", "--", one.name], true);

  if (!it.git.run(["switch", branch], true).ok) {
    if (!it.git.run(["switch", "-c", branch, `origin/${branch}`]).ok) return false;
  }
  it.git.run(["reset", "--hard", `origin/${branch}`], true);

  for (const one of parked) {
    it.disk.write(it.join(it.root, ...one.name.split("/")), one.text);
  }
  return true;
}

// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
function parkedFiles(it) {
  return standingIn(it)
    .filter((one) => one.parked)
    .map((one) => ({
      name: one.name,
      text: it.disk.read(it.join(it.root, ...one.name.split("/"))),
    }));
}

function claimBrief(it, branch) {
  const brief = it.disk.read(it.join(it.root, BRIEF));
  if (!push(it, branch, setStatus(brief, HELD), HELD)) {
    console.error(refusedPush(branch));
    return 1;
  }

  if (sync(it) === 1) {
    console.error(`Resolve the conflict on ${branch}, then read the brief again.`);
    return 1;
  }

  console.log(`You are on ${branch}, and it now stands at ${HELD}.`);
  console.log(`Write your result into ${BRIEF}, then run ./RUNME.sh branch done.\n`);
  console.log(brief.trim());
  return 0;
}

// The take names why the push came back, because a race is one road and a door turning it away is another, and a reader clears each one differently. [[spec/design_output/work#the-take-writes-the-record]]
function refusedPush(branch) {
  return [
    `The push of ${branch} came back refused, so the take stands undone.`,
    "Somebody taking it first is one road, and a push door turning it away is another.",
    "The lines above say which. Clear it, then run branch take again.",
  ].join("\n");
}

// [[spec/design_output/work#the-take-writes-the-record]]
function claimGroup(it, one) {
  const at = ticketAt(one.name);
  const path = it.join(it.root, at);
  const was = it.disk.read(path);
  const hand = handOf(it);
  const before = it.git.run(["rev-parse", "HEAD"], true).out;

  it.disk.write(path, withEntry(was, { step: stepOf(was), hand, hash_before: before }));
  it.git.run(["add", at], true);
  it.git.run(["commit", "-m", `${one.branch}: ${hand} takes it`], true);
  if (!it.git.run(["push", "origin", one.branch]).ok) {
    console.error(refusedPush(one.branch));
    return 1;
  }

  if (sync(it) === 1) {
    console.error(`Resolve the conflict on ${one.branch}, then read the group again.`);
    return 1;
  }

  console.log(`You are on ${one.branch}, and ${hand} holds it.`);
  console.log(`Its tickets stand in ${TICKETS}, and ${at} is the group itself.`);
  console.log(`Run ./RUNME.sh branch done when the last of them closes.\n`);
  console.log(askOf(was));
  return 0;
}

// [[spec/design_output/work#the-routine-a-verb-names]]

function finish(it) {
  const branch = workBranchHere(it, "done");
  if (!branch) return 2;
  // [[spec/design_output/work#a-brief-drains-first]]
  const name = ticketNamed(branch);
  const at = ticketAt(name);
  const group = it.join(it.root, at);
  const brief = it.join(it.root, BRIEF);
  const path = it.disk.exists(brief) ? brief : group;
  if (!it.disk.exists(path)) {
    console.error(`Write your result to ${BRIEF} first. It is what comes back.`);
    return 2;
  }

  const stopped = ready(it, branch);
  if (stopped.code) return stopped.code;

  if (path === group) return leaves(it, branch, at, path, stopped.says);

  if (!push(it, branch, setStatus(it.disk.read(path), DONE), DONE)) return 1;
  console.log(`${branch} stands at ${DONE}, and ${stopped.says}.`);
  console.log(`Run ./RUNME.sh branch merge ${name} from ${TRUNK}.`);
  console.log("A cloud box stops here, because the harness holds trunk shut.");
  return 0;
}

// [[spec/design_output/work#trunk-comes-in-last-too]]
function ready(it, branch) {
  it.git.run(["fetch", "origin", TRUNK], true);
  const behind = Number(
    it.git.run(["rev-list", "--count", `HEAD..origin/${TRUNK}`], true).out,
  );
  if (Number.isFinite(behind) && behind > 0) {
    console.error(`${TRUNK} holds ${behind} commit(s) ${branch} lacks.`);
    console.error("Run ./RUNME.sh branch sync, then check, then branch done.");
    console.error("A branch older than a rule greens itself and reddens trunk.");
    return { code: 1 };
  }

  const said = batterySays(it);
  if (!said.green) {
    console.error(`${branch} claims nothing yet: ${said.says}.`);
    console.error("Commit your work, run ./RUNME.sh check, then run branch done.");
    return { code: 1 };
  }
  return { code: 0, says: said.says };
}

// [[spec/design_output/work#a-box-leaves]]
function leaves(it, branch, at, path, says) {
  const name = branch.replace(/^work\//, "");
  const after = it.git.run(["rev-parse", "HEAD"], true).out;
  const children = childrenHere(it, name);
  const open = children.filter((one) => fieldOf(one.text, "state") !== CLOSED);

  // A closed sibling frees the one waiting on it, so takeable reads them all. [[spec/design_output/pull#done-leaves-no-takeable-step]]
  const busy = [...open, { name, text: it.disk.read(path) }]
    .map((one) => ({ name: one.name, step: takeable(it, one, children) }))
    .filter((one) => one.step);
  if (busy.length) {
    for (const one of busy) {
      console.error(`${one.name} stands at ${one.step}, and a hand can take it.`);
    }
    console.error(
      "Run ./RUNME.sh branch pull, and spawn the hand a spawn answer names.",
    );
    console.error(
      "branch done leaves a group only when every open step waits for a person.",
    );
    return 1;
  }

  let now = withHashAfter(it.disk.read(path), after);
  // [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]] takes the tag off.
  if (!open.length) {
    now = withoutField(
      withField(withField(now, "state", CLOSED), "reason", DONE),
      PARKED,
    );
  }
  it.disk.write(path, now);
  it.git.run(["add", at], true);
  it.git.run(["commit", "-m", `${branch}: the box leaves`], true);
  if (!it.git.run(["push", "origin", branch]).ok) return 1;

  console.log(`${branch} carries ${shortOf(after)}, and ${says}.`);
  if (open.length) {
    console.log(`${name} stays ${OPEN}, because ${open.length} ticket(s) stand open:`);
    for (const one of open) console.log(`  ${one.name}`);
  } else {
    console.log(`${name} stands ${CLOSED}, because every ticket in it is closed.`);
  }
  console.log(`Run ./RUNME.sh branch merge ${name} from ${TRUNK}.`);
  return 0;
}

// [[spec/design_output/work#a-box-leaves]]

function batterySays(it) {
  const at = it.join(it.root, STAMP);
  const text = it.disk.exists(at) ? it.disk.read(at) : "";
  return saysGreen(stampOf(text), it.git.run(["rev-parse", "HEAD"], true).out);
}

function release(it, name) {
  const here = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  const branch = name ? `${WORK_BRANCH}${name}` : workBranchHere(it, "release");
  if (!branch || dirty(it, branch)) return 2;
  const brief = briefOf(it, branch);
  const named = ticketNamed(branch);
  const ticket = brief ? "" : textAt(it, `origin/${branch}`, ticketAt(named));
  if (!brief && !isGroup(ticket)) {
    console.error(`${branch} carries no ${BRIEF} and no group.`);
    return 1;
  }
  const standing = brief ? statusOf(brief) : groupStanding(ticket);
  if (standing === DONE) {
    console.error(`${branch} stands at ${DONE}. Read it before you reopen it.`);
    return 1;
  }

  if (!onBranch(it, branch)) return 1;
  if (!brief) return letGo(it, branch, named, here);
  if (!push(it, branch, setStatus(brief, TODO), TODO)) return 1;
  if (here !== branch) it.git.run(["switch", here], true);

  console.log(`${branch} stands at ${TODO} again, and is free for anybody.`);
  return 0;
}

// [[spec/design_output/work#a-stale-group-is-yours]]
function letGo(it, branch, name, here) {
  const at = ticketAt(name);
  const path = it.join(it.root, at);
  const held = heldIn(it.disk.read(path));
  if (!held) {
    console.log(`${branch} holds nobody already, so it is free for anybody.`);
    return 0;
  }

  it.disk.write(
    path,
    withHashAfter(it.disk.read(path), it.git.run(["rev-parse", "HEAD"], true).out),
  );
  it.git.run(["add", at], true);
  it.git.run(["commit", "-m", `${branch}: ${held.hand} lets it go`], true);
  if (!it.git.run(["push", "origin", branch]).ok) return 1;
  if (here !== branch) it.git.run(["switch", here], true);

  console.log(`${branch} stands at ${TODO} again, and is free for anybody.`);
  return 0;
}

function read(it, name) {
  if (!name) {
    console.error("branch read needs a name: ./RUNME.sh branch read fix-lsp");
    return 2;
  }
  const said = briefOf(it, `work/${name}`);
  if (!said) {
    console.error(`work/${name} carries no ${BRIEF}.`);
    return 1;
  }
  console.log(said);
  return 0;
}

// [[spec/design_output/work#a-row-per-group]]
function list(it, _name, argv) {
  const stand = standOf(it);
  const standing = standingAll(stand, mergedHere(it));
  if ((argv ?? []).includes("--done")) return doneOnly(stand, standing);
  const now = it.clock ? it.clock.now().getTime() : 0;
  const rows = stand.flatMap((one) => [
    rowOf(it, one, standing, now),
    ...childRows(it, one),
  ]);
  const loose = looseRows(it);

  if (!rows.length && !loose.length) {
    console.log("No group and no loose ticket stands.");
    return 0;
  }

  // [[spec/design_output/work#a-stale-group-is-yours]]
  const stale = rows.filter((row) => row.stale);
  if (stale.length) {
    console.log("Yours");
    for (const row of stale) {
      console.log(`  ${row.said}`);
      console.log(
        `    ${row.name} held ${row.age}. Release it, take it over, or close it.`,
      );
    }
    console.log("");
  }
  for (const row of [...rows, ...loose]) console.log(row.said);
  return 0;
}

// [[spec/design_output/work#a-row-per-group]]
function rowOf(it, one, standing, now) {
  const text = noteOf(one);
  const kind = one.brief ? "brief" : GROUP;
  const status = standing.get(one.branch) || "no status";
  const waits = waitingOn(text, standing);
  const why = waits.length ? `waits for ${waits.join(", ")}` : urgencyOf(text);
  // [[spec/design_output/work#a-stale-group-is-yours]]
  const { age, stale } =
    status === HELD ? staleClaim(it, one.branch, now) : { age: "", stale: false };

  return {
    name: one.name,
    age,
    stale,
    said: `${one.branch.padEnd(COL.branch)} ${kind.padEnd(COL.kind)} ${status.padEnd(COL.status)} ${why.padEnd(COL.why)} ${age}`,
  };
}

// [[spec/design_output/work#a-ticket-under-its-group]]
function childRows(it, one) {
  if (!one.ticket) return [];
  return ticketsOn(it, `origin/${one.branch}`)
    .filter((child) => fieldOf(child.text, GROUP) === one.name)
    .map((child) => ({
      stale: false,
      said: `  ${child.name.padEnd(COL.child)} ticket ${stateOf(child.text).padEnd(COL.status)} ${whyOf(child.text)}`,
    }));
}

// [[spec/design_output/work#a-ticket-under-its-group]]
function stateOf(text) {
  return fieldOf(text, "state") || OPEN;
}

// [[spec/design_output/work#a-ticket-under-its-group]]
export function whyOf(text) {
  return stepOf(text) || urgencyOf(text);
}

// [[spec/design_output/work#a-row-per-group]]
function looseRows(it) {
  return ticketsOn(it, `origin/${TRUNK}`)
    .filter((one) => !fieldOf(one.text, GROUP) && !isGroup(one.text))
    .map((one) => ({
      stale: false,
      said: `${one.name.padEnd(COL.branch)} ticket ${(fieldOf(one.text, "state") || OPEN).padEnd(COL.status)} ${urgencyOf(one.text)}`,
    }));
}

// [[spec/design_output/work#a-merged-branch-goes]]

function doneOnly(stand, standing) {
  const ready = stand.filter((one) => standing.get(one.branch) === DONE);
  if (!ready.length) {
    console.log(`No branch stands at ${DONE}.`);
    return 0;
  }
  for (const one of ready) {
    console.log(`${one.branch.padEnd(COL.branch)} ./RUNME.sh branch read ${one.name}`);
  }
  return 0;
}
