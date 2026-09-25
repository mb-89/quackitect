// The text a hand writes and the engine reads: the answer a hand-out prints,
// the chapter a leaf owns, and the evidence weighed against the leaf's fields.
// [[spec/design_output/pull#the-work-answer]]

import { inherits } from "../../.claude/skills/level0/lib/layer.js";
import { shortOf } from "../../.claude/skills/level0/lib/runs.js";
import { readNote, sectionAt } from "../../.claude/skills/level0/lib/schema.js";
import { formIn, refusesIn } from "../../.claude/skills/level0/lib/warnings.js";
import { voiceOver } from "../bridge/findings.js";

export { HELPER, SPAWN, spawnPrompt } from "./pull-spawn.js";

import { writesHere } from "../../.claude/skills/level0/lib/ticket.js";
import { notesSaid, parsed } from "./guidance-hand.js";
import { PERSON, roleOf } from "./pull-hand-of.js";
import { excludes, handRule } from "./pull-hand.js";
import { ANSWERED, bare, CHECKED, COMMENT, CUT, FENCE, WORK } from "./pull-route.js";
import { changedSince, commitsFor, tipOf } from "./pull-writes.js";

// A shell answers this where it finds no command, which a backtick or a fence around the line earns. [[spec/design_output/pull#the-fields-hold-their-forms]]
const NO_COMMAND = 127;

export function workAnswer(it, one, leaf) {
  const rows = [];
  const phase = leaf.parent ? ` under ${leaf.parent}` : "";
  rows.push(
    `${WORK}  ${one.name} at ${leaf.path}, leaf ${leaf.at + 1} of ${leaf.of}${phase}`,
  );
  if (leaf.does) rows.push(`      ${leaf.does}`);
  rows.push("", "# Ask", "", askOf(one.text) || "(the ask stands empty)", "");

  const deep = "#".repeat(leaf.path.split("/").length);
  rows.push(`Write under ${deep} ${leaf.name} in ${one.path}, one heading a field:`);
  for (const field of leaf.evidence) {
    const more = field.expects !== undefined ? `, expects ${field.expects}` : "";
    const options = field.options
      ? `, one of ${[field.options].flat().join(", ")}`
      : "";
    rows.push(
      `  ${deep}# ${field.name}  ${field.form}${more}${options}: ${field.says ?? ""}`,
    );
  }
  if (leaf.checklist.length) {
    rows.push(
      `  ${deep}# ${CHECKED}  one line per item below, on how you take it into account`,
    );
    rows.push("", "Checklist:");
    for (const item of leaf.checklist) rows.push(`  - ${item}`);
  }
  if (leaf.asks) rows.push("", `Asks: ${leaf.asks}`);

  rows.push(...notesSaid(it, leaf.reads));

  rows.push("");
  if (leaf.evidence.some((field) => field.form === "verdict")) {
    rows.push(
      `Hand it back with ./RUNME.sh ticket pull ${one.name}, and the verdict field decides.`,
    );
  } else {
    rows.push(
      `Hand it back: ./RUNME.sh ticket pull ${one.name} --pass, or --fail "why", or --became <ticket>, or --answered <ticket>.`,
    );
  }
  return rows.join("\n");
}

export function askOf(text) {
  const said = readNote(text).sections.find(
    (one) => one.header.toLowerCase() === "ask",
  );
  return said
    ? said.own
        .filter((row) => !COMMENT.test(row))
        .join("\n")
        .trim()
    : "";
}

// [[spec/design_output/pull#a-leaf-comes-back]]

export function withPayload(text, path, payload) {
  const fields = parsed(payload);
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return {
      why: "--fields takes a JSON object, one key per field of the leaf in hand.",
    };
  }
  let now = String(text ?? "");
  for (const [name, said] of Object.entries(fields)) {
    const put = withFieldText(now, path, name, String(said ?? ""));
    if (put.why) return put;
    now = put.text;
  }
  return { text: now };
}

