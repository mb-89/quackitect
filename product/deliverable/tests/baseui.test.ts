// THE INSTRUMENT DRAWS, AND WHAT IT DRAWS MATCHES THE FILE.
//
// Two properties matter here. The chrome must show the state that is actually
// on disk — a ticked box over an unticked column is a lie the reader would
// act on. And a filter the builder cannot express must show RAW rather than an
// approximation, because a silently rewritten filter changes which rows appear.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { basesCard, HELP_TOPICS, helpFor, propertyInventory } from "../engine/baseui.ts";
import { GLOBALS } from "../engine/expr.ts";
import { Vault, type Row } from "../engine/vault.ts";

const BASE = `views:
  - type: table
    name: Everything
    order:
      - file.name
      - status
    filters:
      and:
        - status == "open"
        - price / age > 2
  - type: table
    name: Second
    order:
      - file.name
`;

/** A fresh vault per case. Setup is cheap and shared state is what breaks a suite. */
function vault(): { root: string; rows: Row[] } {
  const root = mkdtempSync(join(tmpdir(), "se-baseui-"));
  const dir = join(root, "product");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "v.base"), BASE);
  writeFileSync(join(dir, "one.md"), '---\nstatus: open\nprice: 10\nage: 4\naccessed: 2026-08-01\ntags:\n  - book\n---\n\n# one\n\nA [[link]].\n');
  writeFileSync(join(dir, "two.md"), "---\nstatus: closed\nprice: 3\nage: 3\n---\n\n# two\n");
  const v = new Vault(root);
  v.build();
  return { root, rows: v.all() };
}

describe("the property inventory", () => {
  test("file fields come first and are marked synthetic", () => {
    const v = vault();
    const props = propertyInventory(v.rows);
    assert.equal(props[0].name, "file.name");
    assert.equal(props[0].synthetic, true);
  });

  test("a frontmatter key carries the type its values actually hold", () => {
    const v = vault();
    const props = propertyInventory(v.rows);
    const by = new Map(props.map((p) => [p.name, p.type]));
    assert.equal(by.get("status"), "string");
    assert.equal(by.get("price"), "number");
    assert.equal(by.get("tags"), "list");
    assert.equal(by.get("accessed"), "date", "a date-shaped scalar is typed at index time");
  });

  test("every key in the vault is offered as a column", () => {
    const v = vault();
    const names = propertyInventory(v.rows).map((p) => p.name);
    for (const want of ["status", "price", "age", "tags", "statement"]) assert.ok(names.includes(want), want);
  });
});

