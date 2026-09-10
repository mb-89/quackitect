// The verb behind `./RUNME.sh work review <name>`. It gathers what a reader
// needs, answers the two questions a program owns, and prints the report. No
// model runs here.
// [[spec/design_output/review#what-the-verb-gathers]]

import {
  BRIEF,
  DIFF_CAP,
  report,
  retroIn,
  WORKTREE,
} from "../../.claude/skills/level0/lib/review.js";
import { TOOLS } from "../../.claude/skills/level0/lib/tools.js";

const TRUNK = "main";
const LOUD = 5;

export function review(it, name, argv) {
  if (!name) {
    console.error("work review needs a name: ./RUNME.sh work review fix-lsp");
    return 2;
  }
  const branch = name.startsWith("work/") ? name : `work/${name}`;
  it.git.run(["fetch", "--prune", "origin"], true);

  const ref = refFor(it, branch);
  if (!ref) {
    console.error(`${branch} stands nowhere, here or on origin.`);
    console.error("Run ./RUNME.sh work list to see every branch that does.");
    return 1;
  }
  const trunk = refFor(it, TRUNK) ?? TRUNK;
  const first = firstCommit(it, trunk, ref);
  if (!first) {
    console.error(`${ref} carries no commit beyond ${trunk}, so there is nothing to read.`);
    return 1;
  }

  const material = gather(it, { branch, ref, trunk, first });
  if ((argv ?? []).includes("--json")) {
    console.log(JSON.stringify(material));
    return 0;
  }
  console.log(report(material));
  return 0;
}

// [[spec/design_output/review#what-the-verb-gathers]]
function gather(it, at) {
  const handback = show(it, `${at.ref}:${BRIEF}`);
  return {
    branch: at.branch,
    ref: at.ref,
    trunk: at.trunk,
    brief: show(it, `${at.first}:${BRIEF}`),
    handback,
    retro: retroIn(handback),
    stat: it.git.run(["diff", "--stat", `${at.trunk}..${at.ref}`], true).out,
    diff: capped(it.git.run(["diff", `${at.trunk}..${at.ref}`], true).out),
    check: checkOn(it, at),
  };
}

function refFor(it, name) {
  for (const ref of [`origin/${name}`, name]) {
    if (it.git.run(["rev-parse", "--verify", "--quiet", ref], true).ok) return ref;
  }
  return "";
}

function firstCommit(it, trunk, ref) {
  const said = it.git.run(["rev-list", "--reverse", `${trunk}..${ref}`], true);
  return said.out.split("\n").filter(Boolean)[0] ?? "";
}

function show(it, ref) {
  const said = it.git.run(["show", ref], true);
  return said.ok ? said.out : "";
}

function capped(text) {
  const said = String(text ?? "");
  if (said.length <= DIFF_CAP) return said;
  return `${said.slice(0, DIFF_CAP)}\n\n[the diff runs on past ${DIFF_CAP} characters]`;
}

// [[spec/design_output/review#a-worktree-runs-the-check]]
function checkOn(it, at) {
  const where = it.join(it.root, WORKTREE, at.branch.split("/").join("-"));
  it.disk.remove(where);
  it.git.run(["worktree", "prune"], true);

  if (!it.git.run(["worktree", "add", "--detach", where, at.ref], true).ok) {
    return { ok: false, code: null, says: `no worktree opens on ${at.ref}` };
  }

  const survey = it.join(it.root, TOOLS);
  if (it.disk.exists(survey)) {
    it.disk.makeDir(it.join(where, ".se"));
    it.disk.write(it.join(where, TOOLS), it.disk.read(survey));
  }

  const ran = it.proc.run([it.node, "src/scripts/cli.js", "check"], { cwd: where });
  it.git.run(["worktree", "remove", "--force", where], true);
  it.disk.remove(where);
  it.git.run(["worktree", "prune"], true);

  const ok = ran.exitCode === 0;
  return { ok, code: ran.exitCode, says: ok ? "" : whatFailed(ran) };
}

// [[spec/design_output/review#a-worktree-runs-the-check]]
export function whatFailed(ran) {
  const lines = `${ran.stdout ?? ""}\n${ran.stderr ?? ""}`.split(/\r?\n/);
  const failed = lines
    .map((one) => one.trim())
    .filter((one) => /^not ok \d/.test(one) || /^\s*\d+ +[A-Za-z]+\.[A-Za-z]/.test(one));
  if (failed.length) return failed.slice(0, LOUD).join("\n");

  const last = lines.map((one) => one.trim()).filter(Boolean);
  return last.slice(-LOUD).join("\n");
}
