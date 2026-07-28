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
  assert.ok(g.nodes.every((n) => n.status === "done"), "checked on arrival");
  assert.deepEqual(g.nodes.map((n) => n.brief), ["hunting the bug", "found it"]);
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
  session.decisions.apply("idle@0", { op: "plan", items: ["item one"] });
  session.decisions.apply("idle@0", { op: "update", brief: "narrating" });
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
    assert.ok(g.nodes.some((n) => n.brief === "narrating"), "the update rides the wire as a checked point");
    assert.ok(Array.isArray(g.visits));
  } finally {
    server.close();
  }
});

test("feed rows carry the click keys the panel needs", () => {
  const root = freshRoot();
  const log = new CallLog(seDir(root));
  log.append({ tool: "se_update", args: { via: "se_tick", visit: "idle@0", op: "update", brief: "x" }, ok: true, outcome: "result", duration_ms: 0 });
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
// It also flickered: term.resize relaid out inside the pane, the observer saw
// the relayout, and the two chased each other.
test("the terminal starts at half its column, drags past half, and cannot chase its own resize", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  assert.match(html, /#w-terminal \{ height: 50%;/, "an explicit half, not a content-sized box under a cap");
  assert.ok(!/#w-terminal \{[^}]*max-height/.test(html), "no cap — the owner asked to drag past half");
  assert.ok(html.includes('data-axis="y"'), "the height splitter ships");
  assert.ok(html.includes("row-resize"), "and it looks draggable");
  // The loop-breaker: a resize that changes no rows or columns must not fire.
  assert.ok(html.includes("if (cols === lastCols && rows === lastRows) return;"), "a no-op resize never happens");
  assert.ok(html.includes("requestAnimationFrame"), "the pane is measured on a settled frame");
});

// ONE SURFACE NEVER RESETS ANOTHER (owner ruling 2026-07-28). Switching the
// machine on screen used to throw the details pane away, because the view URL
// carried only the view. The reader had a log entry open; changing what they
// were looking at NEXT to it is no reason to close it.
test("a machine switch carries the reader's open detail with it", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  assert.ok(html.includes('u.searchParams.set("detail", CURRENT_DETAIL)'), "the view jump carries the open detail");
  assert.ok(html.includes('new URLSearchParams(location.search).get("detail")'), "and the page it lands on restores it");
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

// THE COLUMN IS SIZED BY THE TERMINAL IN IT (owner ruling 2026-07-28). 820px
// was too wide, but narrowing it alone would only have made the agent wrap
// early — the width and the column count are one decision, not two.
test("the left column's default width holds an 80-column terminal", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  const m = /#left \{ width: (\d+)px;/.exec(html);
  assert.ok(m !== null, "the left column still declares a starting width");
  // The client measures a real glyph and floors the division, so the column
  // must clear 80 cells at the widest a 13px monospace cell gets.
  const CELL_MAX = 8;
  const SCROLLBAR = 10;
  assert.ok(Number(m[1]) - SCROLLBAR >= 80 * CELL_MAX, `${m[1]}px cannot hold 80 columns`);
  assert.ok(Number(m[1]) < 820, "and it is narrower than the 820px the owner called too wide");
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
