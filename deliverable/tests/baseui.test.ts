// THE INSTRUMENT DRAWS, AND WHAT IT DRAWS MATCHES THE FILE.
//
// The property carrying the most weight: NOTHING ON THE CARD MAY PROMISE WHAT
// IT CANNOT DO. Filter, Search, the view switcher, a New button, a formula
// button and a drag grip were all drawn before they worked, and each one cost
// the reader a wasted click and some trust. Their absence is asserted here so
// they cannot drift back in ahead of their implementation.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { setSource, setViewFilters, toggleProperty } from "../engine/bases.ts";
import { basesCard, HELP_TOPICS, helpFor, propertyInventory } from "../engine/baseui.ts";
import { GLOBALS } from "../engine/expr.ts";
import { type Row, Vault } from "../engine/vault.ts";
import { refusal } from "./helpers.ts";

const BASE = `views:
  - type: table
    name: Everything
    order:
      - file.path
      - status
`;

/** A fresh vault per case. Setup is cheap and shared state is what breaks a suite. */
function vault(body = BASE): { root: string; rows: Row[] } {
  const root = mkdtempSync(join(tmpdir(), "se-baseui-"));
  const dir = root;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "v.base"), body);
  writeFileSync(
    join(dir, "one.md"),
    "---\nstatus: open\nprice: 10\nage: 4\naccessed: 2026-08-01\ntags:\n  - book\n---\n\n# one\n\nA [[link]].\n",
  );
  writeFileSync(join(dir, "two.md"), "---\nstatus: closed\nprice: 3\nage: 3\n---\n\n# two\n");
  const v = new Vault(root);
  v.build();
  return { root, rows: v.all() };
}

const card = (v: { root: string; rows: Row[] }, selected?: string): string => basesCard(v.root, "", selected, v.rows);

describe("the property inventory", () => {
  test("file fields come first, with the path leading", () => {
    const props = propertyInventory(vault().rows);
    assert.equal(props[0].name, "file.path");
    assert.equal(props[0].synthetic, true);
  });

  test("a frontmatter key carries the type its values actually hold", () => {
    const by = new Map(propertyInventory(vault().rows).map((p) => [p.name, p.type]));
    assert.equal(by.get("status"), "string");
    assert.equal(by.get("price"), "number");
    assert.equal(by.get("tags"), "list");
    assert.equal(by.get("accessed"), "date", "a date-shaped scalar is typed at index time");
  });
});

describe("the toolbar carries only what works", () => {
  test("Filter, Sort and Properties are there", () => {
    const html = card(vault());
    for (const label of ["Filter", "Sort", "Properties"]) assert.ok(html.includes(`${label}</button>`), label);
  });

  test("the view name and the count sit on one line, once", () => {
    const html = card(vault());
    assert.match(html, /class="bs-view-name">Everything</);
    assert.match(html, /class="bs-count">2 results</);
    assert.equal((html.match(/2 results/g) ?? []).length, 1, "the count is not repeated below the bar");
    assert.ok(!html.includes("<caption"), "the table repeats neither the name nor the count");
  });

  const absent: [string, string][] = [
    ["Search", "Search"],
    ["the New button", "bs-new"],
    ["the view switcher", "bs-view-btn"],
    ["Add view", "Add view"],
    ["Configure view", "Configure view"],
    ["a formula button", "Formula"],
    ["a drag grip", "bs-grip"],
  ];
  for (const [label, needle] of absent) {
    test(`no ${label}, because it does not work yet`, () => {
      assert.ok(!card(vault()).includes(needle), `${label} promises something the card cannot do`);
    });
  }
});

describe("the query flips with the table", () => {
  test("both panes exist and the table is the one shown", () => {
    const html = card(vault());
    assert.ok(html.includes("bs-pane-table"));
    assert.match(html, /class="bs-pane bs-pane-code" hidden/, "the query starts hidden");
    assert.ok(html.includes("bs-code-toggle"), "the icon that flips them");
  });

  test("the toggle sits at the end of the toolbar", () => {
    const html = card(vault());
    const bar = html.slice(html.indexOf('class="bs-bar"'), html.indexOf('class="bs-pop"'));
    assert.ok(bar.lastIndexOf("bs-code-toggle") > bar.lastIndexOf('bs-tool" data-pop="props"'), "the code icon is last");
  });

  test("the query is the file on disk, verbatim", () => {
    const html = card(vault());
    assert.ok(html.includes("bs-code-text"));
    assert.ok(html.includes("Everything"));
  });

  test("a control's write shows in the query text on the next draw", () => {
    const v = vault();
    assert.ok(!/- price/.test(card(v)));
    toggleProperty(v.root, "v.base", "Everything", "price", true);
    assert.match(card(v), /- price/);
  });
});

