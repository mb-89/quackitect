// The mirror's data contracts — what the page's client script consumes
// keeps its shape: the decisions panel (checklist nodes, branches, and the
// narration timeline), the feed's click keys, and the served page carrying
// the renderers. Pinned after the blank-panel regression (owner order
// 2026-07-27): a narrated visit must NEVER render empty.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { CallLog } from "../engine/calllog.ts";
import { seDir } from "../engine/paths.ts";
import { feedRows, renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

test("the checklist lives: plan opens nodes, done checks them off, fork branches", () => {
  const s = new Session(freshRoot());
  s.decisions.apply("idle@0", { op: "plan", items: ["first item", "second item"] });
  let g = s.decisions.graph("idle@0");
  assert.equal(g.nodes.length, 2);
  assert.ok(g.nodes.every((n) => n.status === "open"));
  const first = g.nodes[0];
  s.decisions.apply("idle@0", { op: "fork", brief: "a surprise under the first item" });
  g = s.decisions.graph("idle@0");
  assert.equal(g.nodes.length, 3, "the fork branched the tree");
  const forkNode = g.nodes.find((n) => n.brief.includes("surprise"))!;
  s.decisions.apply("idle@0", { op: "done", node: forkNode.id, brief: "handled" });
  s.decisions.apply("idle@0", { op: "done", node: first.id, brief: "shipped" });
  g = s.decisions.graph("idle@0");
  assert.equal(g.nodes.filter((n) => n.status === "done").length, 2, "checked off");
  assert.equal(g.nodes.filter((n) => n.status === "open").length, 1, "one still open");
});

test("EVERY update changes the render: a bare update lands as a checked point (owner ruling)", () => {
  const s = new Session(freshRoot());
  s.decisions.apply("idle@0", { op: "update", brief: "hunting the bug" });
  s.decisions.apply("idle@0", { op: "update", brief: "found it" });
  const g = s.decisions.graph("idle@0");
  assert.equal(g.nodes.length, 2, "each update is a visible point");
  assert.ok(
    g.nodes.every((n) => n.status === "done"),
    "checked on arrival",
  );
  assert.deepEqual(
    g.nodes.map((n) => n.brief),
    ["hunting the bug", "found it"],
  );
  // An update aimed at an open plan item nests under it.
  s.decisions.apply("idle@0", { op: "plan", items: ["one item"] });
  const item = s.decisions.graph("idle@0").nodes.find((n) => n.status === "open")!;
  s.decisions.apply("idle@0", { op: "update", node: item.id, brief: "working the item" });
  const nested = s.decisions.graph("idle@0").nodes.find((n) => n.brief === "working the item")!;
  assert.equal(nested.parent, item.id, "the point hangs under the item it narrates");
});

test("/api/decisions serves the panel's whole contract over HTTP", async () => {
  const { startMirror } = await import("../engine/mirror.ts");
  const root = freshRoot();
  const session = new Session(root);
  const planned = session.decisions.apply("idle@0", { op: "plan", items: ["item one"] }) as Record<string, unknown>;
  const only = (planned.open_nodes as { id: string }[])[0].id;
  session.decisions.apply("idle@0", { op: "update", node: only, brief: "narrating" });
  const server = startMirror({ session, root, port: 0, log: new CallLog(seDir(root)), mode: "agent" });
  await new Promise((r) => server.on("listening", r));
  const port = (server.address() as { port: number }).port;
  try {
    const g = (await (await fetch(`http://localhost:${port}/api/decisions?visit=${encodeURIComponent("idle@0")}`)).json()) as {
      visit: string;
      nodes: { brief: string }[];
      visits: string[];
    };
    assert.equal(g.visit, "idle@0");
    assert.ok(g.nodes.length >= 2, "the checklist rides the wire");
    assert.ok(
      g.nodes.some((n) => n.brief === "narrating"),
      "the update rides the wire as a checked point",
    );
    assert.ok(Array.isArray(g.visits));
  } finally {
    server.close();
  }
});

test("feed rows carry the click keys the panel needs", () => {
  const root = freshRoot();
  const log = new CallLog(seDir(root));
  log.append({
    tool: "se_update",
    args: { via: "se_pull", visit: "idle@0", op: "update", brief: "x" },
    ok: true,
    outcome: "result",
    duration_ms: 0,
  });
  const { rows } = feedRows(log, "1970-01-01T00:00:00.000Z");
  assert.equal(rows[0].type, "update", "narration types as update (bold), never note");
  assert.equal(rows[0].visit, "idle@0", "the click opens this visit's tree");
});

test("the served page ships the panel renderers", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  assert.ok(html.includes("renderDecisions"), "the decisions renderer ships");
  assert.ok(html.includes("loadRecDecisions"), "the archive per-visit history renderer ships");
  assert.ok(html.includes("no decisions recorded"), "the honest empty state ships");
});

