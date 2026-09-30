// The trunk end of a work branch: merge takes a done branch into trunk, and
// close deletes a branch trunk already carries.
// [[spec/design_output/work#a-merged-branch-closes]]

import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import { verbArgv } from "./verb-run.js";
import {
  CLOSED,
  fieldOf,
  GROUP,
  isGroup,
  TICKETS,
  ticketAt,
  ticketNamed,
  withField,
  withoutField,
} from "../engine/group.js";
import { addedHere, onPersonRoute } from "./work-fix.js";
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

// A branch a cloud routine cuts carries no group, so it reads against trunk by its commits. [[spec/design_output/work#a-cloud-branch-comes-in]]
const CLOUD = /^claude\//;

// The key the group ticket on trunk carries while its branch stands in the cloud. [[spec/rationales/git-stays-the-archive]]
export const CLOUD_MARK = "cloud";

// Sets the marker on trunk's copy of a group, or drops it, and stages the file where it moves. [[spec/tickets/groups-carry-the-cloud-marker]]
export function marks(it, name, on) {
  const at = ticketAt(name);
  const path = it.join(it.root, at);
  let text = "";
  try {
    text = it.disk.read(path);
  } catch {
    return false;
  }
  if (!text || (fieldOf(text, CLOUD_MARK) === "true") === on) return false;
  it.disk.write(
    path,
    on
      ? withField(text, CLOUD_MARK, "true", it.front)
      : withoutField(text, CLOUD_MARK, it.front),
  );
  it.git.run(["add", at], true);
  return true;
}

// The marker lands on trunk once the branch stands, so a refused branch push leaves trunk bare, and a second open writes a marker the first one lost. [[spec/tickets/groups-carry-the-cloud-marker]]
export function marksTrunk(it, name) {
  if (!marks(it, name, true)) return true;
  it.git.run(["commit", "-m", `${name}: opens in the cloud`], true);
  if (it.git.run(["push", "origin", TRUNK]).ok) return true;
  console.error(
    `The push of ${TRUNK} comes back refused, so it carries no marker. Run ./RUNME.sh branch open ${name} again.`,
  );
  return false;
}

// The trunk and a clean tree, which every verb committing on trunk stands on. [[spec/tickets/groups-carry-the-cloud-marker]]
export function offTrunk(it, verb) {
  const on = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  if (on !== TRUNK) {
    console.error(`branch ${verb} runs on ${TRUNK}, and this is ${on}.`);
    return true;
  }
  return dirty(it);
}

export function merge(it, name, argv) {
  if (CLOUD.test(name ?? "")) return mergeCloud(it, name);
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

  // A closed pull keeps its head ref on origin, and git reads no pull state, so the person who sees it closed passes --closed. [[spec/tickets/merge-reads-open-pulls]]
  const pull = (argv ?? []).includes("--closed") ? "" : pullCarrying(it, branch);
  if (pull) {
    console.error(
      `${branch} stands in pull request #${pull}, and GitHub lands it once the check passes.`,
    );
    console.error(
      `Where #${pull} stands closed unmerged, run ./RUNME.sh branch merge ${name} --closed.`,
    );
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
    // The resolving commit takes the branch out of the cloud as the clean merge does, so it carries the dropped marker. [[spec/tickets/conflicts-drop-the-marker]]
    const held = conflicted(it, ticketAt(name));
    if (!held) marks(it, name, false);
    console.error(`${branch} conflicts. Resolve it, commit, then run branch close.`);
    if (held)
      console.error(
        `Drop ${CLOUD_MARK}: true from ${ticketAt(name)} as you resolve it.`,
      );
    return 1;
  }

  const freed = freeChildren(it, name);
  // The merge takes the branch out of the cloud, so its commit drops the marker. [[spec/tickets/groups-carry-the-cloud-marker]]
  const unmarked = marks(it, name, false);
  if (freed.length || unmarked) it.git.run(["commit", "--amend", "--no-edit"], true);

  // A merge carrying a new tool builds it, because the install ran before the merge and read the old wants. [[spec/design_output/work#the-merge-lands-the-truth]]
  installs(it);
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
  // Trunk on origin holds the whole branch once the push lands, so the close drops nothing, and a dependent reads the branch gone. [[spec/design_output/work#a-dependency-waits-for-trunk]]
  if (!it.git.run(["push", "origin", TRUNK]).ok) {
    console.log(`Push ${TRUNK}, then run ./RUNME.sh branch close ${name}.`);
    return 0;
  }
  // A remote refusing the delete leaves the branch, and trunk's closed ticket frees what waits. [[spec/design_output/work#a-dependency-waits-for-trunk]]
  if (close(it, name, []))
    console.log(`${branch} stands on the remote, and trunk carries its ticket closed.`);
  return 0;
}

// A staged write of a conflicted file marks it resolved, so the marker waits for the person's resolution there. [[spec/tickets/conflicts-drop-the-marker]]
function conflicted(it, at) {
  return it.git
    .run(["diff", "--name-only", "--diff-filter=U"], true)
    .out.split("\n")
    .includes(at);
}

