// Tickets. pull lives in the work verb's pulling, and the command line routes
// it there. note writes a private ticket off the note
// process and carries on, and update copies a changed process onto a ticket
// while the leaves it already reached keep what they hold. The work verb holds
// the branches, and this verb holds the tickets.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]

import {
  HOLD as OWNED_HOLD,
  HOLDS as OWNED_HOLDS,
  TICKETS,
} from "../../.claude/skills/level0/lib/folders.js";

import { overLong } from "../../.claude/skills/level0/lib/names.js";
import {
  entriesIn,
  readNote,
  schemasFrom,
} from "../../.claude/skills/level0/lib/schema.js";
import { mintedNote, reRouted } from "../../.claude/skills/level0/lib/schema-mint.js";
import { TODO } from "../../.claude/skills/level0/lib/todo.js";
import { fieldOf, GROUP, withField, withoutField } from "../engine/group.js";
import { holdsAnywhere } from "./guidance-hand.js";
import { askRows, processAt } from "./process.js";
import { emptyGroup } from "./pull-hand.js";
import { landedAlone } from "./pull-landed.js";
import { COMMENT } from "./pull-route.js";
import { baseOf, driftOf } from "./ticket-drift.js";
import { filled } from "./ticket-fill.js";
import { reachedOf, routed } from "./ticket-route.js";
import { yours } from "./ticket-yours.js";
import {
  askFaults,
  askRefusal,
  askWarning,
  lineRefusal,
} from "./ticket-ask-lint.js";

export const NOTES = TICKETS;
export const HOLDS = OWNED_HOLDS;
export const HOLD = OWNED_HOLD;
export const NOTE = "note";
// The flag on a note that waits for a person. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
const TALK = "talk";
// The flag that copies a new route over a person's edit. [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]
const OVER = "--over";
const TRAVELS = "spec/tickets";
const SCHEMAS = "spec/schemas";

