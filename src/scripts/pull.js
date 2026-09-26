// The pull. One verb hands a hand the next leaf of a ticket, and the same verb
// takes the leaf back with a verdict. The engine checks the hand-back, writes
// the record, moves the step, commits, pushes, and hands out the next leaf.
// [[spec/design_output/pull#the-answers]]

import { onDesk } from "../../.claude/skills/level0/lib/cloud.js";
import { forEvidence } from "../../.claude/skills/level0/lib/guidance.js";
import { shortOf } from "../../.claude/skills/level0/lib/runs.js";
import { checkNote } from "../../.claude/skills/level0/lib/schema.js";
import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";

export { HELPER, SPAWN, spawnPrompt } from "./pull-spawn.js";

import {
  CLOSED,
  fieldOf,
  frontOf,
  OPEN,
  recordIn,
  TICKETS,
  withEntry,
  withField,
} from "../engine/group.js";
import { inHand } from "../engine/named.js";
import { ephemeralPull } from "./ephemeral-pull.js";
import { dropHold, guidanceText, holdOf, writeHold } from "./guidance-hand.js";
import {
  chapterOf,
  commandsRun,
  formFaults,
  handFaults,
  verdictIn,
  voiceFaults,
  warnsOf,
  withPayload,
  workAnswer,
} from "./pull-chapter.js";
import {
  branchTaken,
  deskRefused,
  handOut,
  namedGroup,
  ticketsHere,
} from "./pull-hand.js";
import { byPerson, handOf, roleOf, SAYS } from "./pull-hand-of.js";
import { landed } from "./pull-landed.js";
import {
  DONE,
  handsOut,
  leafOf,
  leavesOf,
  QUEUE,
  REFUSED,
  say,
  stillHeld,
  WAIT,
  WORK,
} from "./pull-route.js";
import {
  answeredBy,
  became,
  entriesOf,
  failed,
  minted,
  onward,
  passed,
  pushed,
  returnsOf,
  sentOut,
  tipOf,
} from "./pull-writes.js";
import { NOTES, schemasHere } from "./ticket.js";

export * from "./pull-chapter.js";
export * from "./pull-escalate.js";
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
  // A desk works on trunk alone, so its pull on a work branch reads nothing further. [[spec/design_output/work#a-desk-works-on-trunk]]
  if (onDesk(it, branch)) return deskRefused(`the pull hands nothing out on ${branch}`);
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
  // An ephemeral ticket stands in the hold alone, so its hand-back reads no file. [[spec/design_input/the-clear-hands-ephemeral-tickets#an-ephemeral-ticket-stands-held]]
  if (held?.ephemeral) return ephemeralPull(it, who, verdict);
  if (verdict.said === "back") return takeBack(it, who, name, verdict.reason);
  // A working todo holds the hand as a ticket does, so the pull answers it ahead of every road that hands work out. [[spec/tickets/the-todo-joins-the-queue]] [[spec/tickets/the-todo-road-stands-first]]
  // A pull naming the working item itself takes that ticket, because the shell door wants it named there first. [[spec/design_output/pull#the-hand-out]]
  const todo =
    held || verdict.said ? "" : inHand({ disk: it.disk, root: it.root }).todo;
  if (todo && todo !== name) {
    say(WAIT, [
      `the todo ${todo} stands in hand, so the pull hands nothing else out.`,
      "Finish it, and take it off the plan, then pull again.",
    ]);
    return 0;
  }
  // A name on trunk that is a group takes its branch on a cloud box, and a desk refuses it. [[spec/design_output/pull#the-engine-takes-the-branch]]
  const named = onTrunk && name && !verdict.said ? namedGroup(it, name) : "";
  // A name with a leaf in hand hands that leaf back. A name with none asks for that ticket. [[spec/design_output/pull#the-hand-out]]
  const asking = Boolean(name) && !named && !verdict.said && !held;
  // A ticket a verb mints for this session passes the queue, and so does a person's hand or the owner's word. [[spec/design_output/config#the-engine-controls]]
  if (asking && it.binding === QUEUE && name !== it.minted && !byPerson(it, took)) {
    console.error(`${name} stands behind the queue, because this session binds to it.`);
    console.error(
      "Run ./RUNME.sh ticket pull with no name, and take what it hands you.",
    );
    return 2;
  }
  who.wanted = asking ? name : "";
  if (!named && (verdict.said || (name && held)))
    return handBack(it, who, name, verdict);
  if (held) return stillHeld(it, held);
  // The plain pull hands out at the queue alone, and this gate stands above every road it closes. A group a person names passes it. [[spec/design_output/config#the-engine-controls]]
  if (!asking && !named && !handsOut(it.binding)) {
    say(WAIT, [
      `this session binds to ${it.binding}, so the pull hands nothing out.`,
      `Name a ticket to take one, or set engine.binding to ${QUEUE}.`,
    ]);
    return 0;
  }
  // [[spec/design_output/pull#the-engine-takes-the-branch]]
  // A hand asking for one ticket takes no branch, because the queue answers neither. [[spec/design_output/pull#the-hand-out]]
  if (onTrunk && it.take && !asking) {
    const took = branchTaken(it, named);
    if (took !== null) return took;
  }
  if (!fetched(it, branch)) return 1;
  if (group && closedGroup(it, group)) return groupDone(group);
  return handOut(it, who);
}

