// The model as a judge, for the rules no pattern holds. Pure JavaScript with no
// `node:` import, so the write door and the command line share one judge.
//
// A judged rule is a question with a closed set of answers. The model picks one
// word or names none, which keeps it from waffling and makes a refusal
// decidable. It sees one span, with no tools and no conversation.
//
// A model that names no label passes the text, which is how this tree treats
// every checker that cannot run.
//
// THE JUDGE QUIETENS AS A SESSION PROVES ITSELF. It reads every span of the
// first few writes, then samples. A breach puts it back to reading everything,
// so an agent that starts writing background again meets it at once.

export const DEFAULTS = {
  enabled: true,
  model: "haiku",
  maxSpans: 24,
  warmupWrites: 4,
  thenEveryNth: 3,
  rules: [],
};

export function judgeOf(config = {}) {
  const settings = { ...DEFAULTS, ...(config.judge ?? {}) };
  let written = 0;
  let clean = 0;

  return {
    settings,

    // Whether this write is read. The answer moves the counters, so a caller
    // asks once per write.
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

    async run(text, classify) {
      if (!classify) return [];
      const found = [];
      const spans = spansIn(text).slice(0, settings.maxSpans);

      for (const span of spans) {
        for (const rule of settings.rules) {
          let said;
          try {
            said = await classify(`${rule.ask}\n\nText:\n${span.text}`, rule.labels, {
              model: settings.model,
            });
          } catch {
            said = undefined;
          }
          if (said !== rule.refuses) continue;
          found.push({
            rule: rule.name,
            line: span.line,
            column: 1,
            said: cut(span.text),
            message: `${rule.instead}`,
            severity: "error",
            fixable: false,
          });
        }
      }
      return found;
    },
  };
}

// One span per paragraph. A list, a table, a heading and a fenced block carry
// no prose to judge, so none of them becomes a span.
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
    if (/^\s*(```|~~~)/.test(line)) { close(); fenced = !fenced; continue; }
    if (fenced) continue;
    if (!line.trim()) { close(); continue; }
    const t = line.trim();
    if (t.startsWith("#") || t.startsWith("|") || t.startsWith(">")
      || /^[-*+]\s/.test(t) || /^\d+[.)]\s/.test(t) || /^(---|===)/.test(t)
      || /^<!--/.test(t)) {
      close();
      continue;
    }
    if (!held.length) at = i + 1;
    held.push(t);
  }
  close();
  // A one-line span is rarely background and costs a call, so it is left alone.
  return out.filter((one) => one.text.split(/\s+/).length >= 12);
}

function cut(said, at = 72) {
  const flat = String(said ?? "").replace(/\s+/g, " ").trim();
  return flat.length > at ? flat.slice(0, at - 3) + "..." : flat;
}
