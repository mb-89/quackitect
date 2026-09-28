// The verb behind `./RUNME.sh commit "<message>"`: the message reads through
// the door's own rules, the commit lands, the check runs, and green pushes
// from a cloud box alone.
// [[spec/design_output/work#the-battery-answers-first]]

import {
  cloudHere,
  deskRefusal,
  onDesk,
} from "../../.claude/skills/level0/lib/cloud.js";
import {
  markersIn,
  mergeRefusal,
  stagedFault,
  unmergedIn,
} from "../../.claude/skills/level0/lib/markers.js";
import { line } from "../../.claude/skills/level0/lib/refuse.js";
import { formIn, refusesIn } from "../../.claude/skills/level0/lib/warnings.js";
import { messageFaults, messageNote } from "../bridge/bash.js";
import { MESSAGE_HOW, ticketFault, ticketOf } from "../engine/named.js";
import { FOLDER as UNDONE } from "../../.claude/skills/level0/lib/undo.js";
import { coldIn, probeCold } from "./probe-cold.js";
import { BY as RENAMED } from "./rename.js";

const USAGE = ['Usage: ./RUNME.sh commit "<message>" [<path>...] [--no-push]'];

export async function commitVerb(it, argv) {
  const said = argv ?? [];
  const [message = "", ...paths] = said.filter((one) => !one.startsWith("--"));
  if (!message) {
    for (const row of USAGE) console.log(row);
    return 2;
  }

  // [[spec/design_output/level0#a-write-names-its-ticket]]
  const unnamed = ticketFault(ticketOf(message), it, MESSAGE_HOW);
  if (unnamed) {
    console.error(unnamed);
    return 2;
  }

  const all = await messageFaults(message, it);
  const found = refusesIn(all);
  if (found.length) {
    console.error("The voice rules refuse this message. Write it again.");
    for (const one of found) console.error(line(one, "the message"));
    return 2;
  }
  // A break of form lands with the commit, and the rows reach the output and the log. [[spec/design_output/work#the-battery-answers-first]]
  const warned = formIn(all).map((one) => ({ ...one, file: "the message" }));
  if (warned.length) {
    console.error(messageNote(warned));
    it.log?.say?.(
      "warn",
      "commit",
      `${warned.length} line(s) of a commit message stand at warning`,
      {
        rule: warned[0].rule,
        detail: message,
      },
    );
  }

  return landsAndPushes(it, said, message, paths);
}

// Nothing stages before the message reads clean, so a refused message leaves the tree standing. [[spec/design_output/work#the-battery-answers-first]]
async function landsAndPushes(it, argv, message, paths) {
  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out.trim();
  // A desk lands nothing on a work branch, so the refusal comes before the tests run. [[spec/design_output/work#a-desk-works-on-trunk]]
  if (onDesk(it, branch)) {
    console.error(deskRefusal(`this commit lands nowhere on ${branch}`).join("\n"));
    return 2;
  }
  // A merge lands through this verb once its files carry no marker, so a marker refuses before anything stages. [[spec/design_output/work#no-commit-carries-a-marker]]
  const unresolved = markedUnmerged(it);
  if (unresolved) {
    console.error(unresolved);
    return 1;
  }
  // The tests gate the commit, and the check after it stamps the commit that lands. [[spec/design_output/work#the-battery-answers-first]]
  const tested = it.proc.run(
    [it.node, it.join(it.root, "src", "scripts", "cli.js"), "test"],
    {
      cwd: it.root,
    },
  );
  if (tested.exitCode !== 0) {
    console.error("The tests answer red, so nothing stages and nothing lands:");
    console.error(saidBy(tested) || "the test run answers nothing");
    return 1;
  }
  // The paths a call names land alone, so one hand's landing leaves another's files standing. [[spec/design_output/work#one-verb-feeds-that-stamp]]
  const moved = movedFrom(it, paths);
  const named = [...paths, ...moved];
  const only = named.length ? ["--", ...named] : [];
  // git add refuses a path standing neither on disk nor in the index, and the commit still reaches it through HEAD. [[spec/tickets/commit-stages-a-moved-path]]
  const adds = [...paths, ...moved.filter((from) => stagable(it, from))];
  const staged = it.git.run(
    ["add", "-A", ...(adds.length ? ["--", ...adds] : [])],
    true,
  );
  if (!staged.ok) {
    console.error("The staging comes back refused, so the commit stands undone:");
    console.error(saidBy(staged));
    return 1;
  }
  const marked = stagedFault(it.git, only);
  if (marked) {
    unstages(it, only);
    console.error(marked);
    return 1;
  }
  if ((await coldGate(it, only)) !== 0) {
    unstages(it, only);
    return 1;
  }
  const made = it.git.run(["commit", "-m", message, ...only], true);
  if (!made.ok) {
    unstages(it, only);
    console.error("The commit comes back refused, so nothing lands:");
    console.error(saidBy(made));
    return 1;
  }

  const ran = it.proc.run(
    [it.node, it.join(it.root, "src", "scripts", "cli.js"), "check"],
    { cwd: it.root },
  );
  if (ran.exitCode !== 0) {
    console.error("The check answers red on this commit, so no push reaches origin.");
    // The check writes its faults to the error stream, so one stream names the wrong line. [[spec/design_output/work#one-verb-feeds-that-stamp]]
    console.error(saidBy(ran) || "the check answers nothing");
    return 1;
  }
  console.log("The commit lands, and the check answers green on it.");
  // A desk's verb pushes nothing, and a cloud box pushes, because it dies with its tree. [[spec/guidance/working]] [[spec/guidance/cloud/cloud]]
  if (argv.includes("--no-push") || !cloudHere(it)) return 0;

  if (!it.git.run(["push", "origin", branch]).ok) {
    console.error(`The push of ${branch} came back refused. The commit stands here.`);
    return 1;
  }
  console.log(`${branch} stands pushed.`);
  return 0;
}