// [[spec/design_output/pull#a-closed-group-hands-nothing]]
function closedGroup(it, group) {
  const one = ticketsHere(it).find((held) => !held.private && held.name === group);
  return Boolean(one) && fieldOf(one.text, "state") === CLOSED;
}

// [[spec/design_output/pull#a-closed-group-hands-nothing]]
function groupDone(group) {
  say(DONE, [
    `${group} stands closed, so work/${group} takes no more work.`,
    `Run ./RUNME.sh branch done, then ./RUNME.sh ticket pull from ${TRUNK}.`,
  ]);
  return 0;
}

// [[spec/design_output/pull#a-hand-of-its-own]]
export const TAKES = ["--as", "--fail", "--became", "--answered", "--back", "--fields"];

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
  if (!held?.path || (name && name !== held.ticket)) {
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
  // A label names the note beside the number, so one label reaches one rule. [[spec/design_output/pull#the-checks]]
  const rules = (leaf?.reads ?? []).flatMap((path) =>
    forEvidence(guidanceText(it, path), path),
  );
  console.log(
    JSON.stringify({ ticket: held.ticket, step: held.step, evidence, rules }),
  );
  return 0;
}

// [[spec/design_output/pull#the-hand-out]]
export function verdictFlag(rest) {
  const said = rest.find((one) => /^--(pass|fail|became|answered|back)(=|$)/.test(one));
  if (!said) return { said: "" };
  const [, word, eq, inline] = /^--(pass|fail|became|answered|back)(=)?(.*)$/.exec(
    said,
  );
  const after = eq ? inline : (rest[rest.indexOf(said) + 1] ?? "");
  if (word === "pass") return { said: "pass" };
  if (!after || after.startsWith("--")) {
    const takes = {
      fail: "a reason",
      became: "the successor",
      answered: "the ticket answering the ask",
      back: "the leaf",
    }[word];
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
  const sent = one.private ? { ok: true } : pushed(it, who.branch);
  if (!sent.ok) {
    say(REFUSED, [
      "The take-back stands on this box, and its push reaches no origin.",
      ...sent.why,
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
    // The record holds this hand-back already, so the pull pushes it again. [[spec/design_output/pull#the-rejected-push]]
    const sent = sentOut(it, one, who.branch);
    if (!sent.ok) {
      say(REFUSED, [
        `${held.ticket} at ${held.step} answered, and the record holds this hand-back already. Its push reaches no origin.`,
        ...sent.why,
      ]);
      return 1;
    }
    return onward(it, who, [
      `${held.ticket} at ${held.step} answered already, and the record holds it.`,
      ...sent.why,
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
  // A bare name on a leaf the verdict field decides nowhere shows the leaf, and lands nothing. [[spec/design_output/pull#bare-pulls-show-the-leaf]]
  if (!verdict.said && !leaf.evidence.some((field) => field.form === "verdict")) {
    console.log(workAnswer(it, one, leaf));
    return 0;
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
  // A became leaves the leaf's fields to the successor, and an answered leaves them to the answerer, so the hold and the hand alone decide. [[spec/design_output/pull#became]]
  const becomes = verdict.said === "became" || verdict.said === "answered";
  const warned = [];
  if (!becomes) {
    found.push(...formFaults(it, one, leaf, chapter, held));
    if (!found.length) found.push(...voiceFaults(it, one, leaf, warned));
  }
  // A fail runs its commands for the record, and none of them refuses it. [[spec/design_output/pull#the-fail]]
  const fails = verdict.said === "fail";
  const answered =
    found.length || becomes ? [] : commandsRun(it, leaf, chapter, fails ? [] : found);
  found.push(...handFaults(it, one, leaf, who.hand, held));

  if (found.length) return refused(it, who, one, leaf, held, found);
  warnsOf(warned);

  const said = verdictField
    ? verdictIn(chapter.fields.get(verdictField.name) ?? [])
    : { said: verdict.said || "pass", reason: verdict.reason ?? "" };

  if (said.said === "became")
    return became(it, who, one, leaf, held, said.reason, answered);
  if (said.said === "answered")
    return answeredBy(it, who, one, leaf, held, said.reason, answered);
  if (said.said === "fail")
    return failed(it, who, one, leaf, held, said.reason, answered);
  // [[spec/design_output/pull#a-finding-rides-out]]
  if (said.findings) return minted(it, who, one, leaf, held, said.findings, answered);
  return passed(it, who, one, leaf, held, answered);
}

// [[spec/design_output/pull#the-hand-back-refused]]
export function refused(it, who, one, leaf, held, found) {
  const count = Number(held.refused ?? 0) + 1;
  // The cap sends the leaf back with the findings, and the fail takes its own road from there, to a person past its cap. [[spec/design_output/pull#the-hand-back-refused]]
  if (Number(it.refusals) > 0 && count >= Number(it.refusals)) {
    if (one.stood) one.text = one.stood;
    say(REFUSED, [
      ...found,
      "",
      `${count} refusals in a row, so ${leaf.path} goes back.`,
    ]);
    const why = `the hand-back met refused ${count} times: ${found[0]}`;
    return failed(it, who, one, leaf, held, why, []);
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