// THE LOADING BAR MUST NOT LIE (owner ruling 2026-07-28, seen live in the
// expedition archive). It stayed up for good, because showLoading had no
// counterpart — it leaned on a full page load to replace it, and morphing
// had already replaced full page loads. The same visit also loaded TWICE,
// because the page on its way out still answered the /events wake.
test("the loading bar settles: it can come down, it times out, and one action loads once", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  assert.ok(html.includes("function hideLoading("), "the bar has a way down, not only a way up");
  assert.match(html, /finally \{[^}]*hideLoading\(\)/, "a settled refresh always drops the bar");
  assert.ok(html.includes("stalled"), "a load that never answers says so instead of spinning");
  assert.ok(html.includes('addEventListener("pageshow", hideLoading)'), "a restored page carries no stale bar");
  // Navigation that leaves THIS page starts no load on it — the modifier
  // clicks the expand controls advertise were what stranded the bar.
  assert.ok(html.includes("ev.ctrlKey || ev.metaKey || ev.shiftKey"), "a click that opens elsewhere raises no bar here");
  // ONE ACTION, ONE LOAD. Every view jump goes through navigateTo, which
  // latches the flag that stops the outgoing page fetching itself again.
  assert.ok(html.includes("if (navigatingAway) return;"), "a page on its way out does not refresh itself");
  const bare = html.match(/location\.href = "\/\?view=/g) ?? [];
  assert.equal(bare.length, 0, "view navigation goes through navigateTo, never a bare location.href");
});

// THE TERMINAL EARNS ITS SPACE (owner ruling 2026-07-28). It sat tiny because
// flex:none with no height sizes to CONTENT, and max-height only capped that.
//
// The half-a-column splitter that fixed it is retired with the column itself
// (owner 2026-07-29). The ruling survives in a stronger form: the terminal
// fills its whole card, and promoted it takes the big slot — more room than
// the splitter ever gave it. What must never come back is a rule that sizes
// it to its content or caps it.
test("the terminal fills its card, uncapped, and cannot chase its own resize", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "agent" });
  assert.ok(!/#w-terminal \{[^}]*max-height/.test(html), "no cap on how big it gets");
  assert.ok(!/#w-terminal \{[^}]*flex: none/.test(html), "and never content-sized, which is how it sat tiny");
  assert.match(html, /\.card > \.widget \{ flex: 1/, "a card's widget takes the whole card");
  assert.ok(html.includes("if (cols === lastCols && rows === lastRows) return;"), "a no-op resize never happens");
  assert.ok(html.includes("requestAnimationFrame"), "the pane is measured on a settled frame");
});

// THE FLICKER CAME BACK, because the first fix caught the wrong loop shape
// (owner report 2026-07-28, second round). It refused a resize that changed
// NOTHING, but the loop alternated between two DIFFERENT sizes: padding made
// the grid too wide, xterm overflowed, the pane grew a scrollbar, the box
// shrank, and round it went. Each guard below cuts one link in that chain.
test("the terminal pane cannot flicker between two sizes", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "agent" });
  // Link one: the pane must never grow a scrollbar, or the child changes the
  // parent's client box mid-measure.
  assert.match(html, /\.term-panel \{[^}]*overflow: hidden/, "the terminal pane never scrolls — xterm scrolls itself");
  assert.ok(!/\.term-panel \{[^}]*overflow: auto/.test(html), "and it is not the scroller it used to be");
  // Link two: the grid is measured against the CONTENT box. clientWidth
  // includes padding, which is what made the grid too wide to fit.
  assert.ok(html.includes("parseFloat(s.paddingLeft)"), "padding comes off the measured width");
  assert.ok(html.includes("parseFloat(s.paddingTop)"), "padding comes off the measured height");
  assert.ok(!/Math\.floor\(pane\.clientWidth \/ c\.w\)/.test(html), "never the raw client box again");
  // Link three: our own resize does not feed the observer that watches it.
  assert.ok(html.includes("settleUntil = Date.now() + 250"), "a resize is given time to land");
  assert.ok(html.includes("if (now < settleUntil)"), "and the observer is ignored until it has");
  assert.ok(html.includes("trailing = setTimeout(sync"), "with one trailing look, so a drag ending in the window is not lost");
});

