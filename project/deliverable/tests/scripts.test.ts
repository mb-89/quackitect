// THE PAGE SCRIPT MUST PARSE. A stripped escape or a stray backtick kills
// the WHOLE inline script at parse time — every handler, the live refresh
// and the theme application die together, and no server-side assertion
// sees it. This file does: it extracts every classic <script> block the
// mirror emits and parses each one.
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { NODE_TABLE_EDITOR } from "../engine/editors/node-table.ts";
import { RANK_CUT_EDITOR } from "../engine/editors/rank-cut.ts";
import { TABLE_EDITOR } from "../engine/editors/table.ts";
import { renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { NO_ARGS } from "../engine/stateform.ts";
import { fieldProblems } from "../engine/stateform-problems.ts";
import { freshRoot, mirrorSource } from "./helpers.ts";

function scriptsOf(html: string): string[] {
  const out: string[] = [];
  const re = /<script(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g;
  for (let m = re.exec(html); m !== null; m = re.exec(html)) {
    if (m[1].trim() !== "") out.push(m[1]);
  }
  return out;
}

// EVERY TEMPLATE THE CHECKER KNOWS HAS AN EDITOR (owner report 2026-08-08).
//
// `table` had a branch in stateform.ts that counts cells and refuses prose,
// and NO branch in the renderer — so the field fell through to the generic
// textarea and a person typed markdown by hand. Nothing wrong could be
// saved, and nothing helped anybody fill it either.
//
// The pairing is the thing to guard: a checker branch without an editor
// branch is a field the engine judges and the mirror abandons.
/** THE WHOLE CLIENT SCRIPT, wherever its pieces live. render.ts assembles
 *  it, and an editor that has moved into engine/editors/ is still part of
 *  it — so the guards below survive the move rather than breaking on it. */
function clientSource(): string {
  const dir = fileURLToPath(new URL("../engine/editors/", import.meta.url));
  const moved = readdirSync(dir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => readFileSync(dir + f, "utf8"));
  return [mirrorSource(), ...moved].join("\n");
}

/** THE WHOLE CHECKER, wherever its pieces live. The per-editor branches moved
 *  into stateform-problems.ts when the file was split; the pairing guarded
 *  below is between checker and renderer, not between two file names. */
function checkerSource(): string {
  return ["stateform.ts", "stateform-problems.ts"]
    .map((f) => readFileSync(fileURLToPath(new URL(`../engine/${f}`, import.meta.url)), "utf8"))
    .join("\n");
}

test("every editor the checker dispatches on has a branch in the renderer", () => {
  const checker = checkerSource();
  const client = clientSource();
  const known = new Set<string>();
  for (const m of checker.matchAll(/meta\.editor === "([a-z-]+)"/g)) known.add(m[1]);
  assert.ok(known.size >= 4, `the checker dispatches on several editors: ${[...known].join(", ")}`);
  // An editor is drawn either by an inline branch or by a moved file that
  // declares its id — the registry turns the second into the first.
  const missing = [...known].filter((e) => !client.includes(`tm.editor === "${e}"`) && !client.includes(`id: "${e}"`));
  assert.deepEqual(missing, [], `these are checked but never drawn, so they fall through to a textarea: ${missing.join(", ")}`);
});

test("the table editor draws its columns and serialises them back", () => {
  const client = clientSource();
  assert.match(client, /id: "table"/, "it is registered");
  assert.match(client, /args\.column_help/, "and the per-column help is drawn from the field's own arguments");
  assert.ok(client.includes('class="sftb"'), "its cells carry the class the collector looks for");
  assert.ok(client.includes('querySelectorAll(".sftb")'), "and the collector looks for them");
});

// A DRAWING CHANGE IS NOT DONE UNTIL ITS OUTPUT IS MEASURED (guidance/craft/
// ux.md). Everything above greps the source, which cannot tell whether the
// markup a person actually sees carries the controls. This runs the editor and
// reads its HTML.
//
// WHAT IT CAUGHT: the first table shipped with a dead minus button, no plus at
// all, and borders it drew itself instead of the ones the node table already
// had. The owner found all three by looking at the page.
test("the table a person sees carries the same row buttons and classes as the rest", () => {
  const escText = (s: string): string =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  const sfRowBtns = (): string => '<button type="button" class="sfrowadd">+</button><button type="button" class="sfrowdel">−</button>';
  const draw = new Function("name", "fl", "args", "escText", "sfRowBtns", TABLE_EDITOR.render) as (
    n: string,
    f: { content: string },
    a: Record<string, unknown>,
    e: typeof escText,
    b: typeof sfRowBtns,
  ) => string;
  const html = draw(
    "contradictions",
    { content: "| cluster | improving |\n| --- | --- |\n| routing | 9 Speed |\n" },
    {
      columns: ["cluster", "improving"],
      column_help: ["which cluster", "what gets better"],
      picks: { improving: ["9 Speed", "27 Reliability"] },
    },
    escText,
    sfRowBtns,
  );

  assert.match(html, /class="sfnodetable sftable"/, "it wears the node table's class rather than borders of its own");
  assert.match(html, /<tr class="sfrow"/, "every row is an sfrow, which is what the add and remove handlers look for");
  assert.match(html, /class="sfrowadd"/, "a person can add a row");
  assert.match(html, /class="sfrowdel"/, "and remove one");
  assert.match(html, /which cluster/, "the per-column help is drawn");
  assert.match(html, /<select class="sftb sfpick"[^>]*data-col="improving"/, "a picked column is a chooser, not a hint");
  assert.match(html, /<option value="9 Speed" selected>/, "and it opens on what the row already says");
  assert.match(html, /<option value="27 Reliability">/, "with the rest of the offer beside it");
  assert.match(html, /<input class="sftb"[^>]*data-col="cluster"/, "a column with no source stays a plain box");
  assert.match(html, /value="routing"/, "the stored row comes back into the boxes");
  assert.equal((html.match(/<tr class="sfrow"/g) ?? []).length, 1, "the stored header row is not shown a second time");
});

// THE DEFECT THAT PROMPTED ALL THIS (owner, 2026-08-08). Every cluster column
// was already wired to $clusters, and every one of them read as free text —
// because partition-functions had not run, so the offer was empty and an empty
// offer is invisible. A chooser that says nothing is indistinguishable from no
// chooser at all.
test("an empty offer says what it is waiting for instead of looking like free text", () => {
  const escText = (s: string): string => String(s ?? "");
  const sfRowBtns = (): string => "<btns>";
  const draw = new Function("name", "fl", "args", "escText", "sfRowBtns", TABLE_EDITOR.render) as (
    n: string,
    f: { content: string },
    a: Record<string, unknown>,
    e: typeof escText,
    b: typeof sfRowBtns,
  ) => string;
  const html = draw(
    "trims",
    { content: "" },
    { columns: ["cluster"], picks: { cluster: [] }, pick_sources: { cluster: ["$clusters"] } },
    escText,
    sfRowBtns,
  );
  assert.match(html, /<select class="sftb sfpick"/, "it is still visibly a chooser");
  assert.match(html, /disabled>— no clusters yet —</, "and it names what it is waiting for, without the dollar sign");
});

test("a free pick stays a box with a hint, and a closed one does not", () => {
  const escText = (s: string): string => String(s ?? "");
  const sfRowBtns = (): string => "<btns>";
  const draw = new Function("name", "fl", "args", "escText", "sfRowBtns", TABLE_EDITOR.render) as (
    n: string,
    f: { content: string },
    a: Record<string, unknown>,
    e: typeof escText,
    b: typeof sfRowBtns,
  ) => string;
  const args = { columns: ["a", "b"], picks: { a: ["one"], b: ["two"] }, pick_free: ["b"] };
  const html = draw("t", { content: "" }, args, escText, sfRowBtns);
  assert.match(html, /<select[^>]*data-col="a"/, "the closed column is a chooser");
  assert.match(html, /<input[^>]*list="sfl-t-b"[^>]*data-col="b"/, "the free column is a box pointing at a datalist");
  assert.match(html, /<datalist id="sfl-t-b">/, "which exists");
  assert.ok(!/<datalist id="sfl-t-a">/.test(html), "and the closed column draws no datalist at all");
});

// A CLOSED CHOOSER MUST NOT EAT AN ANSWER. Renaming a cluster upstream would
// otherwise blank every cell naming the old one, silently.
test("a stored value the offer no longer holds survives, and says so", () => {
  const escText = (s: string): string => String(s ?? "");
  const sfRowBtns = (): string => "<btns>";
  const draw = new Function("name", "fl", "args", "escText", "sfRowBtns", TABLE_EDITOR.render) as (
    n: string,
    f: { content: string },
    a: Record<string, unknown>,
    e: typeof escText,
    b: typeof sfRowBtns,
  ) => string;
  const html = draw("t", { content: "| a |\n| --- |\n| gone |\n" }, { columns: ["a"], picks: { a: ["one", "two"] } }, escText, sfRowBtns);
  assert.match(html, /<option value="gone" selected>gone — no longer offered</, "the answer is kept and flagged");
});

test("an empty table still offers one row to fill", () => {
  const escText = (s: string): string => String(s ?? "");
  const sfRowBtns = (): string => "<btns>";
  const draw = new Function("name", "fl", "args", "escText", "sfRowBtns", TABLE_EDITOR.render) as (
    n: string,
    f: { content: string },
    a: Record<string, unknown>,
    e: typeof escText,
    b: typeof sfRowBtns,
  ) => string;
  const html = draw("t", { content: "" }, { columns: ["a", "b"] }, escText, sfRowBtns);
  assert.equal((html.match(/<tr class="sfrow"/g) ?? []).length, 1);
  assert.equal((html.match(/class="sftb"/g) ?? []).length, 2, "one box per declared column");
});

// THE SEAM GENERALISES, so the node table's paging gets measured the same way.
// note-f19849007bab said picks and paging shipped unverified; both are read off
// the produced markup below.
function drawNodeTable(fl: { content: string }, args: Record<string, unknown>): string {
  const escText = (s: string): string =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  const fn = new Function("name", "fl", "args", "escText", "paths", NODE_TABLE_EDITOR.render) as (
    n: string,
    f: { content: string },
    a: Record<string, unknown>,
    e: typeof escText,
    p: Record<string, string> | null,
  ) => string;
  return fn("pool", fl, args, escText, null);
}

test("a node table under its page size is one table with no pager at all", () => {
  const html = drawNodeTable({ content: "" }, { of: "criterion", columns: ["weight"], items: ["a", "b"], page_size: 5 });
  assert.equal((html.match(/<details/g) ?? []).length, 0, "two rows do not need paging");
  assert.equal((html.match(/class="sfnt"/g) ?? []).length, 2);
});

// THE LOAD-BEARING CLAIM. A pager that removed rows would silently drop every
// answer on every page but the one showing, and nothing downstream could tell.
//
// THE SHAPE CHANGED ON 2026-08-08. It used to stack a details group per page,
// all of them on the screen at once — the whole list with folds in it, which
// over ninety rows the owner called unreadable. Now one bar pages through.
test("paging offers previous and next, and keeps every row in the DOM", () => {
  const items = ["a", "b", "c", "d", "e", "f", "g"];
  const html = drawNodeTable({ content: "" }, { of: "criterion", columns: ["weight"], items, page_size: 3 });
  assert.equal((html.match(/<details/g) ?? []).length, 0, "no folds — that was the wrong shape");
  assert.equal((html.match(/class="sfntpager"/g) ?? []).length, 1, "one bar for the field");
  assert.match(html, /class="sfntprev"/, "previous");
  assert.match(html, /class="sfntnext"/, "next");
  assert.match(html, /class="sfntper"/, "and the page size is chosen, not fixed");
  assert.match(html, /data-total="7"[\s\S]*?data-page="0"|data-page="0"/, "the bar carries what it needs to page");
  assert.equal((html.match(/class="sfnt"/g) ?? []).length, items.length, "every row's input is in the DOM, on the page or not");
  assert.equal(
    (html.match(/<tr class="sfntrow" data-idx=/g) ?? []).length,
    items.length,
    "and every row knows its place, so the pager can hide it",
  );
});

test("a table under its page size gets no pager at all", () => {
  const html = drawNodeTable({ content: "" }, { of: "criterion", columns: ["weight"], items: ["a", "b"], page_size: 10 });
  assert.equal((html.match(/class="sfntpager"/g) ?? []).length, 0);
});

test("a node table draws a closed pick as a chooser and an unconstrained column as a box", () => {
  const html = drawNodeTable(
    { content: "" },
    { of: "criterion", columns: ["cluster", "note"], items: ["a"], picks: { cluster: ["routing", "storage"] } },
  );
  assert.match(html, /<select class="sfnt sfpick"[^>]*data-col="cluster"/, "the picked column is a chooser");
  assert.match(html, /<option value="routing">routing<\/option>/, "holding the resolved offer");
  assert.match(html, /<input class="sfnt"[^>]*data-col="note"/, "a column with no pick source stays a plain box");
  assert.ok(!/<datalist/.test(html), "and nothing here is a datalist, because nothing declared itself free");
});

// THE COMPARISON CARDS ARE WHY pick_free EXISTS. Their cells hold an id PLUS a
// reason, so a closed chooser would forbid the reason. This proves the escape
// hatch still opens.
test("a free pick on a node table is a box with its list beside it", () => {
  const html = drawNodeTable(
    { content: "" },
    { of: "criterion", columns: ["weighs_with"], items: ["a"], picks: { weighs_with: ["c-one", "c-two"] }, pick_free: ["weighs_with"] },
  );
  assert.match(html, /<datalist id="sfl-pool-weighs_with">/, "the offer is a suggestion");
  assert.match(html, /<input class="sfnt"[^>]*list="sfl-pool-weighs_with"/, "and the cell is a box that can hold more than the offer");
  assert.ok(!/<select/.test(html), "nothing is closed here");
});

test("a node table's empty offer names what it is waiting for", () => {
  const html = drawNodeTable(
    { content: "" },
    { of: "function", columns: ["cluster"], items: ["a"], picks: { cluster: [] }, pick_sources: { cluster: ["$clusters"] } },
  );
  assert.match(html, /<select class="sfnt sfpick"/, "it is still visibly a chooser");
  assert.match(html, /disabled>— no clusters yet —</, "and it says what has not been named yet");
});

test("a node table shows the node's own value, and marks an unanswered cell", () => {
  const html = drawNodeTable(
    { content: "| node | weight |\n| --- | --- |\n| [[a]] | 3 |\n| [[b]] | <!-- todo --> |\n" },
    { of: "criterion", columns: ["weight"], items: ["a", "b"] },
  );
  assert.match(html, /value="3"/, "what the note carries is what the cell shows");
  assert.match(html, /font-style:italic;[^>]*data-item="b"/, "and the row still holding a placeholder reads as unanswered");
  assert.ok(!/font-style:italic;[^>]*data-item="a"/.test(html), "while the answered row does not");
});

// A BACKTICK INSIDE AN EDITOR BODY ENDS IT, and everything after becomes real
// TypeScript. It has happened twice — the second time on 2026-08-08, from a
// backtick around an argument name in a COMMENT, which reads as harmless.
//
// IT MUST BE A LEXICAL CHECK, and that is the trap. Once a body has been cut
// short, the truncated string is what the module exports — so nothing read at
// RUNTIME can see the missing half. Only the source shows it.
//
// The header comments above an editor may hold all the backticks they like.
// This reads only BETWEEN the line that opens a body and the line that closes
// it, which is the convention every editor already follows.
// THE RANKED LIST WITH A CUTOFF (owner design 2026-08-08). It replaced four
// columns that asked the same question of every row — cut_proposed,
// cut_verdict, cut_reason, criterion_band — which over ninety rows let ninety
// answers disagree about one line.
function drawRankCut(fl: { content: string }, args: Record<string, unknown>, paths: Record<string, string> | null = null): string {
  const escText = (s: string): string =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  const fn = new Function("name", "fl", "args", "escText", "paths", RANK_CUT_EDITOR.render) as (
    n: string,
    f: { content: string },
    a: Record<string, unknown>,
    e: typeof escText,
    p: Record<string, string> | null,
  ) => string;
  return fn("cuts", fl, args, escText, paths);
}

test("the ranked list draws its arrows, its cutoff and its two reasons", () => {
  const html = drawRankCut({ content: "" }, { items: ["req-a", "req-b", "req-c"] });
  assert.equal((html.match(/class="sfrcrow"/g) ?? []).length, 3);
  assert.equal((html.match(/class="sfrcup"/g) ?? []).length, 3, "every row moves up");
  assert.equal((html.match(/class="sfrcdown"/g) ?? []).length, 3, "and down");
  assert.equal((html.match(/class="sfrccutoff"/g) ?? []).length, 3, "and can be the cutoff");
  assert.match(html, /class="sfrccut"[^>]*placeholder="strike it/, "a strike carries its reason");
  assert.match(html, /class="sfrcmoved"/, "and a move carries its own");
  assert.ok(!/cut_proposed|cut_verdict|criterion_band/.test(html), "the four columns are gone");
});

// THE MARKS ARE THE FILE'S, THE ORDER IS NOT (owner ruling 2026-08-09). A
// strike and a cutoff are decisions somebody made and they come back. A bare
// row number is an accident of when the file was last written, and it does not.
test("the stored marks come back, and the stored order does not", () => {
  const stored = ["1. [[req-c]]", "2. [[req-a]] [cutoff]", "3. [[req-b]] [cut: every candidate meets it identically]"].join("\n");
  const html = drawRankCut({ content: stored }, { items: ["req-a", "req-b", "req-c"] });
  const order = [...html.matchAll(/class="sfrcrow" data-id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(order, ["req-a", "req-b", "req-c"], "the computed order, not the file's");
  assert.match(html, /data-id="req-a" data-cutoff="1"/, "the cutoff comes back on its row");
  assert.match(html, /class="sfrccut"[^>]*value="every candidate meets it identically"/, "and so does the strike's reason");
});

// A ROW WRITTEN SINCE THE LAST SAVE MUST NOT VANISH. It keeps the place the
// settled order gave it rather than dropping off the list.
test("a row the file has not caught up with is still drawn", () => {
  const html = drawRankCut({ content: "1. [[req-a]]" }, { items: ["req-a", "req-new"] });
  assert.equal((html.match(/class="sfrcrow"/g) ?? []).length, 2);
  assert.match(html, /data-id="req-new"/);
});

test("an empty ranking says why it is empty rather than drawing a blank table", () => {
  assert.match(drawRankCut({ content: "" }, { items: [] }), /derive-criteria settles the order/);
});

// A MOVE CANNOT BE UNDONE BY HAND (owner report 2026-08-08). The arrows go one
// place at a time and nothing remembers where a row started, so the editor has
// to carry the last saved state with it.
test("the computed order wins over a stored one, and only a recorded move overrides it", () => {
  // THE DEFECT THIS PINS, 2026-08-09. A stored number beat the computed sort
  // forever, so a corrosive row sat first of seventy-two above every fatal
  // one. The items arrive already sorted worst-breakage first; a bare stored
  // position must not reorder them.
  const stored = ["1. [[req-late]]", "2. [[req-early]]"].join("\n");
  const html = drawRankCut({ content: stored }, { items: ["req-early", "req-late"] });
  const order = [...html.matchAll(/data-id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(order, ["req-early", "req-late"], "the computed order stands, the stored numbers do not");

  // A MOVE IS A DECISION SOMEBODY SIGNED, so it is honoured.
  const moved = ["1. [[req-late]] [moved: it gates the must set]", "2. [[req-early]]"].join("\n");
  const html2 = drawRankCut({ content: moved }, { items: ["req-early", "req-late"] });
  const order2 = [...html2.matchAll(/data-id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(order2, ["req-late", "req-early"], "a recorded move overrides the sort");
});

test("the ranking carries its last saved state, so it can be reverted to", () => {
  const stored = ["1. [[req-b]] [cutoff] [moved: it gates the must set]", "2. [[req-a]] [cut: measured identically everywhere]"].join("\n");
  const html = drawRankCut({ content: stored }, { items: ["req-a", "req-b"] });
  // THE ACT CLASSES RIDE ALONG (owner, 2026-08-09). Save and revert wear the
  // accent so they read as the two acts on offer, rather than as decoration.
  assert.match(html, /class="sfrcsave sfact save"/, "changes are kept on purpose, and it looks like it");
  assert.match(html, /class="sfrcrevert sfact revert"/, "or thrown away");
  const snap = /data-pristine="([^"]*)"/.exec(html);
  assert.ok(snap !== null, "the saved state rides on the table");
  const rows = (snap?.[1] ?? "").split("");
  assert.equal(rows.length, 2);
  assert.ok(rows[0].startsWith("1req-b1"), `the saved order and its cutoff: ${rows[0]}`);
  assert.ok(rows[1].includes("measured identically everywhere"), `and the saved reasons: ${rows[1]}`);
});

// A MOVE WITH NO REASON MUST REACH THE FILE, or the checker has nothing to
// refuse and leaving the box empty becomes the way to move a row unnoticed.
test("an unreasoned move is written as a bare mark, and the checker refuses it", () => {
  const meta = { editor: "rank-cut", line_pattern: "", line_help: "", placeholder: "", resolves: "", description: "" };
  const args = { ...NO_ARGS, items: ["req-a", "req-b"] };
  const moved = ["1. [[req-b]] [moved]", "2. [[req-a]] [cutoff]"].join("\n");
  assert.match(fieldProblems("cuts", meta, args, moved).join(" "), /moved with no reason — req-b/);

  const reasoned = ["1. [[req-b]] [moved: it outranks a on the same evidence]", "2. [[req-a]] [cutoff]"].join("\n");
  assert.deepEqual(fieldProblems("cuts", meta, args, reasoned), [], "with a reason it passes");
});

// CUTTING NOTHING IS LEGAL. It is said by putting the cutoff on the last row,
// not by leaving it unset — an unset cutoff is a decision nobody made.
test("a ranking with no cutoff is refused", () => {
  const meta = { editor: "rank-cut", line_pattern: "", line_help: "", placeholder: "", resolves: "", description: "" };
  const args = { ...NO_ARGS, items: ["req-a"] };
  assert.match(fieldProblems("cuts", meta, args, "1. [[req-a]]").join(" "), /no cutoff/);
  assert.deepEqual(fieldProblems("cuts", meta, args, "1. [[req-a]] [cutoff]"), [], "keeping everything is a cutoff on the last row");
});

test("no editor body contains a backtick of its own", () => {
  const dir = fileURLToPath(new URL("../engine/editors/", import.meta.url));
  const files = readdirSync(dir).filter((n) => n.endsWith(".ts") && n !== "index.ts" && n !== "kinds.ts");
  assert.ok(files.length >= 6, `the editors live one to a file — found ${files.length}`);
  const offenders: string[] = [];
  for (const f of files) {
    const lines = readFileSync(dir + f, "utf8").split("\n");
    let inside = "";
    let opened = 0;
    lines.forEach((line, i) => {
      const opens = /^\s*(render|collect): `$/.exec(line);
      if (inside === "" && opens !== null) {
        inside = opens[1];
        opened++;
        return;
      }
      if (inside !== "" && /^\s*`,$/.test(line)) {
        inside = "";
        return;
      }
      if (inside !== "" && line.includes("`"))
        offenders.push(`editors/${f}:${i + 1} has a backtick inside ${inside}, which ENDS the body there`);
    });
    // A file whose bodies never opened is a file this check silently skipped.
    if (opened === 0) offenders.push(`editors/${f} opens no render or collect body on its own line, so nothing was checked`);
  }
  assert.deepEqual(offenders, [], offenders.join("; "));
});

test("every inline script the mirror emits PARSES", () => {
  const root = freshRoot();
  const pages = [
    renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" }),
    renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" }, "machine"),
    renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" }, "details"),
  ];
  let checked = 0;
  for (const html of pages) {
    for (const script of scriptsOf(html)) {
      checked++;
      assert.doesNotThrow(() => new Function(script), `a script block failed to parse:\n${script.slice(0, 400)}`);
    }
  }
  assert.ok(checked > 0, "at least one script block was found and parsed");
});
