// The six schemas this tree ships, and the real Vale over a parked draft. Each
// case drives the thing itself: the schemas off disk, mint through the checker,
// and the write door's own linter over a name opening with an underscore.
// [[spec/design_output/schema#the-sweep-over-the-tree]]

import assert from "node:assert/strict";
import { dirname } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  checkNote,
  isNoteKind,
  mintNote,
  schemaFaults,
  schemasIn,
  SEVERITY,
} from "../../.claude/skills/level0/lib/schema.js";
import { treeOf } from "../../.claude/skills/level0/lib/tree.js";
import { lintText } from "../../.claude/skills/level0/lib/vale.js";
import { disk } from "../../src/doors/disk.js";
import { git } from "../../src/doors/git.js";
import { proc } from "../../src/doors/proc.js";
import { readTools, whereIs } from "../../src/scripts/tools.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const bin = whereIs(files, root, "vale", readTools(files, root));
const ifVale = files.exists(bin) ? test : skip;

const here = treeOf({
  disk: files,
  git: git(outside, root),
  root,
  words: 5,
  node: "",
});
const schemas = schemasIn(here);

const run = async (argv, init = {}) =>
  outside.run(argv, { ...init, cwd: init.cwd ?? root });

const ruled = async (text, where) => {
  const said = await lintText(text, where, { bin, run });
  assert.ok(said.ran, `vale ran: ${said.why}`);
  return said.found.map((one) => one.rule);
};

const PAST =
  "---\nkind: [[guidance]]\n---\n\n# Nothing\n\nThe tree was installed here.\n";

test("every schema in the folder reads, and names the kind its file names", () => {
  assert.ok(schemas.size >= 6, `${schemas.size} schemas read`);
  for (const name of here.names("spec/schemas", ".schema.yaml")) {
    const kind = name.slice(0, -".schema.yaml".length);
    assert.ok(schemas.has(kind), `${name} names ${kind}`);
  }
  // [[spec/design_output/schema#a-note-kind-holds-chapters]]
  assert.ok(notes().size >= 6, `${notes().size} note kinds read`);
  for (const [kind, schema] of notes()) {
    assert.ok(schema.body?.sections?.length, `${kind} names a chapter`);
  }
});

function notes() {
  return new Map([...schemas].filter(([, schema]) => isNoteKind(schema)));
}

// [[spec/design_output/schema#mint-writes-a-valid-note]]
test("mint writes one note per kind, and the checker passes each one", () => {
  for (const [kind, schema] of notes()) {
    const text = mintNote(schema);
    assert.deepEqual(checkNote(text, schema, `${kind}.md`), [], `${kind} mints clean`);
    assert.match(
      text,
      new RegExp(`^---\\nkind: \\[\\[${kind}\\]\\]`),
      `${kind} names itself`,
    );
  }
});

// [[spec/design_output/schema#warning-now-and-error-later]]
test("every departure in this tree stands at warning, so check stays green", () => {
  const found = schemaFaults(here);
  for (const one of found) {
    assert.equal(one.severity, SEVERITY, `${one.file} stands at ${SEVERITY}`);
    assert.ok(files.exists(`${root}/${one.file}`), `${one.file} stands on disk`);
    assert.ok(one.line >= 1, `${one.file} points at a line`);
    assert.match(one.rule, /^Schema\./, "a finding names the schema and the section");
  }
});

test("the guidance notes this tree ships hold the shape guidance names", () => {
  const found = schemaFaults(here).filter((one) =>
    one.file.startsWith("spec/guidance/"),
  );
  assert.deepEqual(found, []);
});

// [[spec/design_output/schema#the-underscore-parks-a-draft]]
ifVale("a draft parked under an underscore breaks no rule vale holds", async () => {
  assert.deepEqual(await ruled(PAST, "spec/guidance/_probe.md"), []);
  assert.ok(
    (await ruled(PAST, "spec/guidance/probe.md")).length,
    "the same text, named without the underscore, meets the rules",
  );
});
