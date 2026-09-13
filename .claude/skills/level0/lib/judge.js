// The model as a judge, for the rules no pattern holds. A judged rule is a
// question with a closed set of answers, read from spec/config/styles/VoiceJudged.
// [[spec/design_output/level0#the-judge-costs-a-call]]

import { matches } from "./paths.js";

// [[spec/design_output/level0#a-judged-rule-scopes]]
export function readsFor(rule, path) {
  if (!path) return true;

  const only = rule?.reads;
  if (Array.isArray(only) && !only.some((glob) => matches(glob, path))) return false;

  const globs = rule?.ignores;
  if (!Array.isArray(globs)) return true;
  return !globs.some((glob) => matches(glob, path));
}

// [[spec/design_output/config#a-caller-hands-it-in]]
export function judgeOf(said = {}, rules = []) {
  const settings = { ...said, rules };
  let written = 0;
  let clean = 0;

  return {
    settings,

    reads() {
      if (!settings.enabled || !settings.rules.length) return false;
      written++;
      if (written <= settings.warmupWrites) return true;
      return clean % Math.max(1, settings.thenEveryNth) === 0;
    },

    sawBreach() {
      clean = 0;
      written = 0;
    },

    sawClean() {
      clean++;
    },

    async run(text, classify, path) {
      if (!classify) return [];
      const asking = settings.rules.filter((rule) => readsFor(rule, path));
      if (!asking.length) return [];

      const found = [];

      for (const [cut, rules] of grouped(asking)) {
        for (const span of cut(text).slice(0, settings.maxSpans)) {
          for (const rule of rules) {
            let said;
            try {
              said = await classify(`${rule.ask}\n\nText:\n${span.text}`, rule.labels, {
                model: settings.model,
              });
            } catch {
              said = undefined;
            }
            if (!refusedBy(rule, said)) continue;
            found.push({
              rule: rule.name,
              line: span.line,
              column: 1,
              said: shortened(span.text),
              message: rule.message,
              severity: "error",
              fixable: false,
            });
          }
        }
      }
      return found;
    },
  };
}

// [[spec/design_output/level0#a-judged-rule-scopes]]
export function refusedBy(rule, said) {
  if (typeof said !== "string") return false;
  return [].concat(rule?.refuses ?? []).includes(said);
}

// [[spec/design_output/level0#a-judged-rule-cuts]]
const CUTS = new Map([
  ["paragraph", spansIn],
  ["chapter", chaptersIn],
]);

// [[spec/design_output/level0#a-judged-rule-cuts]]
export function cutFor(rule) {
  return CUTS.get(String(rule?.span ?? "paragraph")) ?? spansIn;
}

function grouped(rules) {
  const out = new Map();
  for (const rule of rules) {
    const cut = cutFor(rule);
    if (!out.has(cut)) out.set(cut, []);
    out.get(cut).push(rule);
  }
  return out;
}

export function spansIn(text) {
  const lines = String(text ?? "").split(/\r?\n/);
  const out = [];
  let held = [];
  let at = 0;
  let fenced = false;

  const close = () => {
    if (held.length) out.push({ text: held.join(" "), line: at });
    held = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      close();
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    if (!line.trim()) {
      close();
      continue;
    }
    const t = line.trim();
    if (
      t.startsWith("#") ||
      t.startsWith("|") ||
      t.startsWith(">") ||
      /^[-*+]\s/.test(t) ||
      /^\d+[.)]\s/.test(t) ||
      /^(---|===)/.test(t) ||
      /^<!--/.test(t)
    ) {
      close();
      continue;
    }
    if (!held.length) at = i + 1;
    held.push(t);
  }
  close();
  return out.filter((one) => one.text.split(/\s+/).length >= 12);
}

// [[spec/design_output/level0#a-judged-rule-cuts]]
export function chaptersIn(text) {
  const lines = bodyOf(text);
  const out = [];
  let held = [];
  let at = 1;
  let fenced = false;

  const close = () => {
    if (held.join(" ").trim()) out.push({ text: held.join("\n").trim(), line: at });
    held = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      held.push(line);
      continue;
    }
    if (!fenced && /^#{1,6}\s/.test(line.trim())) {
      close();
      at = i + 1;
    }
    held.push(line);
  }
  close();
  return out.filter((one) => one.text.split(/\s+/).length >= 12);
}

// [[spec/design_output/level0#a-judged-rule-cuts]]
function bodyOf(text) {
  const lines = String(text ?? "").split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return lines;
  const shut = lines.findIndex((line, i) => i > 0 && line.trim() === "---");
  if (shut < 0) return lines;
  return lines.map((line, i) => (i <= shut ? "" : line));
}

function shortened(said, at = 72) {
  const flat = String(said ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return flat.length > at ? `${flat.slice(0, at - 3)}...` : flat;
}
