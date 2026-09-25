// The escalation: a hand reaching no answer without a person puts a person step
// into the route, and the question it asks.
// [[spec/design_output/pull#a-person-step-goes-in]]

import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import { frontOf } from "../engine/group.js";
import { dropHold, holdOf } from "./guidance-hand.js";
import { flagValue } from "./pull.js";
import { withPersonStep } from "./pull-hand.js";
import { handOf } from "./pull-hand-of.js";
import { landed } from "./pull-landed.js";
import { REFUSED, say } from "./pull-route.js";
import { onward, pushed } from "./pull-writes.js";
import { NOTES } from "./ticket.js";

// The one road a step goes in by, so a hand reaching no answer without a person says so. [[spec/design_output/pull#a-person-step-goes-in]]
export function escalate(it, argv) {
  const rest = (argv ?? []).slice(1);
  const options = wordsIn(flagValue(rest, "--options"));
  const question = askedIn(rest);
  if (!question) {
    say(REFUSED, [
      "branch escalate takes the question a person answers, as its words.",
    ]);
    return 2;
  }
  // A helper reaches its own hold, so the hand reads the way the pull writes it. [[spec/design_output/pull#a-hand-of-its-own]]
  const as = flagValue(rest, "--as");
  const hand = as ? `${handOf(it)} · ${as}` : handOf(it);
  const held = holdOf(it, hand);
  if (!held) {
    say(REFUSED, [
      "nothing stands in your hand, so no leaf takes a person step.",
      "Run ./RUNME.sh ticket pull to take a leaf, then run this again.",
    ]);
    return 1;
  }
  const at = it.join(it.root, ...held.path.split("/"));
  if (!it.disk.exists(at)) {
    say(REFUSED, [`${held.path} stands nowhere, so nothing takes a person step.`]);
    return 1;
  }
  const one = {
    name: held.ticket,
    path: held.path,
    at,
    private: held.path.startsWith(NOTES),
  };
  one.text = it.disk.read(at);
  one.front = frontOf(one.text);

  const put = withPersonStep(it, one, held.step, question, options);
  if (!put.path) {
    say(REFUSED, [
      `${held.step} takes no person step, and ${one.name} stands as it stood.`,
    ]);
    return 1;
  }

  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  const finding = landed(it, one, [`${held.step} waits for a person at ${put.path}`]);
  if (finding) {
    say(REFUSED, [
      "the hook refuses the commit, so the person step lands not:",
      finding,
    ]);
    return 1;
  }
  dropHold(it, hand);
  // The step stands in the record by now, so the branch is what a hand pushes. [[spec/design_output/pull#the-rejected-push]]
  const sent = one.private ? { ok: true } : pushed(it, branch);
  if (!sent.ok) {
    say(REFUSED, [
      `${put.path} stands on this box, and its push reaches no origin.`,
      ...sent.why,
    ]);
    return 1;
  }
  const who = {
    hand,
    plainHand: hand,
    branch,
    // Trunk names no group, as the pull reads it. [[spec/design_output/pull#the-engine-takes-the-branch]]
    group: branch === TRUNK ? "" : branch.replace(/^work\//, ""),
    held: null,
  };
  return onward(it, who, [
    `${one.name} at ${held.step} waits for a person at ${put.path}.`,
  ]);
}

// The question is every word the flags leave, so a hand writes it with no quotes. [[spec/design_output/pull#a-person-step-goes-in]]
export function askedIn(rest) {
  const out = [];
  for (let i = 0; i < rest.length; i++) {
    const one = rest[i];
    if (one.startsWith("--")) {
      if (ESCALATES.includes(one)) i++;
      continue;
    }
    out.push(one);
  }
  return out.join(" ").trim();
}

export const ESCALATES = ["--options", "--as"];

export function wordsIn(said) {
  const out = String(said ?? "")
    .split(",")
    .map((one) => one.trim())
    .filter(Boolean);
  return out.length ? out : undefined;
}
