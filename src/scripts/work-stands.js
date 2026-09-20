// What every work verb reads before it moves a thing: the standing a group
// ticket carries, the branches standing, and the trunk coming in. The verbs
// stand in work.js and work-merge.js beside this file.
// [[spec/design_output/work#a-group-is-a-ticket]]

import { MS } from "../../.claude/skills/level0/lib/log.js";
import { isTagged, reaches } from "../../.claude/skills/level0/lib/todo.js";
import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import {
  CLOSED,
  fieldOf,
  GROUP,
  heldIn,
  isGroup,
  NOTE_END,
  TICKETS,
  ticketAt,
  ticketNamed,
  WORK_BRANCH,
} from "./group.js";
import { asText, framed, namesIn, REF_FORMAT, refsIn } from "./work-read.js";

export const COL = { branch: 34, child: 32, place: 6, status: 6, why: 24 };
export { MS };
// [[spec/design_output/work#a-merged-branch-closes]]
export const MINE = /^(work|claude)\//;
export const TODO = "todo";
export const HELD = "held";
// A branch sharing no ancestor with trunk reaches no sync, so no box takes it. [[spec/design_output/work#the-listing-reads-git-once]]
export const ORPHAN = "orphan";

// [[spec/design_output/work#the-routine-a-verb-names]]
export const ROUTINE = { name: "do_work", id: "trig_01EenLoDAB3NdmANnRM9mSh6" };
export const DONE = "done";
export const MERGED = "merged";

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

