// The model as a judge, for the rules no pattern holds. A judged rule is a
// question with a closed set of answers, read from spec/config/styles/VoiceJudged.
// [[spec/design_output/level0#the-judge-costs-a-call]]

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
            message: rule.message,
            severity: "error",
            fixable: false,
          });
        }
      }
      return found;
    },
  };
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

function cut(said, at = 72) {
  const flat = String(said ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return flat.length > at ? `${flat.slice(0, at - 3)}...` : flat;
}
