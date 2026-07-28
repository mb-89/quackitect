// THE DRAWING IS THE TRUTH, SIZE INCLUDED (owner ruling 2026-07-28).
//
// The render used to compute its own box sizes, on the reasoning that a label
// needs less room than a note. The cost was that the mirror and Obsidian
// looked nothing alike, and a size the owner fixed in Obsidian was overruled
// on the way to the screen. So the render now changes NO geometry at all.
//
// Sizing did not disappear, it moved to BIRTH. A new node is created just big
// enough for its title and subtitle, and a person takes it from there.
//
// These are the invariants that must survive future edits, pinned here rather
// than in a comment.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { nodeSize, SUB_MAX, subLabel } from "../engine/canvas.ts";
import { renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

interface Node { id: string; type?: string; x: number; y: number; width: number; height: number; file?: string; styleAttributes?: { shape?: string } }

function mainCanvas(): { nodes: Node[] } {
  return JSON.parse(readFileSync(new URL("../machines/main.canvas", import.meta.url), "utf8")) as { nodes: Node[] };
}

// The render is a view. Nothing in it may re-derive a node's box: fix the
// drawing in Obsidian and the mirror must agree.
test("the render never re-sizes and never re-positions a node", () => {
  const src = readFileSync(new URL("../engine/render.ts", import.meta.url), "utf8");
  assert.ok(!src.includes("sizeForRender"), "the render-time resizer is gone, not merely unused");
  assert.ok(!/n\.width = /.test(src), "no node's width is ever reassigned");
  assert.ok(!/n\.height = /.test(src), "no node's height is ever reassigned");
  assert.ok(!/n\.x \+=/.test(src), "no node is nudged horizontally");
  assert.ok(!/n\.y \+=/.test(src), "no node is nudged vertically");
});

// The drawn numbers must reach the SVG untouched. The old render replaced
// them with a computed label size, so the drawn ones simply were not there.
test("the drawn geometry reaches the SVG verbatim", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "agent" });
  const states = mainCanvas().nodes.filter((n) => n.type === "file");
  assert.ok(states.length > 0, "the main machine carries state nodes");
  for (const n of states) {
    assert.ok(html.includes(`width="${n.width}"`), `${n.id} keeps the width it was drawn at`);
    assert.ok(html.includes(`height="${n.height}"`), `${n.id} keeps the height it was drawn at`);
  }
});

// Birth size: the label, and nothing more. This is where the struck 620x640
// rule used to live.
test("a new node is born the size of its title and subtitle", () => {
  const bare = nodeSize("front_desk");
  const withSub = nodeSize("front_desk", "In doubt, go here.");
  assert.ok(withSub.height > bare.height, "the subtitle earns its line");
  assert.ok(bare.width >= 200, "a box is never narrower than the minimum");
  assert.ok(bare.height < 200, "and never as tall as the note-reading box the old rule made");
  assert.ok(nodeSize("a_very_long_state_identifier_indeed").width > bare.width, "a longer title needs a wider box");
  // The struck rule: nothing is born anywhere near 620x640 any more.
  assert.ok(withSub.height < 640, "the 620x640 birth size is struck");
});

// A GENERATED BOX IS SIZED BY WHAT IT SHOWS (owner ruling 2026-07-28). An
// expedition's subtitle is its whole goal statement, and sizing from that made
// e20's box 10793px wide to display 48 characters. Nobody could fix it in
// Obsidian either, because the node is generated on every render.
test("a long statement widens the box no further than the text it shows", () => {
  const shown = "x".repeat(SUB_MAX);
  const essay = "x".repeat(4000);
  assert.equal(nodeSize("e20", essay).width, nodeSize("e20", shown).width, "past the cut, more text buys no more width");
  assert.ok(nodeSize("e20", essay).width <= 560, "and no box is ever wider than the ceiling");
  assert.ok(nodeSize("a_very_long_state_identifier_indeed_and_then_some_more").width <= 560, "a long title is capped too");
});

// One shortening, two readers. They drifted apart once already: the render cut
// the subtitle at 48 while the size measured all thousand characters.
test("the drawing and the size read the same shortened subtitle", () => {
  const src = readFileSync(new URL("../engine/render.ts", import.meta.url), "utf8");
  assert.ok(src.includes("subLabel("), "the render shortens through the shared helper");
  assert.ok(!/slice\(0, *4[0-9]\)/.test(src), "and keeps no truncation of its own to drift");
  assert.equal(subLabel("x".repeat(4000))!.length, SUB_MAX, "the shortened label is exactly the cut length");
  assert.equal(subLabel("short"), "short", "a short subtitle passes through untouched");
  assert.equal(subLabel(""), undefined, "an empty subtitle is no subtitle");
});