// Each unmerged file still carrying a marker on disk, by the line it stands on. [[spec/design_output/work#no-commit-carries-a-marker]]
function markedUnmerged(it) {
  const marked = [];
  for (const file of unmergedIn(it.git).keys()) {
    const at = it.join(it.root, ...file.split("/"));
    if (!it.disk?.exists?.(at)) continue;
    const [line] = markersIn(it.disk.read(at));
    if (line) marked.push({ file, line });
  }
  return mergeRefusal([], marked);
}

// A named path a staged rename lands takes its old path with it, so the deletion rides the same commit. [[spec/design_output/work#one-verb-feeds-that-stamp]]
function movedFrom(it, paths) {
  if (!paths.length) return [];
  const staged = it.git.run(["diff", "--cached", "--name-status", "-M"], true).out;
  const out = [];
  const touched = new Set();
  for (const row of staged.split("\n")) {
    const [how, from, to] = row.split("\t");
    touched.add(from);
    if (/^R/.test(how ?? "") && paths.includes(to) && !paths.includes(from))
      out.push(from);
  }
  // A journaled old path joins where the staged delta names it or git still holds it, so a move that landed long ago adds no pathspec git refuses. [[spec/tickets/commit-skips-landed-moves]]
  const stands = (from) => touched.has(from) || stagable(it, from);
  for (const one of journaledMoves(it)) {
    for (const path of paths) {
      const under =
        path === one.to
          ? ""
          : path.startsWith(`${one.to}/`)
            ? path.slice(one.to.length)
            : null;
      if (under === null) continue;
      const from = `${one.from}${under}`;
      if (!paths.includes(from) && !out.includes(from) && stands(from)) out.push(from);
    }
  }
  return out;
}

// A path git add matches stands on disk or in the index. [[spec/tickets/commit-stages-a-moved-path]]
function stagable(it, path) {
  if (it.disk?.exists?.(it.join(it.root, ...path.split("/")))) return true;
  return Boolean(it.git.run(["ls-files", "--cached", "--", path], true).out?.trim());
}

// The rename verb journals each move, so a rewrite past git's similarity cut still names its old path. [[spec/tickets/rename-detection-misses-rewrites]]
function journaledMoves(it) {
  const folder = it.join(it.root, ...UNDONE.split("/"));
  if (!it.disk?.exists?.(folder)) return [];
  const out = [];
  for (const row of it.disk.list(folder)) {
    if (row.kind !== "file" || !row.name.endsWith(".json")) continue;
    try {
      const entry = JSON.parse(String(it.disk.read(it.join(folder, row.name))));
      if (entry?.by === RENAMED && entry.moved?.to) out.push(entry.moved);
    } catch {}
  }
  return out;
}

// A staged file on the cold path runs the cold probe over the staged delta, so no hand remembers it. [[spec/design_output/level0#the-cold-probe]]
export async function coldGate(it, only) {
  const listed = it.git.run(
    ["diff", "--cached", "--name-only", "--no-renames", ...only],
    true,
  );
  const touched = coldIn(listed.out.split("\n").filter(Boolean));
  if (!touched.length) return 0;
  const client = clientOf(it);
  if (!client) {
    console.error(
      `claude stands nowhere on this box, so ${touched.join(", ")} lands only where the cold probe runs: run ./RUNME.sh tools, or land it from a box holding claude.`,
    );
    return 1;
  }
  const delta = it.proc.run(
    ["git", "diff", "--cached", "--binary", "--no-renames", ...only],
    {
      cwd: it.root,
    },
  );
  if (delta.exitCode !== 0) {
    console.error(
      "The staged delta comes back refused, so the cold probe runs nothing:",
    );
    console.error(saidBy(delta));
    return 1;
  }
  const lines = [];
  const probe = it.cold ?? probeCold;
  const code = await probe(
    it.root,
    it,
    client,
    (one) => lines.push(one),
    delta.stdout ?? "",
  );
  if (code !== 0) {
    console.error(
      "The cold probe answers FAIL on the staged change, so nothing lands:",
    );
    for (const one of lines) console.error(one);
    return 1;
  }
  console.log(`The cold probe passes on the staged change to ${touched.join(", ")}.`);
  return 0;
}

// A reset naming a pathspec unstages and leaves MERGE_HEAD standing, so a refused merge commit stays a merge. [[spec/design_output/work#one-verb-feeds-that-stamp]]
function unstages(it, only) {
  it.git.run(["reset", "-q", ...(only.length ? only : ["--", "."])], true);
}

// The survey names where claude stands, and a name the disk lacks stands nowhere. [[spec/design_output/tools#where-a-caller-looks]]
function clientOf(it) {
  const at = String(it.claude ?? "");
  return at && it.disk.exists(at) ? at : "";
}

// A run answers on two streams, and a read of one alone names the wrong line. [[spec/design_output/work#one-verb-feeds-that-stamp]]
export function saidBy(ran) {
  return [ran?.err, ran?.stderr, ran?.out, ran?.stdout]
    .map((one) => String(one ?? "").trim())
    .filter(Boolean)
    .join("\n");
}
