// The fill verb: a ticket a person saves with a process and no route takes
// what the mint writes for it. The frontmatter and the chapters the person
// wrote ride in as the mint's fields, so the mint verb and the fill share one
// road. `--stdout` prints the text, and writes nothing.
// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]

import { readNote } from "../../.claude/skills/level0/lib/schema.js";
import { mintedNote } from "../../.claude/skills/level0/lib/schema-mint.js";
import { processAt, withRoute } from "./process.js";

const STDOUT = "--stdout";
// The chapters a person writes before the fill, which ride into the mint as they stand. [[spec/schemas/ticket.schema.yaml]]
const WRITTEN = ["Ask", "Discussion"];
const COMMENT = /^\s*<!--.*-->\s*$/;

// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
export function filled(it, at, argv, schemas) {
  const text = it.disk.read(at.path);
  const note = readNote(text);
  const front = note.front.said ?? {};
  if ([front.steps ?? []].flat().length) {
    console.log(`${at.said} carries a route already, so the fill copies nothing.`);
    return 0;
  }

  const root = it.method ?? it.root;
  if (!String(front.process ?? "").trim()) {
    console.error(processAt(it.disk, root, it.join, "").why);
    return 2;
  }
  const fields = { ...front };
  for (const header of WRITTEN) {
    const said = chapterText(note.sections, header);
    if (said) fields[header] = said;
  }
  const schema = schemas.get("ticket");
  const copied = withRoute(it.disk, root, it.join, schema, fields);
  if (copied.why) {
    console.error(copied.why);
    return 2;
  }

  const made = mintedNote(schemas, { kind: "ticket", path: at.said, fields: copied.fields });
  if (made.why) {
    console.error(made.why);
    return 2;
  }
  if ((argv ?? []).includes(STDOUT)) {
    console.log(made.text.trimEnd());
    return 0;
  }
  it.disk.write(at.path, made.text);
  console.log(JSON.stringify({ ticket: at.said, process: copied.process.link }));
  return 0;
}

function chapterText(sections, header) {
  const one = sections.find((it) => it.level === 1 && it.header === header);
  if (!one) return "";
  return one.own
    .filter((row) => !COMMENT.test(row))
    .join("\n")
    .trim();
}
