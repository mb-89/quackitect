// Work branches. A branch named work/<name> carries one piece of work, and its
// HANDOVER.md carries the brief a cloud box reads.
// [[spec/design_output/work#the-round-trip]]

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const BRIEF = "HANDOVER.md";
const TRUNK = "main";

export function work(root, argv) {
  const what = argv[0];
  const name = argv[1];
  const doing = { new: newWork, take, read, list };
  if (!doing[what]) {
    console.log("Usage: ./RUNME.sh work <verb>\n");
    console.log("  new <name>    cut work/<name> from main, write the brief, push");
    console.log(
      "  take          take the next branch nobody holds, and print its brief",
    );
    console.log("  read <name>   print what came back on work/<name>");
    console.log("  list          every work branch, and whether it is held");
    return what ? 2 : 0;
  }
  return doing[what](root, name);
}

const git = (root, args, quiet) => {
  const ran = spawnSync("git", args, { cwd: root, encoding: "utf8", shell: false });
  if (!quiet && ran.status !== 0 && ran.stderr) console.error(ran.stderr.trim());
  return { ok: ran.status === 0, out: (ran.stdout ?? "").trim() };
};

function branches(root) {
  git(root, ["fetch", "--prune", "origin"], true);
  const said = git(root, ["ls-remote", "--heads", "origin", "work/*"], true);
  return said.out
    .split("\n")
    .filter(Boolean)
    .map((row) => row.split("\t")[1].replace("refs/heads/", ""));
}

function briefOf(root, branch) {
  const said = git(root, ["show", `origin/${branch}:${BRIEF}`], true);
  return said.ok ? said.out : "";
}

function heldBy(root, branch) {
  const said = git(root, ["log", "-1", "--format=%an", `origin/${branch}`], true);
  return said.ok ? said.out : "";
}

function newWork(root, name) {
  if (!name) {
    console.error("work new needs a name: ./RUNME.sh work new fix-lsp");
    return 2;
  }
  const branch = `work/${name}`;
  const brief = join(root, BRIEF);

  if (!existsSync(brief)) {
    console.error(`Write the brief to ${BRIEF} first, saying what this work is.`);
    console.error(
      "Level zero reads it on the branch and hands it to whoever works it.",
    );
    return 2;
  }

  const on = git(root, ["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  if (on !== TRUNK) {
    console.error(`work new cuts from ${TRUNK}, and this is ${on}.`);
    return 2;
  }

  if (!git(root, ["switch", "-c", branch]).ok) return 1;
  if (!git(root, ["add", BRIEF]).ok) return 1;
  if (!git(root, ["commit", "-m", `${branch}: the brief`]).ok) return 1;
  if (!git(root, ["push", "-u", "origin", branch]).ok) return 1;
  git(root, ["switch", TRUNK], true);

  console.log(`${branch} is pushed, and ${BRIEF} left ${TRUNK} with it.`);
  console.log("Point a cloud agent at that branch, or let a routine take it.");
  return 0;
}

// [[spec/design_output/work#why-a-routine-needs-this]]
function take(root) {
  const open = branches(root).filter((b) => briefOf(root, b));
  if (!open.length) {
    console.log("No work branch carries a brief. Nothing to take.");
    return 0;
  }

  const branch = open[0];
  if (!git(root, ["switch", branch]).ok) {
    if (!git(root, ["switch", "-c", branch, `origin/${branch}`]).ok) return 1;
  }
  git(root, ["reset", "--hard", `origin/${branch}`], true);

  const brief = readFileSync(join(root, BRIEF), "utf8");
  unlinkSync(join(root, BRIEF));
  writeFileSync(join(root, BRIEF), `# Held\n\nA session is working this branch.\n`, {
    encoding: "utf8",
  });
  git(root, ["add", BRIEF], true);
  git(root, ["commit", "-m", `${branch}: held`], true);

  if (!git(root, ["push", "origin", branch]).ok) {
    console.error("Somebody took this branch first. Run work take again.");
    return 1;
  }

  console.log(`You are on ${branch}. Its brief follows.`);
  console.log(`Write what you did back to ${BRIEF}, then commit and push.\n`);
  console.log(brief.trim());
  return 0;
}

function read(root, name) {
  if (!name) {
    console.error("work read needs a name: ./RUNME.sh work read fix-lsp");
    return 2;
  }
  const branch = `work/${name}`;
  const said = briefOf(root, branch);
  if (!said) {
    console.error(`${branch} carries no ${BRIEF}.`);
    return 1;
  }
  console.log(said);
  return 0;
}

function list(root) {
  const all = branches(root);
  if (!all.length) {
    console.log("No work branch stands.");
    return 0;
  }
  for (const branch of all) {
    const brief = briefOf(root, branch);
    const state = brief.startsWith("# Held") ? "held" : brief ? "open" : "no brief";
    console.log(`${branch.padEnd(34)} ${state.padEnd(9)} ${heldBy(root, branch)}`);
  }
  return 0;
}