// PROMOTION MOVES NOTHING (owner design 2026-07-29). The whole layout is ONE
// grid, so a card grows by changing CLASS, never by changing parent. This is
// the reason it is a grid and not two panes: a moved widget is a recreated
// widget, and a recreated terminal loses its scrollback and its focus.
test("promoting a card changes a class, never the DOM", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  assert.ok(html.includes('el.classList.toggle("main"'), "the promoted card is marked by class");
  const from = html.indexOf("function applyCards");
  // The FIRST keydown after applyCards bounds the slice — the form editors
  // own an earlier keydown of their own.
  const to = html.indexOf('addEventListener("keydown"', from);
  assert.ok(from !== -1 && to > from, "the card logic is present");
  const cardJs = html.slice(from, to);
  assert.ok(!cardJs.includes("appendChild"), "no card is ever re-parented");
  assert.ok(!cardJs.includes("insertBefore"), "nor spliced into a new position");
  assert.ok(!cardJs.includes("innerHTML"), "nor rebuilt from markup");
});

// THE NUMBERS ARE THE PRODUCT'S, AND THE LEGEND FILLS THE VACATED SLOT.
test("every card carries its number and the legend takes the empty slot", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  assert.match(html, /id="card-legend"/, "the legend is a card of its own");
  assert.match(html, /grid-template-rows:repeat\(3,1fr\)/, "six cards make a two-by-three grid");
  assert.match(html, /<span class="cardnum"[^>]*>2<\/span>/, "cards carry the number that promotes them");
  // The default main card is the first AVAILABLE one — one rule, no exception
  // list. With no agent connected, the state machine leads.
  assert.match(html, /class="card main" id="card-state-machine"/, "the state machine leads when chat is empty");
});

