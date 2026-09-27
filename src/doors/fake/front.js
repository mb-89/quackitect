// A front writer in memory, which writes what se-front writes. The contract
// test holds it to the binary's answers.
// [[spec/tickets/go-writes-the-frontmatter]]

import { behaves } from "./behaves.js";

const FENCE = "---";
const ENTRY = "  - ";
const FIELD = "    ";
const NESTED = "      - ";
const DEEPER = "        ";
const MARKS = "\"'[{&*!|>%@`#";
const LINK = /^\[\[[^[\]]*\]\]$/;

export function fakeFront() {
  return behaves(
    {
      set: (text, key, value) =>
        written(text, (one) => {
          const said = String(value);
          const row = `${key}: ${flowish(said) ? said : quote(said)}`;
          const at = keyAt(one.rows, key);
          if (at < 0) one.rows.push(row);
          else one.rows.splice(at, blockEnd(one.rows, at) - at, row);
        }),
      drop: (text, key) =>
        written(text, (one) => {
          const at = keyAt(one.rows, key);
          if (at >= 0) one.rows.splice(at, blockEnd(one.rows, at) - at);
        }),
      entry: (text, item) => entry(String(text ?? ""), item),
      after: (text, hash) => written(text, (one) => after(one.rows, String(hash))),
      mint: (fields) =>
        `${[FENCE, ...Object.entries(fields).flatMap(([key, said]) => keyRows(key, said, 0)), FENCE].join("\n")}\n`,
    },
    "front",
  );
}

// [[spec/tickets/go-writes-the-frontmatter]]
export function quote(said) {
  if (LINK.test(said)) return said;
  const plain =
    said !== "" &&
    !said.includes(": ") &&
    !said.includes(" #") &&
    !MARKS.includes(said[0]) &&
    !said.startsWith("- ") &&
    !said.endsWith(" ") &&
    !/[\n\r]/.test(said);
  if (plain) return said;
  return `"${said.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r")}"`;
}

// The note split at its fences: the front rows, the line end, and the text past the closing fence. A note with no front comes back as it stands. [[spec/tickets/go-writes-the-frontmatter]]
function written(text, change) {
  const said = String(text ?? "");
  const lines = said.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  if (!lines.length || lines[0].replace(/\r?\n$/, "") !== FENCE) return said;
  const eol = lines[0].endsWith("\r\n") ? "\r\n" : "\n";
  const shut = lines.findIndex(
    (one, at) => at > 0 && one.replace(/\r?\n$/, "") === FENCE,
  );
  if (shut < 0) return said;
  const one = {
    rows: lines.slice(1, shut).map((row) => row.replace(/\r?\n$/, "")),
  };
  change(one);
  return (
    [FENCE, ...one.rows].map((row) => row + eol).join("") + lines.slice(shut).join("")
  );
}

function flowish(said) {
  return (
    !LINK.test(said) &&
    ((said.startsWith("[") && said.endsWith("]")) ||
      (said.startsWith("{") && said.endsWith("}")))
  );
}

function keyAt(rows, key) {
  return rows.findIndex((row) => row === `${key}:` || row.startsWith(`${key}: `));
}

function blockEnd(rows, opens) {
  let at = opens + 1;
  while (at < rows.length && /^[ \t-]/.test(rows[at])) at++;
  return at;
}

function entry(text, item) {
  const rows = itemRows(item);
  if (!rows.length) return text;
  return written(text, (one) => {
    const at = keyAt(one.rows, "record");
    if (at < 0) {
      one.rows.push("record:", ...rows);
      return;
    }
    const ends = blockEnd(one.rows, at);
    one.rows.splice(ends, 0, ...rows);
  });
}

function itemRows(item) {
  const out = [];
  for (const [key, said] of Object.entries(item ?? {})) {
    if (isEmpty(said)) continue;
    const lead = out.length ? FIELD : ENTRY;
    if (!Array.isArray(said)) {
      out.push(`${lead}${key}: ${scalar(said)}`);
      continue;
    }
    out.push(`${lead}${key}:`);
    for (const each of said) {
      const pairs = Object.entries(each ?? {}).filter(
        ([, value]) => value !== undefined && value !== null,
      );
      for (const [at, [name, value]] of pairs.entries()) {
        out.push(`${at ? DEEPER : NESTED}${name}: ${scalar(value)}`);
      }
    }
  }
  return out;
}

function isEmpty(said) {
  return (
    said === undefined ||
    said === null ||
    said === "" ||
    (Array.isArray(said) && !said.length)
  );
}

function after(rows, hash) {
  const opens = keyAt(rows, "record");
  if (opens < 0) return;
  const ends = blockEnd(rows, opens);
  const starts = [];
  for (let at = opens + 1; at < ends; at++)
    if (rows[at].startsWith(ENTRY)) starts.push(at);
  if (!starts.length) return;
  const spans = starts.map((one, which) => [one, starts[which + 1] ?? ends]);
  const row = `${FIELD}hash_after: ${quote(hash)}`;
  const holds = ([from, to], key) =>
    rows
      .slice(from, to)
      .some((one) => one.replace(ENTRY, "").trimStart().startsWith(`${key}:`));
  const open = spans
    .filter((one) => holds(one, "hash_before") && !holds(one, "hash_after"))
    .at(-1);
  if (open) {
    rows.splice(open[1], 0, row);
    return;
  }
  const [from, to] = spans.at(-1);
  for (let at = from; at < to; at++) {
    if (rows[at].trimStart().startsWith("hash_after:")) rows[at] = row;
  }
}

function scalar(said) {
  if (said === null || said === undefined) return "";
  if (typeof said === "boolean" || typeof said === "number") return String(said);
  return quote(String(said));
}

function isObject(said) {
  return Boolean(said) && typeof said === "object" && !Array.isArray(said);
}

function keyRows(key, said, pad) {
  const gap = " ".repeat(pad);
  if (isObject(said)) return [`${gap}${key}:`, ...blockRows(said, pad + 2)];
  if (Array.isArray(said)) {
    if (said.some(isObject)) return [`${gap}${key}:`, ...blockRows(said, pad + 2)];
    return [`${gap}${key}: ${flow(said)}`];
  }
  if (said === null || said === undefined) return [`${gap}${key}:`];
  return [`${gap}${key}: ${scalar(said)}`];
}

function blockRows(said, pad) {
  const gap = " ".repeat(pad);
  if (isObject(said)) {
    return Object.entries(said).flatMap(([key, value]) => keyRows(key, value, pad));
  }
  return said.flatMap((each) => {
    if (!isObject(each)) return [`${gap}- ${scalar(each)}`];
    const rows = Object.entries(each).flatMap(([key, value]) =>
      keyRows(key, value, pad + 2),
    );
    if (!rows.length) return [];
    return [`${gap}- ${rows[0].trimStart()}`, ...rows.slice(1)];
  });
}

function flow(list) {
  const items = list.map(
    (each) =>
      `"${String(each ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')}"`,
  );
  return `[${items.join(", ")}]`;
}
