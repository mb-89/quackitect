// The dry probe's clear: a session past a low handover key takes the handover
// and the clear off the real pull, ends its turn, and the conversation clears.
// The next one pulls the read, takes its leaf in the same answer, commits, and
// ends its turn with no second clear. [[spec/tickets/the-clear-hands-back-the-leaf]]

import { LOCAL } from "../../.claude/skills/level0/lib/config.js";
import { RESUME } from "../bridge/handover.js";

// A key under the fill the harness reports, so the first measure marks the session due. [[spec/tickets/the-clear-continues-the-session]]
const KEY = 500;
const PULL_WAIT = 240_000;
// The span the clear the plugin queues takes to reach the harness. [[spec/tickets/the-clear-continues-the-session]]
const SETTLE = 3000;
const TICK = 50;
// The characters a line of evidence shows. [[spec/tickets/the-clear-continues-the-session]]
const SHOWN = 160;
const HANDOVER_FILE = ".se/HANDOVER.md";
const HANDOVER_TEXT = "# Handover\n\nThe dry probe stands nothing in hand, and the queue holds what waits.\n";
const ANSWER = "The handover stands, and the clear ends this turn.";
// The ticket the probe's own work branch carries, so the pull reads a group still open whatever the clone stands on. [[spec/tickets/the-clear-runs-live-remote]]
const GROUP = "dry-probe-clears";
// The leaf the probe's group carries across the clear, and the words each pull past the clear answers. [[spec/tickets/the-clear-hands-back-the-leaf]]
const LEAF = "dry-probe-leaf";
// The line a tagged ticket's front matter carries. [[spec/tickets/probe-clone-drops-free-tags]]
const LEAF_TEXT = `---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change
    evidence:
      - name: says
        form: text
        says: what changes
process: [[spec/processes/trivial]]
group: ${GROUP}
---

# Ask

The leaf the dry probe carries across the clear.

# do

## says

<!-- what changes -->

# Discussion
`;
const READ_HELD = "read-handover stands in your hand.";
const LEAF_HANDED = `work  ${LEAF} at do`;

// The turn's two ends, in the order the live host names: the Stop, then the turn's completion. [[spec/tickets/the-clear-runs-live-remote]]
export const ENDS = ["classic.Stop", "turn.complete"];

// The session runs on past the key: due, the handover ticket, the clear ticket, and the turn's end. [[spec/tickets/the-clear-continues-the-session]]
export async function clearRun(it, tree, raise, seen, outer) {
  const env = inClone(tree, outer);
  const runs = [];
  const pull = (...words) => {
    const ran = it.proc.run([it.join(tree, "RUNME.sh"), "ticket", "pull", ...words], {
      cwd: tree,
      env,
      timeoutMs: PULL_WAIT,
    });
    runs.push({ words: words.join(" "), exit: ran.exitCode, said: `${ran.stdout}${ran.stderr}` });
    return `${ran.stdout}${ran.stderr}`;
  };
  const own = grouped(it, tree, env);
  if (own) runs.push(own);
  keyed(it, tree);
  seen.commands.length = 0;
  seen.prompts.length = 0;
  await raise("prompt.submit", { text: "carry on" }, async (said) => said, { kind: "composer" });
  await raise("tool.call", { tool: "Read", file_path: it.join(tree, "README.md") });
  pull();
  it.disk.write(it.join(tree, HANDOVER_FILE), HANDOVER_TEXT);
  pull("handover", "--pass");
  for (const event of ENDS) {
    const e = event === "turn.complete" ? { reason: "answer", answer: ANSWER } : {};
    await raise(event, e, async () => (event === "turn.complete" ? { text: ANSWER } : {}));
  }
  await settled(seen);
  const commands = [...seen.commands];
  const prompts = [...seen.prompts];
  const after = { pulled: pull(), read: pull("--pass"), committed: committed(it, tree) };
  for (const event of ENDS) {
    const e = event === "turn.complete" ? { reason: "answer", answer: ANSWER } : {};
    await raise(event, e, async () => (event === "turn.complete" ? { text: ANSWER } : {}));
  }
  after.clears = seen.commands.filter((one) => one === "clear").length;
  return { runs, commands, prompts, after };
}

// The work the leaf makes lands as a commit on the box's branch, and origin carries it. [[spec/tickets/the-clear-hands-back-the-leaf]]
function committed(it, tree) {
  const commit = it.proc.run(
    ["git", "-c", "user.name=probe", "-c", "user.email=probe@probe", "commit", "-q", "--allow-empty", "-m", `${LEAF}: the leaf lands`],
    { cwd: tree, timeoutMs: PULL_WAIT },
  );
  const pushed = it.proc.run(["git", "update-ref", `refs/remotes/origin/work/${GROUP}`, "HEAD"], {
    cwd: tree,
    timeoutMs: PULL_WAIT,
  });
  const fell = [commit, pushed].find((one) => one.exitCode !== 0);
  return { exit: fell?.exitCode ?? 0, said: fell ? `${fell.stdout}${fell.stderr}` : "" };
}

// A verb finds its root off QUACKITECT_ROOT before its folder, and the index hands its own root to every child, so the clone names itself. [[spec/tickets/the-clear-carries-no-local-work]]
function inClone(tree, env) {
  return { ...env, QUACKITECT_ROOT: tree };
}

