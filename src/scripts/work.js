// Work branches. A branch named work/<name> carries one piece of work: a group
// ticket at spec/tickets/<name>.md, or the brief a cloud box reads at
// HANDOVER.md while the last of them drains.
// [[spec/design_output/work#the-round-trip]]

import { mintNote, readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { overLong } from "../../.claude/skills/level0/lib/names.js";
import { saysGreen, STAMP, stampOf } from "../../.claude/skills/level0/lib/runs.js";
import { COPY } from "../../.claude/skills/level0/lib/vehicle.js";
import {
  aged,
  askOf,
  CLOSED,
  fieldOf,
  GROUP,
  heldIn,
  isGroup,
  OPEN,
  routeOf,
  spanOf,
  STALE,
  stepOf,
  ticketAt,
  TICKETS,
  withEntry,
  withField,
  withGave,
  withoutField,
} from "./group.js";
import { review } from "./review.js";

export const BRIEF = "HANDOVER.md";
const TRUNK = "main";
const TICKET_SCHEMA = "spec/schemas/ticket.schema.yaml";
const PROCESSES = "spec/processes";

// [[spec/design_output/work#a-merged-branch-closes]]
export const MINE = /^(work|claude)\//;

export const TODO = "todo";
export const HELD = "held";

// [[spec/design_output/work#the-routine-a-verb-names]]
export const ROUTINE = { name: "do_work", id: "trig_01KCYQ2oxi7rnCuBZYJsnLnQ" };
export const DONE = "done";
export const MERGED = "merged";

export function work(root, argv, doors) {
  const it = { root, ...doors };
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
    collect,
    trigger,
    adopt,
  };
  if (doing[what] && LOUD.includes(what)) {
    return tell(it, what, doing[what](it, name, argv));
  }
  if (!doing[what]) {
    console.log("Usage: ./RUNME.sh work <verb>\n");
    console.log("  new <name>    cut work/<name> from main with the brief, and push");
    console.log(
      "  take          take the next branch marked todo, and print its brief",
    );
    console.log("  sync          take main into this branch before you start");
    console.log("  done          mark this branch done, commit and push");
    console.log("  release       put this branch, or the one you name, back to todo");
    console.log("  read <name>   print what stands on work/<name>");
    console.log("  review <name> gather what a reader needs, and answer the report");
    console.log("  list          every work branch and its status");
    console.log("  merge <name>  take a done branch into main");
    console.log("  close [name]  delete a branch already inside main, or every one");
    console.log("  collect       every branch marked done, waiting on a merge");
    console.log("  trigger       the routine that works a branch, and what stands free");
    console.log("  adopt <name>  turn a brief branch into a group ticket and one child");
    return what ? 2 : 0;
  }
  return doing[what](it, name, argv);
}

const LOUD = ["new", "take", "done", "release", "merge", "close", "adopt"];

// [[spec/design_output/log#which-door-says-what]]
function tell(it, what, code) {
  if (!it.log) return code;
  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  return it.log
    .say(code === 0 ? "info" : "warn", "work", `${what} answered ${code}`, { branch })
    .then(() => code);
}

export function statusOf(text) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(text ?? ""));
  if (!front) return "";
  const said = /^status:\s*(\S+)\s*$/m.exec(front[1]);
  return said ? said[1].toLowerCase() : "";
}

export const URGENCY = ["now", "soon", "whenever"];

// [[spec/design_output/work#urgency-and-what-waits]]
export function urgencyOf(text) {
  const said = frontField(text, "urgency").toLowerCase();
  return URGENCY.includes(said) ? said : "soon";
}

export function dependsOn(text) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(text ?? ""));
  if (!front) return [];

  const out = [];
  let reading = false;
  for (const row of front[1].split(/\r?\n/)) {
    const opens = /^depends_on:\s*(.*)$/.exec(row);
    if (opens) {
      reading = true;
      for (const one of opens[1].split(",")) out.push(one);
      continue;
    }
    if (!reading) continue;
    const item = /^\s*-\s+(.*)$/.exec(row);
    if (item) {
      out.push(item[1]);
      continue;
    }
    if (row.trim()) reading = false;
  }
  return out.map(named).filter(Boolean);
}

