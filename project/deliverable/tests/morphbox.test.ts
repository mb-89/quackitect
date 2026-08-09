// THE MORPHOLOGICAL BOX, measured on what it actually produces.
//
// The grid is derived, the dots are per candidate, and the curve joins the
// dots rather than the cells — so the assertions below read the markup and the
// geometry, never the source that made them.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { MORPH_BOX_EDITOR } from "../engine/editors/morph-box.ts";
import { bare, boxTable, chartPlan, type MorphBox, orderLines, storedOrder, unvisited } from "../engine/morphbox.ts";

const BOX: MorphBox = {
  rows: [
    {
      id: "cluster-route",
      name: "routing",
      cells: [
        { id: "opt-proxy", label: "a proxy in front", found_by: "prior-art", pruned: "" },
        { id: "opt-direct", label: "talk straight to it", found_by: "without", pruned: "costs a round trip nobody has" },
      ],
    },
    {
      id: "cluster-store",
      name: "storage",
      cells: [{ id: "opt-blob", label: "one blob per record", found_by: "analogy", pruned: "" }],
    },
  ],
  lines: [{ id: "cand-1-proxy", name: "Thin client", statement: "every decision on the server", picks: ["opt-proxy", "opt-blob"] }],
};

const escText = (s: string): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");

function draw(box: MorphBox, paths: Record<string, string> | null = null, name = "chart"): string {
  const fn = new Function("name", "fl", "args", "escText", "paths", MORPH_BOX_EDITOR.render) as (
    n: string,
    f: { content: string },
    a: Record<string, unknown>,
    e: typeof escText,
    p: Record<string, string> | null,
  ) => string;
  return fn(name, { content: "" }, { box }, escText, paths);
}

describe("the box's shape", { concurrency: true }, () => {
  test("a wiki link, a path and a bare id all name one node", () => {
    assert.equal(bare("[[opt-proxy]]"), "opt-proxy");
    assert.equal(bare("project/spec/trace/option/opt-proxy.md"), "opt-proxy");
    assert.equal(bare("  opt-proxy  "), "opt-proxy");
    assert.equal(bare("[[opt-proxy|a proxy]]"), "opt-proxy");

    // THE YAML QUOTES COME OFF, and this is the case that cost a whole chart
    // on 2026-08-09. A block list writes its items quoted, so every pick read
    // back with its quotes, matched no cell, and all five lines drew empty.
    assert.equal(bare('"[[opt-proxy]]"'), "opt-proxy");
    assert.equal(bare("'[[opt-proxy]]'"), "opt-proxy");
    assert.equal(bare('"opt-proxy"'), "opt-proxy");
  });

  // THE FILE DECIDES THE ORDER, and the order decides the colours. A person
  // recolours the chart by reordering the table, so this cannot come from
  // whatever order the trace happens to enumerate in.
  test("the stored table supplies the line order", () => {
    const stored = ["| candidate | name |", "| --- | --- |", "| [[cand-b]] | B |", "| [[cand-a]] | A |"].join("\n");
    assert.deepEqual(storedOrder(stored), ["cand-b", "cand-a"]);
    const cands = [
      { id: "cand-a", name: "A", statement: "", picks: [] },
      { id: "cand-b", name: "B", statement: "", picks: [] },
    ];
    assert.deepEqual(
      orderLines(cands, storedOrder(stored)).map((l) => l.id),
      ["cand-b", "cand-a"],
    );
  });

  // A RENDERING MUST NOT HIDE A NODE. A candidate the file has not caught up
  // with is still drawn, or the chart is quietly incomplete.
  test("a candidate the table never mentions is still drawn, last", () => {
    const cands = [
      { id: "cand-a", name: "A", statement: "", picks: [] },
      { id: "cand-new", name: "New", statement: "", picks: [] },
    ];
    assert.deepEqual(
      orderLines(cands, ["cand-a"]).map((l) => l.id),
      ["cand-a", "cand-new"],
    );
  });

  test("an unfinished line names the rows it has not visited", () => {
    assert.deepEqual(unvisited(BOX, BOX.lines[0]), [], "this one visits both clusters");
    assert.deepEqual(unvisited(BOX, { id: "x", name: "", statement: "", picks: ["opt-proxy"] }), ["cluster-store"]);
  });

  test("the stored form is a readable markdown table", () => {
    assert.equal(
      boxTable(BOX),
      [
        "| candidate | name | what it is | visits |",
        "| --- | --- | --- | --- |",
        "| [[cand-1-proxy]] | Thin client | every decision on the server | [[opt-proxy]] · [[opt-blob]] |",
      ].join("\n"),
    );
  });
});

