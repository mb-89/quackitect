// Work branches. A branch named work/<name> carries one piece of work, and its
// HANDOVER.md carries the brief a cloud box reads. The frontmatter status says
// where that work stands.
// [[spec/design_output/work#the-round-trip]]


export const BRIEF = "HANDOVER.md";
const TRUNK = "main";

export const TODO = "todo";
export const HELD = "held";
export const DONE = "done";

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
    read,
    list,
    collect,
  };
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
    console.log("  list          every work branch and its status");
    console.log("  collect       every branch marked done, waiting on a merge");
    return what ? 2 : 0;
  }
  return doing[what](it, name);
}

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

function whoTouched(it, branch) {
  const said = it.git.run(["log", "-1", "--format=%an", `origin/${branch}`], true);
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

// [[spec/design_output/work#trunk-comes-in-before-the-work-starts]]
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
    "is the only one left. These steps put it back.",
    "",
    `1. Run \`./RUNME.sh work sync\` FIRST. It takes ${TRUNK} into this branch, so`,
    "   an old branch works against what the tree holds now. Resolve any conflict",
    "   before you start, because a conflict found later costs the work already",
    "   done.",
    "2. Commit and push each time you finish a thing. A cloud box dies and takes",
    "   its working tree with it.",
    `3. Write your result and your retro into \`${BRIEF}\`, at the root, replacing`,
    "   this brief. Say what surprises you and every dead end you walk into.",
    "4. Run `./RUNME.sh work done`, which sets the status and pushes.",
    "5. Run `./RUNME.sh work release` instead where you stop early, so the branch",
    "   goes back to `todo` for somebody else.",
    `6. Leave the merge into ${TRUNK} to a person. A cloud box opens no pull`,
    "   request, and trunk only ever comes towards you.",
    "",
  ].join("\n");
}

function newWork(it, name) {
  if (!name) {
    console.error("work new needs a name: ./RUNME.sh work new fix-lsp");
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
  const open = branches(it).filter((b) => statusOf(briefOf(it, b)) === TODO);
  if (!open.length) {
    console.log(`No work branch stands at ${TODO}. Nothing to take.`);
    return 0;
  }

  const branch = open[0];
  if (!it.git.run(["switch", branch], true).ok) {
    if (!it.git.run(["switch", "-c", branch, `origin/${branch}`]).ok) return 1;
  }
  it.git.run(["reset", "--hard", `origin/${branch}`], true);

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

function finish(it) {
  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  if (!branch.startsWith("work/")) {
    console.error(`work done runs on a work branch, and this is ${branch}.`);
    return 2;
  }
  const path = it.join(it.root, BRIEF);
  if (!it.disk.exists(path)) {
    console.error(`Write your result to ${BRIEF} first. It is what comes back.`);
    return 2;
  }
  if (!push(it, branch, setStatus(it.disk.read(path), DONE), DONE)) return 1;
  console.log(`${branch} stands at ${DONE}. The merge belongs to a person.`);
  return 0;
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

function list(it) {
  const all = branches(it);
  if (!all.length) {
    console.log("No work branch stands.");
    return 0;
  }
  for (const branch of all) {
    const status = statusOf(briefOf(it, branch)) || "no status";
    console.log(
      `${branch.padEnd(34)} ${status.padEnd(10)} ${whoTouched(it, branch)}`,
    );
  }
  return 0;
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