// [[spec/design_output/pull#the-fields-ride-the-payload]]
export function withFieldText(text, path, name, said) {
  const sections = readNote(text).sections;
  const leaf = sectionAt(sections, path);
  if (leaf < 0) return { why: `${path} holds no chapter to write ${name} into.` };
  const level = path.split("/").length + 1;
  let field = -1;
  for (let i = leaf + 1; i < sections.length; i++) {
    if (sections[i].level < level) break;
    if (sections[i].level === level && sections[i].header === name) {
      field = i;
      break;
    }
  }
  const rows = text.split(/\r?\n/);
  if (field < 0) {
    if (name !== CHECKED) return { why: `${path} holds no field ${name}.` };
    const end = chapterEnd(sections, leaf, level - 1, rows.length);
    rows.splice(end, 0, `${"#".repeat(level)} ${CHECKED}`, "", ...said.split("\n"), "");
    return { text: rows.join("\n") };
  }
  const start = sections[field].line;
  const end = chapterEnd(sections, field, level, rows.length);
  const kept = rows.slice(start, end).filter((row) => COMMENT.test(row));
  const gap = kept.length ? [""] : [];
  rows.splice(start, end - start, "", ...kept, ...gap, ...said.split("\n"), "");
  return { text: rows.join("\n") };
}

export function chapterEnd(sections, at, level, last) {
  for (let i = at + 1; i < sections.length; i++) {
    if (sections[i].level <= level) return sections[i].line - 1;
  }
  return last;
}

// [[spec/design_output/pull#the-fields-hold-their-forms]]
export function chapterOf(text, path) {
  const sections = readNote(text).sections;
  const found = sectionAt(sections, path);
  if (found < 0) return { stands: false, own: [], fields: new Map() };

  const level = path.split("/").length;
  const own = lines(sections[found].own);
  const fields = new Map();
  for (let i = found + 1; i < sections.length; i++) {
    if (sections[i].level <= level) break;
    if (sections[i].level === level + 1) {
      fields.set(sections[i].header, lines(sections[i].own));
    }
  }
  return { stands: true, own, fields };
}

export function lines(own) {
  return (own ?? [])
    .filter(
      (row) =>
        row.trim() && !COMMENT.test(row) && !ANSWERED.test(row) && !FENCE.test(row),
    )
    .map((row) => row.trim());
}

// [[spec/design_output/pull#the-fields-hold-their-forms]]
export function formFaults(it, one, leaf, chapter, held) {
  const out = [];
  if (!chapter.stands) return [`${one.path} holds no chapter for ${leaf.path}.`];

  for (const field of leaf.evidence) {
    const rows = chapter.fields.get(field.name);
    const where = `${field.name} under ${leaf.path}`;
    if (!rows) {
      out.push(`${where} stands as no heading, and its form is ${field.form}.`);
      continue;
    }
    out.push(...formFault(it, field, rows, where, one, held));
  }
  if (leaf.checklist.length) {
    const rows = chapter.fields.get(CHECKED) ?? [];
    if (rows.length < leaf.checklist.length) {
      out.push(
        `${CHECKED} under ${leaf.path} holds ${rows.length} line(s), and the checklist holds ${leaf.checklist.length} item(s).`,
      );
    }
  }
  return out;
}

// [[spec/design_output/pull#the-fields-hold-their-forms]]
export function formFault(it, field, rows, where, one, held) {
  const form = String(field.form ?? "text");
  if (form === "text" || form === "list") {
    return rows.length
      ? []
      : [`${where} holds no ${form === "list" ? "item" : "text"}.`];
  }
  if (form === "command") {
    return rows.length === 1
      ? []
      : [`${where} holds ${rows.length} line(s), and a command is one line.`];
  }
  if (form === "link") {
    if (rows.length !== 1)
      return [`${where} holds ${rows.length} line(s), and a link is one.`];
    // A link resolves in the work root first, then in the method root. [[spec/design_output/vehicle#the-work-root-inherits]]
    const said = bare(rows[0]);
    const reads = inherits(it.disk, it.method ?? it.root, it.root);
    return reads.exists(said) || reads.exists(`${said}.md`)
      ? []
      : [`${where} names ${said}, which resolves nowhere.`];
  }
  if (form === "choice") {
    const options = [field.options ?? []].flat().map(String);
    if (rows.length !== 1)
      return [`${where} holds ${rows.length} line(s), and a choice is one word.`];
    return options.includes(rows[0])
      ? []
      : [`${where} reads ${rows[0]}, and the options are ${options.join(", ")}.`];
  }
  if (form === "files") {
    const named = new Set(rows.map((row) => row.replace(/^[-*]\s+/, "").trim()));
    const missing = changedSince(it, one, held).filter((path) => !named.has(path));
    if (!rows.length) return [`${where} names no file.`];
    return missing.length
      ? [`${where} leaves out ${missing.join(", ")}, which the branch changes.`]
      : [];
  }
  if (form === "checklist") {
    return rows.length ? [] : [`${where} holds no line.`];
  }
  if (form === "verdict") {
    const said = verdictIn(rows);
    if (!said.said)
      return [
        `${where} opens with pass or fail, and it reads ${rows[0] ?? "nothing"}.`,
      ];
    if (said.said === "fail" && !said.reason)
      return [`${where} fails with no finding under it.`];
    return [];
  }
  return [];
}

