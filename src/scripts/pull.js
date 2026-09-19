// The pull. One verb hands a hand the next leaf of a ticket, and the same verb
// takes the leaf back with a verdict. The engine checks the hand-back, writes
// the record, moves the step, commits, pushes, and hands out the next leaf.
// [[spec/design_output/pull#the-answers]]

import { actionables } from "../../.claude/skills/level0/lib/guidance.js";
import { shortOf } from "../../.claude/skills/level0/lib/runs.js";
import { checkNote } from "../../.claude/skills/level0/lib/schema.js";
import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";

export { HELPER, SPAWN, spawnPrompt } from "./spawn.js";

import {
  fieldOf,
  frontOf,
  OPEN,
  recordIn,
  TICKETS,
  withEntry,
  withField,
} from "./group.js";
import { dropHold, guidanceText, holdOf, writeHold } from "./guidance-hand.js";
import { handOf, roleOf, SAYS } from "./hand.js";
import { landed } from "./landed.js";
import {
  chapterOf,
  commandsRun,
  formFaults,
  handFaults,
  verdictIn,
  voiceFaults,
  withPayload,
} from "./pull-chapter.js";
import {
  handOut,
  namedGroup,
  ticketsHere,
  urgentGroup,
  withPersonStep,
} from "./pull-hand.js";
import { leafOf, leavesOf, REFUSED, say, stillHeld, WAIT, WORK } from "./pull-route.js";
import {
  became,
  entriesOf,
  failed,
  onward,
  passed,
  pushed,
  returnsOf,
  tipOf,
} from "./pull-writes.js";
import { NOTES, schemasHere } from "./ticket.js";

export * from "./pull-chapter.js";
export * from "./pull-hand.js";
export * from "./pull-route.js";
export * from "./pull-writes.js";