// [[spec/design_output/work#urgency-and-what-waits]]
function named(said) {
  return String(said)
    .trim()
    .replace(/^\[|\]$/g, "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim()
    .replace(/^work\//, "");
}

function frontField(text, key) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(text ?? ""));
  if (!front) return "";
  const said = new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m").exec(front[1]);
  return said ? said[1] : "";
}

// [[spec/design_output/work#a-dependency-waits-for-trunk]]
export function waitingOn(text, standing) {
  return dependsOn(text).filter((name) => {
    const status = standing.get(`work/${name}`);
    return status === TODO || status === HELD || status === DONE;
  });
}

export function standingOf(briefs, merged = new Set()) {
  return new Map(
    [...briefs].map(([branch, text]) => [branch, merged.has(branch) ? MERGED : statusOf(text)]),
  );
}

function mergedHere(it) {
  return new Set(
    it.git
      .run(["branch", "-r", "--merged", `origin/${TRUNK}`], true)
      .out.split("\n")
      .map((row) => row.trim().replace("origin/", ""))
      .filter((row) => MINE.test(row)),
  );
}

// [[spec/design_output/work#held-derives-from-the-record]]
export function groupStanding(text) {
  if (!text) return "";
  if (fieldOf(text, "state") === CLOSED) return DONE;
  return heldIn(text) ? HELD : TODO;
}

