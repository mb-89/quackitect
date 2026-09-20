// The body checks: the chapters a schema wants, their order, the list and
// the table under a chapter, and the placeholder a mint leaves.
// [[spec/design_output/schema#a-schema-names-its-chapters]]

import { fault, LEFT } from "./schema-fault.js";
import { FENCE, readNote } from "./schema-read.js";
import { tableFaults } from "./schema-table.js";

const ITEM = /^\s*(?:\d+[.)]|[-*+])\s+\S/;

const NUMBERED = /^(\d+)[.)]?\s/;

const COMMENT = /<!--[\s\S]*?-->/g;

export function bodyFaults(note, spec, kind, where) {
  const level = spec.headingLevel ?? 1;
  const wanted = chaptersWanted(spec.sections ?? [], note.front.said ?? {}, level);
  const levels = new Set(wanted.map((one) => one.level ?? level));
  const nested = wanted.some((one) => (one.level ?? level) > level);
  const standing = note.sections.filter((one) =>
    nested ? one.level >= level : levels.has(one.level),
  );
  const top = standing.filter((one) => one.level === level);
  const named = new Map(
    wanted.map((one) => [`${one.level ?? level} ${one.header}`, one]),
  );
  const out = [];

  for (const one of wanted) {
    const at = one.level ?? level;
    if (
      !one.required ||
      standing.some((held) => held.header === one.header && held.level === at)
    )
      continue;
    out.push(fault(one.header, where, 1, `A ${kind} carries a ${one.header} chapter.`));
  }

  for (const held of standing) {
    if (named.has(`${held.level} ${held.header}`)) continue;
    if (spec.extraSections === false) {
      out.push(
        fault(
          held.header,
          where,
          held.line,
          `The ${kind} schema names no ${held.header} chapter.`,
        ),
      );
    }
  }

  const once = wanted.filter((one) => (one.level ?? level) === level);
  if (spec.order === "strict") out.push(...orderFaults(top, once, kind, where));
  out.push(...lastFaults(top, once, where));

  for (const held of standing) {
    const rule = named.get(`${held.level} ${held.header}`);
    if (rule) out.push(...sectionFaults(held, rule, note, where));
  }
  return out;
}

// [[spec/design_output/schema#three-keywords-name-a-step]]
export function chaptersWanted(sections, front, level) {
  const out = [];
  for (const one of sections ?? []) {
    const list = one["x-one-per"];
    if (!list) {
      out.push({ ...one, level: one.level ?? level });
      continue;
    }
    out.push(...chaptersOf(front?.[list], level, one));
  }
  return out;
}

function chaptersOf(list, level, rule, listed = false) {
  const out = [];
  for (const one of [list ?? []].flat()) {
    if (!one || typeof one !== "object") continue;
    const header = String(one.name ?? "").trim();
    if (!header) continue;
    out.push({
      ...rule,
      header,
      level,
      required: true,
      description: askedOf(one) || sayOf(one),
      form: String(one.form ?? ""),
      "x-fills": Boolean(one.form),
    });
    const asks =
      listed || [one.checklist ?? []].flat().some((it) => String(it ?? "").trim());
    let leaf = true;
    for (const value of Object.values(one)) {
      if (!Array.isArray(value)) continue;
      if (!value.some((it) => it && typeof it === "object" && it.name)) continue;
      out.push(...chaptersOf(value, level + 1, rule, asks));
      if (value === one.steps) leaf = false;
    }
    // [[spec/design_output/pull#the-fields-hold-their-forms]]
    if (asks && leaf && one.evidence) {
      out.push({
        ...rule,
        header: CHECKED,
        level: level + 1,
        required: false,
        description:
          "one line per item of the checklist, on how you take it into account",
        form: "checklist",
        "x-fills": true,
      });
    }
  }
  return out;
}

export const CHECKED = "checked";

// A step the engine parks carries its question in `asks`, and the chapter under it reads that question, so the ticket alone says what the step waits on. [[spec/design_output/pull#a-person-step-goes-in]]
function askedOf(one) {
  return String(one?.asks ?? "")
    .replace(/\s+/g, " ")
    .replace(/--+>/g, "->")
    .trim();
}

// [[spec/design_output/schema#the-render-follows-the-tree]]
function sayOf(one) {
  for (const key of ["does", "says"]) {
    if (String(one?.[key] ?? "").trim()) return String(one[key]).trim();
  }
  return "";
}

function orderFaults(standing, wanted, kind, where) {
  const order = wanted.map((one) => one.header);
  const held = standing.filter((one) => order.includes(one.header));
  const out = [];
  for (let i = 1; i < held.length; i++) {
    if (order.indexOf(held[i].header) > order.indexOf(held[i - 1].header)) continue;
    out.push(
      fault(
        held[i].header,
        where,
        held[i].line,
        `${held[i].header} stands after ${held[i - 1].header}, and a ${kind} note puts it first.`,
      ),
    );
  }
  return out;
}