export function pull(it, argv) {
  const rest = (argv ?? []).slice(1);
  const name = positionalOf(rest);
  const as = flagValue(rest, "--as");
  const verdict = verdictFlag(rest);
  if (verdict.why) {
    console.error(verdict.why);
    return 2;
  }

  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  const onTrunk = branch === TRUNK;
  if (!onTrunk && !branch.startsWith("work/")) {
    console.error(
      `ticket pull runs on ${TRUNK} or a work branch, and this is ${branch}.`,
    );
    console.error(
      `Run ./RUNME.sh ticket pull from ${TRUNK}, which hands out work there.`,
    );
    return 2;
  }
  const group = onTrunk ? "" : branch.replace(/^work\//, "");
  // The owner sends a hand into a person's step, and the record names both. [[spec/design_output/pull#the-hand-rule]]
  it.ownerSays = rest.includes("--owner-says");
  const took = as ? `${handOf(it)} · ${as}` : handOf(it);
  const hand = it.ownerSays ? `${took} · ${SAYS}` : took;
  const plainHand = took;
  const held = holdOf(it, hand);
  const who = { hand, plainHand, branch, group, held, oneStep: Boolean(as) };
  it.argv = rest;

  if (rest.includes("--judge")) return judgeMaterial(it, held, name);
  if (rest.includes("--drop")) return dropped(it, who);
  if (verdict.said === "back") return takeBack(it, who, name, verdict.reason);
  // A name on trunk that is a group takes its branch. [[spec/design_output/pull#the-engine-takes-the-branch]]
  const named = onTrunk && name && !verdict.said ? namedGroup(it, name) : "";
  // A name with a leaf in hand hands that leaf back. A name with none asks for that ticket. [[spec/design_output/pull#the-hand-out]]
  const asking = Boolean(name) && !named && !verdict.said && !held;
  if (asking && it.binding === "queue") {
    console.error(`${name} stands behind the queue, because this session binds to it.`);
    console.error("Run ./RUNME.sh ticket pull with no name, and take what it hands you.");
    return 2;
  }
  who.wanted = asking ? name : "";
  if (!named && (verdict.said || (name && held))) return handBack(it, who, name, verdict);
  if (held) return stillHeld(it, held);
  // [[spec/design_output/pull#the-engine-takes-the-branch]]
  // A hand asking for one ticket takes no branch, because the queue answers neither. [[spec/design_output/pull#the-hand-out]]
  if (onTrunk && it.take && !asking) {
    if (it.cloud && !named) return it.take();
    const wanted = named || urgentGroup(it);
    if (wanted || it.ready?.()) return wanted ? it.take(wanted) : 0;
  }
  if (!fetched(it, branch)) return 1;
  return handOut(it, who);
}

// [[spec/design_output/pull#a-hand-of-its-own]]
export const TAKES = ["--as", "--fail", "--became", "--back", "--fields"];

export function positionalOf(rest) {
  for (let i = 0; i < rest.length; i++) {
    const one = rest[i];
    if (one.startsWith("--")) {
      if (TAKES.includes(one)) i++;
      continue;
    }
    return one;
  }
  return "";
}

export function flagValue(rest, flag) {
  const at = rest.indexOf(flag);
  if (at >= 0) return String(rest[at + 1] ?? "").trim();
  const inline = rest.find((one) => one.startsWith(`${flag}=`));
  return inline ? inline.slice(flag.length + 1).trim() : "";
}

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
    say(REFUSED, [`${held.step} takes no person step, and ${one.name} stands as it stood.`]);
    return 1;
  }

  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  const finding = landed(it, one, [`${held.step} waits for a person at ${put.path}`]);
  if (finding) {
    say(REFUSED, ["the hook refuses the commit, so the person step lands not:", finding]);
    return 1;
  }
  dropHold(it, hand);
  // The step stands in the record by now, so the branch is what a hand pushes. [[spec/design_output/pull#the-rejected-push]]
  if (!one.private && !pushed(it, branch)) {
    say(REFUSED, [
      `${put.path} stands on this box, and ${branch} moves under it.`,
      `Push ${branch}, then run ./RUNME.sh ticket pull.`,
    ]);
    return 1;
  }
  const who = {
    hand,
    plainHand: hand,
    branch,
    group: branch.replace(/^work\//, ""),
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

// [[spec/design_output/pull#the-hand-and-the-hold]]
export function dropped(it, who) {
  if (!who.held) {
    say(WAIT, ["nothing stands in your hand, so nothing drops."]);
    return 0;
  }
  dropHold(it, who.hand);
  say(WORK, [
    `the hold drops, and ${who.held.ticket} stays at ${who.held.step} for the next pull.`,
  ]);
  return 0;
}

// [[spec/design_output/pull#the-checks]]
export function judgeMaterial(it, held, name) {
  if (!held || (name && name !== held.ticket)) {
    console.log("null");
    return 1;
  }
  const at = it.join(it.root, ...held.path.split("/"));
  if (!it.disk.exists(at)) {
    console.log("null");
    return 1;
  }
  const text = it.disk.read(at);
  const leaf = leafOf(frontOf(text), held.step);
  const chapter = chapterOf(text, held.step);
  // The judge reads prose, and the leaf names which fields hold a line a shell runs. [[spec/tickets/the-group-leaves-at-todo]]
  const commands = new Set(
    (leaf?.evidence ?? [])
      .filter((field) => String(field.form) === "command")
      .map((field) => String(field.name)),
  );
  const evidence = [
    ...chapter.own,
    ...[...chapter.fields]
      .filter(([field, rows]) => rows.length && !commands.has(field))
      .flatMap(([field, rows]) => [`${field}:`, ...rows]),
  ].join("\n");
  const rules = (leaf?.reads ?? []).flatMap((path) =>
    actionables(guidanceText(it, path)),
  );
  console.log(
    JSON.stringify({ ticket: held.ticket, step: held.step, evidence, rules }),
  );
  return 0;
}

// [[spec/design_output/pull#the-hand-out]]
export function verdictFlag(rest) {
  const said = rest.find((one) => /^--(pass|fail|became|back)(=|$)/.test(one));
  if (!said) return { said: "" };
  const [, word, eq, inline] = /^--(pass|fail|became|back)(=)?(.*)$/.exec(said);
  const after = eq ? inline : (rest[rest.indexOf(said) + 1] ?? "");
  if (word === "pass") return { said: "pass" };
  if (!after || after.startsWith("--")) {
    const takes = { fail: "a reason", became: "the successor", back: "the leaf" }[word];
    return { why: `--${word} takes ${takes}: --${word} "..."` };
  }
  return { said: word, reason: after };
}

// [[spec/design_output/pull#the-pull-fetches-first]]
export function fetched(it, branch) {
  it.git.run(["fetch", "origin", branch], true);
  const behind = it.git.run(
    ["rev-list", "--count", `HEAD..origin/${branch}`],
    true,
  ).out;
  if (!behind || behind === "0") return true;
  if (it.git.run(["merge", "--ff-only", `origin/${branch}`], true).ok) return true;
  say(REFUSED, [
    `origin/${branch} holds ${behind} commit(s) this box lacks, and the two diverge.`,
    `Run git pull --rebase origin ${branch}, then pull again.`,
  ]);
  return false;
}

// [[spec/design_output/pull#what-a-hand-out-reads]]

export function takeBack(it, who, name, path) {
  if (who.held) {
    say(REFUSED, [
      `${who.held.ticket} stands in your hand at ${who.held.step}. Hand it back first.`,
    ]);
    return 1;
  }
  if (!name) {
    say(REFUSED, [
      "--back names the ticket and the leaf: ticket pull <ticket> --back <leaf>",
    ]);
    return 1;
  }
  if (!fetched(it, who.branch)) return 1;
  const one = ticketsHere(it).find((held) => held.name === name);
  if (!one) {
    say(REFUSED, [`${name} stands nowhere under ${TICKETS} or ${NOTES}.`]);
    return 1;
  }
  const leaf = leafOf(one.front, path);
  if (!leaf) {
    say(REFUSED, [`${path} names no leaf of ${name}.`]);
    return 1;
  }
  const wrote = entriesOf(one.front)
    .filter((entry) => String(entry.step) === path && !entry.skipped)
    .at(-1);
  // The record holds the role, so the read of it takes the role too. [[spec/design_output/pull#the-hand-rule]]
  const role = roleOf(who.hand);
  if (!wrote || String(wrote.hand ?? "") !== role) {
    say(REFUSED, [
      `${path} carries no hand-back by ${role}, so it is another hand's or nobody's.`,
    ]);
    return 1;
  }
  const tip = one.private ? "" : tipOf(it);
  const text = withEntry(one.text, {
    step: path,
    hand: role,
    hash_before: tip,
    hash_after: tip,
    returns: returnsOf(one.front, path) + 1,
    why: "the hand takes it back",
  });
  one.text = withField(withField(text, "step", path), "state", OPEN);
  landed(it, one, [`${role} takes ${path} back`]);
  if (!one.private && !pushed(it, who.branch)) {
    say(REFUSED, [
      `${who.branch} moves under this take-back, and one rebase fell short. Pull again.`,
    ]);
    return 1;
  }
  say(WORK, [`${name} stands at ${path} again, and the next pull hands it out.`]);
  return handOut(it, who);
}

// [[spec/design_output/pull#the-hand-back]]
export function handBack(it, who, name, verdict) {
  const held = who.held;
  if (!held) {
    say(REFUSED, [
      "nothing stands in your hand. Run ./RUNME.sh ticket pull to take a leaf.",
    ]);
    return 1;
  }
  if (name && name !== held.ticket) {
    say(REFUSED, [
      `${held.ticket} stands in your hand, and ${name} is another ticket.`,
    ]);
    return 1;
  }
  if (!held.path.startsWith(NOTES) && !fetched(it, who.branch)) return 1;

  const at = it.join(it.root, ...held.path.split("/"));
  if (!it.disk.exists(at)) {
    say(REFUSED, [`${held.path} stands nowhere, so nothing hands back.`]);
    dropHold(it, who.hand);
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

  // [[spec/design_output/pull#the-hand-back-matches-the-hold]]
  const done = recordIn(one.text).find(
    (entry) =>
      String(entry.step) === held.step &&
      !entry.skipped &&
      entry.hash_after &&
      String(entry.hash_before ?? "") === held.hash,
  );
  if (done) {
    if (!one.private && !pushed(it, who.branch)) {
      say(REFUSED, [
        `${who.branch} moves under this hand-back. Pull again to push it.`,
      ]);
      return 1;
    }
    return onward(it, who, [
      `${held.ticket} at ${held.step} answered already, and the record holds it.`,
    ]);
  }
  if ((fieldOf(one.text, "step") || leavesOf(one.front)[0]?.path) !== held.step) {
    dropHold(it, who.hand);
    say(REFUSED, [
      `${held.ticket} stands at ${fieldOf(one.text, "step") || "no step"} now, and the hold names ${held.step}.`,
      "The take is stale, so the hold drops. Pull again.",
    ]);
    return 1;
  }
  if (
    held.hash &&
    !it.git.run(["merge-base", "--is-ancestor", held.hash, "HEAD"], true).ok
  ) {
    dropHold(it, who.hand);
    say(REFUSED, [
      `the take hash ${shortOf(held.hash)} trails ${who.branch}, so the hold drops. Pull again.`,
    ]);
    return 1;
  }

  const leaf = leafOf(one.front, held.step);
  if (!leaf) {
    say(REFUSED, [`${held.step} names no leaf of ${held.ticket}.`]);
    return 1;
  }

  // A payload rides the hold until the checks pass, so a refused word reaches no disk. [[spec/design_output/pull#the-fields-ride-the-payload]]
  const payload = flagValue(it.argv ?? [], "--fields") || held.payload || "";
  if (payload) {
    const put = withPayload(one.text, held.step, payload);
    if (put.why) {
      say(REFUSED, [put.why]);
      return 1;
    }
    Object.assign(one, { stood: one.text, payload });
    one.text = put.text;
    one.front = frontOf(one.text);
  }
  const verdictField = leaf.evidence.find((field) => field.form === "verdict");
  if (verdictField && verdict.said) {
    say(REFUSED, [
      `${leaf.path} holds the verdict field ${verdictField.name}, so the field decides and the flag stays off.`,
    ]);
    return 1;
  }

  // [[spec/design_output/pull#the-checks]]
  const found = [];
  const schema = schemasHere(it).get("ticket");
  if (schema) {
    for (const fault of checkNote(one.text, schema, held.path, schemasHere(it))) {
      found.push(`${held.path}:${fault.line} ${fault.message}`);
    }
  }
  const chapter = chapterOf(one.text, leaf.path);
  // A became leaves the leaf's fields to the successor, so the hold and the hand alone decide. [[spec/design_output/pull#became]]
  const becomes = verdict.said === "became";
  if (!becomes) {
    found.push(...formFaults(it, one, leaf, chapter, held));
    if (!found.length) found.push(...voiceFaults(it, one, leaf, chapter));
  }
  // A fail runs its commands for the record, and none of them refuses it. [[spec/design_output/pull#the-fail]]
  const fails = verdict.said === "fail";
  const answered =
    found.length || becomes ? [] : commandsRun(it, leaf, chapter, fails ? [] : found);
  found.push(...handFaults(it, one, leaf, who.hand, held));

  if (found.length) return refused(it, who, one, leaf, held, found);

  const said = verdictField
    ? verdictIn(chapter.fields.get(verdictField.name) ?? [])
    : { said: verdict.said || "pass", reason: verdict.reason ?? "" };

  if (said.said === "became")
    return became(it, who, one, leaf, held, said.reason, answered);
  if (said.said === "fail")
    return failed(it, who, one, leaf, held, said.reason, answered);
  return passed(it, who, one, leaf, held, answered);
}

// [[spec/design_output/pull#the-hand-back-refused]]
export function refused(it, who, one, leaf, held, found) {
  const count = Number(held.refused ?? 0) + 1;
  // The cap sends the leaf back with the findings, because a step a box inserts waits for a person nobody sends. [[spec/design_output/pull#the-hand-back-refused]]
  if (Number(it.refusals) > 0 && count >= Number(it.refusals)) {
    if (one.stood) one.text = one.stood;
    say(REFUSED, [...found, "", `${count} refusals in a row, so ${leaf.path} goes back.`]);
    return failed(
      it,
      who,
      one,
      leaf,
      held,
      `the hand-back met refused ${count} times: ${found[0]}`,
      [],
    );
  }
  writeHold(it, who.hand, {
    ...held,
    refused: count,
    payload: one.payload ?? held.payload,
  });
  say(REFUSED, [
    ...found,
    "",
    `Fix it, and ${one.name} stays in hand at ${leaf.path}.`,
  ]);
  return 1;
}

// [[spec/design_output/pull#the-fields-ride-the-payload]]
