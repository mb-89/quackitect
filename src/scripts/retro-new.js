// The retro's mint: one command writes the ticket off the retro route, opens it
// at that route's first leaf, and hands the leaf out. The copy verb stands in
// retro-collect.js beside this file.
// [[spec/design_input/the-agent-pulls-tickets]]

import { mintedNote } from "../../.claude/skills/level0/lib/schema-mint.js";
import { firstLeaf } from "../engine/group.js";
import { askRows, processAt } from "./process.js";
import { pull } from "./pull.js";
import { fromHold, schemasHere } from "./ticket.js";
import { askFaults, askWarning, lineRefusal } from "./ticket-ask-lint.js";

const TICKETS = "spec/tickets";
const RETRO = "retro";
// The commit a name reads off, short enough for a name holding few words. [[spec/design_input/the-agent-pulls-tickets]]
const SHORT = 7;
const STANDING = "the owner asks for it";

// [[spec/design_input/the-agent-pulls-tickets]]
export function newRetro(it, argv) {
  const rest = (argv ?? []).slice(1);
  const tip = String(it.git.run(["rev-parse", "HEAD"], true).out ?? "").trim();
  const name = flagOf(rest, "--name") || `${RETRO}-${tip.slice(0, SHORT)}`;
  const why = flagOf(rest, "--why") || STANDING;

  const path = `${TICKETS}/${name}.md`;
  const at = it.join(it.root, ...path.split("/"));
  if (it.disk.exists(at)) {
    console.error(`${path} stands already. Name a retro nothing holds yet.`);
    return 1;
  }

  const held = processAt(it.disk, it.root, it.join, RETRO);
  if (held.why) {
    console.error(held.why);
    return 1;
  }

  const route = fromHold(held.route, null);
  const made = mintedNote(schemasHere(it), {
    kind: "ticket",
    path,
    fields: {
      state: "open",
      process: held.link,
      process_hash: held.hash,
      steps: route,
      step: firstLeaf(route),
      Ask: [askRows(held.ask), "", why].join("\n").trim(),
    },
  });
  if (made.why) {
    console.error(made.why);
    return 1;
  }
  // The --why line lands in the Ask, so the mint reads it through the lint's road before it writes. [[spec/design_output/pull#a-draft-opens]]
  const found = askFaults(it, path, made.text);
  if (found.refused.length) {
    console.error(lineRefusal(path, found.refused));
    return 1;
  }
  if (found.warned.length) console.error(askWarning(path, found.warned));

  it.disk.makeDir(it.join(it.root, ...TICKETS.split("/")));
  it.disk.write(at, made.text);
  // The pull says what a hand reads next, and this verb writes none of those words again. [[spec/guidance/working]]
  // The verb mints the retro for this session, so the queue lets its pull through. [[spec/design_output/config#the-engine-controls]]
  return pull({ ...it, minted: name }, ["pull", name]);
}

function flagOf(rest, flag) {
  const at = rest.indexOf(flag);
  return at >= 0 ? String(rest[at + 1] ?? "").trim() : "";
}
