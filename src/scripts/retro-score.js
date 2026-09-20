// The score verb: it counts the improvement tickets earlier retros mint, and
// says how many of them still stand open in the tree. The score step reads that
// count against this window's numbers, so an improvement nobody lands shows.
// [[spec/design_input/the-agent-pulls-tickets]]

import { fieldOf, NOTE_END, ticketNamed } from "../engine/group.js";

const TICKETS = "spec/tickets";
const RETRO = "retro-";
const CLOSED = "closed";

// [[spec/design_input/the-agent-pulls-tickets]]
export function score(it) {
  const rows = mintedBy(it);
  if (!rows.length) {
    console.log("No retro mints an improvement yet, so this one scores nothing.");
    return 0;
  }

  const open = rows.filter((one) => one.state !== CLOSED);
  console.log(
    `${rows.length} improvement(s) stand in the tree, and ${open.length} stay open.`,
  );
  for (const one of rows) console.log(`  ${one.name} ${one.state}, off ${one.group}`);
  return 0;
}

// An improvement names its retro under group, so the count reads the field. [[spec/design_input/the-agent-pulls-tickets]]
function mintedBy(it) {
  const at = it.join(it.root, ...TICKETS.split("/"));
  if (!it.disk.exists(at)) return [];
  const out = [];
  for (const one of it.disk.list(at)) {
    if (one.kind !== "file" || !one.name.endsWith(NOTE_END)) continue;
    const name = ticketNamed(one.name);
    if (name.startsWith(RETRO)) continue;
    const text = read(it, it.join(at, one.name));
    const group = fieldOf(text, "group");
    if (!group.startsWith(RETRO)) continue;
    out.push({ name, group, state: fieldOf(text, "state") || "open" });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function read(it, at) {
  try {
    return it.disk.read(at);
  } catch {
    return "";
  }
}