// [[spec/design_output/work#a-group-is-a-ticket]]
function standOf(it) {
  return branches(it).map((branch) => {
    const name = branch.replace(/^work\//, "");
    const ticket = textAt(it, `origin/${branch}`, ticketAt(name));
    return {
      branch,
      name,
      brief: briefOf(it, branch),
      ticket: isGroup(ticket) ? ticket : "",
    };
  });
}

// [[spec/design_output/work#held-derives-from-the-record]]
function standingAll(stand, merged) {
  return new Map(
    stand.map((one) => [
      one.branch,
      merged.has(one.branch)
        ? MERGED
        : one.brief
          ? statusOf(one.brief)
          : groupStanding(one.ticket),
    ]),
  );
}

function noteOf(one) {
  return one.brief || one.ticket;
}

function textAt(it, ref, path) {
  const said = it.git.run(["show", `${ref}:${path}`], true);
  return said.ok ? `${said.out}\n` : "";
}

// [[spec/design_output/work#the-take-writes-the-record]]
function handOf(it) {
  const at = it.join(it.root, COPY);
  if (!it.disk.exists(at)) return "an unnamed box";
  try {
    return `box ${JSON.parse(it.disk.read(at)).id}`;
  } catch {
    return "an unnamed box";
  }
}

// [[spec/design_output/work#the-merge-frees-the-tickets]]
function ticketsOn(it, ref) {
  const said = it.git.run(["ls-tree", "-r", "--name-only", ref, `${TICKETS}/`], true);
  if (!said.ok) return [];
  return said.out
    .split("\n")
    .filter((path) => path.endsWith(".md"))
    .map((path) => ({ path, name: path.slice(TICKETS.length + 1, -3), text: textAt(it, ref, path) }));
}

// [[spec/design_output/work#a-stale-group-is-yours]]
function tipAge(it, branch, now) {
  const said = it.git.run(["log", "-1", "--format=%ct", `origin/${branch}`], true);
  if (!now || !said.ok || !said.out) return -1;
  return Math.max(0, Math.floor(now / 1000) - Number(said.out));
}

// [[spec/design_output/work#a-stale-group-is-yours]]
function staleAfter(it) {
  return spanOf(it.stale || STALE) || spanOf(STALE);
}

export function setStatus(text, to) {
  const said = String(text ?? "");
  if (/^---\r?\n[\s\S]*?\r?\n---/.test(said)) {
    if (/^status:\s*\S+\s*$/m.test(said)) {
      return said.replace(/^status:\s*\S+\s*$/m, `status: ${to}`);
    }
    return said.replace(/^---\r?\n/, `---\nstatus: ${to}\n`);
  }
  return `---\nkind: [[handover]]\nstatus: ${to}\n---\n\n${said.trimStart()}`;
}

function branches(it) {
  it.git.run(["fetch", "--prune", "origin"], true);
  const said = it.git.run(["ls-remote", "--heads", "origin", "work/*"], true);
  return said.out
    .split("\n")
    .filter(Boolean)
    .map((row) => row.split("\t")[1].replace("refs/heads/", ""));
}

function briefOf(it, branch) {
  const said = it.git.run(["show", `origin/${branch}:${BRIEF}`], true);
  return said.ok ? said.out : "";
}

function dirty(it) {
  const said = it.git.run(["status", "--porcelain"], true).out;
  if (!said) return false;
  console.error("This tree carries uncommitted changes, so no branch may move.");
  console.error("Commit them, or stash them, and run this again.");
  return true;
}

function push(it, branch, was, why) {
  it.disk.write(it.join(it.root, BRIEF), was);
  it.git.run(["add", BRIEF], true);
  it.git.run(["commit", "-m", `${branch}: ${why}`], true);
  return it.git.run(["push", "origin", branch]).ok;
}

// [[spec/design_output/work#trunk-comes-in-first]]
function sync(it) {
  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  if (!branch.startsWith("work/")) {
    console.error(`work sync runs on a work branch, and this is ${branch}.`);
    return 2;
  }

  it.git.run(["fetch", "origin", TRUNK], true);
  const behind = it.git.run(["rev-list", "--count", `HEAD..origin/${TRUNK}`], true).out;
  if (behind === "0") {
    console.log(`${branch} already carries every commit on ${TRUNK}.`);
    return 0;
  }

  const merged = it.git.run([
    "merge",
    `origin/${TRUNK}`,
    "--no-edit",
    "-m",
    `${branch}: take ${TRUNK} in`,
  ]);
  if (!merged.ok) {
    console.error(`${TRUNK} conflicts with ${branch}. Resolve it, commit, and go on.`);
    console.error("git status names the files. The merge belongs to you here.");
    return 1;
  }

  console.log(`${branch} took ${behind} commit(s) from ${TRUNK}.`);
  return 0;
}

export const CONTRACT_HEADING = "## How this branch runs";

// [[spec/design_output/work#every-brief-carries-the-contract]]
export function withContract(brief) {
  const said = String(brief ?? "").trimEnd();
  if (said.includes(CONTRACT_HEADING)) return `${said}\n`;
  return [
    said,
    "",
    CONTRACT_HEADING,
    "",
    "Level zero deletes this file when it reads it, so the copy in your context",
    "is the only one left. These steps write it back.",
    "",
    `1. Run \`./RUNME.sh work sync\` FIRST. It takes ${TRUNK} into this branch, so`,
    "   an old branch works against what the tree holds now. Resolve any conflict",
    "   before you start, because a conflict found later costs the work already",
    "   done.",
    "2. Commit and push each time you finish a thing. A cloud box dies and takes",
    "   its working tree with it.",
    `3. Write your result and your retro into \`${BRIEF}\`, at the root, replacing`,
    "   this brief. Head the retro `What surprises me`, and name every dead end",
    "   you walk into.",
    `4. Run \`./RUNME.sh work sync\` again, so ${TRUNK} comes in last too.`,
    "   Run `./RUNME.sh check` after it, and answer whatever the merge turns red.",
    "5. Run `./RUNME.sh work done`, which sets the status and pushes.",
    "6. Run `./RUNME.sh work release` instead where you stop early, so the branch",
    "   goes back to `todo` for somebody else.",
    `7. Run \`./RUNME.sh work merge <name>\` from ${TRUNK} to take it in, then`,
    "   `work close`. A cloud box stops at step 4, because the harness holds",
    `   ${TRUNK} shut there and a cloud box opens no pull request.`,
    "",
  ].join("\n");
}

function newWork(it, name) {
  if (!name) {
    console.error("work new needs a name: ./RUNME.sh work new fix-lsp");
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
    console.error(`work new cuts from ${TRUNK}, and this is ${on}.`);
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
function take(it) {
  if (dirty(it)) return 2;

  const stand = standOf(it);
  const standing = standingAll(stand, mergedHere(it));
  const open = stand.filter((one) => standing.get(one.branch) === TODO);

  if (!open.length) {
    console.log(`No work branch stands at ${TODO}. Nothing to take.`);
    return 0;
  }

  const free = freeIn(stand, standing);
  if (!free.length) {
    console.log(`Every branch at ${TODO} waits for another. Nothing to take.`);
    for (const one of open) {
      console.log(`  ${one.branch} waits for ${waitingOn(noteOf(one), standing).join(", ")}`);
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

function onBranch(it, branch) {
  if (!it.git.run(["switch", branch], true).ok) {
    if (!it.git.run(["switch", "-c", branch, `origin/${branch}`]).ok) return false;
  }
  it.git.run(["reset", "--hard", `origin/${branch}`], true);
  return true;
}

function claimBrief(it, branch) {
  const brief = it.disk.read(it.join(it.root, BRIEF));
  if (!push(it, branch, setStatus(brief, HELD), HELD)) {
    console.error("Somebody took this branch first. Run work take again.");
    return 1;
  }

  if (sync(it) === 1) {
    console.error(`Resolve the conflict on ${branch}, then read the brief again.`);
    return 1;
  }

  console.log(`You are on ${branch}, and it now stands at ${HELD}.`);
  console.log(`Write your result into ${BRIEF}, then run ./RUNME.sh work done.\n`);
  console.log(brief.trim());
  return 0;
}

// [[spec/design_output/work#the-take-writes-the-record]]
function claimGroup(it, one) {
  const at = ticketAt(one.name);
  const path = it.join(it.root, at);
  const was = it.disk.read(path);
  const hand = handOf(it);
  const took = it.git.run(["rev-parse", "HEAD"], true).out;

  it.disk.write(path, withEntry(was, { step: stepOf(was), hand, took }));
  it.git.run(["add", at], true);
  it.git.run(["commit", "-m", `${one.branch}: ${hand} takes it`], true);
  if (!it.git.run(["push", "origin", one.branch]).ok) {
    console.error("Somebody took this group first. Run work take again.");
    return 1;
  }

  if (sync(it) === 1) {
    console.error(`Resolve the conflict on ${one.branch}, then read the group again.`);
    return 1;
  }

  console.log(`You are on ${one.branch}, and ${hand} holds it.`);
  console.log(`Its tickets stand in ${TICKETS}, and ${at} is the group itself.`);
  console.log(`Run ./RUNME.sh work done when the last of them closes.\n`);
  console.log(askOf(was));
  return 0;
}

// [[spec/design_output/work#the-routine-a-verb-names]]
function freeIn(stand, standing) {
  return stand
    .filter((one) => standing.get(one.branch) === TODO)
    .filter((one) => !waitingOn(noteOf(one), standing).length);
}

// [[spec/design_output/work#the-routine-a-verb-names]]
export function freeNow(briefs, merged = new Set()) {
  const stand = [...briefs].map(([branch, brief]) => ({ branch, brief, ticket: "" }));
  return freeIn(stand, standingAll(stand, merged)).map((one) => one.branch);
}

function trigger(it) {
  const stand = standOf(it);
  const free = freeIn(stand, standingAll(stand, mergedHere(it))).map((one) => one.branch);

  console.log(`${ROUTINE.name} runs ./RUNME.sh work take on a cloud box.`);
  console.log("Fire it with the RemoteTrigger tool, once for every box you want:\n");
  console.log(`    action=run  trigger_id=${ROUTINE.id}\n`);

  if (!free.length) {
    console.log("No branch stands free, so a box fired now takes nothing.");
    return 0;
  }
  console.log("These branches stand free, and a box takes one each:");
  for (const branch of free) console.log(`  ${branch}`);
  return 0;
}

function finish(it) {
  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  if (!branch.startsWith("work/")) {
    console.error(`work done runs on a work branch, and this is ${branch}.`);
    return 2;
  }
  const name = branch.replace(/^work\//, "");
  const at = ticketAt(name);
  const group = it.join(it.root, at);
  const path = it.disk.exists(group) ? group : it.join(it.root, BRIEF);
  if (!it.disk.exists(path)) {
    console.error(`Write your result to ${BRIEF} first. It is what comes back.`);
    return 2;
  }

  const stopped = ready(it, branch);
  if (stopped.code) return stopped.code;

  if (path === group) return leaves(it, branch, at, group, stopped.says);

  if (!push(it, branch, setStatus(it.disk.read(path), DONE), DONE)) return 1;
  console.log(`${branch} stands at ${DONE}, and ${stopped.says}.`);
  console.log(`Run ./RUNME.sh work merge ${name} from ${TRUNK}.`);
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
    console.error("Run ./RUNME.sh work sync, then check, then work done.");
    console.error("A branch older than a rule greens itself and reddens trunk.");
    return { code: 1 };
  }

  const said = batterySays(it);
  if (!said.green) {
    console.error(`${branch} claims nothing yet: ${said.says}.`);
    console.error("Commit your work, run ./RUNME.sh check, then run work done.");
    return { code: 1 };
  }
  return { code: 0, says: said.says };
}

// [[spec/design_output/work#a-box-leaves]]
function leaves(it, branch, at, path, says) {
  const name = branch.replace(/^work\//, "");
  const gave = it.git.run(["rev-parse", "HEAD"], true).out;
  const open = childrenHere(it, name).filter(
    (one) => fieldOf(one.text, "state") !== CLOSED,
  );

  let now = withGave(it.disk.read(path), gave);
  if (!open.length) now = withField(withField(now, "state", CLOSED), "reason", DONE);
  it.disk.write(path, now);
  it.git.run(["add", at], true);
  it.git.run(["commit", "-m", `${branch}: the box leaves`], true);
  if (!it.git.run(["push", "origin", branch]).ok) return 1;

  console.log(`${branch} carries ${gave.slice(0, 8)}, and ${says}.`);
  if (open.length) {
    console.log(`${name} stays ${OPEN}, because ${open.length} ticket(s) stand open:`);
    for (const one of open) console.log(`  ${one.name}`);
  } else {
    console.log(`${name} stands ${CLOSED}, because every ticket in it is closed.`);
  }
  console.log(`Run ./RUNME.sh work merge ${name} from ${TRUNK}.`);
  return 0;
}

// [[spec/design_output/work#a-box-leaves]]
function childrenHere(it, name) {
  const at = it.join(it.root, TICKETS);
  if (!it.disk.exists(at)) return [];
  return it.disk
    .list(at)
    .filter((one) => one.kind === "file" && one.name.endsWith(".md"))
    .map((one) => ({ name: one.name.slice(0, -3), text: it.disk.read(it.join(at, one.name)) }))
    .filter((one) => fieldOf(one.text, GROUP) === name);
}

// [[spec/design_output/work#the-battery-answers-first]]
function batterySays(it) {
  const at = it.join(it.root, STAMP);
  const text = it.disk.exists(at) ? it.disk.read(at) : "";
  return saysGreen(stampOf(text), it.git.run(["rev-parse", "HEAD"], true).out);
}

function release(it, name) {
  const here = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  const branch = name ? `work/${name}` : here;
  if (!branch.startsWith("work/")) {
    console.error("work release takes a name, or runs on a work branch.");
    return 2;
  }

  if (dirty(it)) return 2;

  const brief = briefOf(it, branch);
  if (!brief) {
    console.error(`${branch} carries no ${BRIEF}.`);
    return 1;
  }
  if (statusOf(brief) === DONE) {
    console.error(`${branch} stands at ${DONE}. Read it before you reopen it.`);
    return 1;
  }

  if (!it.git.run(["switch", branch], true).ok) {
    if (!it.git.run(["switch", "-c", branch, `origin/${branch}`]).ok) return 1;
  }
  it.git.run(["reset", "--hard", `origin/${branch}`], true);
  if (!push(it, branch, setStatus(brief, TODO), TODO)) return 1;
  if (here !== branch) it.git.run(["switch", here], true);

  console.log(`${branch} stands at ${TODO} again, and is free for anybody.`);
  return 0;
}

function read(it, name) {
  if (!name) {
    console.error("work read needs a name: ./RUNME.sh work read fix-lsp");
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

// [[spec/design_output/work#one-row-per-group-and-per-ticket]]
function list(it) {
  const stand = standOf(it);
  const standing = standingAll(stand, mergedHere(it));
  const now = it.clock ? it.clock.now().getTime() : 0;
  const rows = stand.map((one) => rowOf(it, one, standing, now));
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
      console.log(`    ${row.name} held ${row.age}. Release it, take it over, or close it.`);
    }
    console.log("");
  }
  for (const row of [...rows, ...loose]) console.log(row.said);
  return 0;
}

// [[spec/design_output/work#one-row-per-group-and-per-ticket]]
function rowOf(it, one, standing, now) {
  const text = noteOf(one);
  const kind = one.brief ? "brief" : GROUP;
  const status = standing.get(one.branch) || "no status";
  const waits = waitingOn(text, standing);
  const why = waits.length ? `waits for ${waits.join(", ")}` : urgencyOf(text);
  const held = status === HELD ? tipAge(it, one.branch, now) : -1;
  const age = held < 0 ? "" : aged(held);

  return {
    name: one.name,
    age,
    stale: held >= 0 && held > staleAfter(it),
    said: `${one.branch.padEnd(34)} ${kind.padEnd(6)} ${status.padEnd(6)} ${why.padEnd(24)} ${age}`,
  };
}

// [[spec/design_output/work#one-row-per-group-and-per-ticket]]
function looseRows(it) {
  return ticketsOn(it, `origin/${TRUNK}`)
    .filter((one) => !fieldOf(one.text, GROUP) && !isGroup(one.text))
    .map((one) => ({
      stale: false,
      said: `${one.name.padEnd(34)} ticket ${(fieldOf(one.text, "state") || OPEN).padEnd(6)} ${urgencyOf(one.text)}`,
    }));
}

// [[spec/design_output/work#a-merged-branch-goes]]
function merge(it, name) {
  if (dirty(it)) return 2;
  const branch = name ? `work/${name}` : "";
  if (!branch) {
    console.error("work merge needs a name: ./RUNME.sh work merge fix-lsp");
    return 2;
  }

  const on = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  if (on !== TRUNK) {
    console.error(`work merge runs on ${TRUNK}, and this is ${on}.`);
    return 2;
  }

  it.git.run(["fetch", "--prune", "origin"], true);
  const ticket = textAt(it, `origin/${branch}`, ticketAt(name));
  const group = isGroup(ticket);
  const status = group ? groupStanding(ticket) : statusOf(briefOf(it, branch));
  if (status !== DONE) {
    console.error(`${branch} stands at ${status || "no status"}, so it is not ready.`);
    return 1;
  }

  const moved = movedOnTrunk(it, branch);
  if (moved.length) {
    console.error(`${TRUNK} moved what ${branch} holds, so the branch is no longer the truth.`);
    for (const one of moved) {
      console.error(`  ${one.path}`);
      for (const line of one.lines) console.error(`    ${line}`);
    }
    console.error(`Take ${TRUNK} into ${branch} first, resolve it there, then merge.`);
    return 1;
  }

  const was = it.git.run(["rev-parse", "HEAD"], true).out;
  if (!it.git.run(["merge", "--no-ff", "--no-edit", `origin/${branch}`]).ok) {
    console.error(`${branch} conflicts. Resolve it, commit, then run work close.`);
    return 1;
  }

  const freed = group ? freeChildren(it, name) : [];
  if (it.git.run(["rm", "--cached", "-q", BRIEF], true).ok) dropBrief(it);
  if (freed.length || !group) it.git.run(["commit", "--amend", "--no-edit"], true);

  // [[spec/design_output/work#the-merge-lands-the-truth]]
  const said = checkSays(it);
  if (!said.ok) {
    it.git.run(["reset", "--hard", was], true);
    console.error(`The check answers red on the merge commit, so ${TRUNK} stands where it was.`);
    console.error(said.says || "Run ./RUNME.sh check to read what it says.");
    return 1;
  }

  console.log(`${branch} is merged, and the check passes on the merge commit.`);
  for (const one of freed) console.log(`  ${one} lost its group, and stands loose on ${TRUNK}.`);
  console.log(`Run ./RUNME.sh work close ${name}.`);
  return 0;
}

// [[spec/design_output/work#the-merge-lands-the-truth]]
function movedOnTrunk(it, branch) {
  const base = it.git.run(["merge-base", `origin/${TRUNK}`, `origin/${branch}`], true);
  if (!base.ok || !base.out) return [];

  const touched = it.git.run(
    ["diff", "--name-only", `${base.out}..origin/${branch}`, "--", TICKETS],
    true,
  );
  const out = [];
  for (const path of touched.out.split("\n").filter(Boolean)) {
    const said = it.git.run(
      ["diff", "--unified=0", `${base.out}..origin/${TRUNK}`, "--", path],
      true,
    );
    const lines = said.out
      .split("\n")
      .filter((one) => /^[-+]/.test(one) && !/^[-+][-+][-+]/.test(one));
    if (lines.length) out.push({ path, lines });
  }
  return out;
}

// [[spec/design_output/work#the-merge-frees-the-tickets]]
function freeChildren(it, name) {
  const out = [];
  for (const one of childrenHere(it, name)) {
    if (fieldOf(one.text, "state") === CLOSED) continue;
    const at = ticketAt(one.name);
    it.disk.write(it.join(it.root, at), withoutField(one.text, GROUP));
    it.git.run(["add", at], true);
    out.push(one.name);
  }
  return out;
}

// [[spec/design_output/work#the-merge-lands-the-truth]]
function checkSays(it) {
  const ran = it.proc.run([it.node, it.join(it.root, "src", "scripts", "cli.js"), "check"], {
    cwd: it.root,
  });
  const rows = String(ran.stdout ?? "").trim().split("\n");
  return { ok: ran.exitCode === 0, says: rows.at(-1) ?? "" };
}

function dropBrief(it) {
  const path = it.join(it.root, BRIEF);
  if (it.disk.exists(path)) it.disk.remove(path);
}

// [[spec/design_output/work#a-merged-branch-closes]]
function close(it, name, argv) {
  const forced = (argv ?? []).includes("--force");
  it.git.run(["fetch", "--prune", "origin"], true);

  // [[spec/design_output/work#a-merged-branch-closes]] holds this proof.
  const ahead = it.git.run(
    ["rev-list", "--count", `origin/${TRUNK}..${TRUNK}`],
    true,
  ).out;
  if (ahead !== "0" && !forced) {
    console.error(`${TRUNK} holds ${ahead} commit(s) origin has never seen.`);
    console.error(`Push ${TRUNK} first, so the merge outlives the branch.`);
    return 1;
  }

  const inTrunk = mergedHere(it);

  const wanted = name ? [MINE.test(name) ? name : `work/${name}`] : [...inTrunk];
  if (!wanted.length) {
    console.log(`No work branch stands inside ${TRUNK}.`);
    return 0;
  }

  let shut = 0;
  for (const branch of wanted) {
    if (!inTrunk.has(branch) && !forced) {
      console.error(`${branch} is outside ${TRUNK}, so closing it drops its work.`);
      console.error(`Merge it first, or run close ${branch.slice(5)} --force.`);
      continue;
    }
    if (!it.git.run(["push", "origin", "--delete", branch]).ok) continue;
    it.git.run(["branch", "-D", branch], true);
    console.log(`${branch} is closed${inTrunk.has(branch) ? "" : ", unmerged"}.`);
    shut++;
  }
  return shut || !name ? 0 : 1;
}

// [[spec/design_output/work#a-brief-becomes-a-group]]
function adopt(it, name, argv) {
  const here = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  const branch = name ? `work/${name}` : here;
  if (!branch.startsWith("work/")) {
    console.error("work adopt takes a name, or runs on a work branch.");
    return 2;
  }
  if (here !== branch) {
    console.error(`work adopt runs on ${branch}, and this is ${here}.`);
    return 2;
  }
  if (dirty(it)) return 2;

  const at = it.join(it.root, BRIEF);
  if (!it.disk.exists(at)) {
    console.error(`${branch} carries no ${BRIEF}, so there is no brief to adopt.`);
    return 1;
  }

  const group = branch.replace(/^work\//, "");
  const child = childName(it, argv, it.disk.read(at), group);
  if (!child) {
    console.error("Name the one child this brief becomes: work adopt <name> <child>.");
    return 2;
  }

  const schema = readYaml(it.disk.read(it.join(it.root, TICKET_SCHEMA)));
  const brief = it.disk.read(at);
  const wrote = [
    minted(it, schema, GROUP, ticketAt(group), { Ask: askOf(brief) || headingOf(brief) }),
    minted(it, schema, "standard", ticketAt(child), { Ask: bodyOf(brief), group }),
  ];
  if (wrote.some((one) => !one)) return 1;

  it.git.run(["rm", "-q", BRIEF], true);
  dropBrief(it);
  it.git.run(["add", TICKETS], true);
  it.git.run(["commit", "-m", `${branch}: the brief becomes a group and one ticket`], true);
  if (!it.git.run(["push", "origin", branch]).ok) return 1;

  console.log(`${branch} carries ${ticketAt(group)} and ${ticketAt(child)}, and no brief.`);
  console.log(`Fill the ask of ${child}, then run ./RUNME.sh work done.`);
  return 0;
}

// [[spec/design_output/work#a-brief-becomes-a-group]]
function minted(it, schema, process, at, fields) {
  const path = it.join(it.root, `${PROCESSES}/${process}.yaml`);
  if (!it.disk.exists(path)) {
    console.error(`${PROCESSES} holds no ${process}, so no route stands to copy.`);
    return false;
  }
  const route = routeOf(it.disk.read(path));
  it.disk.makeDir(it.join(it.root, TICKETS));
  it.disk.write(
    it.join(it.root, at),
    mintNote(schema, { ...fields, process, steps: route.steps, urgency: "soon" }),
  );
  return true;
}

// [[spec/design_output/work#a-brief-becomes-a-group]]
export function childName(it, argv, brief, group) {
  const said = (argv ?? [])[2] || slug(headingOf(brief));
  if (!said || said === group) return "";
  return overLong(said, it.words) ? "" : said;
}

function headingOf(brief) {
  const said = /^#\s+(.+)$/m.exec(String(brief ?? ""));
  return said ? said[1].trim() : "";
}

function bodyOf(brief) {
  return String(brief ?? "")
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
    .split(CONTRACT_HEADING)[0]
    .trim();
}

function slug(said) {
  return String(said ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function collect(it) {
  const ready = branches(it).filter((b) => statusOf(briefOf(it, b)) === DONE);
  if (!ready.length) {
    console.log(`No branch stands at ${DONE}.`);
    return 0;
  }
  for (const branch of ready) {
    console.log(`${branch.padEnd(34)} ./RUNME.sh work read ${branch.slice(5)}`);
  }
  return 0;
}
