// THE TABLE READS THE NOTES, AND THE PIVOT IS A VIEW OF THE SAME NOTES.
//
// Two properties are worth more than the rest here, and both are about NOT
// LYING. A filter clause the renderer does not understand must refuse rather
// than quietly drop rows, and a dimension value that is missing must get its
// own bucket rather than losing the row. Either failure produces a table that
// looks complete and is wrong, which is the one outcome a view over the
// project's own data cannot have.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { CallLog } from "../engine/calllog.ts";
import { readKeys } from "../engine/frontmatter.ts";
import { seDir } from "../engine/paths.ts";
import { Session } from "../engine/session.ts";
import {
  type BaseView,
  editCell,
  listBases,
  loadBase,
  matches,
  parseBase,
  type Row,
  readVault,
  renderView,
  selectRows,
  TABLE_SCRIPT,
  unreadableRows,
} from "../engine/tables.ts";
import { freshRoot, refusalChecked } from "./helpers.ts";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const RIGOR = `${REPO_ROOT}/deliverable/tests/fixtures/rigor-matrix.base`;

const ROWS: Row[] = [
  { kind: "matrix-row", state_kind: "work", patch: "none", depends_on: ["a", "b"], file: { name: "one" } },
  { kind: "matrix-row", state_kind: "gate", patch: "full", depends_on: "a", file: { name: "two" } },
  { kind: "matrix-row", state_kind: "work", patch: "full", file: { name: "three" } },
  { kind: "something-else", state_kind: "work", patch: "full", file: { name: "four" } },
];

const view = (over: Partial<BaseView>): BaseView => ({
  type: "table",
  name: "t",
  order: [],
  sort: [],
  groupBy: [],
  columnSize: {},
  ...over,
});
const pivot = (over: Partial<BaseView>): BaseView => view({ type: "pivot", filters: 'kind == "matrix-row"', ...over });

const SPEC = parseBase("properties:\n  file.name:\n    displayName: Step\nviews: []\n");