describe("the box a person sees", { concurrency: true }, () => {
  test("every cluster is a row and every option is a cell", () => {
    const html = draw(BOX);
    assert.match(html, /<tr data-row="cluster-route">/);
    assert.match(html, /<tr data-row="cluster-store">/);
    assert.match(html, /data-opt="opt-proxy"[^>]*data-row="cluster-route"/);
    assert.match(html, /a proxy in front/);
    assert.equal((html.match(/class="sfmbcell"/g) ?? []).length, 3, "three options across two clusters");
  });

  // THE CHART IS THE WHOLE SPACE, including what was ruled out. A pruned option
  // that vanished would leave the next reader re-proposing it.
  test("a pruned option still shows, struck through, carrying its reason", () => {
    const html = draw(BOX);
    assert.match(html, /data-opt="opt-direct"[^>]*data-pruned="1"/);
    assert.match(html, /costs a round trip nobody has/, "the reason is on the cell");
    assert.match(html, /text-decoration:line-through/);
  });

  // ONE CELL CAN SIT ON FOUR CANDIDATES, so a cell cannot carry a colour. The
  // dots do, and the client fills their slots — the markup only reserves the
  // holder, so the count follows the lines rather than the render.
  test("every cell holds a dot holder, and the render fills none of it", () => {
    const html = draw(BOX);
    assert.equal((html.match(/class="sfmbdots"/g) ?? []).length, 3, "one holder per cell");
    assert.ok(!/class="sfmbdot"/.test(html), "the slots are the client's, so the count can follow the lines");
  });

  // THE ROW IS A REFERENCE TO A NOTE (owner ruling 2026-08-08). Clicking it
  // opens the candidate, where its prose lives.
  test("a line whose note exists opens it; one not written yet says so", () => {
    const linked = draw(BOX, { "cand-1-proxy": "project/spec/trace/candidate/cand-1-proxy.md" });
    assert.match(linked, /class="reflink"[^>]*data-path="project\/spec\/trace\/candidate\/cand-1-proxy\.md"/);
    const unwritten = draw(BOX);
    assert.ok(!/class="reflink"/.test(unwritten), "nothing to open until the save writes it");
    assert.match(unwritten, /title="the note is written when the form is saved"/);
  });

  test("an empty cluster says nobody found anything, rather than drawing nothing", () => {
    const html = draw({ rows: [{ id: "cluster-lonely", name: "lonely", cells: [] }], lines: [] });
    assert.match(html, /nobody found an option for this cluster/);
  });

  test("no clusters means no chart, and it says why rather than drawing a blank", () => {
    const html = draw({ rows: [], lines: [] });
    assert.match(html, /No clusters yet/);
    assert.match(html, /partition-functions names the rows/);
  });

  test("each line gets a row it can be named, described and deleted in", () => {
    const html = draw(BOX);
    assert.match(html, /class="sfrow sfmbline" data-cand="cand-1-proxy" data-picks="opt-proxy opt-blob"/);
    assert.match(html, /class="sfmbname"[^>]*value="Thin client"/);
    assert.match(html, /class="sfmbwhat"[^>]*value="every decision on the server"/);
    assert.match(html, /class="sfmbdel"/);
    assert.match(html, /class="sfmblines"[^>]*data-rows="2"/, "the row count rides along so unfinished lines can be counted");
  });

  test("the overlay is there for the curves, and takes no clicks off the cells", () => {
    const html = draw(BOX);
    assert.match(html, /<svg class="sfmbsvg"[^>]*pointer-events:none/);
  });
});

