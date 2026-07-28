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
