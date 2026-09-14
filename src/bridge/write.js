// The write door. A Write, an Edit or a MultiEdit meets four checks in turn,
// and the first one failing refuses the write with the reason and the line: a
// draft passes, a private note stays off the tree, a note stands in the shape
// its schema names, and the voice rules hold over the text as the file would
// stand after the write. Code passes here until the code door comes over.
// [[spec/design_output/level0#the-write-door]]

import { join } from "node:path";
import { CODE } from "../../.claude/skills/level0/lib/code.js";
import { isDraft, relativeTo } from "../../.claude/skills/level0/lib/paths.js";
import { carriedFrom, NOTES, refusedPrivate } from "../../.claude/skills/level0/lib/private.js";
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
import { marksStale, ownerDoor } from "./projection.js";

const PASS = { pass: true };

// [[spec/design_output/schema#the-door-refuses-a-departure]]
export function schemasHere(disk, root) {
  return schemasFrom(readFolder(disk, join(root, SCHEMAS), END));
}

export async function onWrite(e, box) {
  const writing = asWrite(e);
  if (!writing) return PASS;
  const where = relativeTo(box.root, writing.path);
  // A file outside the tree is none of the tree's, and a draft passes every check.
  if (/^([A-Za-z]:)?[\\/]/.test(where) || isDraft(where)) return PASS;

  const checks = [ownerDoor, privateDoor, schemaDoor, voiceDoor];
  for (const check of checks) {
    const found = await check(e, writing, where, box);
    if (found) return { result: { deny: found } };
  }
  marksStale(where, box);
  return PASS;
}

// [[spec/design_output/private#the-door-reads-the-notes]]
function privateDoor(e, writing, where, box) {
  if (where.startsWith(".se/")) return "";
  const carried = carriedFrom(writing.text, readFolder(box.disk, join(box.root, NOTES), ".md"));
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
  const schemas = box.schemas ?? (box.schemas = schemasHere(box.disk, box.method));
  const whole = wholeAfter(e, writing, box.disk);
  const kind = kindOf(whole);

  const governor = governorOf(schemas, where);
  const stranger = governor ? strangerFault(whole, governor, where) : null;
  if (stranger) {
    box.log.say("warn", "schema", `refused a stranger in ${where}`, { file: where, rule: stranger.rule, tool: String(e.tool) });
    return refusedKind(where, governor, stranger);
  }

  const schema = schemas.get(kind);
  const found = schema ? checkNote(whole, schema, where, schemas) : [];
  if (found.length) {
    box.log.say("warn", "schema", `refused ${found.length} line(s) in ${where}`, { file: where, rule: found[0]?.rule, tool: String(e.tool) });
    return refusedNote(where, kind, found);
  }

  // [[spec/design_output/schema#the-three-places]]
  const held = schema ? ticketFaults(textAt(box.disk, writing.path), whole, schema, where) : [];
  if (held.length) {
    box.log.say("warn", "ticket", `refused ${held.length} line(s) in ${where}`, { file: where, rule: held[0]?.rule, tool: String(e.tool) });
    return refusedTicket(where, kind, held);
  }
  return "";
}

// The voice rules read the file as it stands after the write, so an edit far
// from its header meets the same rules as the whole.
// [[spec/design_output/level0#the-write-door]]
async function voiceDoor(e, writing, where, box) {
  if (CODE.test(writing.path) || !box.vale.stands()) return "";
  const said = await box.vale.lint(wholeAfter(e, writing, box.disk), where);
  if (!said.ran || !said.found.length) return "";
  box.log.say("warn", "vale", `refused ${said.found.length} line(s) in ${where}`, {
    file: where,
    rule: said.found[0]?.rule,
    tool: String(e.tool),
  });
  return refusal(where, said.found);
}

function asWrite(e) {
  if (!e?.file_path) return undefined;
  const path = String(e.file_path);
  if (e.tool === "Write") return { path, text: String(e.content ?? "") };
  if (e.tool === "Edit") return { path, text: String(e.new_string ?? "") };
  if (e.tool === "MultiEdit" && Array.isArray(e.edits)) {
    return { path, text: e.edits.map((one) => String(one?.new_string ?? "")).join("\n") };
  }
  return undefined;
}

// The file as it stands after the write: the content of a Write, or the edits laid over the file.
function wholeAfter(e, writing, disk) {
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

function readFolder(disk, folder, end) {
  try {
    return disk
      .list(folder)
      .filter((one) => one.kind === "file" && one.name.endsWith(end) && !isDraft(one.name))
      .map((one) => ({ name: one.name, text: disk.read(join(folder, one.name)) }));
  } catch {
    return [];
  }
}