describe("the base format", { concurrency: true }, () => {
  test("a displayName becomes the column heading", () => {
    const r = renderView(SPEC, view({ order: ["file.name"] }), ROWS);
    assert.match(r.html, /<th data-col="file\.name"[^>]*>[\s\S]*?>Step</);
    assert.doesNotMatch(r.html, />file\.name<\/span>/);
  });

  test("file.name reaches into the nested field", () => {
    const r = renderView(SPEC, view({ order: ["file.name"], filters: 'kind == "matrix-row"' }), ROWS);
    assert.match(r.html, />one</);
    assert.equal(r.rows, 3);
  });

  test("a list cell joins rather than printing [object Object]", () => {
    const r = renderView(SPEC, view({ order: ["depends_on"] }), ROWS);
    assert.match(r.html, /<td>a, b<\/td>/);
    assert.doesNotMatch(r.html, /object Object/);
  });

  test("an empty result says so instead of showing a bare heading row", () => {
    const r = renderView(SPEC, view({ order: ["file.name"], filters: 'kind == "nothing"' }), ROWS);
    assert.equal(r.rows, 0);
    assert.match(r.html, /no rows match this view's filter/);
  });

  test("and, or and not all compose", () => {
    const both = { and: ['kind == "matrix-row"', { not: 'patch == "none"' }] };
    assert.equal(selectRows(SPEC, view({ filters: both }), ROWS).length, 2);
    assert.equal(selectRows(SPEC, view({ filters: { or: ['patch == "none"', 'state_kind == "gate"'] } }), ROWS).length, 2);
  });

  // "GIVE ME EVERY NOTE LINKED TO X" IS THE QUERY THE REGISTER IS FOR (owner,
  // 2026-08-08). It is one expression, and it THREW: the first note without a
  // refines field hit null.contains() and the whole filter died. Over a vault
  // holding method cards, states and templates that is immediately, so the one
  // query that matters could not be run at all.
  test("a link query survives every note that has no links", () => {
    const mixed: Row[] = [
      { file: { name: "req-a" }, refines: ["uc-take-a-step", "uc-capture-a-stray"] },
      { file: { name: "req-b" }, refines: ["uc-capture-a-stray"] },
      { file: { name: "a-method-card" } },
    ];
    const linked = selectRows(SPEC, view({ filters: 'refines.contains("uc-take-a-step")' }), mixed);
    assert.equal(linked.length, 1, "the card with no refines answers false, it does not take the query down");
    assert.equal(selectRows(SPEC, view({ filters: 'refines.contains("uc-capture-a-stray")' }), mixed).length, 2);
  });

  // A NULL METHOD ANSWERS FOR NULL. Null's table used to be the fallback for
  // EVERY type, so anything registered there leaked — and a typo on a number
  // would have answered false instead of naming the type error.
  test("contains on a number still refuses by type", () => {
    assert.match(refusalChecked(() => matches('count.contains("x")', { count: 3 })).got, /number\.contains/);
  });

  test("the table filter treats a bare property as presence", () => {
    assert.equal(matches("depends_on", ROWS[0]), true);
    assert.equal(matches("depends_on", ROWS[2]), false);
  });

  // THE POINT OF THE WHOLE MODULE. A clause we cannot evaluate must never be
  // treated as false: rows would vanish and the table would look finished.
  test("an expression outside the subset REFUSES rather than hiding rows", () => {
    assert.match(refusalChecked(() => matches('patch =~ "no.*"', ROWS[0])).got, /=~/);
    assert.match(refusalChecked(() => matches({ xor: [] }, ROWS[0])).got, /xor/);
  });

  test("a view type we cannot draw refuses by name", () => {
    assert.match(refusalChecked(() => renderView(SPEC, view({ type: "cards" }), ROWS)).got, /cards/);
  });
});

describe("the pivot", { concurrency: true }, () => {
  test("a list-valued dimension spreads across its elements", () => {
    // one waits for a AND b, two waits for a, three waits for nothing.
    const r = renderView(SPEC, pivot({ rows: "file.name", columns: "depends_on" }), ROWS);
    assert.equal(r.rows, 3);
    assert.deepEqual(r.columns, ["a", "b", "—"]);
    assert.match(r.html, /3×3, 4 filled/);
  });

  test("a row with no value keeps its place in the empty bucket, last", () => {
    const r = renderView(SPEC, pivot({ rows: "file.name", columns: "depends_on" }), ROWS);
    assert.match(r.html, /three/, "the row with no depends_on is still drawn");
    assert.equal(r.columns.at(-1), "—", "and its bucket sorts last, whatever it is called");
  });

  test("the totals row counts every crossing", () => {
    const r = renderView(SPEC, pivot({ rows: "state_kind", columns: "patch" }), ROWS);
    assert.equal(r.rows, 2);
    assert.deepEqual(r.columns, ["full", "none"]);
    assert.match(r.html, /pv-totals/);
    assert.match(r.html, /2×2, 3 filled/);
  });

  test("past a dozen columns the headings turn", () => {
    const wide: Row[] = Array.from({ length: 20 }, (_, i) => ({ kind: "matrix-row", k: `c${i}`, file: { name: `r${i}` } }));
    assert.match(renderView(SPEC, pivot({ rows: "file.name", columns: "k" }), wide).html, /class="tbl pivot wide"/);
    assert.doesNotMatch(renderView(SPEC, pivot({ rows: "state_kind", columns: "patch" }), ROWS).html, /wide/);
  });

  test("list names the rows and refuses without a value property", () => {
    const r = renderView(SPEC, pivot({ rows: "state_kind", columns: "patch", aggregate: "list", value: "file.name" }), ROWS);
    assert.match(r.html, /one/);
    assert.match(
      refusalChecked(() => renderView(SPEC, pivot({ rows: "state_kind", columns: "patch", aggregate: "list" }), ROWS)).expected,
      /value/,
    );
  });

  test("one dimension is a table, and an unknown aggregate refuses", () => {
    assert.match(refusalChecked(() => renderView(SPEC, pivot({ rows: "state_kind" }), ROWS)).got, /absent/);
    assert.match(
      refusalChecked(() => renderView(SPEC, pivot({ rows: "state_kind", columns: "patch", aggregate: "median" }), ROWS)).got,
      /median/,
    );
  });
});

/** THE VAULT, READ ONCE FOR THE WHOLE FILE.
 *
 *  SEVEN CASES BELOW EACH READ IT FROM SCRATCH, and the vault is the entire
 *  spec corpus — 2,966 notes. Measured: those seven cost 33.5 of the battery's
 *  296 seconds of work, the heaviest file in the run, and every second of it
 *  was the same parse repeated.
 *
 *  SHARING IS SAFE HERE BECAUSE NOTHING WRITES. These cases render views from
 *  the rows and assert about what came back. The cases that EDIT a note build
 *  their own throwaway root and never touch this. */
let vaultRows: ReturnType<typeof readVault> | undefined;
const sharedVault = (): ReturnType<typeof readVault> => (vaultRows ??= readVault(REPO_ROOT));

describe("the vault", { concurrency: true }, () => {
  test("every note is a row, and none of them fail to parse", () => {
    const rows = sharedVault();
    assert.ok(rows.length > 100, `the vault has notes in it — got ${rows.length}`);
    assert.deepEqual(unreadableRows(rows), [], "no note in the vault has broken frontmatter");
  });

  test("every rigor row comes back through the owner's own base file", () => {
    const spec = loadBase(RIGOR);
    const matrix = spec.views.find((v) => v.name === "The matrix");
    assert.ok(matrix !== undefined, "the shipped base declares The matrix");
    // 63 since the roster row: position 05 of every milestone, M0 through M9.
    assert.equal(renderView(spec, matrix, sharedVault()).rows, 63);
  });

  // The pivot and the flat view read ONE set of notes. Each rigor row carries
  // exactly one `patch`, so pivoting the same filter by file.name must give
  // back the same rows the table lists — a disagreement means one of the two
  // is filtering differently, which is the bug worth catching here.
  test("the pivot agrees with the flat view it pivots", () => {
    const rows = sharedVault();
    const spec = loadBase(RIGOR);
    const struck = spec.views.find((v) => v.name === "Struck at patch");
    assert.ok(struck !== undefined);
    const flat = renderView(spec, struck, rows).rows;
    const crossed = renderView(spec, pivot({ filters: struck.filters, rows: "file.name", columns: "patch" }), rows);
    assert.equal(crossed.rows, flat, `the pivot has ${crossed.rows} steps where the table lists ${flat}`);
    assert.deepEqual(crossed.columns, ["none"], "and every one of them was struck for the same reason");
  });

  // THE DEFECT THIS PINS, because it shipped and looked fine. The first cut of
  // depends.base crossed `file.name` with `depends_on`, and those are two
  // different vocabularies: rows read M0_10_onboard-retro, columns read
  // onboard-retro. Zero of the 50 row labels appeared among the 49 column
  // labels, so a 50x49 grid was drawn with no diagonal anywhere in it.
  test("the dependency pivot crosses ONE vocabulary with itself", () => {
    const rows = sharedVault();
    const spec = loadBase(`${REPO_ROOT}/deliverable/tests/fixtures/depends.base`);
    const waits = spec.views[0];
    const r = renderView(spec, waits, rows);
    const labels = [...r.html.matchAll(/pv-row">([^<]+)</g)].map((m) => m[1]);
    assert.equal(labels.length, 63, "every rigor step is a row");
    const shared = r.columns.filter((c) => labels.includes(c));
    assert.ok(shared.length >= 45, `the axes name the same things — only ${shared.length} of ${r.columns.length} columns are also rows`);
  });

  // An acyclic graph in its authored order is TRIANGULAR, and that shape is
  // the whole reason to draw a matrix. Sorting the axis alphabetically threw
  // it away: 31 of 58 marks landed above the diagonal in a graph with no
  // cycles at all. The view declares the order; the renderer obeys it.
  test("the authored order is kept, so the matrix stays triangular", () => {
    const rows = sharedVault();
    const spec = loadBase(`${REPO_ROOT}/deliverable/tests/fixtures/depends.base`);
    const r = renderView(spec, spec.views[0], rows);
    const labels = [...r.html.matchAll(/pv-row">([^<]+)</g)].map((m) => m[1]);
    const at = new Map(labels.map((k, i) => [k, i]));
    let above = 0;
    let below = 0;
    for (const tr of r.html.split("<tbody>")[1].split("<tr").slice(1)) {
      const named = /pv-row">([^<]+)</.exec(tr);
      if (named === null) continue;
      const ri = at.get(named[1]);
      if (ri === undefined) continue;
      [...tr.matchAll(/<td class="pv-(off|on)/g)].forEach((m, ci) => {
        const cj = at.get(r.columns[ci]);
        if (m[1] !== "on" || cj === undefined || cj === ri) return;
        if (cj < ri) below++;
        else above++;
      });
    }
    assert.equal(above, 0, `an acyclic matrix has nothing above its diagonal — found ${above}, with ${below} below`);
    assert.ok(below >= 55, `and the dependencies are all below it — found ${below}`);
  });

  test("every declared view in the vault draws", () => {
    const rows = sharedVault();
    const bases = listBases(REPO_ROOT);
    assert.ok(bases.length >= 1, "the vault ships a base file");
    for (const rel of bases) {
      const spec = loadBase(`${REPO_ROOT}/${rel}`);
      for (const v of spec.views) renderView(spec, v, rows);
    }
  });

  // One view this renderer cannot draw must show its refusal in place rather
  // than taking the card down. Today nothing in the vault refuses, and this is
  // what says so out loud. The card itself is covered in baseui.test.ts.
  test("no view the vault ships is beyond the renderer", () => {
    const rows = sharedVault();
    for (const rel of listBases(REPO_ROOT)) {
      const spec = loadBase(`${REPO_ROOT}/${rel}`);
      for (const v of spec.views) assert.doesNotMatch(renderView(spec, v, rows).html, /tbl-refused/);
    }
  });

  // file.hasTag reads r.tags off the FILE object a method receives — the
  // isolated expr.test.ts fixture sets that by hand. A real vault row's file
  // object used to carry only name/path/folder/ext, so file.hasTag silently
  // matched nothing against real notes, ever — two of the harvested queries
  // (decisions-strategy.base, force-rationales.base) rely on it.
  test("readVault forwards frontmatter tags onto file.tags, so file.hasTag matches real notes", () => {
    const root = mkdtempSync(join(tmpdir(), "se-tags-"));
    const dir = join(root, "rows");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "tagged.md"),
      ["---", "kind: matrix-row", "tags:", "  - strategy", "---", "", "# Tagged", ""].join("\n"),
      "utf8",
    );
    writeFileSync(join(dir, "untagged.md"), ["---", "kind: matrix-row", "---", "", "# Untagged", ""].join("\n"), "utf8");
    const rows = readVault(root);
    const tagged = rows.find((r) => (r.file as Row).name === "tagged");
    const untagged = rows.find((r) => (r.file as Row).name === "untagged");
    assert.ok(tagged !== undefined && untagged !== undefined, "both fixture notes came back as rows");
    assert.equal(matches('file.hasTag("strategy")', tagged as Row), true, "the tagged note matches its own tag");
    assert.equal(matches('file.hasTag("strategy")', untagged as Row), false, "the untagged note does not");
  });
});

const NOTE = [
  "---",
  "kind: matrix-row",
  "patch: none",
  "count: 2",
  "depends_on:",
  "  - a",
  "  - b",
  "---",
  "",
  "# One",
  "",
  "body",
  "",
].join("\n");

/** A throwaway vault holding one note, so a write can be proven on disk. */
function vault(): { root: string; abs: string; rel: string } {
  const root = mkdtempSync(join(tmpdir(), "se-table-"));
  const dir = join(root, "rows");
  mkdirSync(dir, { recursive: true });
  const abs = join(dir, "one.md");
  writeFileSync(abs, NOTE, "utf8");
  return { root, abs, rel: "rows/one.md" };
}

describe("editing a cell", { concurrency: true }, () => {
  test("a scalar lands in the note and comes back through the reader", () => {
    const v = vault();
    const written = editCell(v.root, { path: v.rel, key: "patch", text: "full" });
    assert.equal(written.display, "full");
    assert.equal(readKeys(readFileSync(v.abs, "utf8"), v.rel).patch, "full");
    assert.equal(readVault(v.root)[0].patch, "full", "and the next render sees it");
  });

  // THE CASE THE SPLICE COULD NOT DO, now proven end to end.
  test("a list is written from the comma-separated text a person types", () => {
    const v = vault();
    const written = editCell(v.root, { path: v.rel, key: "depends_on", text: "x, y, z" });
    assert.equal(written.display, "x, y, z");
    assert.deepEqual(readKeys(readFileSync(v.abs, "utf8"), v.rel).depends_on, ["x", "y", "z"]);
  });

  test("emptying a cell clears the key and says it did", () => {
    const v = vault();
    const written = editCell(v.root, { path: v.rel, key: "patch", text: "   " });
    assert.equal(written.removed, true);
    assert.equal("patch" in readKeys(readFileSync(v.abs, "utf8"), v.rel), false);
  });

  test("the body is never touched by a cell edit", () => {
    const v = vault();
    editCell(v.root, { path: v.rel, key: "count", text: "9" });
    assert.match(readFileSync(v.abs, "utf8"), /\n\n# One\n\nbody\n$/);
  });

  // A REFUSED WRITE LEAVES THE FILE ALONE. Half-writing a note because the
  // value was the wrong type is worse than not writing at all.
  test("a wrong type refuses and the note is untouched", () => {
    const v = vault();
    const before = readFileSync(v.abs, "utf8");
    assert.match(refusalChecked(() => editCell(v.root, { path: v.rel, key: "count", text: "seven" })).expected, /number/);
    assert.equal(readFileSync(v.abs, "utf8"), before);
  });

  test("a cell may not write outside the vault, or write anything but a note", () => {
    const v = vault();
    assert.match(refusalChecked(() => editCell(v.root, { path: "../../secrets.md", key: "k", text: "x" })).expected, /inside the vault/);
    assert.match(refusalChecked(() => editCell(v.root, { path: "rows/one.txt", key: "k", text: "x" })).expected, /markdown note/);
  });
});

describe("which cells offer an editor", { concurrency: true }, () => {
  test("a frontmatter key is editable and carries what the write needs", () => {
    const spec = parseBase("views: []\n");
    const html = renderView(spec, view({ order: ["patch"] }), readVault(vault().root)).html;
    assert.match(html, /class="tbl-cell"/);
    assert.match(html, /data-key="patch"/);
    assert.match(html, /data-path="rows\/one\.md"/);
  });

  // Editing file.name is a RENAME, which moves a file and rewrites every
  // reference to it. That is se_file_move's job and never a cell's.
  test("a file.* column and a nested value are locked, with the reason", () => {
    const spec = parseBase("views: []\n");
    const rows: Row[] = [{ file: { name: "one", path: "rows/one.md" }, nest: { a: 1 } }];
    const html = renderView(spec, view({ order: ["file.name", "nest"] }), rows).html;
    assert.match(html, /tbl-locked" title="this comes from the filename/);
    assert.match(html, /tbl-locked" title="a nested value needs its own editor/);
    assert.doesNotMatch(html, /data-key="file\.name"/);
  });

  test("a row with no note behind it offers no editor at all", () => {
    const spec = parseBase("views: []\n");
    const html = renderView(spec, view({ order: ["patch"] }), [{ patch: "none" }]).html;
    assert.doesNotMatch(html, /tbl-cell/);
  });

  // The delegate ships as text inside a page. A syntax error in it would leave
  // a table that draws perfectly and silently refuses to be edited, which is
  // the exact failure the webview preflight exists to catch.
  test("the client-side delegate parses as JavaScript", () => {
    assert.doesNotThrow(() => new Function(TABLE_SCRIPT));
  });
});

// THE WIRE BETWEEN THE CELL AND THE WRITER. Everything above proves the two
// ends; this proves they are joined, on a throwaway root.
describe("the edit route", () => {
  test("an edit over HTTP writes the note, and a refusal says why", async () => {
    const { startMirror } = await import("../engine/mirror.ts");
    const root = freshRoot();
    const abs = join(root, "rows", "one.md");
    mkdirSync(join(root, "rows"), { recursive: true });
    writeFileSync(abs, NOTE, "utf8");
    const server = startMirror({ session: new Session(root), root, port: 0, log: new CallLog(seDir(root)), mode: "agent" });
    await new Promise((r) => server.on("listening", r));
    const port = (server.address() as { port: number }).port;
    const edit = async (key: string, text: string): Promise<{ ok: boolean; display?: string; error?: string }> => {
      const r = await fetch(`http://127.0.0.1:${port}/table/edit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: "rows/one.md", key, text }),
      });
      return (await r.json()) as { ok: boolean; display?: string; error?: string };
    };
    try {
      const listed = await edit("depends_on", "x, y");
      assert.equal(listed.ok, true, `the list write went through — ${String(listed.error)}`);
      assert.equal(listed.display, "x, y");
      assert.deepEqual(readKeys(readFileSync(abs, "utf8"), "one.md").depends_on, ["x", "y"], "and it reached the note");

      const wrong = await edit("count", "seven");
      assert.equal(wrong.ok, false, "a wrong type is refused");
      assert.match(String(wrong.error), /number/, "and the cell is told why");
      assert.equal(readKeys(readFileSync(abs, "utf8"), "one.md").count, 2, "the note is untouched by a refusal");
    } finally {
      server.close();
    }
  });
});