// WHAT A SAVED CHART DOES TO THE NOTES. A line becomes a candidate note, a
// deleted row takes its note with it, and a prune lands on the option (owner
// ruling 2026-08-08). The session does the file work; this decides it.
describe("what a saved chart means for the notes", { concurrency: true }, () => {
  const table = (...rows: string[]): string =>
    ["| candidate | name | what it is | visits |", "| --- | --- | --- | --- |", ...rows].join("\n");

  test("a drawn line becomes a candidate note, with its picks", () => {
    const plan = chartPlan(table("| [[cand-1-proxy]] | Thin client | on the server | [[opt-proxy]] · [[opt-blob]] |"), []);
    assert.deepEqual(plan.write, [
      { id: "cand-1-proxy", name: "Thin client", statement: "on the server", picks: ["opt-proxy", "opt-blob"] },
    ]);
    assert.deepEqual(plan.remove, []);
  });

  test("a row that left the table takes its note with it", () => {
    assert.deepEqual(chartPlan(table("| [[cand-a]] | A | x | [[opt-1]] |"), ["cand-a", "cand-gone"]).remove, ["cand-gone"]);
  });

  // THE DESTRUCTIVE CASE, and the one worth a test of its own. Opening the
  // form and saving it before drawing anything must not wipe the register.
  test("an empty table deletes nothing at all", () => {
    assert.deepEqual(chartPlan("", ["cand-a", "cand-b"]).remove, []);
    assert.deepEqual(chartPlan(table(), ["cand-a"]).remove, [], "a header with no rows is still nothing drawn");
  });

  test("a prune lands on the option, carrying its reason", () => {
    const content = [table("| [[cand-a]] | A | x | [[opt-1]] |"), "", "pruned:", "- [[opt-direct]] — costs a round trip nobody has"].join(
      "\n",
    );
    assert.deepEqual(chartPlan(content, []).prune, [{ id: "opt-direct", why: "costs a round trip nobody has" }]);
  });

  test("a table row that is not a candidate is not one", () => {
    const plan = chartPlan([table("| [[cand-a]] | A | x | [[opt-1]] |"), "| [[opt-stray]] | not a candidate | | |"].join("\n"), []);
    assert.deepEqual(
      plan.write.map((w) => w.id),
      ["cand-a"],
    );
  });
});

describe("the palette", { concurrency: true }, () => {
  /** The client's own sfmbPen, lifted out of the behaviour source and run. */
  const pen = (): ((i: number, n: number) => string) => {
    const src = MORPH_BOX_EDITOR.behaviour ?? "";
    const body = src.slice(src.indexOf("function sfmbPen"));
    return new Function(`${body.slice(0, body.indexOf("\n  }") + 4)}\nreturn sfmbPen;`)() as (i: number, n: number) => string;
  };

  // pyqtgraph's intColor(index, hues=n): h = index * 360 / hues. The owner
  // named that function, so the rule is checked against it rather than against
  // whatever looked reasonable.
  test("the hue wheel is cut into n equal parts", () => {
    const p = pen();
    assert.equal(p(0, 1), "hsl(0 80% 55%)", "one line takes the top of the wheel");
    assert.equal(p(0, 2), "hsl(0 80% 55%)");
    assert.equal(p(1, 2), "hsl(180 80% 55%)", "two lines land opposite each other");
    assert.equal(p(1, 4), "hsl(90 80% 55%)");
    assert.equal(p(3, 4), "hsl(270 80% 55%)");
  });

  test("adding a line re-cuts the wheel, so every colour moves", () => {
    const p = pen();
    assert.notEqual(p(1, 2), p(1, 3), "line two is a different colour once a third exists");
  });

  // Two dozen is the owner's stated ceiling for a chart worth reading. They
  // stay ordered and distinct at that count; past it the method is the problem,
  // not the palette.
  test("two dozen lines are still all different", () => {
    const p = pen();
    const seen = new Set(Array.from({ length: 24 }, (_, i) => p(i, 24)));
    assert.equal(seen.size, 24);
  });
});
