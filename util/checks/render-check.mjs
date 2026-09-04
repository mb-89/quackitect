// Render the editor page from a real query and check its shape.
// The page is pure: given a table it returns HTML, so it can be checked
// without an editor. What it cannot check is how it looks.
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { writeFileSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// THE ROOT IS RESOLVED HERE, so a criterion can name this check with a relative
// path and mean this tree. It took whatever it was handed, so `node
// util/checks/render-check.mjs .` built ".\src\extension\node_modules\..." and
// died on the import, and the only way to run it was to pass an absolute path
// twice. A check nobody can name from a criterion is a check no criterion has.
const root = resolve(process.argv[2] ?? ".");
const work = resolve(process.argv[3] ?? process.argv[2] ?? ".");
const se = join(root, ".bin", process.env.SE_EXE || (process.platform === "win32" ? "se.exe" : "se"));

const ask = (...args) => JSON.parse(execFileSync(se, [...args, "--work", work], { encoding: "utf8" }));
const sides = ask("query", "--view", "work", "--panes").panes;
const panes = sides.map((side) => ({ side, table: ask("query", "--view", "work", "--pane", side) }));
const views = ask("query", "--list").views;
// The icon table, read the way the editor reads it: off the query answer.
const ICONS = panes[0]?.table?.icons ?? {};

// THE NAMES THE SOURCE ASKS FOR, not the names the table holds.
//
// Comparing against the table's keys could never catch a missing entry:
// deleting one takes it off both sides at once, so the check went green with
// the bare name on a button. What the page must not show is a name the SOURCE
// asked for, and editor.ts is where the asking happens.
const ASKED = new Set(
  [...readFileSync(join(root, "src", "extension", "editor.ts"), "utf8")
    .matchAll(/icon\("([^"]+)"\)/g)].map((m) => m[1]),
);
// A CHECK THAT FINDS NOTHING TO CHECK REFUSES. This one matched nothing and
// said ok, because a pattern written through another language left a literal
// control character at its front. A count of zero here is the difference
// between a check that passed and a check that never ran.
if (ASKED.size === 0) {
  console.error("no icon() call was found in editor.ts, so the icon check guards nothing");
  process.exit(1);
}

// The bundler lives beside the extension it builds, so it is loaded from
// there rather than from wherever this script happens to sit.
const out = mkdtempSync(join(tmpdir(), "render-"));
const here = join(root, "src", "extension");
const { build } = await import("file://" + join(here, "node_modules", "esbuild", "lib", "main.js"));
await build({
  entryPoints: [join(here, "editor.ts"), join(here, "panel.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent", outExtension: { ".js": ".mjs" },
});
const { editorHtml } = await import("file://" + join(out, "editor.mjs"));
const { panelHtml } = await import("file://" + join(out, "panel.mjs"));

const tree = ask("--tree");
const shown = ask("--config").value["panel.shown"];
const panel = panelHtml(tree, shown);
const html = editorHtml(panes, views, "work");

const wantPanel = [
  ["the work group", /<summary>work<\/summary>/],
  ["the hold is a button", /<button class="toggle" id="hold"/],
  ["the hold is not a field", (h) => !/data-key="control.hold"/.test(h)],
  ["the toggle button", /data-command="quackitect.showWork"/],
  ["the line edit", /class="line"[\s\S]*?data-run="quackitect.mintWork"/],
  ["the line edit spanning three", /grid-column: span 3/],

  ["a caret on the picker", /pick .picked::after/],

  // THE STRIP CANNOT SPILL PAST THE LEFT EDGE OF THE PANEL.
  //
  // THE ONE THE OWNER MET. The head is a flex row justified to its end, and the
  // strip inside it is a plain block, so its width is its longest line: an actor
  // that stopped carries the whole reason it stopped. A flex item wider than the
  // row it is justified to the end of overflows past the START, off the left of
  // the panel, where nothing can scroll to it. The first glyph of the first
  // agent's name went outside the box, and an m with its opening stem cut off
  // reads as an h: main rendered as hain.
  //
  // min-width is what lets a flex item shrink below its own longest word, and
  // without it none of the ellipsis rules can ever come into play.
  ["the doing strip can shrink rather than spill off the left", /\.doings \{[^}]*min-width: 0/],
  ["and a long line ends in an ellipsis inside the panel",
    /\.doing, \.onhold \{[^}]*text-overflow: ellipsis/],
  // One plus three plus one is five, so the row asks for no filler. Counting
  // controls rather than columns asked for seven and the row wrapped.
  ["the work row adds no filler", (h) => !/<summary>work<\/summary>[\s\S]*?<span><\/span>/.test(h)],
  ["the picker", /class="pick"/],
  // THE PICKER IS FILLED FROM THE PROCESS FILES, so this asks for the shape
  // rather than for a word. It named SS·T, which was a scope and whether the
  // token was traced joined with a middle dot, and the process owns both of
  // those now. A check naming one process would go red the day somebody adds
  // a second and renames the first.
  ["the picker short when closed", /class="picked" data-value="[^"]+">[^<]+</],
  ["the picker saying what it means", /<li data-value="[^"]+"><b>[^<]+<\/b><span>[^<]+<\/span><\/li>/],
  // A CHOICE THE ENGINE WOULD REFUSE IS THE FAULT THIS GUARDS. Every value the
  // picker offers is a process src/processes declares.
  ["every choice is a process that exists", (h) => {
    const offered = [...h.matchAll(/<li data-value="([^"]+)"/g)].map((m) => m[1]);
    const declared = new Set(readdirSync(join(root, "src", "processes"))
      .filter((f) => f.endsWith(".process.yaml") && !f.startsWith("_"))
      .map((f) => f.slice(0, -".process.yaml".length)));
    return offered.length > 0 && offered.every((o) => declared.has(o));
  }],
];
for (const [says, re] of wantPanel) {
  const ok = typeof re === "function" ? re(panel) : re.test(panel);
  if (!ok) console.log("FAIL  panel: " + says);
  else console.log("ok    panel: " + says);
}

const want = [
  ["a doctype", /^<!DOCTYPE html>/],
  ["a toolbar per pane", /class="bs-bar"[\s\S]*class="bs-bar"/],
  ["the sort popover", /data-pop="sort" hidden/],
  ["the properties list", /class="bs-tick" data-property=/],
  ["the raw query", /class="bs-code-text"/],
  ["the filter builder", /data-pop="filter"/],
  ["its operator vocabulary", /data-ops='\[\{&quot;id&quot;:&quot;is&quot;/],
  ["a condition row", /class="bs-row bs-cond"/],
  ["the templates it clones", /class="bs-cond-tpl"[\s\S]*class="bs-group-tpl"/],
  ["the join word on every row", /class="bs-join">or</],
  // THE PAGINATION IS GONE. The owner asked for one scrollbar for the whole
  // thing with separators in between, so a pager anywhere on the page is the
  // defect this line exists to catch, and the sift box is what narrows.
  ["no pagination anywhere on the page", (h) => !/bs-pager|bs-per|bs-prev|bs-next|bs-where/.test(h)],
  // ONE SCROLLBAR FOR THE WHOLE PANE. The body scrolls and neither box inside
  // it scrolls on its own, which is where the small upper scrollbar came from.
  ["one box scrolls per pane", (h) =>
    /\.body \{[^}]*overflow: auto/.test(h)
      && !/\.top \{[^}]*overflow/.test(h) && !/\.pane \{[^}]*overflow/.test(h)],
  ["a grip to drag a column", /th-grip/],
  // A CHECK THAT NAMES A CLASS NOBODY WRITES CANNOT FAIL. This one said
  // `total` while the bar said `bs-count`, so it passed with the total on
  // screen. It now names the class the bar actually used, and asserts the
  // heading counts are still there so it cannot pass by the counts going away.
  ["no total on the top bar", (h) => !/bs-count/.test(h)],
  // A BOX TAKES THE INPUT COLOURS, and the rules that give it them are shared
  // with the sidebar rather than copied. That sharing is asserted once, at the
  // end of this file, by reading BOTH pages. Two checks with one name, each
  // reading its own side, is how a disagreement between them reached a reviewer
  // green, so there is no per-page copy of that question here.
  ["no box is left to the browser's default", (h) => {
    // Every box the editor draws, and the rule above has to reach each one.
    const boxes = [...h.matchAll(/<(?:input|select)[^>]*class="([^"]*)"/g)]
      .map((m) => m[1].trim()).filter(Boolean);
    if (boxes.length === 0) return false;
    const styled = /\.bs-pop input|\.bs-rename-field|\.bs-per/;
    return boxes.every((c) => styled.test("." + c) || /bs-/.test(c));
  }],
  // A CLASS BEATS THE BROWSER'S [hidden], so a popover with a display of its
  // own stayed open. Every one of them needs the rule that turns it off.
  ["a hidden popover stays hidden", /\.bs-pop\[hidden\] \{ display: none; \}/],
  // EVERY GROUP CARRIES A PIN. A count read off the page moves with the data.
  // The rule does not: one pin per heading, whatever the rows are.
  ["a pin on every group heading", (h) =>
    (h.match(/class="pin/g) || []).length === (h.match(/<h2/g) || []).length],
  ["a pinned group unpins by name", /class="pin on" data-unpin=/],
  // EVERY MARK COMES FROM util/icons.json. Nothing in the client carries a
  // glyph, so a name the table does not hold reaches the page as a bare word.
  // The name is checked where an icon is drawn, not anywhere on the page: open
  // and sort are also values a token carries, and a table cell may say either.
  // THE SLOTS ARE READ FROM THE PAGE, not from a list somebody keeps. Naming a
  // few of them passed over bs-tool, bs-dir, bs-prev, bs-next and the rest, so
  // a missing entry for split, remove, previous or next was never seen.
  ["no icon name reached the page as a word", (h) => {
    // THESE CLASSES HOLD TEXT SOMEBODY WROTE, not marks. A group heading's name
    // is a status or a bucket, and a row's title is whatever the work is
    // called: three tokens are titled sort and filter work, open work blocks
    // and sort takes many levels, and every one of those words is also an icon
    // name. A check that read them would report a defect on the data.
    //
    // The set is right below. Counting it in a comment kept a second copy of
    // one fact, and the two disagreed in three rounds running.
    // bs-pill-open holds a token's TITLE, which is a person's words: the pill
    // lists what a count counted, and a token called the bar burns down ends in
    // a word the icon table also uses. It is data and not a mark.
    const data = new Set(["name", "count", "bs-view-name", "bs-ticked", "bs-join", "door",
                          "bs-pill-open"]);
    const slots = [...h.matchAll(/<(?:span|button)[^>]*class="([^"]*)"[^>]*>([^<]*)</g)];
    // EACH WORD, NOT THE WHOLE CONTENT. Four buttons draw a mark beside a
    // word, so their content is the two together and a whole-content lookup
    // never matched. Deleting filter from the table rendered "filter Filter"
    // on the face and this check answered 0 failed.
    const loose = slots.filter((m) => !data.has(m[1].trim()) &&
      m[2].trim().split(/\s+/).some((w) => ASKED.has(w)));
    if (loose.length) console.log("      " + loose.map((m) => m[2].trim()).join(", "));
    return loose.length === 0;
  }],
  ["the marks the table gives are on the page", (h) =>
    ["\u{1F4CC}", "▾", "⇅", "◫"].every((g) => h.includes(g))],
  // A DECLARED GROUP DRAWN AT ZERO IS ASSERTED IN GO, in
  // TestAPinnedFunctionalGroupIsDrawnEvenWithNoRows, where a fixture is
  // free. It used to be asserted here, over the live tree, and it passed
  // only while one particular group happened to be empty: a check whose
  // red depends on the data it reads goes quiet as the data changes.
  // What this page can decide is the mapping below, which holds for any
  // count.
  // And it pins by its name alone, because the file already holds its filter.
  ["a declared group pins by its name", /class="pin" data-pin="noted" title=/],

  // The table is three parts and they hide together for the raw query.
  ["the raw query hides the whole table", (h) => {
    const m = h.match(/([^}]*showing-code[^}]*)\{\s*display:\s*none/);
    return !!m && [".pane", ".top", ".heads"].every((c) => m[1].includes(c));
  }],
  ["every group heading counts its own", /<h2[^>]*>[\s\S]*?class="count"/],
  ["two panes", /data-side="left"[\s\S]*data-side="right"/],
  ["the second ships hidden", /data-side="right" hidden/],
  ["a seam between them", /class="seam" hidden/],
  ["the second column button", /id="second"/],
  // THE COUNTER IS NEVER CUT OFF AT THE RIGHT EDGE.
  //
  // THE ONE THE OWNER MET. The bar is one flex row of tabs, then the counter,
  // then the split button. The counter is nowrap and every item was free to
  // shrink, so once there were tabs enough the row ran past the right edge and
  // the counter was cut mid-number: BD: 98/182/5 and then nothing, with the
  // third figure unreadable.
  //
  // The counter and the button hold their size and the TABS give way, because a
  // tab that is a little narrower can still be read and half a number cannot.
  ["the counter never shrinks or is cut off", /\.bd \{[^}]*flex: 0 0 auto/],
  ["the split button keeps its size too", /\.bar \.second \{[^}]*flex: 0 0 auto/],
  ["and the tabs are what give way", /\.bar \.tab \{[^}]*min-width: 0/],
  ["an editable cell", /class="edits"[^>]*data-was=/],
  // THE TEXT IS THE DOOR, AND ONLY THE TEXT. A cell that was a door edge to
  // edge left no way to tick a row.
  // The indent and the fold sit between the cell and the words, so the pattern
  // allows them. What it holds is that the DOOR is the span and not the cell.
  ["the title text is the door",
    /<td class="opens"[^>]*>(<span class="kid-[^>]*>[^<]*<\/span>)*<span class="door" title="open the note">/],
  ["the cell around it is not", (h) => !/<td class="opens"[^>]*title="click to open/.test(h)],
  // Ticked rows make a group, and the controls say what they can do.
  // THE COUNT OF WHAT IS TICKED IS GONE, on the owner's word: the rows are
  // highlighted, so the number said nothing they could not already see. The
  // check that asserted it goes with it rather than being weakened.
  ["a button to group them", /class="bs-tool bs-make-bucket" hidden/],
  ["a button to rename it", /class="bs-tool bs-rename" hidden/],
  ["a field to type the name in", /class="bs-rename-field" type="text" hidden/],
  ["a locked cell says why", /class="locked"[^>]*title="a pull moves this/],
  // THE RULE, NOT A COLUMN NAME. This named assignee, so it went red the day
  // the owner ticked a fourth property and assignee stopped being last. What
  // it means is that whichever column is last carries no width, so the table
  // fills its pane.
  ["the last column takes what is left", (h) => {
    const rows = [...h.matchAll(/<thead><tr>([\s\S]*?)<\/tr><\/thead>/g)];
    if (rows.length === 0) return false;
    return rows.every((r) => {
      const cells = [...r[1].matchAll(/<th[^>]*>/g)].map((m) => m[0]);
      return cells.length > 0 && !/width/.test(cells[cells.length - 1]);
    });
  }],
  ["a tab per view", new RegExp(`data-view="work"`)],
  ["the pinned region outside the scroller", /<div class="top">[\s\S]*<div class="pane">/],
  ["a sticky header", /thead th \{ position: sticky/],

  ["a draggable row", /<tr draggable="true" data-id="wk-/],
  ["the pinned group named", /class="group pinned"/],
  // A QUERY SAYS IT IS ONE, AND A BUCKET DOES NOT. A group declared by a
  // filter is a question asked of every row; a bucket is where a row lives.
  // The page says which without a legend, and both kinds are on it, so the
  // second half of this cannot pass by there being no buckets to draw.
  // A QUERY SAYS IT IS ONE AND A BUCKET DOES NOT, and the mapping is held
  // against the table rather than against the page alone: every group the
  // engine marks declared draws with q slash before its name, and every
  // group the data made draws with its own name. The check refuses when
  // the table holds no groups, so it cannot pass by there being none.
  // NO TWO GROUPS ON A PAGE SHARE A NAME. The grouping fell back to the
  // state when a token had no bucket, so every state drew twice: once as the
  // query named after it and once as a group the grouping invented. A person
  // read it off the page and said backlogged is in there twice.
  ["no group name is drawn twice in one pane", (h) => {
    const panes = h.split('<div class="pane-wrap"').slice(1);
    if (panes.length === 0) return false;
    return panes.every((pane) => {
      const names = [...pane.matchAll(/<span class="name">([^<]*)<\/span>/g)].map((m) => m[1]);
      const seen = new Set();
      const twice = names.filter((n) => (seen.has(n) ? true : (seen.add(n), false)));
      return names.length > 0 && twice.length === 0;
    });
  }],
  // A RULE BETWEEN THE TWO KINDS, once per pane, after the last query and
  // before the first bucket. The two halves overlap by design, so the page
  // says they are different kinds rather than leaving a reader to count the
  // rows twice.
  ["a rule divides the queries from the buckets", (h) => {
    const panes = h.split('<div class="pane-wrap"').slice(1);
    if (panes.length === 0) return false;
    return panes.every((pane) => {
      const scroll = pane.slice(pane.indexOf('<div class="pane">'));
      const rule = scroll.indexOf('<div class="kinds">');
      if (rule < 0) return false;
      const after = scroll.slice(rule);
      const before = scroll.slice(0, rule);
      return before.includes('<span class="name">q/')
        && !after.includes('<span class="name">q/');
    });
  }],
  // THE NUMBER OF TOKENS IS ON THE PAGE, ONCE, AND IT IS THE DISTINCT COUNT.
  //
  // THE OWNER READ 370 OFF A TREE HOLDING 187. Every row is drawn under every
  // query that matches it and again under its bucket, so the headings add to
  // roughly twice the tokens and there was nothing on the page saying which
  // number was the tokens. Measured on this tree: total 187, and the group
  // counts summed to 376.
  //
  // IT GOES ON THE RULE, because the rule is where the two halves meet and it
  // is the one place that can say the buckets below add to this and the queries
  // above do not. The toolbar is where it was ruled out, and that ruling stands:
  // a bar number is the same fact in a second place.
  //
  // THE NUMBER IS ASKED OF THE TABLE, never typed. A check that types 187 stops
  // being able to fail the moment a token is minted.
  ["the rule carries the distinct number of rows", (h) => {
    const wraps = h.split('<div class="pane-wrap"').slice(1);
    if (wraps.length === 0 || panes.length === 0) return false;
    return wraps.every((pane, i) => {
      const total = panes[i]?.table?.total;
      if (typeof total !== "number") return false;
      const rule = pane.match(/<div class="kinds">([\s\S]*?)<\/div>/);
      return !!rule && rule[1].includes(String(total));
    });
  }],
  // AND THE RULE SAYS THE NUMBER AND STOPS. It carried a sentence explaining
  // that the buckets hold each token once while the queries ask again, on
  // every render, and the owner asked twice in two sessions for it to go.
  // A shape an agent keeps re-adding after a telling needs a check rather
  // than another telling, and this is that check.
  ["the rule carries the count only, no prose after it", (h) => {
    const rules = [...h.matchAll(/<div class="kinds">([\s\S]*?)<\/div>/g)].map((m) => m[1]);
    return rules.length > 0 && rules.every((r) => /^<b>\d+<\/b> tokens?$/.test(r.trim()));
  }],
  // AND THE BUCKETS BELOW IT ADD UP TO THAT NUMBER, which is what makes the
  // sentence on the rule true rather than decorative. The queries above do not
  // and are not asked to.
  ["the buckets add up to the number on the rule", () => {
    if (panes.length === 0) return false;
    return panes.every((p) => {
      const gs = p.table.groups || [];
      const buckets = gs.filter((g) => !g.declared);
      if (buckets.length === 0) return false;
      return buckets.reduce((n, g) => n + (g.count || 0), 0) === p.table.total;
    });
  }],
  ["a query draws q slash and a bucket does not", (h) => {
    const flat = [];
    const walk = (gs) => (gs || []).forEach((g) => { flat.push(g); walk(g.groups); });
    for (const p of panes) { walk(p.table.pinned); walk(p.table.groups); }
    if (flat.length === 0) return false;
    const drawn = [...h.matchAll(/<span class="name">([^<]*)<\/span>/g)].map((m) => m[1]);
    return flat.every((g) => {
      const want = (g.declared ? "q/" : "") + (g.name || "no group");
      return drawn.includes(want);
    });
  }],
];
const say2 = (what, ok, extra) => {
  if (!ok) bad++;
  console.log((ok ? "ok  " : "FAIL") + "  shared: " + what + (ok || !extra ? "" : "\n      " + extra));
};

let bad = wantPanel.filter(([, re]) => !(typeof re === "function" ? re(panel) : re.test(panel))).length;
for (const [says, re] of want) {
  const ok = typeof re === "function" ? re(html) : re.test(html);
  if (!ok) bad++;
  console.log((ok ? "ok  " : "FAIL") + "  editor: " + says);
}

// A GROUP WITH NO VALUE IS STILL A GROUP, and it is usually the biggest one on
// the page. The shipped view groups by if(bucket, bucket, status), which can
// never be empty, so the live page cannot ask this question. A fixture asks it.
//
// Grouping by a column some rows lack is reachable from a shipped control: the
// Sort popover writes se view --group <column>.
const empties = ask("query", "--view", "work", "--pane", "left");
if (empties.groups) {
  const fixture = JSON.parse(JSON.stringify(empties));
  fixture.pinned = [];
  fixture.groups = [
    { name: "", by: "holder", pins: 'holder == ""', depth: 0, count: 2, lines: [] },
    { name: "main", by: "holder", pins: 'holder == "main"', depth: 0, count: 1, lines: [] },
  ];
  fixture.groups[1].sets = "bucket";
  const page = editorHtml([{ side: "left", table: fixture }], views, "work");
  const pins = (page.match(/class="pin/g) || []).length;
  const heads = (page.match(/<h2/g) || []).length;
  const ok = pins === heads && heads === 2 && /data-pin="" data-matching="holder == &quot;&quot;"/.test(page);
  if (!ok) bad++;
  console.log((ok ? "ok  " : "FAIL") +
    `  editor: a group with no value pins too (${pins} pins, ${heads} headings)`);

  // A GROUP THE DATA MADE PINS ON ITS FILTER, and takes a drop that writes the
  // property the level sets. Both were asserted against the live page until the
  // view declared every status, at which point nothing on it was derived and
  // the checks tested a shape that had stopped appearing. The fixture makes one.
  for (const [says, re] of [
    ["an unpinned group pins on a filter", /class="pin" data-pin="[^"]+" data-matching="[^"]+"/],
    ["a droppable group", /data-sets="bucket"/],
  ]) {
    const held = re.test(page);
    if (!held) bad++;
    console.log((held ? "ok  " : "FAIL") + "  editor: " + says);
  }
}
// ONE STYLESHEET FOR A CONTROL, AND THIS IS THE ONLY CHECK THAT CAN SEE IT.
//
// The sidebar and the editor each carried their own rules for a button, a text
// box and a select. They were not shared, they were copied, and they had drifted
// to two different heights and two different buttons. Two checks with one name,
// each reading its own side, is how that reached a reviewer green.
//
// SO THIS READS BOTH PAGES AND COMPARES THEM. It is the only form that can fail
// for the thing it is about.
{
  const shared = (page) => {
    const at = page.indexOf("--control-h:");
    if (at < 0) return "";
    // From the height declaration to the end of the checkbox rule, which is the
    // last thing the shared block declares.
    const end = page.indexOf("accent-color", at);
    return end < 0 ? "" : page.slice(at, page.indexOf("}", end) + 1);
  };
  const inEditor = shared(html);
  const inPanel = shared(panel);
  const found = inEditor !== "" && inPanel !== "";
  say2("both pages carry the shared control rules", found,
    found ? "" : "editor " + (inEditor === "" ? "no" : "yes") +
      ", panel " + (inPanel === "" ? "no" : "yes"));
  say2("and they are the same rules", found && inEditor === inPanel,
    found && inEditor !== inPanel ? "they differ" : "");

  const heightOf = (page) => (page.match(/--control-h:\s*([^;]+);/) || [])[1];
  const he = heightOf(html);
  const hp = heightOf(panel);
  say2("a control is the same height in both", !!he && he === hp,
    "editor " + he + ", panel " + hp);
}

// THE BAR SAYS IT WITH ICONS, AND AN ICON STILL HAS TO SAY WHAT IT IS.
//
// The owner named filter and sort as the two whose words are spare, so those
// two are what is asserted here. Properties keeps its word on purpose: a third
// button nobody asked about is a decision this check does not own.
//
// A BUTTON WITH NO WORDS AND NO TITLE IS A MYSTERY, which is why the second
// half is here rather than left to be noticed. The title is what the pointer
// shows and what a screen reader reads.
{
  const buttons = new Map();
  for (const b of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const pop = /data-pop="([^"]+)"/.exec(b[1]);
    if (pop) buttons.set(pop[1], { attrs: b[1], inner: b[2] });
  }
  say2("the bar draws its popover buttons (" + [...buttons.keys()].join(", ") + ")",
    buttons.size > 0, "no button carrying data-pop was found, so this guards nothing");
  for (const name of ["filter", "sort"]) {
    const b = buttons.get(name);
    if (!b) { say2(name + " is on the bar", false, "no button carries data-pop=\"" + name + "\""); continue; }
    // WHAT COUNTS AS A WORD. The icon is one glyph and everything else in the
    // button is text the owner asked to lose. Stripping tags first, so a mark
    // wrapped in a span is not read as a word.
    const words = b.inner.replace(/<[^>]*>/g, "").replace(/[^\p{L}\p{N}]/gu, "").trim();
    say2(name + " carries its icon and no word", words === "",
      "it still says " + JSON.stringify(words));
    say2(name + " says what it is in its title", /\btitle="[^"]+"/.test(b.attrs),
      "it has no title, so with the word gone nothing names it");
  }
}

// THE RULE BETWEEN THE KINDS IS THE SAME RULE THAT DIVIDES THE PINNED FROM THE
// REST, AND NOT A SECOND KIND OF LINE.
//
// The criterion says both halves and only the first had a check: that a rule is
// drawn. Whether it is the SAME rule was asserted by nothing, so the two could
// drift to different widths, styles or colours and the page would grow a second
// kind of divider with every check green.
//
// THE TWO DECLARATIONS ARE COMPARED RATHER THAN EITHER BEING TYPED HERE. What a
// border should look like is the stylesheet's decision and this check does not
// own it. What it owns is that the two agree.
{
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
  const border = (selector) => {
    const rule = new RegExp("\\." + selector + "\\s*\\{([^}]*)\\}").exec(css);
    if (!rule) return null;
    const found = /border(?:-top|-bottom)?\s*:\s*([^;]+)/.exec(rule[1]);
    return found ? found[1].trim() : null;
  };
  const top = border("top");
  const kinds = border("kinds");
  say2("the pinned groups are divided from the rest by a rule", !!top,
    "no border was found on .top, so there is nothing to be the same as");
  say2("and the kinds are divided by the same rule rather than a second kind of line",
    !!top && top === kinds,
    "the pinned divider is " + JSON.stringify(top) + " and the kinds divider is "
      + JSON.stringify(kinds) + ", so the page draws two kinds of line");
}

// Every tag that opens is closed, which is the mistake a template makes.
for (const tag of ["div", "section", "table", "tr", "td", "h2", "ul", "li"]) {
  // A backslash inside a RegExp string is the letter after it, so the escape
  // has to survive the string as well as the pattern.
  const open = (html.match(new RegExp("<" + tag + "[ >]", "g")) || []).length;
  const shut = (html.match(new RegExp("</" + tag + ">", "g")) || []).length;
  const ok = open === shut;
  if (!ok) bad++;
  console.log((ok ? "ok  " : "FAIL") + `  <${tag}> ${open} open, ${shut} closed`);
}
writeFileSync(join(out, "page.html"), html);
console.log(`\n${bad} failed. The page is at ${join(out, "page.html")}`);
process.exit(bad ? 1 : 0);
