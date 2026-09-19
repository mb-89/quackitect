// The text a hand writes and the engine reads: the answer a hand-out prints,
// the chapter a leaf owns, and the evidence weighed against the leaf's fields.
// [[spec/design_output/pull#the-work-answer]]

import { inherits } from "../../.claude/skills/level0/lib/layer.js";
import { shortOf } from "../../.claude/skills/level0/lib/runs.js";
import { readNote } from "../../.claude/skills/level0/lib/schema.js";
import {
  faultIn,
  fromJson,
  CONFIG as VALE_CONFIG,
} from "../../.claude/skills/level0/lib/vale.js";

export { HELPER, SPAWN, spawnPrompt } from "./spawn.js";

import { notesSaid, parsed } from "./guidance-hand.js";
import { PERSON, roleOf } from "./hand.js";
import { excludes } from "./pull-hand.js";
import { ANSWERED, bare, CHECKED, COMMENT, CUT, FENCE, WORK } from "./pull-route.js";
import { changedSince, tipOf } from "./pull-writes.js";

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
      `Hand it back with ./RUNME.sh branch pull ${one.name}, and the verdict field decides.`,
    );
  } else {
    rows.push(
      `Hand it back: ./RUNME.sh branch pull ${one.name} --pass, or --fail "why", or --became <ticket>.`,
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

export function sectionAt(sections, path) {
  const parts = path.split("/");
  let from = 0;
  let found = -1;
  for (let depth = 0; depth < parts.length; depth++) {
    const level = depth + 1;
    found = -1;
    for (let i = from; i < sections.length; i++) {
      if (sections[i].level < level && i > from) break;
      if (sections[i].level === level && sections[i].header === parts[depth]) {
        found = i;
        break;
      }
    }
    if (found < 0) return -1;
    from = found + 1;
  }
  return found;
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
  const parts = path.split("/");
  let from = 0;
  let found = -1;
  for (let depth = 0; depth < parts.length; depth++) {
    const level = depth + 1;
    found = -1;
    for (let i = from; i < sections.length; i++) {
      if (sections[i].level < level && i > from) break;
      if (sections[i].level === level && sections[i].header === parts[depth]) {
        found = i;
        break;
      }
    }
    if (found < 0) return { stands: false, own: [], fields: new Map() };
    from = found + 1;
  }

  const level = parts.length;
  const own = lines(sections[found].own);
  const fields = new Map();
  const rawOwn = prose(sections[found].own);
  const rawFields = new Map();
  for (let i = found + 1; i < sections.length; i++) {
    if (sections[i].level <= level) break;
    if (sections[i].level === level + 1) {
      fields.set(sections[i].header, lines(sections[i].own));
      rawFields.set(sections[i].header, prose(sections[i].own));
    }
  }
  return { stands: true, own, fields, rawOwn, rawFields };
}

export function prose(own) {
  return (own ?? []).filter((row) => !COMMENT.test(row) && !ANSWERED.test(row));
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

// [[spec/design_output/pull#the-fields-hold-their-forms]]
export function verdictIn(rows) {
  const first = String(rows[0] ?? "")
    .replace(/^[-*]\s+/, "")
    .trim();
  const word = first.split(/[\s:.,]+/)[0].toLowerCase();
  if (word !== "pass" && word !== "fail") return { said: "" };
  const rest = [first.slice(word.length).replace(/^[\s:.,]+/, ""), ...rows.slice(1)]
    .map((row) => row.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);
  return { said: word, reason: rest.join("; ") };
}

// [[spec/design_output/pull#the-voice-reads-the-evidence]]
export function voiceFaults(it, one, leaf, chapter) {
  if (!it.vale) return [];
  const prose = new Set([CHECKED]);
  for (const field of leaf.evidence) {
    if (["text", "list", "checklist", "verdict"].includes(String(field.form))) {
      prose.add(String(field.name));
    }
  }
  const rows = [...(chapter.rawOwn ?? [])];
  for (const [name, held] of chapter.rawFields ?? []) {
    if (prose.has(name)) rows.push("", ...held);
  }
  const text = rows.join("\n");
  if (!text.trim()) return [];
  let ran;
  try {
    ran = it.proc.run(
      [
        it.vale,
        `--config=${it.join(it.method ?? it.root, VALE_CONFIG)}`,
        `--path=${one.path}`,
        "--output=JSON",
        "--no-exit",
      ],
      { stdin: text, cwd: it.root },
    );
  } catch {
    return [];
  }
  if (faultIn(ran.stdout)) return [];
  return fromJson(ran.stdout)
    .filter((fault) => fault.severity === "error")
    .map(
      (fault) =>
        `${leaf.path} breaks ${fault.rule} at line ${fault.line} of its chapter: ${fault.message}`,
    );
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
  if (leaf.by === "person" && it.agent && !it.ownerSays)
    out.push(`${leaf.path} is a person's step, and this hand is an agent.`);
  out.push(...signFaults(it, one, hand));
  const other = excludes(one.front, leaf, hand);
  if (other) out.push(`${leaf.path} ${other}.`);
  if (leaf.evidence.some((field) => field.form === "verdict") && !one.private) {
    const tip = tipOf(it);
    if (held.hash && tip !== held.hash) {
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