// A KEY NEVER FIRES WHILE THE READER IS TYPING. Chat is a card you type in,
// so this is load-bearing rather than an edge case.
test("the number keys yield to a text field and pin their choice in the URL", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  assert.ok(html.includes('t.tagName === "INPUT"'), "typing in a field is not a shortcut");
  assert.ok(html.includes("t.isContentEditable"), "nor typing in anything else editable");
  assert.ok(html.includes('q.set("card", id)'), "the promoted card is pinned in the URL");
  // Same key again is the way back: the loop is chat, look at something, chat.
  assert.ok(
    html.includes("if (id === CARD_NOW) { if (CARD_PREV !== null) promoteCard(CARD_PREV); return; }"),
    "the same key returns to the previous card",
  );
  // THE NUMBER IS A CONTROL, NOT A LABEL (owner 2026-07-29). A badge that
  // names a shortcut but does nothing when clicked is a label pretending.
  assert.ok(html.includes('ev.target.closest(".cardnum")'), "the badge is wired to the click");
  assert.ok(html.includes('promoteCard(card.id.replace(/^card-/, ""))'), "and it promotes the card it sits on");
  assert.match(html, /\.cardnum \{[^}]*cursor: pointer/, "and it looks clickable");

  // AIMING THE LINE had no surface: the route could be drawn but not pointed.
  // The key is registered, so the legend renders it without a hand-kept list.
  assert.match(html, /<span class="legend-key">t<\/span>/, "the target key is in the legend");
  assert.ok(html.includes('fetch("/target"'), "and it posts the selected state");

  // A ROUTE LINE MUST NOT DEPEND ON CSS TO AVOID FILLING. An unstyled SVG path
  // paints solid black, and the morph used to leave a stale stylesheet behind.
  assert.match(html, /<path d="[^"]+" fill="none" class="route-line"/, "fill=none is an attribute, not only a rule");
  assert.ok(html.includes('doc.querySelector("head style")'), "and the morph refreshes the stylesheet");
});

// NEVER CHANGE ANYTHING THE LAST CHANGE DID NOT TOUCH (owner, note-4ba204a85769,
// restated in general form). The rule had been written in prose three times and
// broken three times, which is the case for a mechanical check instead. These
// are the four things a morph must leave alone.
test("a morph leaves untouched everything the change did not touch", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  assert.ok(html.includes('from.hasAttribute("data-morph-ignore")'), "client-filled subtrees are never overwritten");
  assert.ok(html.includes('from.hasAttribute("data-keep-style")'), "a size the reader dragged is never snapped back");
  assert.ok(html.includes("from !== document.activeElement"), "a control under the reader's hand stays theirs");
  assert.match(html, /<div class="cards" data-keep-style/, "the card split is a dragged size, so it is kept");
  // A full reload throws away every one of the above at once. Exactly two
  // survive: the reader's manual retry on a stalled loading bar, and the
  // stale-shell heal when the ENGINE's life stamp changed — by then the
  // page's script is dead code and there is no place left to keep.
  const reloads = html.match(/location\.reload\(\)/g) ?? [];
  assert.equal(reloads.length, 2, "the page reloads itself in exactly two sanctioned places");
  assert.ok(html.includes("if (stalled !== null) { hideLoading(); location.reload(); return; }"), "one is the reader asking for it");
  assert.ok(
    html.includes("if (a.build && D.build && a.build !== D.build) { location.reload(); return; }"),
    "the other is a new engine life serving a new script",
  );
});

// THE SAME RULE, ON THE PATH THE MORPH DOES NOT OWN (owner, 2026-07-29, seen
// live). The details pane is morph-ignored, so the morph left it alone — and
// then rebind() rewrote it from scratch after every render anyway. The reader
// watched it flicker and lost their scroll position mid-read. A guard with a
// second door into the same room is not a guard.
test("the details pane is not rewritten when its content did not change", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  assert.ok(
    html.includes("if (DETAIL_TITLE === title && DETAIL_HTML === html) return;"),
    "an unchanged details render touches no DOM at all",
  );
  assert.ok(html.includes("const top = sameSubject ? el.scrollTop : 0;"), "and a changed one still keeps the reader's place");
  assert.ok(html.includes("el.scrollTop = top;"), "the kept position is actually restored");
  // The feed polls constantly, so it repaints far more often than anything
  // else. A reader scrolled down into the past was snapped to the top by a
  // poll that found nothing new.
  assert.ok(html.includes("if (html === LOG_HTML) return;"), "an unchanged feed repaints nothing");
  assert.ok(html.includes("logPanel.scrollTop = stick ? 0 : top;"), "and a changed feed keeps the reader where they were");
});

