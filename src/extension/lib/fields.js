// The fields a person's hold on a ticket still wants, each at the line of its
// heading, with the hover naming what it asks. The route, the chapter and the
// headings come from their owners through the door's import, so a test holds
// it with no editor running.
// [[spec/design_output/extension#a-take-marks-the-fields]]

const { HOLDS, HOLD_WATCHES, holdsIn, personHolds, ticketOf } = require("./lens.js");
const { SCHEMA } = require("./route-host.js");

const ROUTE = "src/scripts/pull-route.js";
const CHAPTER = "src/scripts/pull-chapter.js";
const CHECKLIST = "checklist";
const FIRST_LINE = 1;

// [[spec/design_output/extension#a-take-marks-the-fields]]
function fieldMarksOf(door) {
  const texts = new Map();
  let known = new Set();

  const personal = async () =>
    (await holdsIn(await door.list(HOLDS), (one) => door.read(one))).filter(
      personHolds,
    );

  const rules = async () => {
    const [route, chapter, schema] = await Promise.all(
      [ROUTE, CHAPTER, SCHEMA].map((one) => door.imports(one)),
    );
    return { ...schema, leafOf: route.leafOf, chapterOf: chapter.chapterOf };
  };

  const draws = async (path, holds) => {
    const hold = holds.find((one) => one.ticket === ticketOf(path));
    const marks = hold ? marksIn(await rules(), texts.get(path), hold) : [];
    door.marksFields(path, marks);
    return marks;
  };

  return {
    watches: HOLD_WATCHES,

    // A hold standing at the start moves no cursor. [[spec/design_output/extension#a-take-marks-the-fields]]
    async starts() {
      known = new Set((await personal()).map((one) => one.ticket));
    },

    async sees(path, text) {
      if (!ticketOf(path)) return [];
      texts.set(path, String(text ?? ""));
      return draws(path, await personal());
    },

    // A hold the person newly takes puts the cursor on the first mark. [[spec/design_output/extension#a-take-marks-the-fields]]
    async held() {
      const holds = await personal();
      const now = new Set(holds.map((one) => one.ticket));
      const taken = [...now].filter((one) => !known.has(one));
      known = now;
      for (const path of texts.keys()) {
        const marks = await draws(path, holds);
        if (marks.length && taken.includes(ticketOf(path)))
          await door.jumps(path, marks[0].line);
      }
    },
  };
}

// The fields in route order and `checked` last, as the pull prints them. [[spec/design_output/extension#a-take-marks-the-fields]]
function marksIn(rules, text, hold) {
  const note = rules.readNote(text);
  const leaf = rules.leafOf(note.front.said ?? {}, String(hold.step ?? ""));
  if (!leaf) return [];
  const chapter = rules.chapterOf(text, leaf.path);
  const fields = leaf.evidence.map((one) => ({
    name: String(one.name),
    form: String(one.form ?? ""),
    says: String(one.says ?? ""),
    items: [],
  }));
  if (leaf.checklist.length)
    fields.push({
      name: rules.CHECKED,
      form: CHECKLIST,
      says: "",
      items: leaf.checklist,
    });
  const lineOf = headingLines(rules, note.sections, leaf.path);
  return fields
    .filter((one) => !(chapter.fields.get(one.name) ?? []).length)
    .map((one) => ({
      line: lineOf(one.name),
      name: one.name,
      hover: hoverOf(leaf, one),
    }));
}

// A field missing its heading marks the leaf's heading. [[spec/design_output/extension#a-take-marks-the-fields]]
function headingLines(rules, sections, path) {
  const at = rules.sectionAt(sections, path);
  if (at < 0) return () => FIRST_LINE;
  const level = path.split("/").length + 1;
  return (name) => {
    for (let i = at + 1; i < sections.length && sections[i].level >= level; i++) {
      if (sections[i].level === level && sections[i].header === name)
        return sections[i].line;
    }
    return sections[at].line;
  };
}

// [[spec/design_output/extension#a-take-marks-the-fields]]
function hoverOf(leaf, field) {
  const says = field.says ? `: ${field.says}` : "";
  return [
    `**${leaf.path}**: ${leaf.does}`,
    "",
    `\`${field.name}\` · ${field.form}${says}`,
    ...(field.items.length ? ["", ...field.items.map((one) => `- ${one}`)] : []),
  ].join("\n");
}

module.exports = { CHAPTER, ROUTE, fieldMarksOf };
