// The voice verbs, and the pure half of both. `measure` scores a folder of
// prose, and `refused` ranks what the doors turn away. Every function here
// takes rows and answers rows, so a test drives it over a fixture.
// [[spec/design_output/projection#the-second-target]]

import { inRun } from "./folders.js";

export const MEASURED = inRun("measure");
export const SHORTEST = 25;
export const DAYS = 7;
export const ANSWER = "answer.md";

const WORD = /[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g;
const TOP = 3;
const PER = 1000;
const TENTHS = 10;
const ORDINAL = 3;
const HEADS = ["file", "words", "findings", `per ${PER} words`, "top rules"];
const TEXT_HEADS = new Set(["file", "top rules"]);
const NUMERIC = HEADS.flatMap((name, at) => (TEXT_HEADS.has(name) ? [] : [at]));

// [[spec/design_output/projection#the-second-target]]
export function wordsIn(said) {
  return (String(said ?? "").match(WORD) ?? []).length;
}

// [[spec/design_output/projection#the-second-target]]
export function rowsIn(texts) {
  const out = [];
  for (const text of [texts].flat()) {
    for (const line of String(text ?? "").split(/\r?\n/)) {
      if (!line.trim()) continue;
      try {
        out.push(JSON.parse(line));
      } catch {}
    }
  }
  return out;
}

// [[spec/design_output/projection#the-second-target]]
export function answersIn(text) {
  const out = [];
  for (const row of rowsIn(text)) {
    const said = answerOf(row);
    if (said && wordsIn(said) >= SHORTEST) out.push(said);
  }
  return out;
}

// [[spec/design_output/projection#the-second-target]]
function answerOf(row) {
  if (row?.type !== "assistant") return "";
  if (row?.isSidechain || row?.agentId) return "";
  const blocks = row?.message?.content;
  if (!Array.isArray(blocks)) return "";
  return blocks
    .filter((one) => one?.type === "text" && typeof one.text === "string")
    .map((one) => one.text)
    .join("\n\n")
    .trim();
}

// [[spec/design_output/projection#the-second-target]]
export function answerFiles(session, answers) {
  return [answers].flat().map((said, i) => ({
    path: `${MEASURED}/${session}/${String(i + 1).padStart(ORDINAL, "0")}-${ANSWER}`,
    text: `${String(said).trimEnd()}\n`,
  }));
}

// [[spec/design_output/projection#the-second-target]]
export function scoreOf(words, findings) {
  if (!words) return 0;
  return Math.round((findings / words) * PER * TENTHS) / TENTHS;
}

// [[spec/design_output/projection#the-second-target]]
export function leafOf(said) {
  const flat = String(said ?? "").trim();
  return flat.includes(".") ? flat.slice(flat.lastIndexOf(".") + 1) : flat;
}

// [[spec/design_output/projection#the-second-target]]
export function ruleCounts(found) {
  const by = new Map();
  for (const one of [found].flat()) {
    const rule = leafOf(one?.rule);
    if (!rule) continue;
    by.set(rule, (by.get(rule) ?? 0) + 1);
  }
  return [...by].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

// [[spec/design_output/projection#the-second-target]]
export function measuredRows(files) {
  return [files].flat().map((one) => {
    const found = [one?.found ?? []].flat();
    return {
      file: String(one?.file ?? ""),
      words: Number(one?.words ?? 0),
      findings: found.length,
      score: scoreOf(Number(one?.words ?? 0), found.length),
      top: ruleCounts(found).slice(0, TOP),
    };
  });
}

// [[spec/design_output/projection#the-second-target]]
export function totalOf(rows) {
  const words = rows.reduce((n, one) => n + one.words, 0);
  const findings = rows.reduce((n, one) => n + one.findings, 0);
  return { file: "TOTAL", words, findings, score: scoreOf(words, findings), top: [] };
}

// [[spec/design_output/projection#the-second-target]]
export function sinceOf(now, days) {
  const at = new Date(now);
  at.setUTCDate(at.getUTCDate() - Number(days));
  return at.toISOString();
}

// [[spec/design_output/projection#the-second-target]]
export function refusalsIn(rows, since) {
  return [rows].flat().filter((one) => {
    if (one?.level !== "warn" || !one?.rule) return false;
    return since ? String(one.at ?? "") >= String(since) : true;
  });
}

// [[spec/design_output/projection#the-second-target]]
export function rankedRefusals(rows) {
  const by = new Map();
  for (const one of [rows].flat()) {
    const rule = leafOf(one?.rule);
    const phrase = String(one?.phrase ?? "").trim() || String(one?.tool ?? "").trim();
    const key = JSON.stringify([rule, phrase]);
    const held = by.get(key) ?? { rule, phrase, fires: 0 };
    held.fires += 1;
    by.set(key, held);
  }
  return [...by.values()].sort(
    (a, b) =>
      b.fires - a.fires ||
      a.rule.localeCompare(b.rule) ||
      a.phrase.localeCompare(b.phrase),
  );
}

// [[spec/design_output/projection#the-second-target]]
export function tabled(head, rows, right = []) {
  const all = [head, ...rows].map((row) => row.map((one) => String(one ?? "")));
  const wide = head.map((_, i) => Math.max(...all.map((row) => (row[i] ?? "").length)));
  return all
    .map((row) =>
      row
        .map((one, i) =>
          right.includes(i) ? one.padStart(wide[i]) : one.padEnd(wide[i]),
        )
        .join("  ")
        .trimEnd(),
    )
    .join("\n");
}

// [[spec/design_output/projection#the-second-target]]
export function measureTable(rows) {
  const shown = rows.map((one) => [
    one.file,
    one.words,
    one.findings,
    one.score.toFixed(1),
    one.top.map(([rule, n]) => `${rule} ${n}`).join(", "),
  ]);
  return tabled(HEADS, shown, NUMERIC);
}

// [[spec/design_output/projection#the-second-target]]
export function refusedTable(ranked) {
  const shown = ranked.map((one) => [one.rule, one.fires, one.phrase]);
  return tabled(["rule", "fires", "phrase"], shown, [1]);
}
