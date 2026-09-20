// The write door. Every rule over a written file runs here in the order the
// design note names, and the code door follows.
// [[spec/design_output/level0#the-write-door]]

import { join } from "node:path";
import { CODE } from "../../.claude/skills/level0/lib/code.js";
import { marked, staleFault } from "../../.claude/skills/level0/lib/marks.js";
import { isDraft, relativeTo } from "../../.claude/skills/level0/lib/paths.js";
import {
  carriedFrom,
  NOTES,
  refusedPrivate,
} from "../../.claude/skills/level0/lib/private.js";
import { refusal } from "../../.claude/skills/level0/lib/refuse.js";
import {
  checkNote,
  END,
  governorOf,
  kindOf,
  refusedKind,
  refusedNote,
  SCHEMAS,
  schemasFrom,
  strangerFault,
} from "../../.claude/skills/level0/lib/schema.js";
import { refusedTicket, ticketFaults } from "../../.claude/skills/level0/lib/ticket.js";
import {
  fieldOf,
  GROUP as GROUP_KEY,
  NOTE_END,
  TICKETS,
  ticketNamed,
} from "../engine/group.js";
import { codeDoor } from "./code.js";
import { marksStale, ownerDoor } from "./projection.js";
import { readsProse } from "./prose.js";

const PASS = { pass: true };

// [[spec/design_output/schema#the-door-refuses-a-departure]]
export function schemasHere(disk, root) {
  return schemasFrom(readFolder(disk, join(root, SCHEMAS), END));
}

export async function onWrite(e, box) {
  const writing = asWrite(e);
  if (!writing) return PASS;
  const where = relativeTo(box.root, writing.path);
  if (/^([A-Za-z]:)?[\\/]/.test(where) || isDraft(where)) return PASS;

  const checks = [markDoor, ownerDoor, privateDoor, schemaDoor, voiceDoor];
  for (const check of checks) {
    const found = await check(e, writing, where, box);
    if (found) return { result: { deny: found } };
  }
  marksStale(where, box);
  const whole = wholeAfter(e, writing, box.disk);
  // [[spec/design_output/level0#the-formatter-applies-itself]]
  if (CODE.test(writing.path)) {
    const said = await codeDoor(e, writing, where, whole, box);
    if (!said?.result?.deny) marksSeen(box, where, said?.event?.content ?? whole);
    return said;
  }
  marksSeen(box, where, whole);
  return PASS;
}

// [[spec/design_output/level0#a-write-meets-its-mark]]
export function marksOf(box) {
  if (!box.marks) box.marks = new Map();
  return box.marks;
}

// [[spec/design_output/level0#a-write-meets-its-mark]]
export function marksSeen(box, where, text) {
  marked(marksOf(box), where, text);
}

// [[spec/design_output/level0#a-write-meets-its-mark]]
function markDoor(e, writing, where, box) {
  const found = staleFault(marksOf(box), where, textAt(box.disk, writing.path));
  if (!found) return "";
  box.log.say("warn", "mark", `refused a write over a stale read of ${where}`, {
    file: where,
    tool: String(e.tool),
  });
  return found;
}

// [[spec/design_output/private#the-door-reads-the-notes]]
function privateDoor(e, writing, where, box) {
  if (where.startsWith(".se/")) return "";
  const carried = carriedFrom(
    writing.text,
    readFolder(box.disk, join(box.root, NOTES), ".md"),
  );
  if (!carried) return "";
  box.log.say("warn", "private", `refused a ${carried.how} out of ${carried.note}`, {
    file: where,
    tool: String(e.tool),
  });
  return refusedPrivate(where, carried);
}

