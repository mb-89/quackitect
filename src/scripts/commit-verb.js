// The verb behind `./RUNME.sh commit "<message>"`: the message reads through
// the door's own rules, the commit lands, the check runs, and green pushes.
// [[spec/design_output/work#the-battery-answers-first]]

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
  if (!it.git.run(["add", "-A"], true).ok) {
    console.error("git staged nothing, so the commit stands undone.");
    return 1;
  }
  const made = it.git.run(["commit", "-m", message], true);
  if (!made.ok) {
    it.git.run(["reset", "-q"], true);
    console.error("The commit door refuses this commit, so nothing lands:");
    console.error(made.err || made.out || "the commit answers nothing");
    return 1;
  }

  const ran = it.proc.run(
    [it.node, it.join(it.root, "src", "scripts", "cli.js"), "check"],
    { cwd: it.root },
  );
  if (ran.exitCode !== 0) {
    console.error("The check answers red on this commit, so no push reaches origin.");
    console.error(
      String(ran.stdout ?? "")
        .trim()
        .split("\n")
        .at(-1) ?? "",
    );
    return 1;
  }
  console.log("The commit lands, and the check answers green on it.");
  if (argv.includes("--no-push")) return 0;

  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out.trim();
  if (!it.git.run(["push", "origin", branch]).ok) {
    console.error(`The push of ${branch} came back refused. The commit stands here.`);
    return 1;
  }
  console.log(`${branch} stands pushed.`);
  return 0;
}
