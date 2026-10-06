// A ticket's chapter for one leaf: whether it stands, its own lines, and the
// lines under each field heading, past comments, answers and fences.
// [[spec/design_output/pull#the-fields-hold-their-forms]]

import { readNote, sectionAt } from "../../.claude/skills/level0/lib/schema.js";
import { ANSWERED, COMMENT, FENCE } from "./pull-route.js";

export function chapterOf(text, path) {
  const sections = readNote(text).sections;
  const found = sectionAt(sections, path);
  if (found < 0) return { stands: false, own: [], fields: new Map() };

  const level = path.split("/").length;
  const own = lines(sections[found].own);
  const fields = new Map();
  for (let i = found + 1; i < sections.length; i++) {
    if (sections[i].level <= level) break;
    if (sections[i].level === level + 1) {
      fields.set(sections[i].header, lines(sections[i].own));
    }
  }
  return { stands: true, own, fields };
}

export function lines(own) {
  return (own ?? [])
    .filter(
      (row) =>
        row.trim() && !COMMENT.test(row) && !ANSWERED.test(row) && !FENCE.test(row),
    )
    .map((row) => row.trim());
}