describe("the table", () => {
  test("the path column is a link to the note", () => {
    const html = card(vault());
    assert.match(html, /<a class="doclink tbl-link" data-path="one\.md">one\.md<\/a>/);
  });

  test("a column heading can be dragged and carries its property", () => {
    const html = card(vault());
    assert.match(html, /<th data-col="file\.path" draggable="true"/);
    assert.ok(html.includes("th-grip"), "and its right edge resizes");
  });

  test("every column but the last carries a width", () => {
    const html = card(vault());
    assert.match(html, /data-col="file\.path"[^>]*style="width:\d+px"/);
    assert.ok(!/data-col="status"[^>]*style="width/.test(html), "the last column takes what is left");
  });

  test("a ticked column is a column the file actually declares", () => {
    const html = card(vault());
    assert.match(html, /data-property="status"[^>]*checked/);
    assert.ok(!/data-property="price"[^>]*checked/.test(html));
  });

  test("a view the renderer cannot draw refuses in place", () => {
    const v = vault("views:\n  - type: cards\n    name: Nope\n");
    assert.match(card(v), /tbl-refused/);
  });
});

describe("help is a detail, and the function list is generated", () => {
  test("no help button exists anywhere on the card", () => {
    const html = card(vault()).replace(/title="[^"]*"/g, "");
    assert.ok(!html.includes(">Help<"));
    assert.ok(!/\?<\/button>/.test(html));
  });

  test("every topic a control names has help written for it", () => {
    for (const m of card(vault()).matchAll(/data-help="([^"]+)"/g)) {
      assert.ok(HELP_TOPICS.includes(m[1]), `no help for ${m[1]}`);
    }
  });

  test("the sort help explains that group levels nest", () => {
    const html = helpFor("sort").html;
    assert.match(html, /SUBDIVIDES/);
    assert.match(html, /several levels/);
  });

  test("the expression help lists every function the evaluator accepts", () => {
    const html = helpFor("expression").html;
    for (const name of GLOBALS.keys()) assert.ok(html.includes(`${name}()`), `${name} is registered but not in the help`);
  });

  test("an unknown topic answers rather than throwing", () => {
    assert.match(helpFor("nothing-like-this").html, /No help is written/);
  });
});