// [[spec/design_output/schema#the-door-refuses-a-departure]]
function schemaDoor(e, writing, where, box) {
  if (!where.endsWith(".md")) return "";
  if (!box.schemas) box.schemas = schemasHere(box.disk, box.method);
  const schemas = box.schemas;
  const whole = wholeAfter(e, writing, box.disk);
  const kind = kindOf(whole);

  const governor = governorOf(schemas, where);
  const stranger = governor ? strangerFault(whole, governor, where) : null;
  if (stranger) {
    box.log.say("warn", "schema", `refused a stranger in ${where}`, {
      file: where,
      rule: stranger.rule,
      tool: String(e.tool),
    });
    return refusedKind(where, governor, stranger);
  }

  const schema = schemas.get(kind);
  const found = schema ? checkNote(whole, schema, where, schemas) : [];
  if (found.length) {
    box.log.say("warn", "schema", `refused ${found.length} line(s) in ${where}`, {
      file: where,
      rule: found[0]?.rule,
      tool: String(e.tool),
    });
    return refusedNote(where, kind, found);
  }

  // [[spec/design_output/schema#the-three-places]]
  const held = schema
    ? ticketFaults(textAt(box.disk, writing.path), whole, schema, where, kidsOf(where, box))
    : [];
  if (held.length) {
    box.log.say("warn", "ticket", `refused ${held.length} line(s) in ${where}`, {
      file: where,
      rule: held[0]?.rule,
      tool: String(e.tool),
    });
    return refusedTicket(where, kind, held);
  }
  return "";
}

// [[spec/design_output/level0#a-note-reads-clean-first]]
export async function proseFaults(text, where, box) {
  if (CODE.test(where) || !box.vale.stands()) return [];
  const said = await box.vale.lint(text, where);
  if (!said.ran) return [];
  return readsProse(box, text, said.found);
}

// A rule reading warning is a break of form, and the write lands with it standing for the refactoring hand. [[spec/rationales/voice#11-form-and-substance]]
export function errorsIn(found) {
  return (found ?? []).filter((one) => String(one?.severity ?? "error") !== "warning");
}

// [[spec/design_output/level0#the-write-door]]
async function voiceDoor(e, writing, where, box) {
  const whole = wholeAfter(e, writing, box.disk);
  const found = errorsIn(await proseFaults(whole, where, box));
  if (!found.length) return "";
  box.log.say("warn", "vale", `refused ${found.length} line(s) in ${where}`, {
    file: where,
    rule: found[0]?.rule,
    tool: String(e.tool),
  });
  return refusal(where, found);
}

function asWrite(e) {
  if (!e?.file_path) return undefined;
  const path = String(e.file_path);
  if (e.tool === "Write") return { path, text: String(e.content ?? "") };
  if (e.tool === "Edit") return { path, text: String(e.new_string ?? "") };
  if (e.tool === "MultiEdit" && Array.isArray(e.edits)) {
    return {
      path,
      text: e.edits.map((one) => String(one?.new_string ?? "")).join("\n"),
    };
  }
  return undefined;
}

// The door reads the file as it stands after the edit, so a shape rule over the whole file reads the whole file. [[spec/design_output/level0#the-write-door]]
export function wholeAfter(e, writing, disk) {
  if (e.tool === "Write") return writing.text;
  const was = textAt(disk, writing.path);
  if (was === null) return writing.text;
  const edits = e.tool === "MultiEdit" && Array.isArray(e.edits) ? e.edits : [e];
  let text = was;
  for (const one of edits) {
    const from = String(one?.old_string ?? "");
    const to = String(one?.new_string ?? "");
    if (!from) continue;
    text = one?.replace_all ? text.split(from).join(to) : text.replace(from, () => to);
  }
  return text;
}

function textAt(disk, path) {
  try {
    return String(disk.read(path));
  } catch {
    return null;
  }
}

// The tickets naming this one under group, so the ask door knows what the children say already. [[spec/design_output/work#a-group-is-a-ticket]]
function kidsOf(where, box) {
  if (!where.startsWith(`${TICKETS}/`)) return [];
  const name = ticketNamed(where);
  return readFolder(box.disk, join(box.work, ...TICKETS.split("/")), NOTE_END)
    .filter((one) => fieldOf(one.text, GROUP_KEY) === name)
    .map((one) => ticketNamed(one.name));
}

function readFolder(disk, folder, end) {
  try {
    return disk
      .list(folder)
      .filter(
        (one) => one.kind === "file" && one.name.endsWith(end) && !isDraft(one.name),
      )
      .map((one) => ({ name: one.name, text: disk.read(join(folder, one.name)) }));
  } catch {
    return [];
  }
}
