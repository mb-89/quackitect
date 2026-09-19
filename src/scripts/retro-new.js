// The retro's mint: one command writes the ticket off the retro route, opens it
// at that route's first leaf, and hands the leaf out. The copy verb stands in
// retro-collect.js beside this file.
// [[spec/design_input/the-agent-pulls-tickets]]

import { mintedNote } from "../../.claude/skills/level0/lib/schema.js";
import { firstLeaf } from "./group.js";
import { askRows, processAt } from "./process.js";
import { pull } from "./pull.js";
import { fromHold, schemasHere } from "./ticket.js";

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
      urgent: true,
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

  it.disk.makeDir(it.join(it.root, ...TICKETS.split("/")));
  it.disk.write(at, made.text);
  // The pull says what a hand reads next, and this verb writes none of those words again. [[spec/guidance/working]]
  return pull(it, ["pull", name]);
}

function flagOf(rest, flag) {
  const at = rest.indexOf(flag);
  return at >= 0 ? String(rest[at + 1] ?? "").trim() : "";
}
