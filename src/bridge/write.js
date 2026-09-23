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
import { REFACTORS } from "../../.claude/skills/level0/lib/runs.js";
import { PROSE } from "../../.claude/skills/level0/lib/vale.js";
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
import {
  refusedTicket,
  restoredFields,
  ticketFaults,
} from "../../.claude/skills/level0/lib/ticket.js";
import {
  mergedWarnings,
  rowOf,
  WARNING,
  warnedNote,
} from "../../.claude/skills/level0/lib/warnings.js";
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
const UNRAN = "VoiceRulesRan";
const TICKET_KIND = "ticket";

// [[spec/design_output/schema#the-door-refuses-a-departure]]
export function schemasHere(disk, root) {
  return schemasFrom(readFolder(disk, join(root, SCHEMAS), END));
}

export async function onWrite(asked, box) {
  let e = asked;
  let writing = asWrite(e);
  if (!writing) return PASS;
  const where = relativeTo(box.root, writing.path);
  if (/^([A-Za-z]:)?[\\/]/.test(where) || isDraft(where)) return PASS;
  // The engine's fields come back first, so every door reads the write that lands. [[spec/design_output/schema#the-verbs-own-their-fields]]
  const restored = engineRestores(e, writing, where, box);
  if (restored?.deny) return { result: { deny: restored.deny } };
  if (restored) {
    e = restored.e;
    writing = asWrite(e);
  }

  const checks = [markDoor, ownerDoor, privateDoor, schemaDoor, voiceDoor];
  const held = {};
  for (const check of checks) {
    const found = await check(e, writing, where, box, held);
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
  const warned = warnsOf(e, where, held.warned, box);
  if (restored) return putBack(e, where, restored.keys, warned, box);
  return warned ?? PASS;
}

// The write lands with the fields back, and the context names each one. [[spec/design_output/schema#the-verbs-own-their-fields]]
function putBack(e, where, keys, warned, box) {
  box.log.say("info", "ticket", `put back ${keys.join(", ")} in ${where}`, {
    file: where,
    tool: String(e.tool),
  });
  const said = `${keys.join(", ")} stand as the engine holds them in ${where}, and the rest of the write lands. A verb writes these fields: ./RUNME.sh ticket pull moves step and state.`;
  return { event: e, after: { context: [...(warned?.after?.context ?? []), said] } };
}

// A write to a ticket carrying an engine field, turned into one carrying the disk's value there. An edit whose text the field reaches past takes the refusal the ticket door gives. [[spec/design_output/schema#the-verbs-own-their-fields]]
function engineRestores(e, writing, where, box) {
  if (!where.endsWith(".md") || e.tool === "MultiEdit" || e.replace_all) return null;
  const was = textAt(box.disk, writing.path);
  if (was === null) return null;
  const whole = wholeAfter(e, writing, box.disk);
  if (kindOf(whole) !== TICKET_KIND) return null;
  if (!box.schemas) box.schemas = schemasHere(box.disk, box.method);
  const put = restoredFields(was, whole, box.schemas.get(TICKET_KIND));
  if (!put.keys.length) return null;
  if (e.tool === "Write") return { e: { ...e, content: put.text }, keys: put.keys };
  const from = String(e.old_string ?? "");
  const at = was.indexOf(from);
  const head = was.slice(0, at);
  const tail = was.slice(at + from.length);
  const reaches =
    at >= 0 &&
    put.text.startsWith(head) &&
    put.text.endsWith(tail) &&
    put.text.length >= head.length + tail.length;
  if (!reaches) return null;
  const text = put.text.slice(head.length, put.text.length - tail.length);
  if (text === from) {
    return {
      deny: `This edit changes ${put.keys.join(", ")} alone, and the engine holds those in ${where}, so nothing of it lands. A verb writes them: ./RUNME.sh ticket pull moves step and state.`,
    };
  }
  return { e: { ...e, new_string: text }, keys: put.keys };
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
    ? ticketFaults(
        textAt(box.disk, writing.path),
        whole,
        schema,
        where,
        kidsOf(where, box),
      )
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
  if (CODE.test(where)) return [];
  if (!box.vale.stands()) return missesVale(box);
  const said = await box.vale.lint(text, where);
  if (!said.ran) return unran(where, String(said.why ?? ""), box);
  return readsProse(box, text, said.found);
}

// A box with no Vale writes on, and the log says so once. [[spec/design_output/level0#a-broken-rule-says-so]]
function missesVale(box) {
  if (box.valeMissed) return [];
  box.valeMissed = true;
  box.log.say("warn", "vale", "no vale stands here, so the voice rules read no write");
  return [];
}

// A lint that ran nowhere refuses a prose write and names the fault, so a broken rule turns no rule off. A write outside prose lands, so the hand mending the rule file writes it. [[spec/design_output/level0#a-broken-rule-says-so]]
function unran(where, why, box) {
  box.log.say("warn", "vale", `the voice rules did not run over ${where}`, {
    file: where,
    detail: why,
  });
  if (!PROSE.test(where)) return [];
  return [
    {
      rule: UNRAN,
      line: 1,
      column: 1,
      said: "",
      message: `The voice rules did not run over this file: ${why || "vale answered nothing"}. Mend the rule or the setup it names, and write again.`,
      severity: "error",
      fixable: false,
    },
  ];
}

// A rule reading warning is a break of form, and the write lands with it standing for the refactoring hand. [[spec/rationales/voice#11-form-and-substance]]
export function errorsIn(found) {
  return (found ?? []).filter((one) => String(one?.severity ?? "error") !== "warning");
}

// [[spec/design_output/level0#the-write-door]]
async function voiceDoor(e, writing, where, box, held) {
  const whole = wholeAfter(e, writing, box.disk);
  const all = await proseFaults(whole, where, box);
  const found = errorsIn(all);
  if (!found.length) {
    held.warned = all.filter((one) => String(one?.severity ?? "") === WARNING);
    return "";
  }
  box.log.say("warn", "vale", `refused ${found.length} line(s) in ${where}`, {
    file: where,
    rule: found[0]?.rule,
    tool: String(e.tool),
  });
  return refusal(where, found);
}

// A write landing with a warning puts the rows on the refactoring hand's list, writes them to the log, and tells the agent to carry on. [[spec/design_output/level0#a-warning-feeds-the-list]]
function warnsOf(e, where, warned, box) {
  if (!warned) return null;
  const at = join(box.work, ...REFACTORS.split("/"));
  let list = [];
  try {
    list = JSON.parse(String(box.disk.read(at)));
  } catch {
    list = [];
  }
  const held = [list].flat().some((one) => String(one?.file ?? "") === where);
  if (!held && !warned.length) return null;
  const merged = mergedWarnings(list, where, warned);
  try {
    box.disk.write(at, `${JSON.stringify(merged, null, 2)}\n`);
  } catch {
    // The runtime folder stands on every box the server runs on, so a miss here is a fake with no folder. [[spec/design_output/level0#a-warning-feeds-the-list]]
  }
  if (!warned.length) return null;
  box.log.say("warn", "vale", `${warned.length} line(s) stand at warning in ${where}`, {
    file: where,
    rule: warned[0]?.rule,
    tool: String(e.tool),
    detail: warned.map(rowOf).join("\n"),
  });
  return { after: { context: [warnedNote(where, warned, merged.length)] } };
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
