// THE RENDER SIZES BOXES. IT NEVER MOVES THEM (owner ruling 2026-07-28).
//
// Obsidian sizes a node so a person can read the note inside it. The render
// shows a title and a subtitle instead, so it computes its own size — that
// part earns its keep.
//
// The arrangement is a different matter. A render-time re-layout used to band
// everything into columns and rows, and it produced a drawing BIGGER than the
// one it was tidying. The canvas is drawn by hand in Obsidian and that is
// where it gets fixed, so nothing here rearranges it.
//
// These are the invariants that must survive future edits, pinned here rather
// than in a comment.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { sizeForRender } from "../engine/render.ts";

interface Node { id: string; type?: string; x: number; y: number; width: number; height: number; file?: string; styleAttributes?: { shape?: string } }

function mainCanvas(): { nodes: Node[] } {
  return JSON.parse(readFileSync(new URL("../machines/main.canvas", import.meta.url), "utf8")) as { nodes: Node[] };
}

const centre = (n: Node): [number, number] => [n.x + n.width / 2, n.y + n.height / 2];

test("every box stays exactly where it was drawn", () => {
  const before = mainCanvas();
  const after = sizeForRender(before as never, {}) as unknown as { nodes: Node[] };
  assert.equal(after.nodes.length, before.nodes.length, "no node is lost or invented");
  const was = new Map(before.nodes.map((n) => [n.id, centre(n)]));
  for (const n of after.nodes) {
    const [x, y] = was.get(n.id)!;
    const [nx, ny] = centre(n);
    assert.ok(Math.abs(nx - x) < 0.001, `${n.id} kept the horizontal centre it was drawn at`);
    assert.ok(Math.abs(ny - y) < 0.001, `${n.id} kept the vertical centre it was drawn at`);
  }
});

test("a group is a frame somebody drew, so it is not touched at all", () => {
  const before = mainCanvas();
  const after = sizeForRender(before as never, {}) as unknown as { nodes: Node[] };
  const groups = before.nodes.filter((n) => n.type === "group");
  assert.ok(groups.length > 0, "the main machine carries groups");
  for (const g of groups) {
    const now = after.nodes.find((n) => n.id === g.id)!;
    assert.deepEqual([now.x, now.y, now.width, now.height], [g.x, g.y, g.width, g.height], `${g.id} is untouched`);
  }
});

test("start and end become symbols, and a subtitle makes a state taller", () => {
  const canvas = mainCanvas();
  const plain = sizeForRender(canvas as never, {}) as unknown as { nodes: Node[] };
  const pill = plain.nodes.find((n) => n.styleAttributes?.shape === "pill")!;
  assert.equal(pill.width, pill.height, "a pill is square, so it draws as a circle");
  assert.ok(pill.width < 100, "start and end are symbols, not boxes");

  const withSub = sizeForRender(canvas as never, { front_desk: { has_exit: false, exit_met: true, has_entry: false, entry_met: true, subtitle: "In doubt, go here." } }) as unknown as { nodes: Node[] };
  const find = (c: { nodes: Node[] }): Node => c.nodes.find((n) => (n.file ?? "").endsWith("front_desk.md"))!;
  assert.ok(find(withSub).height > find(plain).height, "the subtitle earns its line");
});

test("a box is never narrower than the label it has to show", () => {
  const canvas = mainCanvas();
  const after = sizeForRender(canvas as never, {}) as unknown as { nodes: Node[] };
  const states = after.nodes.filter((n) => n.type !== "group" && n.type !== "text" && n.styleAttributes?.shape !== "pill");
  assert.ok(states.length > 0, "the main machine carries states");
  for (const n of states) assert.ok(n.width >= 200, `${n.id} is at least the minimum box width`);
});
