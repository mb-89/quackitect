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
import { handOf } from "./hand.js";
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
  withSettleStep,
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
      `branch pull runs on ${TRUNK} or a work branch, and this is ${branch}.`,
    );
    console.error(
      `Run ./RUNME.sh branch pull from ${TRUNK}, which hands out work there.`,
    );
    return 2;
  }
  const group = onTrunk ? "" : branch.replace(/^work\//, "");
  const hand = as ? `${handOf(it)} · ${as}` : handOf(it);
  const held = holdOf(it, hand);
  const who = { hand, branch, group, held, oneStep: Boolean(as) };
  it.argv = rest;

  if (rest.includes("--judge")) return judgeMaterial(it, held, name);
  if (rest.includes("--drop")) return dropped(it, who);
  if (verdict.said === "back") return takeBack(it, who, name, verdict.reason);
  // A name on trunk that is a group takes its branch, and any other name hands a ticket back. [[spec/design_output/pull#the-engine-takes-the-branch]]
  const named = onTrunk && name && !verdict.said ? namedGroup(it, name) : "";
  if (!named && (verdict.said || name)) return handBack(it, who, name, verdict);
  if (held) return stillHeld(it, held);
  // [[spec/design_output/pull#the-engine-takes-the-branch]]
  if (onTrunk && it.take) {
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
  const evidence = [
    ...chapter.own,
    ...[...chapter.fields].flatMap(([field, rows]) => [`${field}:`, ...rows]),
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
      "--back names the ticket and the leaf: branch pull <ticket> --back <leaf>",
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
  if (!wrote || String(wrote.hand ?? "") !== who.hand) {
    say(REFUSED, [
      `${path} carries no hand-back by ${who.hand}, so it is another hand's or nobody's.`,
    ]);
    return 1;
  }
  const tip = one.private ? "" : tipOf(it);
  const text = withEntry(one.text, {
    step: path,
    hand: who.hand,
    hash_before: tip,
    hash_after: tip,
    returns: returnsOf(one.front, path) + 1,
    why: "the hand takes it back",
  });
  one.text = withField(withField(text, "step", path), "state", OPEN);
  landed(it, one, [`${who.hand} takes ${path} back`]);
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
      "nothing stands in your hand. Run ./RUNME.sh branch pull to take a leaf.",
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
  const answered = found.length || becomes ? [] : commandsRun(it, leaf, chapter, found);
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
  if (Number(it.refusals) > 0 && count >= Number(it.refusals)) {
    if (one.stood) one.text = one.stood;
    const put = withSettleStep(
      it,
      one,
      leaf.path,
      `the hand-back met refused ${count} times: ${found[0]}`,
    );
    const finding = put.path
      ? landed(it, one, [`${leaf.path} goes to a hand at ${put.path}`])
      : "";
    if (finding)
      found.push(
        `the hook refuses the commit, so the settle step lands not: ${finding}`,
      );
    if (put.path && !finding) {
      dropHold(it, who.hand);
      if (!one.private) pushed(it, who.branch);
      say(REFUSED, [
        ...found,
        "",
        `${count} refusals in a row, so ${put.path} now waits for a hand.`,
      ]);
      return 1;
    }
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