// THE CLASS, NOT THE INSTANCE (owner, 2026-07-29). The reader's place has now
// been thrown away four different ways, and the rule against it was written in
// prose four times. Prose is the weakest guard this repo has.
//
// The failure was always one shape: a NEW pinned surface arrives, and the
// hand-written list of things to carry never learns about it. The list is
// declared once now, and this test refuses any param the client pins that is
// missing from it. Register a param and every navigation carries it for free.
test("every place the reader can pin is registered, so navigation carries it", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  const registry = /const PLACE = \[([^\]]*(?:\][^;]*?)*?)\n\];/.exec(html);
  assert.ok(registry, "the reader's place is declared in one registry");
  const registered = new Set([...registry[1].matchAll(/\["([a-z]+)"/g)].map((m) => m[1]));
  assert.ok(registered.has("detail"), "the details pane is a place");
  assert.ok(registered.has("card"), "the promoted card is a place");

  // Everything the client writes into the URL by name. "view" is the
  // navigation TARGET rather than something carried alongside it, so it is
  // the one exemption. Anything else the reader can pin must be registered,
  // or the next link they click silently drops it.
  const pinned = [...html.matchAll(/(?:q|u\.searchParams)\.set\("([a-z]+)"/g)].map((m) => m[1]);
  assert.ok(pinned.includes("view"), "the sweep found the pin sites at all");
  for (const p of pinned) {
    if (p === "view") continue;
    assert.ok(registered.has(p), `${p} is pinned into the URL but is not a registered place`);
  }

  // Both consumers go through the registry. A fourth hand-written list is
  // how this broke the first three times.
  assert.ok(html.includes("function withPlace(url)"), "navigating away carries the place");
  assert.ok(html.includes("function pinPlace(q)"), "staying put pins the place");
  assert.ok(html.includes("pinPlace(q);"), "and the refresh path uses it instead of its own list");
});

// THE CHAT CARD KEEPS ITS SLOT (owner 2026-07-29). This SUPERSEDES the earlier
// rule that the terminal pane ships hidden until a host answers. Hiding was
// safe while the pane lived in a column of its own. As a numbered card it is
// not: an agent can connect or drop MID-SESSION, and a card that vanishes
// renumbers every card after it while the reader is using those numbers.
//
// Its splitter is retired outright — the card grid sizes the card now.
test("the chat card holds its slot and its number with no agent connected", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "agent" });
  assert.match(html, /id="w-terminal"/, "the chat card is rendered");
  assert.ok(!/class="widget no-host" id="w-terminal"/.test(html), "and it is NOT hidden when nothing answers");
  assert.ok(html.includes("no agent connected"), "it says plainly why it is empty");
  assert.match(html, /id="card-chat"/, "the slot is there under its own id");
  assert.match(html, /<span class="cardnum"[^>]*>1<\/span>/, "carrying the number that promotes it");
});

// THE END IS SHOWN, NOT GUESSED (owner ruling 2026-07-28). Quitting at the
// console left a mirror that looked perfectly alive: the page tried to close
// its own tab, the browsers that refused waited out a twenty-second timeout,
// and the sentence it finally showed blamed an end the walk never reached.
test("the mirror reports the end and never closes its own window", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "agent" });
  assert.ok(!html.includes("window.close()"), "the page never closes the reader's tab");
  assert.ok(html.includes("SESSION OVER"), "the end is stated in full");
  assert.ok(html.includes("link-lost"), "and a dropped link says so at once, rather than in silence");
  // Three ways a session can stop, three different sentences. They shared one
  // before, which is how a quit came to report that the machine reached end.
  assert.ok(html.includes("the machine reached end"), "reaching end reads as reaching end");
  assert.ok(html.includes("the console quit"), "a quit reads as a quit");
  assert.ok(html.includes("the server stopped answering"), "and an unannounced death reads as one");
});

// A QUIT IS ANNOUNCED, NOT INFERRED. The engine learns of it when the lane
// closes, and it knows before any watcher could. Pushing it costs one message
// and saves the reader the whole death timeout.
test("the session's departure is a signal of its own, separate from end", () => {
  const session = new Session(freshRoot());
  assert.equal(session.serverGone, false, "a running session has not gone anywhere");
  session.markServerGone();
  assert.equal(session.serverGone, true, "the departure is recorded");
  assert.equal(session.instance.status, "open", "and the unfinished walk is NOT recorded as complete");
});

