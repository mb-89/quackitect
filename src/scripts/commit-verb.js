// The verb behind `./RUNME.sh commit "<message>"`: the message reads through
// the door's own rules, the commit lands, the check runs, and green pushes
// from a cloud box alone.
// [[spec/design_output/work#the-battery-answers-first]]

import { inCloud } from "../../.claude/skills/level0/lib/cloud.js";
import { line } from "../../.claude/skills/level0/lib/refuse.js";
import { messageFaults } from "../bridge/bash.js";

const USAGE = ['Usage: ./RUNME.sh commit "<message>" [--no-push]'];

export async function commitVerb(it, argv) {
  const said = argv ?? [];
  const message = said.find((one) => !one.startsWith("--")) ?? "";
  if (!message) {
    for (const row of USAGE) console.log(row);
    return 2;
  }

  const found = await messageFaults(message, it);
  if (found.length) {
    console.error("The voice rules refuse this message. Write it again.");
    for (const one of found) console.error(line(one, "the message"));
    return 2;
  }

  return landsAndPushes(it, said, message);
}

// Nothing stages before the message reads clean, so a refused message leaves the tree standing. [[spec/design_output/work#the-battery-answers-first]]
function landsAndPushes(it, argv, message) {
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
  const staged = it.git.run(["add", "-A"], true);
  if (!staged.ok) {
    console.error("The staging comes back refused, so the commit stands undone:");
    console.error(saidBy(staged));
    return 1;
  }
  const made = it.git.run(["commit", "-m", message], true);
  if (!made.ok) {
    it.git.run(["reset", "-q"], true);
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
  if (argv.includes("--no-push") || !inCloud(it.env)) return 0;

  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out.trim();
  if (!it.git.run(["push", "origin", branch]).ok) {
    console.error(`The push of ${branch} came back refused. The commit stands here.`);
    return 1;
  }
  console.log(`${branch} stands pushed.`);
  return 0;
}

// A run answers on two streams, and a read of one alone names the wrong line. [[spec/design_output/work#one-verb-feeds-that-stamp]]
export function saidBy(ran) {
  return [ran?.err, ran?.stderr, ran?.out, ran?.stdout]
    .map((one) => String(one ?? "").trim())
    .filter(Boolean)
    .join("\n");
}