// A verdict field keeps every round, so the last row opening with pass or fail decides. [[spec/design_output/pull#the-fields-hold-their-forms]]
export function verdictIn(rows) {
  const opener = (row) =>
    String(row ?? "")
      .replace(/^[-*]\s+/, "")
      .trim()
      .split(/[\s:.,]+/)[0]
      .toLowerCase();
  const at = rows.findLastIndex((row) => ["pass", "fail"].includes(opener(row)));
  if (at < 0) return { said: "" };
  const first = String(rows[at]).replace(/^[-*]\s+/, "").trim();
  const word = opener(first);
  const rest = [first.slice(word.length).replace(/^[\s:.,]+/, ""), ...rows.slice(at + 1)]
    .map((row) => row.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);
  return { said: word, reason: rest.join("; ") };
}

const FORMS_READ = ["text", "list", "checklist", "verdict"];
const HEADING = /^#{1,6}\s/;

// The pull reads the ticket the way the lint reads it, over the whole ticket with the fields laid in. It keeps what lands on the leaf's chapter: it answers the lines that refuse, and puts each break of form on `warned`, so the hand-back lands over it. [[spec/design_output/pull#the-voice-reads-the-evidence]]
export function voiceFaults(it, one, leaf, warned = []) {
  if (!it.vale) return [];
  const read = voiceText(one.text, leaf);
  if (!read) return [];
  const found = voiceOver(it, one.path, read.text, read);
  const row = (fault) =>
    `${leaf.path} breaks ${fault.rule} at line ${fault.line} of ${one.path}: ${fault.message}`;
  warned.push(...formIn(found).map(row));
  return refusesIn(found).map(row);
}

// A hand-back landing over a break of form names each line. [[spec/design_output/pull#the-voice-reads-the-evidence]]
export function warnsOf(warned) {
  if (!warned.length) return;
  console.log(
    [
      "These lines break a rule of form, and the hand-back lands. Leave them as they stand:",
      ...warned.map((one) => `  ${one}`),
    ].join("\n"),
  );
}

// The ticket with the rows the voice passes blanked in place, so every row keeps its file line: a field in no prose form, and an answered row. A comment stays, so a Vale marker holds as it does in the lint. [[spec/design_output/pull#the-voice-reads-the-evidence]]
function voiceText(text, leaf) {
  const sections = readNote(text).sections;
  const at = sectionAt(sections, leaf.path);
  if (at < 0) return null;
  const rows = String(text).split(/\r?\n/);
  const level = leaf.path.split("/").length;
  const first = sections[at].line;
  const last = chapterEnd(sections, at, level, rows.length);
  const read = new Set([CHECKED]);
  for (const field of leaf.evidence) {
    if (FORMS_READ.includes(String(field.form))) read.add(String(field.name));
  }
  for (let i = at + 1; i < sections.length && sections[i].level > level; i++) {
    if (sections[i].level !== level + 1 || read.has(sections[i].header)) continue;
    const end = chapterEnd(sections, i, level + 1, rows.length);
    for (let row = sections[i].line; row < end; row++) {
      if (!COMMENT.test(rows[row])) rows[row] = "";
    }
  }
  let holds = false;
  for (let row = first - 1; row < last; row++) {
    if (ANSWERED.test(rows[row])) rows[row] = "";
    const bare = rows[row].trim();
    if (bare && !COMMENT.test(bare) && !HEADING.test(bare)) holds = true;
  }
  return holds ? { text: rows.join("\n"), first, last } : null;
}