describe("the card", () => {
  test("the toolbar carries the controls the screenshots show", () => {
    const v = vault();
    const html = basesCard(v.root, "", undefined, v.rows);
    for (const label of ["Sort", "Filter", "Properties", "Search", "New"]) {
      assert.ok(html.includes(`>${label}<`) || html.includes(`${label}</button>`), label);
    }
  });

  test("the result count is the rows the view actually keeps", () => {
    const v = vault();
    const html = basesCard(v.root, "", undefined, v.rows);
    assert.match(html, /class="bs-count">1 result</, "one note has status open and price over twice its age");
  });

  test("only the shown view carries its chrome", () => {
    const v = vault();
    const html = basesCard(v.root, "", undefined, v.rows);
    assert.equal((html.match(/class="bs-bar"/g) ?? []).length, 1);
    assert.equal((html.match(/data-pop="props"/g) ?? []).length, 2, "the button and the popover, once each");
  });

  test("switching the selected view moves the chrome with it", () => {
    const v = vault();
    const html = basesCard(v.root, "", "v.base#Second", v.rows);
    assert.match(html, /class="bs-view-btn[^"]*"[^>]*>[\s\S]{0,60}Second/);
  });

  test("a ticked column is a column the file actually declares", () => {
    const v = vault();
    const html = basesCard(v.root, "", undefined, v.rows);
    assert.match(html, /data-property="status"[^>]*checked/, "status is in order, so it is ticked");
    assert.ok(!/data-property="price"[^>]*checked/.test(html), "price is not in order, so it is not ticked");
  });

  test("a buildable filter shows the builder", () => {
    const v = vault();
    const html = basesCard(v.root, "", undefined, v.rows);
    assert.match(html, /<option value="is" selected>/);
  });

  test("a filter beyond the builder shows raw rather than a wrong form", () => {
    const v = vault();
    const html = basesCard(v.root, "", undefined, v.rows);
    assert.match(html, /class="bs-raw" type="text" spellcheck="false" value="price \/ age &gt; 2"/);
    assert.match(html, /data-raw="1"/);
  });

  test("both scopes of the filter popover are drawn", () => {
    const v = vault();
    const html = basesCard(v.root, "", undefined, v.rows);
    assert.match(html, /data-scope="global"/);
    assert.match(html, /data-scope="view"/);
    assert.ok(html.includes("All views"));
    assert.ok(html.includes("This view"));
  });

  test("a vault with no base says so and offers to make one", () => {
    const root = mkdtempSync(join(tmpdir(), "se-baseui-"));
    mkdirSync(join(root, "product"), { recursive: true });
    const html = basesCard(root, "", undefined, []);
    assert.match(html, /No <code>\.base<\/code> file/);
    assert.match(html, /bs-create/);
  });

  test("a view the renderer cannot draw refuses in place, without taking the card down", () => {
    const root = mkdtempSync(join(tmpdir(), "se-baseui-"));
    const dir = join(root, "product");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "v.base"), "views:\n  - type: cards\n    name: Nope\n  - type: table\n    name: Fine\n    order:\n      - file.name\n");
    writeFileSync(join(dir, "one.md"), "---\nstatus: open\n---\n\n# one\n");
    const fresh = new Vault(root);
    fresh.build();
    const html = basesCard(root, "", "v.base#Fine", fresh.all());
    assert.match(html, /tbl-refused/, "the cards view says why");
    assert.match(html, /class="bs-bar"/, "the table view still draws");
  });
});

describe("help is a detail, and the function list is generated", () => {
  test("no help button exists anywhere on the card", () => {
    const v = vault();
    const html = basesCard(v.root, "", undefined, v.rows);
    assert.ok(!/[?]<\/button>/.test(html.replace(/title="[^"]*"/g, "")), "no question-mark button");
    assert.ok(!html.includes(">Help<"), "no help button");
  });

  test("controls carry the topic they explain", () => {
    const v = vault();
    const html = basesCard(v.root, "", undefined, v.rows);
    for (const topic of ["sort", "filter", "properties", "search", "views", "expression", "formulas"]) {
      assert.ok(html.includes(`data-help="${topic}"`), topic);
    }
  });

  test("every topic a control names has help written for it", () => {
    const v = vault();
    const html = basesCard(v.root, "", undefined, v.rows);
    for (const m of html.matchAll(/data-help="([^"]+)"/g)) {
      assert.ok(HELP_TOPICS.includes(m[1]), `no help for ${m[1]}`);
    }
  });

  test("the expression help lists every function the evaluator accepts", () => {
    const html = helpFor("expression").html;
    for (const name of GLOBALS.keys()) {
      assert.ok(html.includes(`${name}()`), `${name} is registered but not in the help`);
    }
  });

  test("the expression help names the call-by-name three", () => {
    const html = helpFor("expression").html;
    for (const name of ["filter", "map", "reduce"]) assert.ok(html.includes(`.${name}()`), name);
  });

  test("the filter help lists the builder's whole vocabulary", () => {
    const html = helpFor("filter").html;
    for (const label of ["is", "contains", "is empty", "has tag"]) assert.ok(html.includes(label), label);
  });

  test("an unknown topic answers rather than throwing", () => {
    assert.match(helpFor("nothing-like-this").html, /No help is written/);
  });
});
