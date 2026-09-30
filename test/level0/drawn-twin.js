// The drawing of one ticket as `tickets/drawn/<path>` answers it: the graph,
// the route, and each leaf's fields with the line a mark stands at and whether
// the chapter fills it. The fake index answers off this, and the golden test
// holds the Go projection equal to it.
// [[spec/tickets/the-lens-reads-v1]]

import { readNote, sectionAt } from "../../.claude/skills/level0/lib/schema.js";
import { graphIn, LEAF } from "../../src/scripts/graph.js";
import { chapterOf } from "../../src/scripts/pull-chapter.js";
import { CHECKED, leafOf } from "../../src/scripts/pull-route.js";

const CHECKLIST = "checklist";
const FIRST_LINE = 1;

// [[spec/tickets/the-lens-reads-v1]]
export function drawnOf(text) {
  const said = String(text ?? "");
  const note = readNote(said);
  const front = note.front.said ?? {};
  const graph = graphIn(said);
  const leaves = {};
  for (const node of graph.nodes.filter((one) => one.kind === LEAF)) {
    const leaf = leafOf(front, node.id);
    if (leaf) leaves[leaf.path] = leafDrawn(said, note.sections, leaf);
  }
  return { graph, steps: front.steps ?? [], leaves };
}

// The fields in route order and `checked` last, as the pull prints them. [[spec/design_output/extension#a-take-marks-the-fields]]
function leafDrawn(text, sections, leaf) {
  const chapter = chapterOf(text, leaf.path);
  const lineOf = headingLines(sections, leaf.path);
  const fields = leaf.evidence.map((one) => ({
    name: String(one.name),
    form: String(one.form ?? ""),
    says: String(one.says ?? ""),
    items: [],
  }));
  if (leaf.checklist.length)
    fields.push({ name: CHECKED, form: CHECKLIST, says: "", items: leaf.checklist });
  return {
    does: leaf.does,
    fields: fields.map((one) => ({
      ...one,
      line: lineOf(one.name),
      filled: (chapter.fields.get(one.name) ?? []).length > 0,
    })),
  };
}

// A field missing its heading marks the leaf's heading, the rule headingLines in src/extension/lib/fields.js holds. [[spec/design_output/extension#a-take-marks-the-fields]]
function headingLines(sections, path) {
  const at = sectionAt(sections, path);
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

// The fixtures the Go golden test seeds, and the file it holds the Go answer equal to. Run it with node from the root where a fixture or the emitter moves. [[spec/tickets/the-lens-reads-v1]]
const TESTDATA = ["src", "modules", "tickets", "testdata"];
const GOLDEN = "drawn.golden.json";
const FIXTURE = /^drawn-.*\.md$/;
const SEEDED = "spec/tickets/";

if (process.argv[1]?.endsWith("drawn-twin.js")) {
  const { readdirSync, readFileSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const folder = join(...TESTDATA);
  const said = {};
  for (const name of readdirSync(folder)
    .filter((one) => FIXTURE.test(one))
    .sort())
    said[`${SEEDED}${name}`] = drawnOf(readFileSync(join(folder, name), "utf8"));
  writeFileSync(join(folder, GOLDEN), `${JSON.stringify(said, null, 2)}\n`);
  console.log(
    `${[...TESTDATA, GOLDEN].join("/")} holds ${Object.keys(said).length} tickets.`,
  );
}