function lastFaults(standing, wanted, where) {
  const out = [];
  for (const one of wanted) {
    if (one.position !== "last") continue;
    const at = standing.findIndex((held) => held.header === one.header);
    if (at < 0 || at === standing.length - 1) continue;
    out.push(
      fault(
        one.header,
        where,
        standing[at].line,
        `${one.header} closes this note, and ${standing[at + 1].header} stands after it.`,
      ),
    );
  }
  return out;
}

function sectionFaults(held, rule, note, where) {
  const out = [];
  const items = itemsIn(held.own);

  if (rule.list && !items.length) {
    out.push(
      fault(held.header, where, held.line, `${held.header} holds a list of items.`),
    );
  }
  if (rule.ordered && items.some((one) => !NUMBERED.test(one.said))) {
    out.push(
      fault(held.header, where, held.line, `${held.header} numbers every item.`),
    );
  }
  if (rule.maxItems && items.length > rule.maxItems) {
    out.push(
      fault(
        held.header,
        where,
        held.line + items[rule.maxItems].line,
        `A note holds ${rule.maxItems} items.`,
      ),
    );
  }
  if (rule.subsections) {
    out.push(...underFaults(held, rule, note, where));
  }
  if (rule.table) {
    out.push(...tableFaults(held, rule.table, note, where, itemsIn, fault));
  }
  return out;
}

function underFaults(held, rule, note, where) {
  const spec = rule.subsections ?? {};
  const level = spec.headingLevel ?? held.level + 1;
  const at = note.sections.indexOf(held);
  const out = [];
  const numbers = [];

  for (const one of note.sections.slice(at + 1)) {
    if (one.level <= held.level) break;
    if (one.level !== level) continue;
    const found = NUMBERED.exec(one.header);
    if (spec.numbered && !found) {
      out.push(
        fault(
          held.header,
          where,
          one.line,
          `A chapter under ${held.header} opens with the number of the item it argues.`,
        ),
      );
      continue;
    }
    if (found)
      numbers.push({
        said: Number(found[1]),
        line: one.line,
        header: one.header,
      });
  }

  if (spec.order !== "strict") return out;
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i].said > numbers[i - 1].said) continue;
    out.push(
      fault(
        held.header,
        where,
        numbers[i].line,
        `${numbers[i].header} stands after ${numbers[i - 1].header}, and the numbers run up.`,
      ),
    );
  }
  return out;
}

// [[spec/design_output/schema#a-comment-counts-toward-nothing]]
export function itemsIn(rows) {
  const out = [];
  let fenced = false;
  for (let i = 0; i < rows.length; i++) {
    if (FENCE.test(rows[i])) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const said = String(rows[i]).replace(COMMENT, "").trim();
    if (ITEM.test(said)) out.push({ said, line: i + 1 });
  }
  return out;
}

// [[spec/design_output/schema#a-placeholder-stands-at-warning]]
export function placeholderFaults(text, schema, where) {
  const rows = String(text ?? "").split(/\r?\n/);
  const note = readNote(text);
  const props = schema?.frontmatter?.properties ?? {};
  const out = [];

  for (const [key, line] of Object.entries(note.front.lines ?? {})) {
    const rule = props[key];
    if (!rule || rule.const !== undefined || Array.isArray(rule.enum)) continue;
    if (String(rows[line - 1] ?? "").trim() !== `${key}: ${minted(rule)}`) continue;
    out.push(left(where, line, key));
  }

  const named = new Map(
    chaptersWanted(
      schema?.body?.sections ?? [],
      note.front.said ?? {},
      schema?.body?.headingLevel ?? 1,
    )
      .filter((one) => one.description && one["x-fills"] !== false)
      .map((one) => [one.header, `<!-- ${one.description} -->`]),
  );
  for (const held of note.sections) {
    const said = named.get(held.header);
    if (!said) continue;
    const at = held.own.findIndex((line) => String(line).trim() === said);
    if (at < 0) continue;
    out.push(left(where, held.line + at + 1, held.header));
  }
  return out;
}

export function left(file, line, what) {
  return {
    file,
    rule: "Schema.Placeholder",
    line,
    column: 1,
    message: `${what} still carries the placeholder mint writes. Say what stands there.`,
    severity: LEFT,
  };
}

export function minted(rule) {
  if (rule?.const !== undefined) {
    return rule["x-link"] ? `[[${rule.const}]]` : String(rule.const);
  }
  if (Array.isArray(rule?.enum)) return String(rule.enum[0]);

  const said = String(rule?.description ?? "what goes here");
  if ([rule?.type].flat().includes("array")) return `["${said}"]`;
  return rule?.["x-link"] ? `[[${said}]]` : said;
}
