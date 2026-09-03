// THE PAGE, DRIVEN. Rendering says what is drawn and nothing about what happens
// when somebody presses a button. This loads the page into a DOM, presses
// things, and reads what changed.
//
// It is the only check in this project that can see a handler at all. Every
// defect the owner reported in the controls was invisible to the render check,
// because the render check reads markup and the defects are in behaviour.
//
//   node .se/scratchpad/drive-editor.mjs <root>
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.argv[2] ?? ".";
// jsdom lives beside the extension, so it is loaded from there rather than
// from wherever this script happens to sit.
const { JSDOM } = await import(
  pathToFileURL(join(root, "src", "extension", "node_modules", "jsdom", "lib", "api.js")).href
);
const exe = join(root, ".bin", process.platform === "win32" ? "se.exe" : "se");
const ask = (...args) =>
  JSON.parse(execFileSync(exe, [...args, "--work", root], { encoding: "utf8" }));

const out = mkdtempSync(join(tmpdir(), "drive-"));
const here = join(root, "src", "extension");
const { build } = await import(
  pathToFileURL(join(here, "node_modules", "esbuild", "lib", "main.js")).href
);
await build({
  entryPoints: [join(here, "editor.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent",
  outExtension: { ".js": ".mjs" },
});
const { editorHtml } = await import(pathToFileURL(join(out, "editor.mjs")).href);

const sides = ask("query", "--view", "work", "--panes").panes;
const panes = sides.map((side) => ({ side, table: ask("query", "--view", "work", "--pane", side) }));
// A PARENT IS PLANTED RATHER THAN HOPED FOR.
//
// The fold assertions read whatever the live queue happened to hold, so they
// were driving 4 parents one hour and 0 the next: every sub-token closed and
// the checks that press the folds had nothing to press. That is a check whose
// red depends on data the system eats, on a check written to catch exactly that
// class, and it went from proving something to proving nothing with no failure
// in between.
//
// SO THE CASE IS WRITTEN RATHER THAN FOUND. One parent and one child, added to
// the first group of the first pane, beside whatever the tree holds. It is
// additive: every other assertion still reads the real page.
{
  const first = (panes[0].table.groups ?? []).find((g) => (g.lines ?? []).length > 0)
    ?? (panes[0].table.pinned ?? []).find((g) => (g.lines ?? []).length > 0);
  if (!first) {
    console.error("no group on the page holds a row, so the fold cases cannot be planted");
    process.exit(1);
  }
  const cells = (title) => {
    const out = {};
    for (const c of panes[0].table.columns) out[c] = { value: c === "title" ? title : "planted" };
    return out;
  };
  first.lines.push({
    id: "wk-planted-parent", cells: cells("a planted parent"), depth: 0,
    under: [{ id: "wk-planted-child", cells: cells("a planted child"),
              depth: 1, parent: "wk-planted-parent" }],
  });
  first.count = first.lines.length;

  // AND A ROW IN A PINNED GROUP, FOR THE SAME REASON.
  //
  // MEASURED. The pinned groups are declared queries, so whether either holds a
  // row is a fact about today's data. A retro put every token down and marked
  // none for a person, both pinned groups emptied, and the check that asks for
  // one row from each box went red over a page that was working.
  const top = (panes[0].table.pinned ?? [])[0];
  if (!top) {
    console.error("the pane declares no pinned group, so the two-box case cannot be planted");
    process.exit(1);
  }
  top.lines = [...(top.lines ?? []),
    { id: "wk-planted-pinned", cells: cells("a planted pinned row"), depth: 0 }];
  top.count = top.lines.length;
}

const html = editorHtml(panes, ask("query", "--list").views, "work");

// The page talks to VS Code. Nothing here answers, and what it tried to say is
// kept so a press can be checked by what it would have sent.
const sent = [];
const dom = new JSDOM(html, {
  runScripts: "dangerously",
  beforeParse(w) {
    w.acquireVsCodeApi = () => ({ postMessage: (m) => sent.push(m) });
  },
});
const { window } = dom;
const doc = window.document;

// A HANDLER THAT THROWS IS INVISIBLE TO A CHECK THAT ONLY PRESSES.
//
// The button that adds a level took over the class on Hide all, so pressing
// Hide all ran the level handler, which threw on a null and did nothing at all.
// Every assertion in this file passed with that on screen.
const thrown = [];
window.addEventListener("error", (e) => thrown.push(String(e.error ?? e.message)));

let bad = 0;
const say = (what, ok, extra) => {
  if (!ok) bad++;
  console.log((ok ? "ok   " : "FAIL ") + " driven: " + what + (ok || !extra ? "" : "\n      " + extra));
};

// A press, the way a person makes one: it bubbles, so a handler on the document
// sees it unless something stops it.
const press = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

const wrap = doc.querySelector('.pane-wrap[data-side="left"]');
const tool = (name) => wrap.querySelector(`.bs-tool[data-pop="${name}"]`);
const pop = (name) => wrap.querySelector(`.bs-pop[data-pop="${name}"]`);

for (const name of ["filter", "sort", "props"]) {
  say(`${name} starts closed`, pop(name).hidden);
  press(tool(name));
  say(`${name} opens on a press`, !pop(name).hidden,
    `hidden is ${pop(name).hidden} after pressing the button`);
  // THE PRESS THAT OPENS IT MUST NOT ALSO CLOSE IT. That is what the owner sees.
  say(`${name} is still open after the press settles`, !pop(name).hidden);
  // A press inside does nothing to it.
  const inside = pop(name).querySelector("select, input, .bs-pop-title");
  if (inside) {
    press(inside);
    say(`${name} stays open when something inside it is pressed`, !pop(name).hidden);
  }
  // The same button again closes it.
  press(tool(name));
  say(`${name} closes on the same button again`, pop(name).hidden);
  // And a press outside closes it.
  press(tool(name));
  press(doc.querySelector(".panes"));
  say(`${name} closes on a press outside`, pop(name).hidden);
}

// A CONTROL THAT SENDS NOTHING DOES NOTHING. The engine writes the view file,
// so a control's whole job is to send one message, and this is what says it did.
const change = (el) => el.dispatchEvent(new window.Event("change", { bubbles: true }));
const lastOf = (kind) => [...sent].reverse().find((m) => m.type === kind);

press(tool("sort"));
const level = wrap.querySelector('.bs-level[data-kind="sort"] .bs-level-prop');
say("the sort popover has a level to set", !!level);
if (level) {
  level.value = "status";
  change(level);
  const m = lastOf("level");
  say("picking a sort property sends it", !!m && m.property === "status" && m.kind === "sort",
    "what it sent: " + JSON.stringify(m));
  const dir = wrap.querySelector('.bs-level[data-kind="sort"] .bs-dir');
  const was = dir.dataset.direction;
  press(dir);
  say("the direction button turns it round", dir.dataset.direction !== was);
  say("and the mark follows", dir.textContent === (dir.dataset.direction === "ASC" ? dir.dataset.up : dir.dataset.down));
}

// SORT TAKES MORE THAN ONE LEVEL, and the order of the levels is the order
// they sort in, so every level says which one it is.
{
  const list = wrap.querySelector('.bs-levels[data-kind="sort"]');
  const add = wrap.querySelector('.bs-add[data-kind="sort"]');
  const before = list.querySelectorAll('.bs-level').length;
  say("the sort popover has a button to add a level", !!add);
  press(add);
  const after = list.querySelectorAll('.bs-level').length;
  say("pressing it draws another level", after === before + 1);

  const second = list.querySelectorAll('.bs-level')[after - 1];
  say("and the new level knows which one it is", second.dataset.at === String(after - 1));
  const prop2 = second.querySelector('.bs-level-prop');
  prop2.value = "title";
  change(prop2);
  const m = lastOf("level");
  say("filling it sends its position with it",
    !!m && m.property === "title" && m.at === after - 1,
    "what it sent: " + JSON.stringify(m));

  // AND A LEVEL IS TAKEN OUT BY POSITION.
  press(second.querySelector('.bs-drop'));
  const gone = lastOf("drop-level");
  say("the level can be taken out again",
    !!gone && gone.at === after - 1 && gone.kind === "sort",
    "what it sent: " + JSON.stringify(gone));
}

const group = wrap.querySelector('.bs-level[data-kind="group"] .bs-level-prop');
say("the sort popover has a grouping to set", !!group);
if (group) {
  group.value = "bucket";
  change(group);
  const m = lastOf("level");
  say("picking a grouping sends it", !!m && m.property === "bucket" && m.kind === "group",
    "what it sent: " + JSON.stringify(m));
}

press(tool("filter"));
const cond = wrap.querySelector(".bs-cond");
say("the filter popover has a condition to fill", !!cond);
if (cond) {
  cond.querySelector(".bs-prop").value = "status";
  change(cond.querySelector(".bs-prop"));
  cond.querySelector(".bs-op").value = "is";
  change(cond.querySelector(".bs-op"));
  const box = cond.querySelector(".bs-val");
  box.value = "open";
  change(box);
  const m = lastOf("filter");
  say("filling a condition sends it", !!m && JSON.stringify(m).includes("status"),
    "what it sent: " + JSON.stringify(m));
}

press(tool("props"));
const tick = wrap.querySelector(".bs-tick");
say("the properties popover has a column to tick", !!tick);
if (tick) {
  tick.checked = !tick.checked;
  change(tick);
  const m = lastOf("column");
  say("ticking a column sends it", !!m, "what it sent: " + JSON.stringify(m));
}

// A PRESS ON A ROW TICKS IT, AND THE TITLE TEXT IS THE DOOR.
//
// Every clause of that is a handler, and the checks that shipped with it read
// markup. Removing stopPropagation from the door left both markup assertions
// green while opening a note also ticked the row behind it, and removing the
// toggle left them green while a press on a row did nothing at all.
{
  const row = wrap.querySelector("tr[data-id]");
  const ticked = () => row.classList.contains("ticked");
  const plain = row.querySelector("td:not(.opens)") ?? row.querySelector("td");
  const door = row.querySelector(".door");

  say("a row starts unticked", !ticked());
  press(plain);
  say("a press on a row ticks it", ticked());
  press(plain);
  say("and a second press unticks it", !ticked());

  // THE FIRST COLUMN TICKS TOO, everywhere but on the words themselves.
  const first = row.querySelector("td");
  press(first);
  say("a press in the first column ticks the row", ticked());
  press(first);

  // THE DOOR OPENS THE NOTE AND LEAVES THE ROW ALONE.
  const was = ticked();
  const opens = sent.filter((m) => m.type === "open").length;
  press(door);
  say("a press on the title sends open",
    sent.filter((m) => m.type === "open").length === opens + 1);
  say("and does not tick the row underneath it", ticked() === was);
}

// HIDE ALL HIDES EVERY COLUMN, and it is a different control from the one that
// adds a level. They shared a class, and the level handler was wired last.
{
  press(tool("props"));
  const hideAll = wrap.querySelector(".bs-hide-all");
  say("the properties popover has a hide-all", !!hideAll);
  if (hideAll) {
    press(hideAll);
    const cols = lastOf("columns");
    say("pressing it sends an empty column list",
      !!cols && Array.isArray(cols.only) && cols.only.length === 0,
      "what it sent: " + JSON.stringify(cols));
  }
  press(tool("props"));
}

// A CHILD DRAWS UNDER ITS PARENT, AND ITS PARENT FOLDS IT AWAY.
//
// The rows are one flat run that knows its depth, because a nested table would
// break every column width the person set. So folding is a class on the rows
// below a folded parent rather than a container being hidden.
{
  const parent = wrap.querySelector("tr[data-kids]");
  say("some row carries children", !!parent,
    "no row in the left pane has a sub-token under it");
  if (parent) {
    const kids = [...wrap.querySelectorAll("tr[data-id]")]
      .filter((r) => Number(r.dataset.depth || 0) > 0);
    say("a child is drawn deeper than its parent", kids.length > 0);
    // ONCE INSIDE ITS GROUP, AND NOT ONCE ON THE PAGE. A group declared by a
    // filter is a query now, so a row is drawn under every query that matches
    // it and under its bucket as well, and a page-wide count of ids was the
    // partition rule asserted from the outside.
    const twiceInOne = [...wrap.querySelectorAll("section.group")].some((sec) => {
      const ids = [...sec.querySelectorAll(":scope > .rows > table tr[data-id]")]
        .map((r) => r.dataset.id);
      return new Set(ids).size !== ids.length;
    });
    say("and the child is drawn once inside its group", !twiceInOne);

    const fold = parent.querySelector(".kid-fold");
    say("the parent carries a fold", !!fold);
    // THE PAGER COUNTS WHAT IS THERE TO COUNT. A fold changes how many rows a
    // page holds, and the fold was a third way to hide a row, added outside the
    // one pass the other two share.
    const where = wrap.querySelector(".bs-where");
    const counted = () => (where ? where.textContent : "");
    const said = counted();

    const wasAway = [...wrap.querySelectorAll("tr.folded-away")].length;
    press(fold);
    say("folding changes what the pager counts", counted() !== said,
      "the pager said " + JSON.stringify(said) + " and still says " + JSON.stringify(counted()));
    const nowAway = [...wrap.querySelectorAll("tr.folded-away")].length;
    say("folding the parent takes its children away", nowAway > wasAway);
    say("and the parent itself stays", !parent.classList.contains("folded-away"));
    say("the mark turns round", fold.textContent === fold.dataset.shut);
    press(fold);
    say("and unfolding brings them back",
      [...wrap.querySelectorAll("tr.folded-away")].length === wasAway);
    say("and unfolding puts the count back", counted() === said);
    // A press on the fold does not tick the row it sits on.
    say("folding does not tick the row", !parent.classList.contains("ticked"));
  }
}

// A COUNT ON THE BAR OPENS ONTO THE TOKENS BEHIND IT.
//
// THE SET IS THE TABLE'S, NOT THIS FILE'S. How many counts there are and what
// they are called is the view file's decision, so the assertion walks what the
// engine answered. A list typed here would be complete on the day it is written
// and would stop being the moment somebody declares a third count.
{
  const counts = panes[0].table.counts ?? [];
  say("the engine answers counts for the bar (" + counts.map((c) => c.name).join(", ") + ")",
    counts.length > 0,
    "the view declares no count, so this guards nothing");
  const pills = [...wrap.querySelectorAll(".bs-pill")];
  say("the bar draws a pill for each count", pills.length === counts.length,
    counts.length + " count(s) answered and " + pills.length + " pill(s) drawn");
  for (const c of counts) {
    const pill = pills.find((p) => p.textContent.includes(c.name));
    if (!pill) { say("a pill for " + c.name, false, "no pill names it"); continue; }
    say(c.name + " shows its number", pill.textContent.includes(String(c.n)),
      "the count is " + c.n + " and the pill says " + JSON.stringify(pill.textContent));

    const list = wrap.querySelector('.bs-pop[data-pop="' + pill.dataset.pop + '"]');
    say(c.name + " has a list behind it", !!list);
    if (!list) continue;
    say(c.name + " starts closed", list.hidden);
    press(pill);
    say(c.name + " opens on a press", !list.hidden);
    // THE MEMBERS ARE THE ENGINE'S ANSWER, drawn rather than found again.
    const drawn = [...list.querySelectorAll("[data-id]")].map((b) => b.dataset.id);
    const want = (c.of ?? []).map((o) => o.id);
    say(c.name + " lists the tokens the engine named (" + want.length + ")",
      drawn.length === want.length && want.every((id) => drawn.includes(id)),
      "the engine named " + JSON.stringify(want) + " and the list holds " + JSON.stringify(drawn));
    for (const o of c.of ?? []) {
      const entry = list.querySelector('[data-id="' + o.id + '"]');
      say(o.id + " is named by its title", !!entry && entry.textContent.includes(o.title),
        "the title is " + JSON.stringify(o.title));
    }
    // AND PRESSING ONE OPENS IT, through the same message a row's door sends,
    // so there is one way to open a note and not two.
    const first = list.querySelector("[data-id]");
    if (first) {
      const before = sent.filter((m) => m.type === "open").length;
      press(first);
      const after = sent.filter((m) => m.type === "open");
      say("pressing a name in " + c.name + " opens that token",
        after.length === before + 1 && after[after.length - 1].id === first.dataset.id,
        "what it sent: " + JSON.stringify(after[after.length - 1]));
    }
    press(pill);
  }
}

// TWO BUTTONS FOLD EVERYTHING, AND ALL MEANS BOTH KINDS OF FOLD.
//
// A group folds by a class on its section and a row folds by a set the page
// keeps. A button that reached only one of them would move half the table on a
// press, which is worse than moving none, because the person cannot tell a
// button that did half its job from a table that was already half folded.
//
// THE ASSERTION COUNTS FROM THE PAGE rather than from a number typed here. How
// many groups and how many parents there are is the data's business.
{
  const shutAll = wrap.querySelector(".bs-collapse-all");
  const openAll = wrap.querySelector(".bs-expand-all");
  say("the bar carries collapse all and expand all", !!shutAll && !!openAll,
    "collapse " + !!shutAll + ", expand " + !!openAll);
  if (shutAll && openAll) {
    const groups = () => [...wrap.querySelectorAll("section.group")];
    const parents = () => [...wrap.querySelectorAll("tr[data-kids]")];
    const kidsOf = (row) => {
      const depth = Number(row.dataset.depth || 0);
      const out = [];
      for (let n = row.nextElementSibling; n; n = n.nextElementSibling) {
        if (Number(n.dataset.depth || 0) <= depth) break;
        out.push(n);
      }
      return out;
    };
    say("the pane has groups and parents to fold ("
      + groups().length + " group(s), " + parents().length + " parent(s))",
      groups().length > 0 && parents().length > 0,
      "nothing on the page can fold, so this guards nothing");

    press(shutAll);
    say("collapse all shuts every group",
      groups().every((g) => g.classList.contains("shut")),
      groups().filter((g) => !g.classList.contains("shut")).length + " group(s) stayed open");
    say("collapse all folds every parent",
      parents().every((p) => kidsOf(p).every((k) => k.classList.contains("folded-away"))),
      parents().filter((p) => !kidsOf(p).every((k) => k.classList.contains("folded-away")))
        .length + " parent(s) kept their children on show");

    press(openAll);
    say("expand all opens every group",
      groups().every((g) => !g.classList.contains("shut")),
      groups().filter((g) => g.classList.contains("shut")).length + " group(s) stayed shut");
    say("expand all unfolds every parent",
      [...wrap.querySelectorAll("tr.folded-away")].length === 0,
      [...wrap.querySelectorAll("tr.folded-away")].length + " row(s) stayed folded away");
  }
}

// A ROW IS A ROW WHEREVER IT IS DRAWN.
//
// A pane is two boxes: the pinned groups sit in .top and the scrolling ones in
// .pane. What counted the ticked rows read only the second, so a ticked row in
// a pinned group counted for nothing: the Group button stayed hidden for it,
// and with one row ticked in each box the message carried one id for two rows.
//
// THE ROWS ARE TAKEN ONE FROM EACH BOX ON PURPOSE. Picking the first row on the
// page picks whichever box the data happens to put first, and it moves.
{
  const pinned = wrap.querySelector(".top tr[data-id]");
  const scrolling = wrap.querySelector(".pane tr[data-id]");
  say("the pane draws a pinned row and a scrolling one", !!pinned && !!scrolling,
    "pinned " + !!pinned + ", scrolling " + !!scrolling);
  if (pinned && scrolling) {
    const group = wrap.querySelector(".bs-make-bucket");
    press(pinned.querySelector("td"));
    say("ticking a pinned row offers the group button", !group.hidden,
      "the button is hidden with a pinned row ticked");

    press(scrolling.querySelector("td"));
    press(group);
    const m = lastOf("group");
    say("and the group takes a row from each box",
      !!m && m.ids.length === 2 &&
        m.ids.includes(pinned.dataset.id) && m.ids.includes(scrolling.dataset.id),
      "what it sent: " + JSON.stringify(m));

    // Put the page back the way it was for whatever presses next, through the
    // same handler rather than by editing the class, so the button follows.
    press(pinned.querySelector("td"));
    press(scrolling.querySelector("td"));
  }
}

// ONE CONTROL MAKES A BUCKET, AND ONLY ONE.
//
// The toolbar button and every group in the filter builder answered to the same
// class, and the handler that files ticked rows matched by that name alone. A
// filter group is an ancestor of everything inside it, so every press inside
// the Filter popover filed the ticked rows into a bucket the person never asked
// for.
//
// THE ASSERTION IS THAT NOTHING ELSE SENDS IT, rather than a list of the three
// controls that did, so it still catches the class when a fourth is added.
{
  const row = wrap.querySelector(".pane tr[data-id]");
  press(row.querySelector("td"));
  press(tool("filter"));
  const before = sent.filter((m) => m.type === "group").length;
  const inside = [...wrap.querySelectorAll('.bs-pop[data-pop="filter"] *')]
    .filter((el) => el.tagName === "BUTTON" || el.tagName === "SELECT" || el.tagName === "INPUT");
  say("the filter popover has controls to press", inside.length > 0);
  for (const el of inside) press(el);
  say("no press inside the filter makes a bucket",
    sent.filter((m) => m.type === "group").length === before,
    inside.length + " presses sent " +
      (sent.filter((m) => m.type === "group").length - before) + " group message(s)");

  press(tool("filter"));
  press(wrap.querySelector(".bs-make-bucket"));
  say("and the toolbar button makes exactly one",
    sent.filter((m) => m.type === "group").length === before + 1);
  press(row.querySelector("td"));
}

// A HIDDEN CONTROL IS HIDDEN. The group and rename buttons ship hidden and the
// page showed them anyway, because an author's display rule beats the browser's
// own [hidden]. They drew in a bar with no room for them, clipped and out of
// line with their neighbours.
//
// THE ASSERTION THAT IT IS NOT DISPLAYED IS NOT HERE, and that is deliberate.
// jsdom answers display none for a hidden element whether or not the page says
// so, so the assertion stayed green with the rule taken out. A check that
// cannot fail for the defect it names is not evidence. The rule is checked
// where it is written instead, in one-look.mjs over the stylesheet, and that
// one does go red.
{
  const group = wrap.querySelector(".bs-make-bucket");
  say("the group button ships hidden", group.hidden);
}

// THE COLUMN HEADINGS ARE ALWAYS THERE, and new data does not replace them
// with the word undefined. The extension sent no heads with a body message,
// and the client wrote that straight into the block, so every data change
// blanked the column names until a rebuild put them back.
const heads = () => wrap.querySelector(".heads");
say("the headings are on the page", /<th/.test(heads().innerHTML),
  "what is there: " + JSON.stringify(heads().textContent));
say("they name the columns the view declares",
  panes[0].table.columns.every((c) => heads().textContent.includes(c)),
  "columns " + panes[0].table.columns.join(" ") + ", headings " + heads().textContent);

// THEY STAY PUT WHILE THE ROWS GO PAST. The headings sit in their own block
// outside the scrolling area, so scrolling the rows cannot move them. A DOM
// has no layout, so what is asserted is the structure that makes it true.
const scroller = wrap.querySelector(".pane");
say("the headings are outside the scrolling area", !scroller.contains(heads()));
say("the rows are inside it", scroller.querySelectorAll("tr[data-id]").length > 0);
say("the heading block does not scroll on its own",
  /\.heads \{[^}]*flex: 0 0 auto/.test(html));
say("and the heading row is sticky", /thead th \{[^}]*position: sticky/.test(html));

// A body message with no headings leaves the ones that are there.
window.dispatchEvent(new window.MessageEvent("message", {
  data: { type: "body", side: "left", pinned: "", scrolling: "", total: 0 },
}));
say("new data does not blank them", /<th/.test(heads().innerHTML),
  "what is there: " + JSON.stringify(heads().textContent));
say("and never writes the word undefined", !/undefined/.test(heads().textContent));


// THE SECOND PANE IS HIDDEN UNTIL SOMEBODY ASKS FOR IT, and its button asks.
const right = doc.querySelector('.pane-wrap[data-side="right"]');
const seam = doc.querySelector(".seam");
say("the second pane starts hidden", right.hidden);
say("the seam starts hidden", seam.hidden);
press(doc.getElementById("second"));
say("the second pane opens on the button", !right.hidden);
say("the seam opens with it", !seam.hidden);
press(doc.getElementById("second"));
say("the second pane closes on the button again", right.hidden);

// AND THE SEAM IS SOMETHING A PERSON CAN SEE. One pixel is a hairline, and the
// owner reported that nothing marked where one pane ended and the other began.
{
  const wide = /\.seam \{[^}]*flex:\s*0 0 (\d+)px/.exec(html);
  say("the seam is drawn wide enough to see", wide !== null && Number(wide[1]) >= 3,
    "the seam is " + (wide ? wide[1] + "px" : "not sized at all"));
}


// NOTHING THREW. Asserted at the end so it covers every press above, rather
// than each press having to remember to ask.
say("no handler threw", thrown.length === 0, thrown.join("\n      "));

// AN EDITOR OWNS ITS OWN TICKED ROWS.
//
// The two panes are two instances of one generic editor, and the shell is what
// knows there are two. What was here instead was one page with two halves:
// ticked() read tr.ticked out of the whole document and countTicked() wrote the
// same state into every toolbar. So a row ticked on the left lit the right
// pane's Group button, and pressing it filed the left pane's row.
//
// THAT IS THE CLASS BEHIND EVERY EDITOR DEFECT THE OWNER REPORTED THIS WEEK:
// one pane's control reaching into the other pane's state through a shared
// page. An instance that owns its own state cannot have it.
//
// A PAGE OF ITS OWN, because the presses above leave rows and panes wherever
// they left them, and this is about the page as it is drawn.
{
  const fresh = [];
  const two = new JSDOM(html, {
    runScripts: "dangerously",
    beforeParse(w) {
      w.acquireVsCodeApi = () => ({ postMessage: (m) => fresh.push(m) });
    },
  });
  const d = two.window.document;
  const hit = (el) => el.dispatchEvent(new two.window.MouseEvent("click", { bubbles: true }));
  const wraps = [...d.querySelectorAll(".pane-wrap")];
  say("the shell draws two instances", wraps.length === 2,
    "it drew " + wraps.length + ", so there is nothing to keep apart");
  if (wraps.length === 2) {
    hit(d.getElementById("second"));
    say("the second instance opens on the shell's button", !wraps[1].hidden);

    const [left, right] = wraps;
    const leftRow = left.querySelector(".pane tr[data-id]");
    const leftBar = left.querySelector(".bs-bar");
    const rightBar = right.querySelector(".bs-bar");
    say("both instances draw a toolbar and the first has a row",
      !!leftRow && !!leftBar && !!rightBar,
      "row " + !!leftRow + ", left bar " + !!leftBar + ", right bar " + !!rightBar);

    if (leftRow && leftBar && rightBar) {
      hit(leftRow);
      say("ticking a row in one instance shows its own Group button",
        !leftBar.querySelector(".bs-make-bucket").hidden);
      say("and leaves the other instance's Group button hidden",
        rightBar.querySelector(".bs-make-bucket").hidden,
        "the other instance offers to file a row it does not have");

      const before = fresh.length;
      hit(rightBar.querySelector(".bs-make-bucket"));
      say("and pressing the other instance's Group sends nothing",
        fresh.length === before,
        "it sent " + JSON.stringify(fresh.slice(before)) + ", filing a row from the other pane");

      const was = fresh.length;
      hit(leftBar.querySelector(".bs-make-bucket"));
      const m = fresh[fresh.length - 1];
      say("while its own Group files its own row",
        fresh.length === was + 1 && m?.type === "group"
          && JSON.stringify(m.ids) === JSON.stringify([leftRow.dataset.id]),
        "it sent " + JSON.stringify(m));
    }

    // AND A ROW GOES FROM ONE INSTANCE TO THE OTHER.
    //
    // That is the shell's business rather than either instance's, because
    // neither one owns the other. What carries the dragged row therefore sits
    // above both, and this is the check that says so: the drop is on a group in
    // the second instance and the row came out of the first.
    // THE DROP TARGET IS BUILT HERE RATHER THAN FOUND. No group in this tree
    // takes a drop today, because the view declares a group per status and a
    // declared group swallows every row before the grouping level can make one
    // the data named. That is wk-e4754bcd17 and it is not this check's subject.
    //
    // A CHECK THAT WAITS FOR THE TREE TO SUPPLY ITS CASE IS A CHECK THAT GOES
    // QUIET, which this project has already been bitten by twice. So the case
    // is written: a group in the second instance is told what a drop would
    // write, exactly as the engine tells one, and the wiring is asked to pick
    // it up.
    const target = right.querySelector(".group") ?? right.querySelector("section.group");
    const fromRow = left.querySelector(".pane tr[data-id][draggable]")
      ?? left.querySelector(".top tr[data-id][draggable]");
    say("the second instance draws a group and the first draws a draggable row",
      !!target && !!fromRow,
      "group " + !!target + ", row " + !!fromRow + ", so this cannot be driven");
    if (target) {
      target.dataset.sets = "bucket";
      target.dataset.into = "a name a person typed";
      two.window.wireDragging?.(right);
    }
    if (target && fromRow) {
      const fire = (el, kind) => el.dispatchEvent(new two.window.Event(kind, { bubbles: true, cancelable: true }));
      const before = fresh.length;
      fire(fromRow, "dragstart");
      fire(target, "dragover");
      fire(target, "drop");
      const f = fresh[fresh.length - 1];
      say("a row dragged out of one instance and dropped in the other is filed there",
        fresh.length === before + 1 && f?.type === "file" && f.id === fromRow.dataset.id
          && f.into === target.dataset.into,
        "it sent " + JSON.stringify(f) + " for row " + fromRow.dataset.id
          + " onto " + target.dataset.into);
      fire(fromRow, "dragend");
    }

    // THE LINE BETWEEN THE SHELL AND AN INSTANCE, DRAWN AND THEN GUARDED.
    //
    // The shell is the work editor: it knows there are two instances, which
    // view they are showing, and what a row dragged between them is. An
    // instance is a generic editor: it draws a table over one view and pane,
    // and everything it does is about that table.
    //
    // WHY IT IS A CHECK AND NOT A PARAGRAPH. Every editor defect the owner has
    // reported was a control on one side of that line reaching to the other,
    // and a line nothing enforces is a line that moves the next time somebody
    // adds a button.
    // MATCHED BY CLASS AND NOT BY ID, so a second copy of a shell control put
    // inside an instance is caught rather than slipping past on its id.
    const shellOwns = [".tab", ".second", ".seam"];
    const instanceOwns = [".bs-bar", ".bs-make-bucket", ".bs-rename", ".bs-code-toggle",
                          ".bs-pop", ".heads", ".top", ".pane", ".bs-pager", ".bs-pane-code"];
    for (const sel of shellOwns) {
      const all = [...d.querySelectorAll(sel)];
      say("the shell owns " + sel + ", and it is drawn", all.length > 0,
        "nothing matches it, so this guards nothing");
      say("and no instance carries one", all.every((el) => !el.closest(".pane-wrap")),
        "one is inside a .pane-wrap, so an instance knows about the shell");
    }
    for (const sel of instanceOwns) {
      const all = [...d.querySelectorAll(sel)];
      say("an instance owns " + sel + ", and it is drawn", all.length > 0,
        "nothing matches it, so this guards nothing");
      say("and every one is inside an instance", all.every((el) => !!el.closest(".pane-wrap")),
        "one is outside every .pane-wrap, so the shell carries what a table owns");
      say("and each instance has its own " + sel,
        wraps.every((w) => w.querySelector(sel) !== null),
        "an instance is missing one, so the two are not the same editor twice");
    }
  }
}

console.log(`\n${sent.length} message(s) sent. ${bad} failed.`);
process.exit(bad ? 1 : 0);