// [[spec/design_output/work#the-mark-and-what-waits]]
export function named(said) {
  return String(said)
    .trim()
    .replace(/^\[|\]$/g, "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim()
    .replace(/^work\//, "");
}

export function frontField(text, key) {
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

export function standingOf(tickets, merged = new Set()) {
  return new Map(
    [...tickets].map(([branch, text]) => [
      branch,
      merged.has(branch) ? MERGED : groupStanding(text),
    ]),
  );
}

export function mergedHere(it) {
  const fresh = branchesIn(it, ["branch", "-r", "--points-at", `origin/${TRUNK}`]);
  return new Set(
    [...branchesIn(it, ["branch", "-r", "--merged", `origin/${TRUNK}`])].filter(
      (row) => !fresh.has(row),
    ),
  );
}

// A branch standing at trunk's tip carries no work, so the close leaves it alone. [[spec/design_output/work#a-merged-branch-closes]]
function branchesIn(it, argv) {
  return new Set(
    String(it.git.run(argv, true).out ?? "")
      .split("\n")
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

// [[spec/design_output/work#the-listing-reads-git-once]]
export function refsHere(it) {
  const said = it.git.run(
    ["for-each-ref", `--format=${REF_FORMAT}`, `refs/remotes/origin/${WORK_BRANCH}`],
    true,
  );
  if (!said.ok) return [];
  return refsIn(said.out, mergedHere(it)).map((one) => ({
    ...one,
    orphan: !baseOnTrunk(it, one.branch).shares,
  }));
}

// The commit trunk and a branch share. git answers red where they share none, which is what a rewrite of trunk leaves behind. [[spec/design_output/work#the-listing-reads-git-once]]
export function baseOnTrunk(it, branch) {
  const said = it.git.run(["merge-base", `origin/${TRUNK}`, `origin/${branch}`], true);
  return { shares: said.ok, base: said.ok ? said.out.trim() : "" };
}

// The refs, then the paths, then the contents. [[spec/design_output/work#the-listing-reads-git-once]]
export function readWork(it, trunk = false) {
  const refs = refsHere(it);
  const where = refs.map((one) => one.tip);
  if (trunk) where.push(`origin/${TRUNK}`);
  const paths = pathsIn(it, where);

  const asks = [
    ...where.flatMap((one) =>
      paths.get(one).map((name) => `${one}:${TICKETS}/${name}`),
    ),
  ];
  const read = framed(it.git.batch(asks), asks);
  const held = (ask) => asText(read.get(ask) ?? "");
  const ticketsAt = (one) =>
    paths.get(one).map((name) => ({
      path: `${TICKETS}/${name}`,
      name: ticketNamed(name),
      text: held(`${one}:${TICKETS}/${name}`),
    }));

  return {
    stand: refs.map((one) => standing(one, held, ticketsAt)),
    loose: trunk ? ticketsAt(`origin/${TRUNK}`) : [],
  };
}

// [[spec/design_output/work#the-listing-reads-git-once]]
function pathsIn(it, where) {
  const asks = where.map((one) => `${one}:${TICKETS}`);
  const trees = framed(it.git.batch(asks), asks);
  return new Map(
    where.map((one) => [
      one,
      namesIn(trees.get(`${one}:${TICKETS}`) ?? "").filter((name) =>
        name.endsWith(NOTE_END),
      ),
    ]),
  );
}

// [[spec/design_output/work#a-group-is-a-ticket]]
function standing(one, held, ticketsAt) {
  const name = one.branch.replace(WORK_BRANCH, "");
  const ticket = held(`${one.tip}:${ticketAt(name)}`);
  return {
    ...one,
    name,
    ticket: isGroup(ticket) ? ticket : "",
    tickets: ticketsAt(one.tip),
  };
}

// [[spec/design_output/work#a-group-is-a-ticket]]
export function standOf(it) {
  return readWork(it).stand;
}

// [[spec/design_output/work#held-derives-from-the-record]]
export function standingAll(stand) {
  return new Map(
    stand.map((one) => [
      one.branch,
      one.orphan ? ORPHAN : one.merged ? MERGED : groupStanding(one.ticket),
    ]),
  );
}

export function textAt(it, ref, path) {
  const said = it.git.run(["show", `${ref}:${path}`], true);
  return said.ok ? `${said.out}\n` : "";
}

export function workBranchHere(it, verb) {
  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  if (branch.startsWith(WORK_BRANCH)) return branch;
  console.error(`branch ${verb} runs on a work branch, and this is ${branch}.`);
  return "";
}

// [[spec/design_output/work#the-merge-frees-the-tickets]]
export function ticketsOn(it, ref) {
  const said = it.git.run(["ls-tree", "-r", "--name-only", ref, `${TICKETS}/`], true);
  if (!said.ok) return [];
  return said.out
    .split("\n")
    .filter((path) => path.endsWith(NOTE_END))
    .map((path) => ({ path, name: ticketNamed(path), text: textAt(it, ref, path) }));
}

export function branches(it) {
  it.git.run(["fetch", "--prune", "origin"], true);
  const said = it.git.run(["ls-remote", "--heads", "origin", "work/*"], true);
  return said.out
    .split("\n")
    .filter(Boolean)
    .map((row) => row.split("\t")[1].replace("refs/heads/", ""));
}

// Work stands two ways, and a branch moves over neither. [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
export function dirty(it, branch = "") {
  const left = standingIn(it).filter((one) => !one.parked);
  if (left.length) {
    console.error("This tree carries uncommitted changes, so no branch may move.");
    console.error("Commit them, or stash them, and run this again.");
    return true;
  }
  const here = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out.trim();
  const walked = new Set([here, branch].filter((one) => one.startsWith(WORK_BRANCH)));
  for (const one of walked) if (unpushed(it, one)) return true;
  return false;
}

// A branch move resets onto origin, so a commit origin lacks dies under it unheard. [[spec/design_output/work#a-branch-moves-clean]]
function unpushed(it, branch) {
  const said = it.git.run(["rev-list", "--count", `origin/${branch}..${branch}`], true);
  const count = said.ok ? said.out.trim() : "";
  if (!count || count === "0") return false;
  console.error(
    `${branch} holds ${count} commit(s) origin lacks, so no branch may move.`,
  );
  console.error(`Run git push origin ${branch}, and run this again.`);
  return true;
}

// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
export function standingIn(it) {
  const said = it.git.run(["status", "--porcelain"], true).out;
  return said
    .split("\n")
    .filter(Boolean)
    .map((row) => {
      const name = changedIn(row);
      return { name, parked: parkedHere(it, name) };
    });
}

// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
export function changedIn(row) {
  const found = /^\s*\S{1,2}\s+(.*)$/.exec(String(row));
  const said = (found ? found[1] : String(row)).trim();
  const moved = said.split(" -> ");
  return (moved.at(-1) ?? said).replace(/^"|"$/g, "");
}

// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
export function parkedHere(it, name) {
  if (!reaches(name)) return false;
  const at = it.join(it.root, ...name.split("/"));
  return it.disk.exists(at) && isTagged(it.disk.read(at));
}

// [[spec/design_output/work#trunk-comes-in-first]]
export function sync(it) {
  const branch = workBranchHere(it, "sync");
  if (!branch) return 2;

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

// [[spec/design_output/work#a-box-leaves]]
export function childrenHere(it, name) {
  const at = it.join(it.root, TICKETS);
  if (!it.disk.exists(at)) return [];
  return it.disk
    .list(at)
    .filter((one) => one.kind === "file" && one.name.endsWith(NOTE_END))
    .map((one) => ({
      name: ticketNamed(one.name),
      text: it.disk.read(it.join(at, one.name)),
    }))
    .filter((one) => fieldOf(one.text, GROUP) === name);
}

// [[spec/design_output/work#the-battery-answers-first]]
