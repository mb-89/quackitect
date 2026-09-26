// The verb behind `./RUNME.sh commit "<message>"`: the message reads through
// the door's own rules, the commit lands, the check runs, and green pushes
// from a cloud box alone.
// [[spec/design_output/work#the-battery-answers-first]]

import {
  cloudHere,
  deskRefusal,
  onDesk,
} from "../../.claude/skills/level0/lib/cloud.js";
import { line } from "../../.claude/skills/level0/lib/refuse.js";
import { formIn, refusesIn } from "../../.claude/skills/level0/lib/warnings.js";
import { messageFaults, messageNote } from "../bridge/bash.js";
import { MESSAGE_HOW, ticketFault, ticketOf } from "../engine/named.js";

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
function landsAndPushes(it, argv, message, paths) {
  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out.trim();
  // A desk lands nothing on a work branch, so the refusal comes before the tests run. [[spec/design_output/work#a-desk-works-on-trunk]]
  if (onDesk(it, branch)) {
    console.error(deskRefusal(`this commit lands nowhere on ${branch}`).join("\n"));
    return 2;
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
  const named = [...paths, ...movedFrom(it, paths)];
  const only = named.length ? ["--", ...named] : [];
  const staged = it.git.run(["add", "-A", ...only], true);
  if (!staged.ok) {
    console.error("The staging comes back refused, so the commit stands undone:");
    console.error(saidBy(staged));
    return 1;
  }
  const made = it.git.run(["commit", "-m", message, ...only], true);
  if (!made.ok) {
    it.git.run(["reset", "-q", ...only], true);
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
  // A desk's verb pushes nothing, and a cloud box pushes, because it dies with its tree. [[spec/guidance/working]] [[spec/guidance/cloud]]
  if (argv.includes("--no-push") || !cloudHere(it)) return 0;

  if (!it.git.run(["push", "origin", branch]).ok) {
    console.error(`The push of ${branch} came back refused. The commit stands here.`);
    return 1;
  }
  console.log(`${branch} stands pushed.`);
  return 0;
}

// A named path a staged rename lands takes its old path with it, so the deletion rides the same commit. [[spec/design_output/work#one-verb-feeds-that-stamp]]
function movedFrom(it, paths) {
  if (!paths.length) return [];
  const staged = it.git.run(["diff", "--cached", "--name-status", "-M"], true).out;
  const out = [];
  for (const row of staged.split("\n")) {
    const [how, from, to] = row.split("\t");
    if (/^R/.test(how ?? "") && paths.includes(to) && !paths.includes(from))
      out.push(from);
  }
  return out;
}

// A run answers on two streams, and a read of one alone names the wrong line. [[spec/design_output/work#one-verb-feeds-that-stamp]]
export function saidBy(ran) {
  return [ran?.err, ran?.stderr, ran?.out, ran?.stdout]
    .map((one) => String(one ?? "").trim())
    .filter(Boolean)
    .join("\n");
}
