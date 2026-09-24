// The note reader: the frontmatter and the sections a markdown file holds,
// read once so every checker walks the same shape.
// [[spec/design_output/schema#what-a-note-reads-as]]

import { linkless } from "./schema-fault.js";
import { readYaml } from "./schema-yaml.js";

const HEADING = /^(#{1,6})\s+(.+?)\s*$/;

export const FENCE = /^\s*(```|~~~)/;

// [[spec/design_output/schema#what-a-note-reads-as]]
export function readNote(text) {
  const rows = String(text ?? "").split(/\r?\n/);
  return { front: frontOf(rows), sections: sectionsOf(rows) };
}

function frontOf(rows) {
  if (rows[0]?.trim() !== "---") return { stands: false, said: {}, lines: {} };
  const close = rows.findIndex((line, i) => i > 0 && line.trim() === "---");
  if (close < 0) return { stands: false, said: {}, lines: {} };

  const held = rows.slice(1, close);
  const map = new Map();
  const said = readYaml(held.join("\n"), map);
  const lines = {};
  for (const [path, line] of map) lines[path] = line + 1;
  return { stands: true, said, lines };
}

function sectionsOf(rows) {
  const out = [];
  let fenced = false;
  for (let i = 0; i < rows.length; i++) {
    if (FENCE.test(rows[i])) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const found = HEADING.exec(rows[i]);
    if (found) {
      out.push({
        header: found[2],
        level: found[1].length,
        line: i + 1,
        own: [],
      });
      continue;
    }
    if (out.length) out[out.length - 1].own.push(rows[i]);
  }
  return out;
}

// The section a step's chapter opens on, one heading level a step deep, or -1. [[spec/design_output/schema#what-a-note-reads-as]]
export function sectionAt(sections, path) {
  const parts = path.split("/");
  let from = 0;
  let found = -1;
  for (let depth = 0; depth < parts.length; depth++) {
    const level = depth + 1;
    found = -1;
    for (let i = from; i < sections.length; i++) {
      if (sections[i].level < level && i > from) break;
      if (sections[i].level === level && sections[i].header === parts[depth]) {
        found = i;
        break;
      }
    }
    if (found < 0) return -1;
    from = found + 1;
  }
  return found;
}

// [[spec/design_output/schema#what-a-note-reads-as]]
export function kindOf(text) {
  const said = frontOf(String(text ?? "").split(/\r?\n/)).said.kind;
  return said ? String(linkless(said)) : "";
}
