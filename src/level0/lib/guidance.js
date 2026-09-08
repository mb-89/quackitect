// Reads a guidance note and answers its chapters. Level zero hands the agent
// the Actionables chapter and no other.
// [[spec/design_output/level0#the-standing-layer]]

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
  let list = null;
  for (const line of found[1].split(/\r?\n/)) {
    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && list) {
      out[list].push(item[1].trim());
      continue;
    }
    const pair = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (!pair) continue;
    if (pair[2].trim()) {
      list = null;
      out[pair[1]] = pair[2];
    } else {
      out[pair[1]] = [];
      list = pair[1];
    }
  }
  return out;
}

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
    if (held && line.trim()) held += ` ${line.trim()}`;
    else if (held) {
      out.push(held);
      held = null;
    }
  }
  if (held) out.push(held);
  return out.map((one) => one.replace(/\s*\*$/, "").trim()).filter(Boolean);
}

// [[spec/design_output/level0#guidance-a-variable-switches-on]]
export function envOf(text) {
  const said = parse(text).front.env;
  if (!said) return [];
  return (Array.isArray(said) ? said : [said])
    .map((one) => String(one).trim())
    .filter(Boolean);
}

export function bindsHere(text, env) {
  const wants = envOf(text);
  if (!wants.length) return true;
  return wants.some((name) => truthy(env?.[name]));
}

function truthy(said) {
  const t = String(said ?? "")
    .trim()
    .toLowerCase();
  return Boolean(t) && t !== "0" && t !== "false";
}

export function standingLayer(notes) {
  const said = [];
  for (const note of notes) {
    const rules = actionables(note.text);
    if (!rules.length) continue;
    said.push(`### ${titleOf(note)}`);
    said.push("");
    said.push(...rules.map((one, i) => `${i + 1}. ${one}`));
    said.push("");
  }
  return said.join("\n").trim();
}

function titleOf(note) {
  return String(note.name ?? "")
    .replace(/\.md$/, "")
    .replace(/[-_]/g, " ");
}