// THE FUNNEL IS THE FILTER, AND IT IS IN EVERY BASE VIEW because it is drawn by
// the one block builder every card goes through. Its own rule: what it cannot
// read, it shows raw rather than approximating — a redrawn filter that quietly
// asks something else is the failure this whole card is built to avoid.
describe("the funnel — filter by", () => {
  /** The popover's own markup, stopping before the blank templates at its end. */
  const filterBox = (html: string): string =>
    html.slice(html.indexOf('<div class="bs-pop" data-pop="filter"'), html.indexOf('<template class="bs-cond-tpl">'));

  const unesc = (s: string): string =>
    s
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");

  const TWO_GROUPS = { and: ["price > 5", { or: ['status == "open"', 'status == "closed"'] }] };

  const filtered = (tree: unknown): { root: string; rows: Row[] } => {
    const v = vault();
    setViewFilters(v.root, "v.base", "Everything", tree as never);
    return v;
  };

  test("the funnel is on the toolbar and opens its own popover", () => {
    const html = card(vault());
    assert.match(html, /<button type="button" class="bs-tool" data-pop="filter" data-help="filter">/);
    assert.match(html, /<svg[^>]*><path fill="currentColor" d="M2 2h12/, "the icon is a funnel");
    assert.match(html, /<div class="bs-pop" data-pop="filter"[^>]*hidden>/);
    assert.match(html, /class="bs-pop-title bs-helpable" data-help="filter">Filter by</);
  });

  test("a view with no filter draws one group holding one blank condition", () => {
    const box = filterBox(card(vault()));
    assert.equal((box.match(/class="bs-group"/g) ?? []).length, 1);
    assert.equal((box.match(/class="bs-row bs-cond"/g) ?? []).length, 1);
    assert.match(box, /<option value="" selected>Property<\/option>/);
  });

  test("a stored two-group filter draws both, and the second holds two conditions", () => {
    const box = filterBox(card(filtered(TWO_GROUPS)));
    assert.equal((box.match(/class="bs-group"/g) ?? []).length, 2);
    assert.equal((box.match(/class="bs-row bs-cond"/g) ?? []).length, 3);
    assert.match(box, /<option value="price" selected>/);
    assert.match(box, /<input class="bs-val" type="text" placeholder="value" value="open">/);
  });

  test("and joins the groups, or joins the rows, and both words are in the markup", () => {
    const box = filterBox(card(filtered(TWO_GROUPS)));
    assert.equal((box.match(/class="bs-join">and</g) ?? []).length, 2, "one and per group");
    assert.equal((box.match(/class="bs-join">or</g) ?? []).length, 3, "one or per condition");
  });

  test("a leaf the builder cannot read draws raw, and says where to edit it", () => {
    const box = filterBox(card(filtered({ and: ["price * 2 > age"] })));
    assert.match(box, /class="bs-group bs-group-raw"/);
    assert.match(box, /price \* 2 &gt; age/, "the expression is shown as written");
    assert.match(box, /query panel/);
    assert.ok(!box.includes('class="bs-prop"'), "no builder row pretends to hold it");
    assert.match(box, /data-raw="&quot;price \* 2 &gt; age&quot;"/, "and it is posted back verbatim");
  });

  test("the operator list is the property's type, and only that", () => {
    const box = filterBox(card(filtered({ and: ["price > 5"] })));
    assert.match(box, /<option value="gt" selected>/, "a number offers greater than");
    assert.ok(!box.includes('value="startsWith"'), "and never the string-only operators");
  });

  test("the value box is gone where the operator takes none", () => {
    const box = filterBox(card(filtered({ and: ["status.isEmpty()"] })));
    assert.match(box, /<option value="isEmpty" selected>/);
    assert.match(box, /class="bs-val"[^>]*hidden>/);
  });

  test("an operator the file carries is kept even where the type would not offer it", () => {
    const box = filterBox(card(filtered({ and: ['price.startsWith("1")'] })));
    assert.match(box, /<option value="startsWith" selected>/, "the stored operator is never dropped behind the reader");
  });

  test("the operator offer rides the popover, per type, rather than being redeclared", () => {
    const m = /data-ops="([^"]*)"/.exec(card(vault()));
    assert.ok(m !== null, "the client reads the vocabulary off the markup");
    const ops = JSON.parse(unesc(m[1])) as Record<string, { id: string }[]>;
    assert.ok(ops.number.some((o) => o.id === "gt"));
    assert.ok(!ops.number.some((o) => o.id === "startsWith"));
    assert.ok(ops[""].some((o) => o.id === "is"));
    assert.ok(!ops[""].some((o) => o.id === "gt"), "no property picked offers only the type-free operators");
  });

  test("Add condition and Add group have a template to clone from", () => {
    const html = card(vault());
    assert.ok(html.includes("+ Add condition"));
    assert.ok(html.includes("+ Add group"));
    assert.match(html, /<template class="bs-cond-tpl">/, "so Add works with no row on screen to copy");
    assert.match(html, /<template class="bs-group-tpl">/);
  });

  test("a two-group filter narrows the rows the card actually draws", () => {
    const v = filtered({ and: [{ or: ['status == "open"', 'status == "closed"'] }, "price > 5"] });
    assert.match(card(v), /class="bs-count">1 result</, "both notes pass the first group, one passes the second");
  });

  test("the filter help says what and and or mean here", () => {
    const html = helpFor("filter").html;
    assert.match(html, /ORed/);
    assert.match(html, /ANDed/);
    assert.match(html, /EXPRESSION/);
    assert.match(html, /RAW/);
  });
});

describe("writing the query by hand", () => {
  test("valid YAML replaces the file and the card renders it", () => {
    const v = vault();
    setSource(v.root, "v.base", "views:\n  - type: table\n    name: Mine\n    order:\n      - file.name\n");
    const html = card(v);
    assert.ok(html.includes("Mine"));
    assert.ok(!html.includes("Everything"));
  });

  test("YAML that does not parse refuses and leaves the file alone", () => {
    const v = vault();
    const r = refusal(() => setSource(v.root, "v.base", "views:\n  - [unclosed\n"));
    assert.match(r.expected, /parses as YAML/);
    assert.ok(card(v).includes("Everything"), "the file is untouched");
  });
});
