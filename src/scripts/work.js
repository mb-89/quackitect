// Work branches. A branch named work/<name> carries one piece of work, and its
// HANDOVER.md carries the brief a cloud box reads. The frontmatter status says
// where that work stands.
// [[spec/design_output/work#the-round-trip]]

import { overLong } from "../../.claude/skills/level0/lib/names.js";
import { saysGreen, STAMP, stampOf } from "../../.claude/skills/level0/lib/runs.js";
import { review } from "./review.js";

export const BRIEF = "HANDOVER.md";
const TRUNK = "main";

// [[spec/design_output/work#a-merged-branch-closes]]
export const MINE = /^(work|claude)\//;

export const TODO = "todo";
export const HELD = "held";

// [[spec/design_output/work#the-routine-a-verb-names]]
export const ROUTINE = { name: "do_work", id: "trig_01KCYQ2oxi7rnCuBZYJsnLnQ" };
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
    merge,
    close,
    read,
    review,
    list,
    collect,
    trigger,
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
    return what ? 2 : 0;
  }
  return doing[what](it, name, argv);
}

const LOUD = ["new", "take", "done", "release", "merge", "close"];

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
  return out.map((one) => one.trim().replace(/^work\//, "")).filter(Boolean);
}

function frontField(text, key) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(text ?? ""));
  if (!front) return "";
  const said = new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m").exec(front[1]);
  return said ? said[1] : "";
}

export function waitingOn(text, standing) {
  return dependsOn(text).filter((name) => {
    const status = standing.get(`work/${name}`);
    return status === TODO || status === HELD;
  });
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

  const briefs = new Map(branches(it).map((b) => [b, briefOf(it, b)]));
  const standing = new Map([...briefs].map(([b, text]) => [b, statusOf(text)]));
  const open = [...briefs].filter(([, text]) => statusOf(text) === TODO);

  if (!open.length) {
    console.log(`No work branch stands at ${TODO}. Nothing to take.`);
    return 0;
  }

  const free = open.filter(([, text]) => !waitingOn(text, standing).length);
  if (!free.length) {
    console.log(`Every branch at ${TODO} waits for another. Nothing to take.`);
    for (const [b, text] of open) {
      console.log(`  ${b} waits for ${waitingOn(text, standing).join(", ")}`);
    }
    return 0;
  }

  free.sort(
    (a, b) =>
      URGENCY.indexOf(urgencyOf(a[1])) - URGENCY.indexOf(urgencyOf(b[1])) ||
      a[0].localeCompare(b[0]),
  );

  const branch = free[0][0];
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

// [[spec/design_output/work#the-routine-a-verb-names]]
export function freeNow(briefs) {
  const standing = new Map([...briefs].map(([b, text]) => [b, statusOf(text)]));
  return [...briefs]
    .filter(([, text]) => statusOf(text) === TODO)
    .filter(([, text]) => !waitingOn(text, standing).length)
    .map(([branch]) => branch);
}

function trigger(it) {
  const free = freeNow(new Map(branches(it).map((b) => [b, briefOf(it, b)])));

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
  const path = it.join(it.root, BRIEF);
  if (!it.disk.exists(path)) {
    console.error(`Write your result to ${BRIEF} first. It is what comes back.`);
    return 2;
  }
  const said = batterySays(it);
  if (!said.green) {
    console.error(`${branch} claims nothing yet: ${said.says}.`);
    console.error("Commit your work, run ./RUNME.sh check, then run work done.");
    return 1;
  }

  if (!push(it, branch, setStatus(it.disk.read(path), DONE), DONE)) return 1;
  console.log(`${branch} stands at ${DONE}, and ${said.says}.`);
  console.log("The merge belongs to a person.");
  return 0;
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

function list(it) {
  const all = branches(it);
  if (!all.length) {
    console.log("No work branch stands.");
    return 0;
  }
  const briefs = new Map(all.map((b) => [b, briefOf(it, b)]));
  const standing = new Map([...briefs].map(([b, text]) => [b, statusOf(text)]));
  for (const branch of all) {
    const text = briefs.get(branch);
    const status = statusOf(text) || "no status";
    const waits = waitingOn(text, standing);
    const why = waits.length ? `waits for ${waits.join(", ")}` : urgencyOf(text);
    console.log(`${branch.padEnd(34)} ${status.padEnd(6)} ${why.padEnd(24)}`);
  }
  return 0;
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
  const status = statusOf(briefOf(it, branch));
  if (status !== DONE) {
    console.error(`${branch} stands at ${status || "no status"}, so it is not ready.`);
    return 1;
  }

  if (!it.git.run(["merge", "--no-ff", "--no-edit", `origin/${branch}`]).ok) {
    console.error(`${branch} conflicts. Resolve it, commit, then run work close.`);
    return 1;
  }

  if (it.git.run(["rm", "--cached", "-q", BRIEF], true).ok) {
    dropBrief(it);
    it.git.run(["commit", "--amend", "--no-edit"], true);
  }

  console.log(`${branch} is merged. Run ./RUNME.sh check, then work close.`);
  return 0;
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

  const inTrunk = new Set(
    it.git
      .run(["branch", "-r", "--merged", `origin/${TRUNK}`], true)
      .out.split("\n")
      .map((row) => row.trim().replace("origin/", ""))
      .filter((row) => MINE.test(row)),
  );

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
