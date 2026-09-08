// Work branches. A branch named work/<name> carries one piece of work, and its
// HANDOVER.md carries the brief a cloud box reads. The frontmatter status says
// where that work stands.
// [[spec/design_output/work#the-round-trip]]

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const BRIEF = "HANDOVER.md";
const TRUNK = "main";

export const TODO = "todo";
export const HELD = "held";
export const DONE = "done";

export function work(root, argv) {
  const what = argv[0];
  const name = argv[1];
  const doing = { new: newWork, take, done: finish, read, list, collect };
  if (!doing[what]) {
    console.log("Usage: ./RUNME.sh work <verb>\n");
    console.log("  new <name>    cut work/<name> from main with the brief, and push");
    console.log(
      "  take          take the next branch marked todo, and print its brief",
    );
    console.log("  done          mark this branch done, commit and push");
    console.log("  read <name>   print what stands on work/<name>");
    console.log("  list          every work branch and its status");
    console.log("  collect       every branch marked done, waiting on a merge");
    return what ? 2 : 0;
  }
  return doing[what](root, name);
}

const git = (root, args, quiet) => {
  const ran = spawnSync("git", args, { cwd: root, encoding: "utf8", shell: false });
  if (!quiet && ran.status !== 0 && ran.stderr) console.error(ran.stderr.trim());
  return { ok: ran.status === 0, out: (ran.stdout ?? "").trim() };
};

export function statusOf(text) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(text ?? ""));
  if (!front) return "";
  const said = /^status:\s*(\S+)\s*$/m.exec(front[1]);
  return said ? said[1].toLowerCase() : "";
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

function whoTouched(root, branch) {
  const said = git(root, ["log", "-1", "--format=%an", `origin/${branch}`], true);
  return said.ok ? said.out : "";
}

function push(root, branch, was, why) {
  writeFileSync(join(root, BRIEF), was, { encoding: "utf8" });
  git(root, ["add", BRIEF], true);
  git(root, ["commit", "-m", `${branch}: ${why}`], true);
  return git(root, ["push", "origin", branch]).ok;
}

function newWork(root, name) {
  if (!name) {
    console.error("work new needs a name: ./RUNME.sh work new fix-lsp");
    return 2;
  }
  const branch = `work/${name}`;
  const path = join(root, BRIEF);

  if (!existsSync(path)) {
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

  const brief = setStatus(readFileSync(path, "utf8"), TODO);
  if (!git(root, ["switch", "-c", branch]).ok) return 1;
  if (!push(root, branch, brief, "the brief")) return 1;
  git(root, ["switch", TRUNK], true);
  git(root, ["push", "-u", "origin", branch], true);

  console.log(`${branch} is pushed as ${TODO}, and ${BRIEF} left ${TRUNK} with it.`);
  console.log("Point a cloud agent at that branch, or let a routine take it.");
  return 0;
}

// [[spec/design_output/work#why-a-routine-needs-this]]
function take(root) {
  const open = branches(root).filter((b) => statusOf(briefOf(root, b)) === TODO);
  if (!open.length) {
    console.log(`No work branch stands at ${TODO}. Nothing to take.`);
    return 0;
  }

  const branch = open[0];
  if (!git(root, ["switch", branch], true).ok) {
    if (!git(root, ["switch", "-c", branch, `origin/${branch}`]).ok) return 1;
  }
  git(root, ["reset", "--hard", `origin/${branch}`], true);

  const brief = readFileSync(join(root, BRIEF), "utf8");
  if (!push(root, branch, setStatus(brief, HELD), HELD)) {
    console.error("Somebody took this branch first. Run work take again.");
    return 1;
  }

  console.log(`You are on ${branch}, and it now stands at ${HELD}.`);
  console.log(`Write your result into ${BRIEF}, then run ./RUNME.sh work done.\n`);
  console.log(brief.trim());
  return 0;
}

function finish(root) {
  const branch = git(root, ["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  if (!branch.startsWith("work/")) {
    console.error(`work done runs on a work branch, and this is ${branch}.`);
    return 2;
  }
  const path = join(root, BRIEF);
  if (!existsSync(path)) {
    console.error(`Write your result to ${BRIEF} first. It is what comes back.`);
    return 2;
  }
  if (!push(root, branch, setStatus(readFileSync(path, "utf8"), DONE), DONE)) return 1;
  console.log(`${branch} stands at ${DONE}. The merge belongs to a person.`);
  return 0;
}

function read(root, name) {
  if (!name) {
    console.error("work read needs a name: ./RUNME.sh work read fix-lsp");
    return 2;
  }
  const said = briefOf(root, `work/${name}`);
  if (!said) {
    console.error(`work/${name} carries no ${BRIEF}.`);
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
    const status = statusOf(briefOf(root, branch)) || "no status";
    console.log(
      `${branch.padEnd(34)} ${status.padEnd(10)} ${whoTouched(root, branch)}`,
    );
  }
  return 0;
}

function collect(root) {
  const ready = branches(root).filter((b) => statusOf(briefOf(root, b)) === DONE);
  if (!ready.length) {
    console.log(`No branch stands at ${DONE}.`);
    return 0;
  }
  for (const branch of ready) {
    console.log(`${branch.padEnd(34)} ./RUNME.sh work read ${branch.slice(5)}`);
  }
  return 0;
}