// ONE SURFACE NEVER RESETS ANOTHER (owner ruling 2026-07-28). Switching the
// machine on screen used to throw the details pane away, because the view URL
// carried only the view. The reader had a log entry open; changing what they
// were looking at NEXT to it is no reason to close it.
test("a machine switch carries the reader's open detail with it", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  // This used to pin the one line that carried the detail. That pinned HOW
  // rather than WHAT, and it broke the moment the carrying became general
  // while the behaviour it guarded was untouched. It now names the place and
  // the mechanism that carries every place.
  assert.ok(html.includes('["detail", () => CURRENT_DETAIL]'), "the open detail is a registered place");
  assert.ok(
    html.includes("if (v && !u.searchParams.has(p[0])) u.searchParams.set(p[0], v);"),
    "and a view jump carries every registered place",
  );
  assert.ok(html.includes('new URLSearchParams(location.search).get("detail")'), "the page it lands on restores it");
});

// A PANE THE READER SIZED KEEPS THAT SIZE (owner ruling 2026-07-28). Walking
// into a sub-state is a full page load, and a dragged width is an inline
// style, which no page load survives. Every entry into a sub-machine snapped
// the layout back to its defaults, the machine drawing with it.
test("pane sizes are stored on release and restored on load", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  assert.ok(html.includes("function savePaneSize"), "a released divider stores the size");
  assert.ok(html.includes("restorePaneSizes();"), "and the next page load puts it back");
  // localStorage, not sessionStorage: how the reader likes to work outlives
  // the tab, unlike the per-machine viewBox beside it.
  assert.match(html, /localStorage\.setItem\(PANE_KEY/, "the size is a preference, so it survives the tab");
  assert.match(html, /sessionStorage\.setItem\(VB_KEY/, "while the view of one drawing stays session-scoped");
  // A size saved on a wider screen must not push the layout off a narrow one.
  assert.ok(html.includes("Math.min(px, room - 120)"), "a stored size is clamped to the room there actually is");
});

// THE MAIN CARD IS SIZED BY THE TERMINAL IN IT (owner ruling 2026-07-28,
// carried into the card layout). 820px was too wide, but narrowing alone would
// only have made the agent wrap early — the width and the column count are one
// decision, not two.
//
// The column it used to guard is gone. The ruling is not: when chat is the
// PROMOTED card it must still clear 80 columns, and the default split is what
// decides that. A small card cannot hold 80 columns and is not meant to.
test("the default split gives a promoted terminal its 80 columns", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  const m = /--main-w, (\d+)%/.exec(html);
  assert.ok(m !== null, "the main card declares a default share of the width");
  // The client measures a real glyph and floors the division, so the card must
  // clear 80 cells at the widest a 13px monospace cell gets.
  const CELL_MAX = 8;
  const SCROLLBAR = 10;
  const NARROW = 1280; // a small laptop, not a wide desktop
  const got = (NARROW * Number(m[1])) / 100 - SCROLLBAR;
  assert.ok(got >= 80 * CELL_MAX, `${Math.round(got)}px cannot hold 80 columns on a ${NARROW}px screen`);
  assert.ok(Number(m[1]) >= 50, "and the main card is the bigger half, which is the point of promoting it");
});

// HUMAN-RUNNABLE TOOLS RIDE THE LEGAL-TOOLS LINKS (owner ruling 2026-07-28).
// The survey had a button of its own in the machine header, and the owner
// never found it there among the crumbs, the slider and the escape control.
// No lane tool earns bespoke chrome; the per-state list is the surface.
test("the survey is offered as a legal tool, not as a button of its own", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  assert.match(html, /^\s*se_survey: \[\],$/m, "it is registered human-callable, with no arguments to give");
  assert.ok(!html.includes("survey-btn"), "and its bespoke button is gone, handler and all");
});

