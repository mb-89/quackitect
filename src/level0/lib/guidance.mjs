// Reads a guidance note and answers its chapters. Pure JavaScript with no
// `node:` import, so level zero and the command line read one parser.
//
// A guidance note carries three chapters. Motivation says why it exists.
// Actionables holds one rule per item, and that chapter is the one the agent is
// handed. Discussion argues the rules for a reader who disagrees with one.
//
// THE ACTIONABLES ARE INJECTED AND NEVER PROJECTED. Level zero reads them at
// session start and appends them to the system prompt, so no file in the tree
// carries a copy and nothing has to keep one in step.

export const CHAPTERS = ["Motivation", "Actionables", "Discussion"];

export function parse(text) {
  const body = String(text ?? "").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const out = { front: frontOf(text), chapters: {} };

  let heading = null;
  let held = [];
  const close = () => {
    if (heading) out.chapters[heading] = held.join("\n").trim();
    held = [];
  };

  for (const line of body.split(/\r?\n/)) {
    const found = /^#\s+(.+?)\s*$/.exec(line);
    if (found) {
      close();
      heading = found[1];
      continue;
    }
    if (heading) held.push(line);
  }
  close();
  return out;
}

function frontOf(text) {
  const found = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(text ?? ""));
  if (!found) return {};
  const out = {};
  for (const line of found[1].split(/\r?\n/)) {
    const pair = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (pair) out[pair[1]] = pair[2];
  }
  return out;
}

// The rules of one note, one per item, with the detail marker stripped. A rule
// carrying a marker has a chapter under Discussion arguing it.
export function actionables(text) {
  const chapter = parse(text).chapters.Actionables;
  if (!chapter) return [];

  const out = [];
  let held = null;
  for (const line of chapter.split(/\r?\n/)) {
    const found = /^\s*(?:\d+[.)]|[-*+])\s+(.*)$/.exec(line);
    if (found) {
      if (held) out.push(held);
      held = found[1].trim();
      continue;
    }
    if (held && line.trim()) held += " " + line.trim();
    else if (held) { out.push(held); held = null; }
  }
  if (held) out.push(held);
  return out.map((one) => one.replace(/\s*\*$/, "").trim()).filter(Boolean);
}

// What the agent is handed: every guidance note's Actionables chapter, under
// that note's title. `notes` is `[{ name, text }]`.
export function standingLayer(notes) {
  const said = [];
  for (const note of notes) {
    const rules = actionables(note.text);
    if (!rules.length) continue;
    said.push("### " + titleOf(note));
    said.push("");
    said.push(...rules.map((one, i) => `${i + 1}. ${one}`));
    said.push("");
  }
  return said.join("\n").trim();
}

function titleOf(note) {
  return String(note.name ?? "").replace(/\.md$/, "").replace(/[-_]/g, " ");
}
