// Runs the voice rules over one text and answers findings. Pure JavaScript, so
// the hooks module, the linter and the language server share one reading.
//
// An exemption is written on the line it exempts, or on the line above it:
//
//     <!-- voice antithesis = NO: the phrase is the thing being quoted -->
//
// An exemption naming no reason is refused the same as a breach, because a rule
// switched off for no stated reason is a rule nobody trusts.

import { rules, byName, judged } from "./rules.mjs";
import { paragraphsIn, proseLines, sentencesIn } from "./text.mjs";

const MARKER = /<!--\s*voice\s+([a-z-]+)\s*=\s*NO\s*(?::\s*(.*?))?\s*-->/i;

export function exemptionsIn(text) {
  const out = new Map();
  const bad = [];
  const lines = String(text ?? "").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const found = MARKER.exec(lines[i]);
    if (!found) continue;
    const rule = found[1].toLowerCase();
    const reason = (found[2] ?? "").trim();
    if (!reason) {
      bad.push({ rule, line: i + 1 });
      continue;
    }
    // The marker covers its own line and the line under it, so it may stand
    // above the sentence it exempts or beside it.
    for (const line of [i + 1, i + 2]) {
      if (!out.has(line)) out.set(line, new Map());
      out.get(line).set(rule, reason);
    }
  }
  return { allowed: out, unreasoned: bad };
}

function exempt(allowed, line, rule) {
  return allowed.get(line)?.get(rule);
}

export function check(text, options = {}) {
  const only = options.only ? new Set(options.only) : undefined;
  const wanted = rules.filter((r) => !only || only.has(r.name));
  const { allowed, unreasoned } = exemptionsIn(text);
  const found = [];

  for (const { rule, line } of unreasoned) {
    found.push({
      rule: "exemption-carries-a-reason",
      line,
      said: rule,
      why: "An exemption names why the rule is switched off on this line.",
      instead: `Write the reason: <!-- voice ${rule} = NO: why -->`,
      severity: "error",
    });
  }

  for (const rule of wanted.filter((r) => r.scope === "line")) {
    for (const { text: line, line: at } of proseLines(text)) {
      if (MARKER.test(line)) continue;
      if (exempt(allowed, at, rule.name)) continue;
      for (const hit of rule.find(line)) {
        found.push(one(rule, at, hit));
      }
    }
  }

  for (const rule of wanted.filter((r) => r.scope === "paragraph")) {
    for (const { text: body, line: at } of paragraphsIn(text)) {
      if (exempt(allowed, at, rule.name)) continue;
      for (const hit of rule.find(body)) {
        found.push(one(rule, at, hit));
      }
    }
  }

  found.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
  return found;
}

function one(rule, line, hit) {
  return {
    rule: rule.name,
    line,
    column: (hit.index ?? 0) + 1,
    said: hit.said,
    why: rule.why,
    instead: hit.instead ?? rule.instead,
    severity: "error",
    fixable: Boolean(rule.fix),
  };
}

// The judged rules need a model, so they take the caller's classifier rather
// than reaching for one. A classifier answering nothing passes the text, which
// is how the engine treats any checker that cannot run.
export async function judge(text, classify, options = {}) {
  const { allowed } = exemptionsIn(text);
  const found = [];
  const wanted = options.only ? judged.filter((r) => options.only.includes(r.name)) : judged;
  if (!classify || !wanted.length) return found;

  for (const { text: body, line: at } of paragraphsIn(text)) {
    for (const sentence of sentencesIn(body)) {
      for (const rule of wanted) {
        if (exempt(allowed, at, rule.name)) continue;
        let said;
        try {
          said = await classify(rule.ask(sentence), rule.labels);
        } catch {
          said = undefined;
        }
        if (said !== rule.refuses) continue;
        found.push({
          rule: rule.name,
          line: at,
          column: 1,
          said: sentence,
          why: rule.why,
          instead: rule.instead,
          severity: "error",
          fixable: false,
        });
      }
    }
  }
  return found;
}

export function applyFixes(text) {
  let out = text;
  for (const rule of rules.filter((r) => r.fix)) {
    const { allowed } = exemptionsIn(out);
    const lines = out.split(/\r?\n/);
    let fenced = false;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*(```|~~~)/.test(lines[i])) { fenced = !fenced; continue; }
      if (fenced || MARKER.test(lines[i])) continue;
      if (exempt(allowed, i + 1, rule.name)) continue;
      const hits = rule.find(lines[i]);
      for (let h = hits.length - 1; h >= 0; h--) {
        const hit = hits[h];
        const put = rule.fix(hit.said);
        if (put === undefined || put === hit.said) continue;
        lines[i] = lines[i].slice(0, hit.index) + put + lines[i].slice(hit.index + hit.length);
      }
    }
    out = lines.join("\n");
  }
  return out;
}

export { rules, byName, judged };