// A CHECKLIST IS A PROGRESS VIEW (owner 2026-07-29, after watching one sit
// untouched for an hour and then close fourteen items in a minute). The
// rule was already in walking.md and prose lost, so the engine says it.
// THE MAP RIDES EVERY UPDATE (note-792c32b5425e item 5). Resolving a node
// needs its id, and the id used to be printed only by a REFUSAL - so the
// way to see your own checklist was to name a node that does not exist.
test("an update answers with the open nodes, so an id is never guessed", () => {
  const s = new Session(freshRoot());
  const planned = s.decisions.apply("idle@0", { op: "plan", items: ["first", "second"] }) as Record<string, unknown>;
  const map = planned.open_nodes as { id: string; brief: string }[];
  assert.equal(map.length, 2, "the plan answers with what it opened");
  assert.deepEqual(
    map.map((n) => n.brief),
    ["first", "second"],
  );
  assert.ok(
    map.every((n) => /^d\d+$/.test(n.id)),
    "each carries the id a resolution needs",
  );
  // Closing one takes it off the map, so the map is never stale.
  const after = s.decisions.apply("idle@0", { op: "done", node: map[0].id, brief: "landed" }) as Record<string, unknown>;
  const left = after.open_nodes as { id: string; brief: string }[];
  assert.deepEqual(
    left.map((n) => n.brief),
    ["second"],
  );
  assert.equal(after.open, 1, "and the count still agrees with the map");
});

// AN UPDATE THAT MOVES NOTHING ON THE CHECKLIST IS NARRATION WEARING
// progress's clothes (owner, 2026-07-29, watching a board of yellow items
// collect checked leaves underneath). This is only affordable because the
// open node map now rides home on every call.
test("an update names its item while a checklist stands, and is free when none does", () => {
  const s = new Session(freshRoot());
  // Nothing open - there is nothing to attach to, so a bare update is right.
  const bare = s.decisions.apply("idle@0", { op: "update", brief: "before any plan" }) as Record<string, unknown>;
  assert.equal(bare.update, "update");
  const planned = s.decisions.apply("idle@0", { op: "plan", items: ["the item"] }) as Record<string, unknown>;
  const only = (planned.open_nodes as { id: string }[])[0].id;
  assert.throws(
    () => s.decisions.apply("idle@0", { op: "update", brief: "floating free" }),
    (err: unknown) => {
      const r = err as { clause?: string; expected?: string };
      assert.equal(r.clause, "SE-C-121");
      assert.match(String(r.expected), /which item is this about/);
      assert.match(String(r.expected), /the item/, "and the refusal names what is open");
      return true;
    },
  );
  // Named, it lands under the item it narrates.
  s.decisions.apply("idle@0", { op: "update", node: only, brief: "on it" });
  const nested = s.decisions.graph("idle@0").nodes.find((n) => n.brief === "on it")!;
  assert.equal(nested.parent, only);
  // ANOTHER STATE'S checklist is not this state's business.
  const elsewhere = s.decisions.apply("front_desk@0", { op: "update", brief: "a different visit" }) as Record<string, unknown>;
  assert.equal(elsewhere.update, "update", "an open list in another visit never blocks this one");
});

