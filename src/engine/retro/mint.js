// The retro's tickets: one a class the verify step leaves open, minted off
// the standard route, its ask written and the draft opened.
// [[spec/guidance/retro/verify]]

import { CLASSES, recordOf } from "./classes.js";
import { homeOf } from "./timeline.js";

export const TICKETS = "spec/tickets";
// A class the verify step closes opens on one of these, and where or why follows. [[spec/guidance/retro/verify]]
export const CLOSED = ["fixed:", "past:"];
const OPEN = "open";
const ROUTE = "standard";
const CLI = ["node", "src/scripts/cli.js"];

// The ask a class hands its ticket, as the chapter the mint leaves empty. [[spec/guidance/retro/verify]]
export function askOf(ticket) {
  const lines = [
    String(ticket.gain ?? "").trim(),
    "",
    String(ticket.breaks ?? "").trim(),
    "",
  ];
  for (const one of ticket.done_when ?? []) lines.push(`- ${String(one).trim()}`);
  return `${lines.join("\n")}\n`;
}

// The ask chapter, written where the mint leaves its placeholders. [[spec/guidance/retro/verify]]
export function withAsk(text, ask) {
  const rows = text.split("\n");
  const head = rows.findIndex((one) => one.trim() === "# Ask");
  if (head < 0) return text;
  let end = head + 1;
  while (end < rows.length && !rows[end].startsWith("# ")) end += 1;
  return [...rows.slice(0, head + 1), "", ask, ...rows.slice(end)].join("\n");
}

// Every fault standing between the classes and their tickets. [[spec/guidance/retro/verify]]
export function mintFaults(record) {
  const faults = [];
  for (const one of record.classes) {
    const status = String(one.status ?? "");
    const closed = CLOSED.some(
      (word) => status.startsWith(word) && status.slice(word.length).trim(),
    );
    if (status !== OPEN && !closed) {
      faults.push(
        `${one.id} carries no status of open, ${CLOSED.join(" or ")} with its reason`,
      );
      continue;
    }
    if (status !== OPEN || one.tickets?.length) continue;
    for (const field of ["name", "gain", "breaks"]) {
      if (!String(one.ticket?.[field] ?? "").trim())
        faults.push(`${one.id} stands open, and its ticket carries no ${field}`);
    }
    if (!(one.ticket?.done_when ?? []).length)
      faults.push(`${one.id} stands open, and its ticket carries no done_when`);
  }
  return faults;
}

// The verb: mints one ticket a class standing open, writes its ask and opens the draft. [[spec/guidance/retro/verify]]
export function mint(it, name) {
  const home = name ? homeOf(it, name) : "";
  const at = home ? it.join(home, CLASSES) : "";
  if (!at || !it.disk.exists(at)) {
    console.error(`retro mint reads ${CLASSES} of a retro, and none stands.`);
    return 2;
  }
  const record = recordOf(it.disk.read(at));
  const faults = record ? mintFaults(record) : [`${CLASSES} reads as no JSON`];
  if (faults.length) {
    for (const one of faults) console.error(one);
    return 1;
  }

  let made = 0;
  for (const one of record.classes) {
    if (one.status !== OPEN || one.tickets?.length) continue;
    const path = `${TICKETS}/${one.ticket.name}.md`;
    const ran = it.proc.run([...CLI, "mint", "ticket", path, `--process=${ROUTE}`], {
      cwd: it.root,
    });
    if (ran.exitCode !== 0) {
      console.error(`${one.id} mints no ticket: ${String(ran.stderr ?? "").trim()}`);
      return 1;
    }
    const file = it.join(it.root, ...path.split("/"));
    it.disk.write(file, withAsk(it.disk.read(file), askOf(one.ticket)));
    const opened = it.proc.run([...CLI, "ticket", "open", one.ticket.name], {
      cwd: it.root,
    });
    if (opened.exitCode !== 0) {
      console.error(
        `${one.ticket.name} opens not: ${String(opened.stdout ?? "").trim()} ${String(opened.stderr ?? "").trim()}`,
      );
      return 1;
    }
    one.tickets = [one.ticket.name];
    made += 1;
    // The record lands after each ticket, so a refusal past here leaves the tickets it made named. [[spec/guidance/retro/verify]]
    it.disk.write(at, `${JSON.stringify(record, null, 2)}\n`);
    console.log(`${one.id}  ${path}`);
  }
  it.disk.write(at, `${JSON.stringify(record, null, 2)}\n`);
  const closed = record.classes.filter((one) => one.status !== OPEN);
  console.log(
    `${made} ticket(s) mint, and ${closed.length} class(es) stand closed already.`,
  );
  return 0;
}