// The probe mints its own group and stands on its work branch, as origin holds it. [[spec/tickets/the-clear-carries-no-local-work]]
export function grouped(it, tree, env) {
  const minted = it.proc.run(
    [it.join(tree, "RUNME.sh"), "mint", "ticket", `spec/tickets/${GROUP}.md`, "--process=trivial"],
    { cwd: tree, env: inClone(tree, env), timeoutMs: PULL_WAIT },
  );
  it.disk.write(it.join(tree, "spec", "tickets", `${LEAF}.md`), LEAF_TEXT);
  unparked(it, tree);
  const branched = it.proc.run(["git", "checkout", "-q", "-B", `work/${GROUP}`], {
    cwd: tree,
    timeoutMs: PULL_WAIT,
  });
  // The untag lands as a commit on the probe's branch, so the handover meets no tracked change the box alone holds. [[spec/tickets/probe-clone-drops-free-tags]]
  it.proc.run(
    ["git", "-c", "user.name=probe", "-c", "user.email=probe@probe", "commit", "-q", "-a", "--allow-empty", "-m", "dry probe: no ticket of the tree stands tagged"],
    { cwd: tree, timeoutMs: PULL_WAIT },
  );
  // A box's work branch stands on origin, so the handover finds no commit the box alone holds. [[spec/tickets/the-clear-carries-no-local-work]]
  const pushed = it.proc.run(["git", "update-ref", `refs/remotes/origin/work/${GROUP}`, "HEAD"], {
    cwd: tree,
    timeoutMs: PULL_WAIT,
  });
  const fell = [minted, branched, pushed].find((one) => one.exitCode !== 0);
  return fell ? { words: `mint ${GROUP}`, exit: fell.exitCode, said: `${fell.stdout}${fell.stderr}` } : null;
}

// The clone carries the tickets its source box parks, and a parked ticket goes out ahead of the probe's leaf, so the clone drops every park. [[spec/tickets/prompt-flags-follow-prompt-verb]]
function unparked(it, tree) {
  const parked = it.proc.run(["git", "grep", "-l", "^todo: true$", "--", "spec/tickets"], { cwd: tree, timeoutMs: PULL_WAIT });
  const files = String(parked.stdout ?? "").split("\n").filter(Boolean);
  for (const file of files) {
    const at = it.join(tree, file);
    it.disk.write(at, it.disk.read(at).replace(/^todo: true\r?\n/m, ""));
  }
  if (files.length === 0) return;
  it.proc.run(
    ["git", "-c", "user.name=probe", "-c", "user.email=probe@probe", "commit", "-q", "-m", "the probe unparks its clone", "--", ...files],
    { cwd: tree, timeoutMs: PULL_WAIT },
  );
}

function keyed(it, tree) {
  const at = it.join(tree, LOCAL);
  let was = {};
  try {
    was = JSON.parse(it.disk.read(at));
  } catch {}
  it.disk.makeDir(it.join(at, ".."));
  it.disk.write(at, `${JSON.stringify({ ...was, context: { ...was.context, handoverAt: KEY } })}\n`);
}

async function settled(seen) {
  for (let waited = 0; waited < SETTLE && seen.prompts.length === 0; waited += TICK) {
    await new Promise((done) => setTimeout(done, TICK));
  }
}

// The conversation clears, and the resume prompt opens the next one. [[spec/tickets/the-clear-continues-the-session]]
export function clearHeld(rows, seen) {
  const run = seen.cleared;
  if (!run) return { pass: false, evidence: "the session never reaches the clear" };
  const failed = run.runs.find((one) => one.exit !== 0);
  if (failed) {
    const before = run.runs
      .slice(0, run.runs.indexOf(failed))
      .map((one) => `the pull ${one.words || "alone"} answers ${firstLine(one.said)}; `)
      .join("");
    return { pass: false, evidence: `${before}the pull ${failed.words} answers ${failed.exit}: ${firstLine(failed.said)}` };
  }
  if (!run.commands.includes("clear")) {
    const fell = rows.find((one) => /the clear the handover asks for fails/.test(String(one.said ?? "")));
    return {
      pass: false,
      evidence: fell ? `the clear fails: ${fell.detail}` : `no /clear runs, and the pull ${run.runs.at(-1)?.words} answers: ${firstLine(run.runs.at(-1)?.said)}`,
    };
  }
  const prompt = run.prompts.at(-1) ?? "";
  if (prompt !== RESUME) return { pass: false, evidence: `the next conversation opens on: ${firstLine(prompt) || "no prompt"}` };
  return afterHeld(run.after ?? {});
}

// Past the clear the pull hands the read, the read's pass hands the leaf in the same answer, the commit lands, and the turn's end runs no second clear. [[spec/tickets/the-clear-hands-back-the-leaf]]
function afterHeld(after) {
  const pulled = String(after.pulled ?? "");
  const read = String(after.read ?? "");
  if (!pulled.includes(READ_HELD)) return { pass: false, evidence: `the pull after the clear answers: ${firstLine(pulled) || "nothing"}` };
  if (!read.includes(LEAF_HANDED)) return { pass: false, evidence: `the read's pass hands no leaf: ${firstLine(read) || "nothing"}` };
  if (after.committed?.exit !== 0) return { pass: false, evidence: `the leaf's commit answers ${after.committed?.exit}: ${firstLine(after.committed?.said)}` };
  if (after.clears !== 1) return { pass: false, evidence: `the turn after the clear runs ${after.clears} clear(s) in all, and one stands` };
  return { pass: true, evidence: "/clear runs, the resume prompt opens, the read hands the leaf, the commit lands, and no second clear runs" };
}

const firstLine = (text) => String(text ?? "").trim().split("\n").at(-1).slice(0, SHOWN);
