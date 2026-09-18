import { entriesIn } from "../../.claude/skills/level0/lib/schema.js";

export { HELPER, SPAWN, spawnPrompt } from "./spawn.js";

import { frontOf } from "./group.js";
import {
  asOf,
  handsAgain,
  holdAt,
  holdOf,
  notesSaid,
  parsed,
  readsOf,
  writeHold,
} from "./guidance-hand.js";
import { agentOf, BOX, handOf } from "./hand.js";

export const HOLDS = ".se/hold";
export const WORK = "work";
export const REFUSED = "refused";
export const WAIT = "wait";
export const ENGINE = "the engine";
export const MOST_MOVES = 64;
export const CUT = { said: 120, error: 160 };
export const DONE = "done";
export const CHECKED = "checked";
export const COMMENT = /^\s*<!--.*-->\s*$/;
export const ANSWERED = /^\s*answered:/;
export const FENCE = /^\s*(```|~~~)/;

// [[spec/design_output/pull#a-need-is-a-verb]]
export const BRANCH = [
  "new",
  "take",
  "sync",
  "done",
  "release",
  "merge",
  "close",
  "read",
  "review",
  "list",
  "pull",
  "guidance",
  "test",
];

// [[spec/design_output/pull#a-need-is-a-verb]]
export const VERBS = {
  branch: BRANCH,
  work: BRANCH,
  ticket: ["note", "update", "open"],
  retro: ["notes"],
};

// [[spec/design_output/pull#a-need-is-a-verb]]
export function holdsVerb(need, verbs = VERBS) {
  const [verb, sub] = String(need ?? "")
    .trim()
    .split(/\s+/);
  if (!verbs[verb]) return false;
  return !sub || verbs[verb].includes(sub);
}

export { agentOf, BOX, handOf, holdAt, holdOf, parsed };

// A second hand-out at one step hands the notes again on a refusal, a compaction or a moved hash alone. [[spec/design_output/pull#the-hand-and-the-hold]]
export function stillHeld(it, held) {
  const now = readsOf(it, stepReads(it, held));
  const why = handsAgain(held, now);
  if (why) writeHold(it, held.hand, { ...held, reads: now });
  say(REFUSED, [
    `${held.ticket} stands in your hand at ${held.step}, and one hand holds one ticket.`,
    `Hand it back: ./RUNME.sh branch pull ${held.ticket}${asOf(it, held) ? ` --as ${asOf(it, held)}` : ""} --pass, or --fail "why".`,
    ...(why
      ? notesSaid(
          it,
          now.map((one) => one.name),
        )
      : [
          "",
          `Read them again with ./RUNME.sh branch guidance${asOf(it, held) ? ` --as ${asOf(it, held)}` : ""}.`,
        ]),
  ]);
  return 1;
}

export function stepReads(it, held) {
  const at = it.join(it.root, ...String(held.path ?? "").split("/"));
  if (!held.path || !it.disk.exists(at))
    return (held.reads ?? []).map((one) => one.name);
  return leafOf(frontOf(it.disk.read(at)), held.step)?.reads ?? [];
}

// [[spec/design_output/pull#a-leaf-inherits]]
export function walkOf(front) {
  return entriesIn(front?.steps, "steps");
}

export function leavesOf(front) {
  return walkOf(front).filter((one) => one.leaf);
}

// [[spec/design_output/pull#a-leaf-inherits]]
export function leafOf(front, path) {
  const walk = walkOf(front);
  const leaf = walk.find((one) => one.path === path && one.leaf);
  if (!leaf) return null;

  const parts = leaf.path.split("/");
  const chain = [];
  for (let i = 1; i < parts.length; i++) {
    const found = walk.find((one) => one.path === parts.slice(0, i).join("/"));
    if (found) chain.push(found);
  }
  chain.push(leaf);

  const nearest = (key) => {
    for (let i = chain.length - 1; i >= 0; i--) {
      if (chain[i].said[key] !== undefined) return chain[i].said[key];
    }
    return undefined;
  };
  const sum = (key) =>
    chain
      .flatMap((one) => [one.said[key] ?? []].flat())
      .filter((one) => one !== undefined && one !== null && String(one).trim())
      .map((one) => String(one).trim());

  const leaves = walk.filter((one) => one.leaf);
  return {
    ...leaf,
    by: String(nearest("by") ?? "anyone"),
    not: nearest("not") === undefined ? "" : String(nearest("not")),
    on_fail: nearest("on_fail") === undefined ? "" : String(nearest("on_fail")),
    when: String(leaf.said.when ?? ""),
    does: String(leaf.said.does ?? ""),
    asks: String(leaf.said.asks ?? ""),
    options: [leaf.said.options ?? []].flat().map(String),
    reads: sum("reads").map(bare),
    needs: sum("needs"),
    checklist: sum("checklist"),
    evidence: [leaf.said.evidence ?? []].flat().filter((one) => one?.name),
    at: leaves.findIndex((one) => one.path === path),
    of: leaves.length,
    walk,
    leaves,
  };
}

// [[spec/design_output/pull#the-hand-out]]

export function say(word, rows) {
  const out = [word, ...rows.map((row) => `  ${row}`)];
  if (word === REFUSED) console.error(out.join("\n"));
  else console.log(out.join("\n"));
}

export function bare(said) {
  return String(said ?? "")
    .trim()
    .replace(/^\[\[|\]\]$/g, "")
    .trim();
}
