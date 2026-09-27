// The dispatcher's writes: a fix group holding the loose agent tickets, and a
// branch for each ready group on main standing with none. Every write rides one
// commit on claude/dispatch-<commit>, made in a worktree of its own, so no push
// names main and the box's checkout moves nowhere.
// [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]

import { RUN } from "../../.claude/skills/level0/lib/folders.js";
import { mintedNote } from "../../.claude/skills/level0/lib/schema-mint.js";
import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import {
  CLOSED,
  fieldOf,
  GROUP,
  isGroup,
  TICKETS,
  ticketAt,
  withField,
} from "../engine/group.js";
import { withRoute } from "./process.js";
import { cutTo, schemasHere } from "./ticket.js";
import { askFaults } from "./ticket-ask-lint.js";
import { markOff } from "./work.js";
import { FIX } from "./work-fix.js";
import { waitingOn } from "./work-stands.js";

// The branch prefix the writes ride, and the worktree they are made in. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
export const WRITES = "claude/dispatch-";
const WORKTREE = `${RUN}/dispatch`;
// A commit's short name, as git prints it. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
const SHORT = 7;

// The groups on main that open: open, marked for no cloud, with no branch, and waiting on nothing. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
export function opensOf(read, standing) {
  const branched = new Set(read.stand.map((one) => one.name));
  return read.loose
    .filter(
      (one) =>
        isGroup(one.text) &&
        fieldOf(one.text, "state") !== CLOSED &&
        String(fieldOf(one.text, "cloud")) !== "true" &&
        !branched.has(one.name) &&
        !waitingOn(one.text, standing).length,
    )
    .map((one) => one.name)
    .sort();
}

// What stops the writes: a write branch of this main already standing, or an earlier one still unmerged. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
export function writeState(it) {
  const main = String(
    it.git.run(["rev-parse", `origin/${TRUNK}`], true).out ?? "",
  ).trim();
  const branch = `${WRITES}${main.slice(0, SHORT)}`;
  const standing = rowsOf(it, ["branch", "-r", "--list", `origin/${WRITES}*`]);
  const merged = new Set(rowsOf(it, ["branch", "-r", "--merged", `origin/${TRUNK}`]));
  if (!main) return { branch: "", state: "blind", main };
  if (standing.includes(branch)) return { branch, state: "standing", main };
  const waits = standing.filter((one) => !merged.has(one));
  if (waits.length) return { branch: waits[0], state: "waits", main };
  return { branch, state: "free", main };
}

function rowsOf(it, argv) {
  return String(it.git.run(argv, true).out ?? "")
    .split("\n")
    .map((row) => row.trim().replace(/^origin\//, ""))
    .filter(Boolean);
}

// The fix group's name, cut to the words a name holds. [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
export function fixName(it, main) {
  const name = `loose-fixes-${main.slice(0, SHORT)}`;
  return it.words ? cutTo(name, it.words) : name;
}

// The ask the dispatch writes into a fix group. [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
const FIX_ASK = [
  "The loose agent tickets on main land in this fix group, per [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]].",
  "",
  "A fix group hands back no ticket for an agent. What it leaves goes to a person as a question ticket.",
  "",
  "- every ticket naming this group closes through the command it names",
  "- `./RUNME.sh check` exits 0",
  "",
  "The view: none.",
  "",
  "The source: none.",
].join("\n");

// The files the run writes, by path under the tree, or a reason nothing is written. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
export function writesOf(it, plan, read, main) {
  const out = new Map();
  const bundle = plan.bundles.flatMap((one) => one.tickets);
  if (bundle.length) {
    const made = fixGroup(it, fixName(it, main));
    if (made.why) return { why: made.why };
    out.set(made.path, made.text);
    const loose = new Map(read.loose.map((one) => [one.name, one.text]));
    for (const name of bundle)
      out.set(ticketAt(name), withField(loose.get(name), GROUP, made.name, it.front));
  }
  const texts = new Map(read.loose.map((one) => [one.name, one.text]));
  for (const name of plan.opens)
    out.set(ticketAt(name), withField(texts.get(name), "cloud", true, it.front));
  return { files: out };
}

// [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
function fixGroup(it, name) {
  const path = `${TICKETS}/${name}.md`;
  const schemas = schemasHere(it);
  const copied = withRoute(
    it.disk,
    it.method ?? it.root,
    it.join,
    schemas.get("ticket"),
    {
      process: "group",
      Ask: FIX_ASK,
    },
  );
  if (copied.why) return { why: copied.why };
  const made = mintedNote(
    schemas,
    { kind: "ticket", path, fields: copied.fields },
    it.front,
  );
  if (made.why) return { why: made.why };
  const text = withField(made.text, FIX, true, it.front);
  const faults = askFaults(it, path, text).refused;
  if (faults.length)
    return {
      why: [`${path} holds an Ask the voice rules refuse:`, ...faults].join("\n"),
    };
  return { name, path, text };
}

// One commit in a worktree off main, pushed to the write branch, and the worktree gone after. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
export function land(it, branch, files, main) {
  const at = it.join(it.root, ...WORKTREE.split("/"));
  it.git.run(["worktree", "remove", "--force", at], true);
  if (!it.git.run(["worktree", "add", "--detach", at, `origin/${TRUNK}`], true).ok)
    return `The worktree at ${WORKTREE} would not open, so nothing is written.`;
  try {
    for (const [path, text] of files)
      it.disk.write(it.join(at, ...path.split("/")), text);
    const inside = (argv) => it.git.run(["-C", at, ...argv], true);
    if (!inside(["add", "-A"]).ok)
      return "The writes would not stage, so nothing is pushed.";
    if (
      !inside([
        "commit",
        "-m",
        `${branch}: the dispatch over ${TRUNK} at ${main.slice(0, SHORT)}`,
      ]).ok
    )
      return "The writes would not commit, so nothing is pushed.";
    if (!inside(["push", "origin", `HEAD:refs/heads/${branch}`]).ok)
      return `The push of ${branch} came back refused.`;
    return "";
  } finally {
    it.git.run(["worktree", "remove", "--force", at], true);
  }
}

// A ready group's branch opens on a commit of its own off main, as branch open makes it, and main takes no push. [[spec/design_output/work#a-merged-branch-closes]]
export function opens(it, names) {
  const refused = [];
  for (const name of names) {
    const branch = `work/${name}`;
    const mark = markOff(it, branch);
    if (
      !mark ||
      !it.git.run(["push", "origin", `${mark}:refs/heads/${branch}`], true).ok
    )
      refused.push(branch);
  }
  return refused;
}