// [[spec/design_output/pull#the-commands-answer]]
export function commandsRun(it, leaf, chapter, found) {
  const out = [];
  for (const field of leaf.evidence) {
    if (String(field.form) !== "command") continue;
    const line = (chapter.fields.get(field.name) ?? [])[0] ?? "";
    let ran;
    try {
      ran = it.proc.run(["sh", "-c", line], { cwd: it.root });
    } catch (error) {
      found.push(
        `${field.name} under ${leaf.path} runs ${line}, and the box answers ${error.message}.`,
      );
      continue;
    }
    const rows = `${ran.stdout ?? ""}`.trim().split("\n").filter(Boolean);
    const last = rows.at(-1) ?? "";
    out.push({ name: field.name, exit: ran.exitCode, said: last.slice(0, CUT.said) });
    // The shape is what a reader acts on here, because the box stopped at the name and left the command alone. [[spec/design_output/pull#the-fields-hold-their-forms]]
    if (ran.exitCode === NO_COMMAND) {
      found.push(
        `${field.name} under ${leaf.path} runs ${line}, and the box finds no such command. A command field holds one bare line, indented four spaces.`,
      );
      continue;
    }
    const want = field.expects;
    if (want === undefined || want === null || want === "") continue;
    const asNumber = Number(want);
    if (Number.isInteger(asNumber) && String(want).trim() !== "") {
      if (ran.exitCode !== asNumber) {
        found.push(
          `${field.name} under ${leaf.path} expects exit ${asNumber}, and ${line} answers ${ran.exitCode}: ${last}`,
        );
      }
      continue;
    }
    const word = last.split(/[\s:,.]+/)[0].toLowerCase();
    if (word !== String(want).toLowerCase()) {
      found.push(
        `${field.name} under ${leaf.path} expects ${want}, and ${line} answers ${last || "nothing"}`,
      );
    }
  }
  return out;
}

// [[spec/design_output/pull#the-hand-rule]]
export function handFaults(it, one, leaf, hand, held) {
  const out = [];
  // [[spec/tickets/the-one-answer-takes-shape]]
  const said = writesHere(leaf, handRule(it, one.front, [], ""));
  if (!said.writes && said.person)
    out.push(`${leaf.path} is a person's step, and this hand is an agent.`);
  out.push(...signFaults(it, one, hand));
  const other = excludes(one.front, leaf, hand);
  if (other) out.push(`${leaf.path} ${other}.`);
  if (leaf.evidence.some((field) => field.form === "verdict") && !one.private) {
    const tip = tipOf(it);
    // A sibling hand commits beside this reader, and that costs the reading nothing. A commit naming this ticket is this hand's own write, which the rule refuses. [[spec/tickets/the-verdict-guard-reads-tips]]
    const moved =
      held.hash && tip !== held.hash ? commitsFor(it, one.name, held.hash) : null;
    if (moved && (!moved.read || moved.own.length)) {
      out.push(
        `a verdict comes from a hand that leaves the tip where it stands, and ${shortOf(held.hash)} moved to ${shortOf(tip)}.`,
      );
    }
  }
  return out;
}

// The stronger door on a person's hand, which a tracked ticket meets where the config switches it on. [[spec/design_output/pull#the-hand-rule]]
export function signFaults(it, one, hand) {
  if (!it.personSigns || one.private || roleOf(hand) !== PERSON) return [];
  const tip = tipOf(it);
  const said = it.git.signatureOf ? it.git.signatureOf("HEAD") : "";
  if (SIGNED.includes(said.trim())) return [];
  return [
    `a person's hand-back meets a signed tip, and ${shortOf(tip)} answers ${said.trim() || "no signature"}.`,
  ];
}

// What `git log --format=%G?` answers over a good signature, and over one it trusts no key for. [[spec/design_output/pull#the-hand-rule]]
export const SIGNED = ["G", "U"];

// [[spec/design_output/pull#the-pass]]