test("the checklist warns once when narration outruns it, then refuses", () => {
  const s = new Session(freshRoot());
  s.decisions.apply("idle@0", { op: "plan", items: ["first", "second"] });
  // Each update NAMES its item - narration that moves nothing on the
  // checklist is refused outright. This is about the item never CLOSING,
  // which is a different failure.
  const items = (s.decisions.apply("idle@0", { op: "update", node: "d1", brief: "starting" }) as Record<string, unknown>).open_nodes as {
    id: string;
  }[];
  let last: Record<string, unknown> = {};
  for (let i = 0; i < 4; i++)
    last = s.decisions.apply("idle@0", { op: "update", node: items[0].id, brief: `working ${i}` }) as Record<string, unknown>;
  assert.ok(typeof last.nudge === "string", "five updates with nothing closed earns the warning");
  assert.match(String(last.nudge), /PROGRESS view/);
  assert.equal(last.update, "update", "the warned call itself still lands - the warning is free");
  // IGNORE THE WARNING AND THE NEXT ONE REFUSES (owner ruling 2026-08-07).
  // It took the toll's shape because advice lost: in one 15-hour window the
  // nudge fired five times and was ignored five times.
  assert.throws(
    () => s.decisions.apply("idle@0", { op: "update", node: items[0].id, brief: "ignoring the warning" }),
    (e: Error & { clause?: string }) => e.clause === "SE-C-133",
    "the update after the warning is refused",
  );
  // THE REMEDY IS NEVER REFUSED, or the refusal would be a trap with no way
  // out. Closing something is always legal, and it clears the count.
  const open = s.decisions.graph("idle@0").nodes.filter((n) => n.status === "open");
  const closed = s.decisions.apply("idle@0", { op: "done", node: open[0].id, brief: "landed" }) as Record<string, unknown>;
  assert.equal(closed.nudge, undefined, "closing something clears it");
  const after = s.decisions.apply("idle@0", { op: "update", node: open[1].id, brief: "on to the next" }) as Record<string, unknown>;
  assert.equal(after.nudge, undefined, "and the count starts again from there");
});

// DEFERRED MUST NEVER LOOK KILLED (owner design). A parked point is still
// owed; it is simply owed in another state. The badge and the origin line
// were already built, so this pins the one thing that was not: the style.
test("a deferred point reads as owed elsewhere, never as struck out", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  const rule = /\.dnode\.s-deferred \{([^}]*)\}/.exec(html);
  assert.ok(rule, "deferred has a style of its own, not the default nothing");
  assert.ok(!/line-through/.test(rule[1]), "a strike is what says a point died");
  // The VARIABLE, not a literal: colour is configuration now, and a test
  // pinning a hex would refuse the palette file the right to change it.
  assert.match(rule[1], /var\(--se-accent\)/, "it keeps the open colour, because it is still owed");
  assert.match(rule[1], /italic/, "and leans, because it is owed somewhere else");
  // The arrow, distinct from the strike obsolete carries.
  assert.match(html, /deferred: "→"/, "the badge is an arrow");
});

// A POPPED-OUT CARD IS A SNAPSHOT (owner ruling 2026-07-29). The pop-out
// opened a URL baked in at draw time, so it showed the server's default
// while the live card showed whatever the reader had clicked — a state
// against an answered question. Fifth time the reader's place was lost.
test("a popped-out card opens on what it was showing, and then holds still", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  // The place rides every pop-out; the bare, subject-less open is gone.
  assert.ok(!/window\.open\(url,/.test(html), "no pop-out opens its baked-in URL raw");
  assert.match(html, /window\.open\(frozenUrl\(url\), "_blank"\)/, "the reader's place rides along");
  assert.ok(!html.includes('"se-widget"'), "and no NAMED window — five snapshots need five windows, not one reused");
  // Frozen is the absence of liveness, in both directions.
  // A BROWSER ALLOWS ONLY A HANDFUL OF CONNECTIONS TO ONE HOST, and a stream
  // is permanent. One per embedded card exhausted the pool, after which every
  // other request queued instead of going out. So the guard covers both: a
  // frozen window, and any page running inside a frame.
  assert.match(
    html,
    /if \(!FROZEN && window\.parent === window\) \{\nconst es = new EventSource/,
    "only a top-level, unfrozen window opens the event stream",
  );
  assert.match(html, /async function refresh\(detail\) \{\n {2}if \(FROZEN\) return;/, "and never redraws itself");
  // It says so, quietly — a snapshot that looks live is a trap.
  assert.match(html, /frozen-bar/, "the frozen window carries its own marker");
});
