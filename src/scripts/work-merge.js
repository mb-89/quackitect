// The trunk end of a work branch: merge takes a done branch into trunk, and
// close deletes a branch trunk already carries.
// [[spec/design_output/work#a-merged-branch-closes]]

import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import {
  CLOSED,
  fieldOf,
  GROUP,
  isGroup,
  TICKETS,
  ticketAt,
  ticketNamed,
  withoutField,
} from "../engine/group.js";
import {
  baseOnTrunk,
  childrenHere,
  DONE,
  dirty,
  groupStanding,
  MINE,
  mergedHere,
  textAt,
} from "./work-stands.js";

export function merge(it, name) {
  if (dirty(it)) return 2;
  const branch = name ? `work/${name}` : "";
  if (!branch) {
    console.error("branch merge needs a name: ./RUNME.sh branch merge fix-lsp");
    return 2;
  }

  const on = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  if (on !== TRUNK) {
    console.error(`branch merge runs on ${TRUNK}, and this is ${on}.`);
    return 2;
  }

  it.git.run(["fetch", "--prune", "origin"], true);
  const ticket = textAt(it, `origin/${branch}`, ticketAt(name));
  if (!isGroup(ticket)) {
    console.error(`${branch} carries no group at ${ticketAt(name)}.`);
    return 1;
  }
  const status = groupStanding(ticket);
  if (status !== DONE) {
    console.error(`${branch} stands at ${status || "no status"}, so it is not ready.`);
    return 1;
  }

  const moved = movedOnTrunk(it, branch);
  if (moved.length) {
    console.error(
      `${TRUNK} moved what ${branch} holds, so the branch is no longer the truth.`,
    );
    for (const one of moved) {
      console.error(`  ${one.path}`);
      for (const line of one.lines) console.error(`    ${line}`);
    }
    console.error(`Take ${TRUNK} into ${branch} first, resolve it there, then merge.`);
    return 1;
  }

  const was = it.git.run(["rev-parse", "HEAD"], true).out;
  if (!it.git.run(["merge", "--no-ff", "--no-edit", `origin/${branch}`]).ok) {
    console.error(`${branch} conflicts. Resolve it, commit, then run branch close.`);
    return 1;
  }

  const freed = freeChildren(it, name);
  if (freed.length) it.git.run(["commit", "--amend", "--no-edit"], true);

  // [[spec/design_output/work#the-merge-lands-the-truth]]
  const said = checkSays(it);
  if (!said.ok) {
    it.git.run(["reset", "--hard", was], true);
    console.error(
      `The check answers red on the merge commit, so ${TRUNK} stands where it was.`,
    );
    console.error(said.says || "Run ./RUNME.sh check to read what it says.");
    return 1;
  }

  console.log(`${branch} is merged, and the check passes on the merge commit.`);
  for (const one of freed)
    console.log(`  ${one} lost its group, and stands loose on ${TRUNK}.`);
  console.log(`Run ./RUNME.sh branch close ${name}.`);
  return 0;
}

// [[spec/design_output/work#the-merge-lands-the-truth]]
function movedOnTrunk(it, branch) {
  // One read answers what trunk and a branch share, and the listing reads it too. [[spec/design_output/work#the-listing-reads-git-once]]
  const { base } = baseOnTrunk(it, branch);
  if (!base) return [];

  const touched = it.git.run(
    ["diff", "--name-only", `${base}..origin/${branch}`, "--", TICKETS],
    true,
  );
  const out = [];
  for (const path of touched.out.split("\n").filter(Boolean)) {
    const said = it.git.run(
      ["diff", "--unified=0", `${base}..origin/${TRUNK}`, "--", path],
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
  const ran = it.proc.run(
    [it.node, it.join(it.root, "src", "scripts", "cli.js"), "check"],
    {
      cwd: it.root,
    },
  );
  const rows = String(ran.stdout ?? "")
    .trim()
    .split("\n");
  return { ok: ran.exitCode === 0, says: rows.at(-1) ?? "" };
}

// [[spec/design_output/work#a-merged-branch-closes]]
export function close(it, name, argv) {
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
      console.error(`Merge it first, or run close ${ticketNamed(branch)} --force.`);
      continue;
    }
    if (!it.git.run(["push", "origin", "--delete", branch]).ok) continue;
    it.git.run(["branch", "-D", branch], true);
    console.log(`${branch} is closed${inTrunk.has(branch) ? "" : ", unmerged"}.`);
    shut++;
  }
  return shut || !name ? 0 : 1;
}

// [[spec/design_output/work#a-row-per-group]]
