// Counts runs of plain paragraphs, so a wall of prose is a finding. Pure
// JavaScript with no `node:` import, so the write door, the command line and
// the turn's end all read one checker.
//
// A list, a table, a diagram and a heading each break a run. Prose that keeps
// going past the limit without one is what this refuses.
//
// The limits differ by where the text goes. An answer holds one paragraph
// before a reader wants structure; a document carries more.

export const IN_AN_ANSWER = 1;
export const IN_A_DOCUMENT = 3;

const FENCE = /^\s*(```|~~~)/;

// A line that is structure rather than prose. Each one ends a run.
export function isStructure(line) {
  const t = line.trim();
  return t.startsWith("#")
    || t.startsWith("|")
    || t.startsWith(">")
    || /^[-*+]\s/.test(t)
    || /^\d+[.)]\s/.test(t)
    || /^(---|===|\*\*\*)/.test(t)
    || /^<!--/.test(t)
    || /^\s{4,}\S/.test(line);
}

// The runs of consecutive prose paragraphs in one text, each with the line it
// opens on and how many paragraphs it holds.
export function proseRuns(text) {
  const lines = String(text ?? "").split(/\r?\n/);
  const runs = [];

  let fenced = false;
  let inParagraph = false;
  let run = 0;
  let at = 0;

  const endRun = () => {
    if (run) runs.push({ line: at, paragraphs: run });
    run = 0;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (FENCE.test(line)) {
      // A fenced block is a diagram or code, and it breaks a run.
      inParagraph = false;
      endRun();
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;

    if (!line.trim()) { inParagraph = false; continue; }

    if (isStructure(line)) {
      inParagraph = false;
      endRun();
      continue;
    }

    if (!inParagraph) {
      inParagraph = true;
      if (!run) at = i + 1;
      run++;
    }
  }
  endRun();
  return runs;
}

// The findings, in the shape every other checker answers.
export function tooMuchProse(text, max = IN_A_DOCUMENT) {
  return proseRuns(text)
    .filter((run) => run.paragraphs > max)
    .map((run) => ({
      rule: "PreferStructure",
      line: run.line,
      column: 1,
      said: `${run.paragraphs} paragraphs in a row`,
      message:
        `${run.paragraphs} paragraphs run together with no list, table or diagram. `
        + `Hold prose to ${max} and carry the rest as structure.`,
      severity: "error",
      fixable: false,
    }));
}
