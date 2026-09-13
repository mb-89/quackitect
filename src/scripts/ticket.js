// Tickets that stay on this box. note writes a private ticket off the note
// process and carries on, and update copies a changed process onto a ticket
// while the leaves it already reached keep what they hold. The work verb holds
// the branches, and this verb holds the tickets.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]

import { overLong } from "../../.claude/skills/level0/lib/names.js";
import {
  entriesIn,
  mintedNote,
  readNote,
  reRouted,
  schemasFrom,
} from "../../.claude/skills/level0/lib/schema.js";
import { withField } from "./group.js";
import { askRows, processAt } from "./process.js";

export const NOTES = ".se/tickets";
export const HOLD = ".se/hold.json";
export const HOLDS = ".se/hold";
export const NOTE = "note";
const TRAVELS = "spec/tickets";
const SCHEMAS = "spec/schemas";

export function ticket(root, argv, doors) {
  const it = { root, ...doors };
  const what = argv[0];
  const name = argv[1];
  const doing = { note, update, open };
  if (!doing[what]) {
    console.log("Usage: ./RUNME.sh ticket <verb>\n");
    console.log(
      "  note <name> <line>  write a private ticket off the note process, and carry on",
    );
    console.log(
      "  update <ticket>     copy the ticket's process onto the steps it has yet to reach",
    );
    console.log("  open <ticket>       open a draft whose ask stands written, so a hand can pull it");
    return what ? 2 : 0;
  }
  return doing[what](it, name, argv);
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
function note(it, name, argv) {
  const line = (argv ?? []).slice(2).join(" ").trim();
  if (!name || !line) {
    console.error(
      'ticket note needs a name and a line: ./RUNME.sh ticket note slow-lint "..."',
    );
    return 2;
  }
  if (overLong(name, it.words)) {
    console.error(`A ticket name holds ${it.words} words, and ${name} holds more.`);
    return 2;
  }

  const path = `${NOTES}/${name}.md`;
  const at = it.join(it.root, ...path.split("/"));
  if (it.disk.exists(at)) {
    console.error(`${path} stands already. Name a note nothing holds yet.`);
    return 2;
  }

  const held = processAt(it.disk, it.root, it.join, NOTE);
  if (held.why) {
    console.error(held.why);
    return 1;
  }

  const made = mintedNote(schemasHere(it), {
    kind: "ticket",
    path,
    fields: {
      state: "open",
      urgency: "whenever",
      process: held.link,
      process_hash: held.hash,
      steps: fromHold(held.route, holdOf(it)),
      step: firstLeafOf(held.route),
      Ask: [askRows(held.ask), "", line].join("\n").trim(),
    },
  });
  if (made.why) {
    console.error(made.why);
    return 1;
  }

  it.disk.makeDir(it.join(it.root, ...NOTES.split("/")));
  it.disk.write(at, made.text);
  console.log(`${path} stands, and it waits for a retro to decide it.`);
  return said(it, NOTE, line, { ticket: name });
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
function said(it, kind, line, more) {
  if (!it.log) return 0;
  return it.log.say("info", kind, line, more).then(() => 0);
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
export function fromHold(route, hold) {
  const said = hold?.ticket && hold?.step ? `${hold.ticket}/${hold.step}` : "";
  if (!said) return route;
  return [route ?? []].flat().map((one) => (one?.steps ? one : { ...one, from: said }));
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
function holdOf(it) {
  const folder = it.join(it.root, ...HOLDS.split("/"));
  const held = it.disk.exists(folder)
    ? it.disk
        .list(folder)
        .filter((one) => one.kind === "file" && one.name.endsWith(".json"))
        .map((one) => it.join(folder, one.name))
    : [];
  for (const at of [...held, it.join(it.root, ...HOLD.split("/"))]) {
    if (!it.disk.exists(at)) continue;
    const hold = parsedJson(it.disk.read(at));
    if (hold) return hold;
  }
  return null;
}

function parsedJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// [[spec/design_output/pull#a-draft-opens]]
function open(it, name) {
  if (!name) {
    console.error("ticket open needs a ticket: ./RUNME.sh ticket open slow-lint");
    return 2;
  }
  const at = ticketAt(it, name);
  if (!at) {
    console.error(`${name} names no ticket under ${NOTES} or ${TRAVELS}.`);
    return 2;
  }
  const text = it.disk.read(at.path);
  const note = readNote(text);
  const front = note.front.said ?? {};
  if (String(front.state ?? "") !== "draft") {
    console.log(`${at.said} stands ${front.state ?? "with no state"} already.`);
    return 0;
  }
  const ask = note.sections.find((one) => one.header.toLowerCase() === "ask");
  const rows = (ask?.own ?? []).filter((row) => row.trim() && !/^\s*<!--.*-->\s*$/.test(row));
  if (!rows.length) {
    console.error(`${at.said} holds an empty ask, and open waits for one. Write the ask first.`);
    return 1;
  }
  const step = String(front.step ?? "").trim() || firstLeafOf(front.steps);
  it.disk.write(at.path, withField(withField(text, "state", "open"), "step", step));
  console.log(`${at.said} stands open at ${step}, and the pull hands it out.`);
  return 0;
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
function update(it, name, argv) {
  if (!name) {
    console.error("ticket update needs a ticket: ./RUNME.sh ticket update slow-lint");
    return 2;
  }
  const at = ticketAt(it, name);
  if (!at) {
    console.error(`${name} names no ticket under ${NOTES} or ${TRAVELS}.`);
    return 2;
  }

  const text = it.disk.read(at.path);
  const front = readNote(text).front.said ?? {};
  const asked = (argv ?? []).map((one) => /^--process=(.+)$/.exec(one)).find(Boolean);
  const held = processAt(it.disk, it.root, it.join, asked ? asked[1] : front.process);
  if (held.why) {
    console.error(held.why);
    return 2;
  }

  if (String(front.process_hash ?? "") === held.hash && !asked) {
    console.log(`${at.said} already carries ${held.name} as it stands.`);
    return 0;
  }

  const route = updated(front, held.route);
  if (route.why) {
    console.error(route.why);
    return 1;
  }

  const schema = schemasHere(it).get("ticket");
  it.disk.write(at.path, reRouted(text, schema, route.steps, held.hash));
  console.log(
    `${at.said} carries ${held.name} again, and ${route.kept} leaf/leaves keep what they hold.`,
  );
  return 0;
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
export function updated(front, route) {
  const step = String(front?.step ?? "").trim();
  const fresh = entriesIn(route, "steps");
  if (step && !fresh.some((one) => one.leaf && one.path === step)) {
    return {
      why: `This ticket stands at ${step}, and the new route holds no such leaf. Edit the route on the ticket, or close it.`,
    };
  }

  const old = entriesIn(front?.steps, "steps");
  const at = old.findIndex((one) => one.path === step);
  const reached = new Set(
    old.filter((one, i) => one.leaf && at >= 0 && i <= at).map((one) => one.path),
  );
  for (const one of [front?.record ?? []].flat()) {
    if (one?.step) reached.add(String(one.step));
  }

  const held = new Map(old.map((one) => [one.path, one.said]));
  let kept = 0;
  const steps = copied(route, "", (one, path) => {
    if (!reached.has(path) || !held.has(path)) return one;
    kept += 1;
    return held.get(path);
  });
  return { steps, kept };
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
function copied(list, parent, take) {
  return [list ?? []].flat().map((one) => {
    const path = parent ? `${parent}/${one?.name}` : String(one?.name ?? "");
    const under = [one?.steps ?? []].flat();
    if (under.length) return { ...one, steps: copied(under, path, take) };
    return take(one, path);
  });
}

function ticketAt(it, name) {
  const said = String(name).replace(/\.md$/, "");
  for (const folder of [NOTES, TRAVELS]) {
    const path = it.join(it.root, ...`${folder}/${said}.md`.split("/"));
    if (it.disk.exists(path)) return { path, said: `${folder}/${said}.md` };
  }
  const direct = it.join(it.root, ...String(name).split("/"));
  return it.disk.exists(direct) ? { path: direct, said: String(name) } : null;
}

function firstLeafOf(route) {
  const found = entriesIn(route, "steps").find((one) => one.leaf);
  return found ? found.path : "";
}

export function schemasHere(it) {
  const at = it.join(it.root, ...SCHEMAS.split("/"));
  if (!it.disk.exists(at)) return new Map();
  return schemasFrom(
    it.disk
      .list(at)
      .filter((one) => one.kind === "file" && one.name.endsWith(".yaml"))
      .map((one) => ({ text: it.disk.read(it.join(at, one.name)) })),
  );
}