export function ticket(root, argv, doors) {
  const it = { root, method: root, work: root, ...doors };
  const what = argv[0];
  const name = argv[1];
  const doing = {
    note,
    update,
    open,
    todo,
    route,
    fill,
    yours: (it, _name, argv) => yours(it, argv),
  };
  if (!doing[what]) {
    console.log("Usage: ./RUNME.sh ticket <verb>\n");
    console.log(
      "  pull [ticket]       take the next leaf of this group, or hand one back with --pass, --fail, --became, --answered",
    );
    console.log(
      "  note <name> <line>  write a private ticket off the note process, and carry on",
    );
    console.log(
      "  update <ticket>     copy the ticket's process onto the steps it has yet to reach, and --over writes over drift",
    );
    console.log(
      "  open <ticket>       open a draft whose ask stands written, so a hand can pull it",
    );
    console.log(
      "  todo <ticket>       park it for the next pull, and --off takes the tag away",
    );
    console.log(
      "  route <ticket>      write the steps past the pointer, off --steps=<json>, and answer JSON",
    );
    console.log(
      "  yours               the tickets waiting on a person as JSON, or --count, or --next",
    );
    console.log(
      "  fill <path>         write the route a saved ticket's process names, or print it under --stdout",
    );
    console.log(
      `                      note takes --${TALK} where a person decides it, and --${TODO} to park it`,
    );
    return what ? 2 : 0;
  }
  return doing[what](it, name, argv);
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
function note(it, name, argv) {
  const rest = (argv ?? []).slice(2);
  const parks = rest.includes(`--${TODO}`);
  const talks = rest.includes(`--${TALK}`);
  const line = rest
    .filter((one) => one !== `--${TODO}` && one !== `--${TALK}`)
    .join(" ")
    .trim();
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

  const held = processAt(it.disk, it.method, it.join, NOTE);
  if (held.why) {
    console.error(held.why);
    return 1;
  }

  const made = mintedNote(schemasHere(it), {
    kind: "ticket",
    path,
    fields: {
      state: "open",
      ...(parks ? { [TODO]: true } : {}),
      process: held.link,
      process_hash: held.hash,
      steps: talks
        ? personDecides(fromHold(held.route, holdOf(it)))
        : fromHold(held.route, holdOf(it)),
      step: firstLeafOf(held.route),
      Ask: [askRows(held.ask), "", line].join("\n").trim(),
    },
  });
  if (made.why) {
    console.error(made.why);
    return 1;
  }
  // The note reads its Ask through the lint's road before it writes. [[spec/design_output/pull#a-draft-opens]]
  const found = askFaults(it, path, made.text);
  if (found.refused.length) {
    console.error(lineRefusal(path, found.refused));
    return 1;
  }
  if (found.warned.length) console.error(askWarning(path, found.warned));

  it.disk.makeDir(it.join(it.root, ...NOTES.split("/")));
  it.disk.write(at, made.text);
  console.log(
    parks
      ? `${path} stands at ${TODO}, and the next pull hands it back first.`
      : talks
        ? `${path} stands, and it waits for a person to decide it.`
        : `${path} stands, and it waits for a retro to decide it.`,
  );
  return said(it, NOTE, line, { ticket: name });
}

// A note asking for a discussion waits for a person, so the pull hands it to no agent at a desk. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
function personDecides(steps) {
  return [steps ?? []]
    .flat()
    .map((one) => (one?.name ? { ...one, by: "person" } : one));
}

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
function todo(it, name, argv) {
  if (!name) {
    console.error(`ticket ${TODO} needs a ticket: ./RUNME.sh ticket ${TODO} slow-lint`);
    return 2;
  }
  const at = ticketAt(it, name);
  if (!at) {
    console.error(`${name} names no ticket under ${NOTES} or ${TRAVELS}.`);
    return 2;
  }

  const text = it.disk.read(at.path);
  const off = (argv ?? []).includes("--off");
  const rides = fieldOf(text, GROUP);
  if (!off && rides) {
    console.error(`${at.said} rides ${rides}, and that branch speaks for it already.`);
    console.error(`A ${TODO} parks work no branch carries.`);
    return 2;
  }

  it.disk.write(
    at.path,
    off ? withoutField(text, TODO) : withField(text, TODO, "true"),
  );
  console.log(
    off
      ? `${at.said} carries no ${TODO}, and a push takes it away from here.`
      : `${at.said} stands at ${TODO}, and the next pull hands it back first.`,
  );
  return 0;
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
function said(it, kind, line, more) {
  if (!it.log) return 0;
  // The row holds one sentence under `said`, so `text` carries the line whole and the details show it. [[spec/design_output/log#what-a-box-writes]]
  return it.log.say("info", kind, line, { text: line, ...more }).then(() => 0);
}

// [[spec/design_output/pull#a-draft-opens]]
export function askLines(ask) {
  return (ask?.own ?? []).filter((row) => !COMMENT.test(row));
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
export function fromHold(route, hold) {
  const said = hold?.ticket && hold?.step ? `${hold.ticket}/${hold.step}` : "";
  if (!said) return route;
  return [route ?? []].flat().map((one) => (one?.steps ? one : { ...one, from: said }));
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
function holdOf(it) {
  return holdsAnywhere(it)?.held ?? null;
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
  const state = fieldOf(it.disk.read(at.path), "state");
  if (state !== "draft") {
    console.log(`${at.said} stands ${state || "with no state"} already.`);
    return 0;
  }
  const opened = opensDraft(it, at);
  if (opened.refused) {
    console.error(opened.refused);
    return 1;
  }
  console.log(`${at.said} stands open at ${opened.step}, and the pull hands it out.`);
  return 0;
}

// [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
function route(it, name, argv) {
  const at = name ? ticketAt(it, name) : null;
  if (!at) {
    console.log(JSON.stringify({ refused: `${name ?? ""} names no ticket under ${NOTES} or ${TRAVELS}.`, at: "" }));
    return 1;
  }
  return routed(it, at, argv, schemasHere(it).get("ticket"));
}

// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
function fill(it, name, argv) {
  const at = name ? ticketAt(it, name) : null;
  if (!at) {
    console.error(`${name ?? "ticket fill"} names no ticket: ./RUNME.sh ticket fill spec/tickets/slow-lint.md`);
    return 2;
  }
  return filled(it, at, argv, schemasHere(it));
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
  const held = processAt(it.disk, it.method, it.join, asked ? asked[1] : front.process);
  if (held.why) {
    console.error(held.why);
    return 2;
  }

  if (String(front.process_hash ?? "") === held.hash && !asked) {
    console.log(`${at.said} already carries ${held.name} as it stands.`);
    return 0;
  }

  // A person's edit past the reached leaves stops the copy, unless --over says to write over it. [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]
  if (!(argv ?? []).includes(OVER)) {
    const own = processAt(it.disk, it.method, it.join, front.process);
    const base = own.why ? null : baseOf(it.git, own.path, String(front.process_hash ?? ""));
    if (!base) {
      console.error(
        `The process version ${at.said} copied stands nowhere in the history, so any drift stays unread. Run it again with ${OVER} to copy the new route over the route as it stands.`,
      );
      return 1;
    }
    const drift = driftOf(front, base);
    if (drift.length) {
      console.error(
        `${at.said} carries drift from the process it copied, at ${drift.join(", ")}. Nothing changes. Run it again with ${OVER} to copy the new route over it.`,
      );
      return 1;
    }
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
  const reached = reachedOf(front);

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

// A closed note steps aside for the ticket of its name, because a note that became a ticket shares it. [[spec/design_output/pull#the-private-queue]]
function ticketAt(it, name) {
  const said = String(name).replace(/\.md$/, "");
  const standing = [];
  for (const folder of [NOTES, TRAVELS]) {
    const path = it.join(it.root, ...`${folder}/${said}.md`.split("/"));
    if (it.disk.exists(path)) standing.push({ path, said: `${folder}/${said}.md` });
  }
  const live = standing.find(
    (one) => fieldOf(it.disk.read(one.path), "state") !== "closed",
  );
  if (live || standing.length) return live ?? standing[0];
  const direct = it.join(it.root, ...String(name).split("/"));
  return it.disk.exists(direct) ? { path: direct, said: String(name) } : null;
}

// The road from a draft to an open ticket, which the verb and the pull's trivial draft share. It answers the step it opens at, or the refusal. [[spec/design_output/pull#a-draft-opens]]
export function opensDraft(it, at) {
  const text = it.disk.read(at.path);
  const note = readNote(text);
  const front = note.front.said ?? {};
  const ask = note.sections.find((one) => one.header.toLowerCase() === "ask");
  if (!askLines(ask).some((row) => row.trim()))
    return {
      refused: `${at.said} holds an empty ask, and open waits for one. Write the ask first.`,
    };
  const called = at.said.split("/").pop().replace(/\.md$/, "");
  // [[spec/design_output/work#a-group-is-a-ticket]]
  const alone = emptyGroup(it, text, called);
  if (alone) return { refused: alone };
  const found = askFaults(
    it,
    at.path.split("\\").join("/").replace(`${it.root}/`, ""),
    text,
  );
  if (found.refused.length) return { refused: askRefusal(at.said, found.refused) };
  // A break of form on the Ask warns, and the open goes on. [[spec/design_output/pull#a-draft-opens]]
  if (found.warned.length) console.error(askWarning(at.said, found.warned));
  const step = String(front.step ?? "").trim() || firstLeafOf(front.steps);
  // The open lands in one commit of its own, so the queue a push carries holds it. [[spec/design_output/pull#a-draft-opens]]
  const refused = landedAlone(
    it,
    {
      at: at.path,
      text: withField(withField(text, "state", "open"), "step", step),
      name: called,
      private: at.said.startsWith(`${NOTES}/`),
    },
    ["opens"],
  );
  if (refused)
    return {
      refused: `the hook refuses the commit, so ${at.said} stands a draft:\n${refused}`,
    };
  return { step };
}

function firstLeafOf(route) {
  const found = entriesIn(route, "steps").find((one) => one.leaf);
  return found ? found.path : "";
}

export function schemasHere(it) {
  const at = it.join(it.method ?? it.root, ...SCHEMAS.split("/"));
  if (!it.disk.exists(at)) return new Map();
  return schemasFrom(
    it.disk
      .list(at)
      .filter((one) => one.kind === "file" && one.name.endsWith(".yaml"))
      .map((one) => ({ text: it.disk.read(it.join(at, one.name)) })),
  );
}
