// The retro's tickets: one a class the check step leaves open, and one a
// promotion, minted off the standard route, its ask written and the draft
// opened.
// [[spec/guidance/retro/check]]

import { CLASSES, recordOf } from "./classes.js";
import { homeOf } from "./timeline.js";

export const TICKETS = "spec/tickets";
// A class the check step closes opens on one of these, and where or why follows. [[spec/guidance/retro/check]]
export const CLOSED = ["fixed:", "past:"];
const OPEN = "open";
const ROUTE = "standard";

// The command line stands under the method root, and a stub's work root holds none, so the call names it there and hands the child the work root. [[spec/design_output/vehicle#the-work-root-inherits]]
function cliOf(it) {
  return [it.node ?? "node", it.join(it.method ?? it.root, "src", "scripts", "cli.js")];
}

function runIn(it, argv) {
  return it.proc.run([...cliOf(it), ...argv], {
    cwd: it.root,
    env: { SE_WORK_ROOT: it.root },
  });
}

// The ask a class hands its ticket, as the chapter the mint leaves empty. [[spec/guidance/retro/check]]
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

// The ask chapter, written where the mint leaves its placeholders. [[spec/guidance/retro/check]]
export function withAsk(text, ask) {
  const rows = text.split("\n");
  const head = rows.findIndex((one) => one.trim() === "# Ask");
  if (head < 0) return text;
  let end = head + 1;
  while (end < rows.length && !rows[end].startsWith("# ")) end += 1;
  return [...rows.slice(0, head + 1), "", ask, ...rows.slice(end)].join("\n");
}

// Every fault standing between the classes and promotions and their tickets. [[spec/guidance/retro/check]]
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
    faults.push(...ticketFaults(`${one.id} stands open`, one.ticket));
  }
  (record.promotions ?? []).forEach((one, at) => {
    if (one?.tickets?.length) return;
    faults.push(...ticketFaults(`${promotionName(one, at)} waits`, one?.ticket));
  });
  return faults;
}

// A promotion carries no id, so its fault names its what, or its place where the what stands empty. [[spec/tickets/a-promotion-names-its-fault]]
export function promotionName(one, at) {
  const what = String(one?.what ?? "").trim();
  return what ? `promotion "${what}"` : `promotion ${at + 1}`;
}

// Every field a ticket to mint carries none of, each named after the thing it serves. [[spec/tickets/a-promotion-names-its-fault]]
function ticketFaults(said, ticket) {
  const faults = [];
  for (const field of ["name", "gain", "breaks"]) {
    if (!String(ticket?.[field] ?? "").trim())
      faults.push(`${said}, and its ticket carries no ${field}`);
  }
  if (!(ticket?.done_when ?? []).length)
    faults.push(`${said}, and its ticket carries no done_when`);
  return faults;
}

// Mints the ticket a class or a promotion carries, writes its ask, opens the draft and names it back. [[spec/tickets/the-retro-finishes-its-asks]]
function mintOne(it, one, label) {
  const path = `${TICKETS}/${one.ticket.name}.md`;
  const ran = runIn(it, ["mint", "ticket", path, `--process=${ROUTE}`]);
  if (ran.exitCode !== 0) {
    console.error(`${label} mints no ticket: ${String(ran.stderr ?? "").trim()}`);
    return false;
  }
  const file = it.join(it.root, ...path.split("/"));
  it.disk.write(file, withAsk(it.disk.read(file), askOf(one.ticket)));
  const opened = runIn(it, ["ticket", "open", one.ticket.name]);
  if (opened.exitCode !== 0) {
    console.error(
      `${one.ticket.name} opens not: ${String(opened.stdout ?? "").trim()} ${String(opened.stderr ?? "").trim()}`,
    );
    return false;
  }
  one.tickets = [one.ticket.name];
  console.log(`${label}  ${path}`);
  return true;
}

// The verb: mints one ticket a class standing open and a promotion waiting, writes its ask and opens the draft. [[spec/guidance/retro/check]]
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

  // The classes mint first, then every promotion no ticket names yet. [[spec/tickets/the-retro-finishes-its-asks]]
  const waiting = [
    ...record.classes
      .filter((one) => one.status === OPEN && !one.tickets?.length)
      .map((one) => ({ one, label: one.id })),
    ...record.promotions
      .map((one, place) => ({ one, label: promotionName(one, place) }))
      .filter(({ one }) => !one.tickets?.length),
  ];
  let made = 0;
  for (const { one, label } of waiting) {
    if (!mintOne(it, one, label)) return 1;
    made += 1;
    // The record lands after each ticket, so a refusal past here leaves the tickets it made named. [[spec/guidance/retro/check]]
    it.disk.write(at, `${JSON.stringify(record, null, 2)}\n`);
  }
  it.disk.write(at, `${JSON.stringify(record, null, 2)}\n`);
  const closed = record.classes.filter((one) => one.status !== OPEN);
  console.log(
    `${made} ticket(s) mint, and ${closed.length} class(es) stand closed already.`,
  );
  return 0;
}