// The number of the pull request whose head stands at the branch tip, or nothing. [[spec/design_input/the-cloud-runs-itself#the-hand-over]]
function pullCarrying(it, branch) {
  const tip = it.git.run(["rev-parse", `origin/${branch}`], true).out;
  if (!tip) return "";
  const row = it.git
    .run(["ls-remote", "origin", "refs/pull/*/head"], true)
    .out.split("\n")
    .find((one) => one.split("\t")[0] === tip);
  return row ? (row.split("\t")[1] ?? "").split("/")[2] : "";
}

// [[spec/design_output/work#a-cloud-branch-comes-in]]
function mergeCloud(it, branch) {
  if (dirty(it)) return 2;
  const on = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  if (on !== TRUNK) {
    console.error(`branch merge runs on ${TRUNK}, and this is ${on}.`);
    return 2;
  }
  it.git.run(["fetch", "--prune", "origin"], true);
  const left = it.git
    .run(["cherry", TRUNK, `origin/${branch}`], true)
    .out.split("\n")
    .filter((row) => row.startsWith("+"));
  const was = it.git.run(["rev-parse", "HEAD"], true).out;
  if (
    left.length &&
    !it.git.run(["merge", "--no-ff", "--no-edit", `origin/${branch}`]).ok
  ) {
    console.error(`${branch} conflicts. Resolve it, commit, then run branch close.`);
    return 1;
  }

  installs(it);
  const said = checkSays(it);
  if (!said.ok) {
    if (left.length) it.git.run(["reset", "--hard", was], true);
    console.error(`The check answers red on ${TRUNK}, so ${branch} stands.`);
    console.error(said.says || "Run ./RUNME.sh check to read what it says.");
    return 1;
  }
  // [[spec/design_output/work#a-merged-branch-closes]] holds the order: trunk reaches origin before the branch goes.
  if (!it.git.run(["push", "origin", TRUNK]).ok) {
    console.error(`The push of ${TRUNK} comes back refused, so ${branch} stands.`);
    return 1;
  }
  if (!it.git.run(["push", "origin", "--delete", branch]).ok) return 1;
  it.git.run(["branch", "-D", branch], true);
  console.log(
    left.length
      ? `${branch} is merged, the check passes, and the branch is gone.`
      : `${TRUNK} carries ${branch} already, the check passes, and the branch is gone.`,
  );
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

// branch done frees them on the branch, and the merge frees what an older branch still holds. A parent named takes them in place of the top. [[spec/design_output/work#the-merge-frees-the-tickets]]
export function freeChildren(it, name, parent = "") {
  const out = [];
  for (const one of childrenHere(it, name)) {
    if (fieldOf(one.text, "state") === CLOSED) continue;
    filed(it, one, parent);
    out.push(one.name);
  }
  return out;
}

// branch done leaves the person route loose on main, and files each open child group into the group's parent. [[spec/design_output/work#a-box-leaves]]
export function filesUp(it, name, text) {
  const parent = fieldOf(text, GROUP);
  const out = [];
  for (const one of childrenHere(it, name)) {
    if (fieldOf(one.text, "state") === CLOSED) continue;
    filed(it, one, onPersonRoute(one.text) ? "" : parent);
    out.push(one.name);
  }
  if (!parent) return out;
  for (const one of addedHere(it)) {
    if (one.name === name || fieldOf(one.text, GROUP)) continue;
    if (fieldOf(one.text, "state") === CLOSED || onPersonRoute(one.text)) continue;
    filed(it, one, parent);
    out.push(one.name);
  }
  return out;
}

function filed(it, one, parent) {
  const at = ticketAt(one.name);
  const text = parent
    ? withField(one.text, GROUP, parent, it.front)
    : withoutField(one.text, GROUP, it.front);
  it.disk.write(it.join(it.root, at), text);
  it.git.run(["add", at], true);
}

// The install RUNME.sh runs before every verb, run again over the merged tree. [[spec/design_output/work#the-merge-lands-the-truth]]
function installs(it) {
  it.proc.run(["sh", it.join(it.root, "src", "scripts", "install.sh")], {
    cwd: it.root,
  });
}

// [[spec/design_output/work#the-merge-lands-the-truth]]
// The check under --errors prints the red cases alone, so the merge hands on every row. [[spec/tickets/the-verbs-need-no-wrapper]]
function checkSays(it) {
  const ran = it.proc.run(verbArgv(it.node, it.root, ["check", "--errors"], it.join), {
    cwd: it.root,
  });
  return { ok: ran.exitCode === 0, says: String(ran.stdout ?? "").trim() };
}

// [[spec/design_output/work#a-merged-branch-closes]]
export function close(it, name, argv) {
  const forced = (argv ?? []).includes("--force");
  if (offTrunk(it, "close")) return 2;
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
    // [[spec/design_output/work#a-merged-branch-closes]] holds the order: trunk loses the marker on origin before the branch goes.
    if (marks(it, ticketNamed(branch), false)) {
      it.git.run(["commit", "-m", `${ticketNamed(branch)}: leaves the cloud`], true);
      if (!it.git.run(["push", "origin", TRUNK]).ok) {
        console.error(`The push of ${TRUNK} comes back refused, so ${branch} stands.`);
        continue;
      }
    }
    if (!it.git.run(["push", "origin", "--delete", branch]).ok) continue;
    it.git.run(["branch", "-D", branch], true);
    console.log(`${branch} is closed${inTrunk.has(branch) ? "" : ", unmerged"}.`);
    shut++;
  }
  return shut || !name ? 0 : 1;
}

// [[spec/design_output/work#a-row-per-group]]
