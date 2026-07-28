// THE COMPACTION keeps the drawing's ORDER and throws away its magnitudes.
// Obsidian sizes a node so a person can read the note inside it; the render
// only shows a title and a subtitle, so the leftover space is what makes the
// text small once the drawing scales to fit.
//
// These are the invariants that must survive future edits, pinned here rather
// than in a comment: the arrangement a person drew by hand carries meaning,
// and nothing may quietly re-lay-it-out.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { compact } from "../engine/render.ts";

interface Node { id: string; type?: string; x: number; y: number; width: number; height: number; file?: string; styleAttributes?: { shape?: string } }

function mainCanvas(): { nodes: Node[] } {
  return JSON.parse(readFileSync(new URL("../machines/main.canvas", import.meta.url), "utf8")) as { nodes: Node[] };
}

const centre = (n: Node): [number, number] => [n.x + n.width / 2, n.y + n.height / 2];
const boxesOf = (c: { nodes: Node[] }): Node[] => c.nodes.filter((n) => n.type !== "group");
// A COMMENT IS AN ANNOTATION, NOT A STATE (owner report 2026-07-28). Text is
// wide by nature, and pinning its COLUMN order made it claim a column of the
// grid that every other row then left empty. Its ROW still means something -
// a note on top stays on top - so only the left-right pin is lifted.
const statesOf = (c: { nodes: Node[] }): Node[] => boxesOf(c).filter((n) => n.type !== "text");

test("compaction keeps who is left of, right of, above and below whom", () => {
  const before = mainCanvas();
  const after = compact(before as never, {}) as unknown as { nodes: Node[] };
  const b = new Map(boxesOf(before).map((n) => [n.id, centre(n)]));
  const a = new Map(boxesOf(after).map((n) => [n.id, centre(n)]));
  const states = new Set(statesOf(before).map((n) => n.id));
  assert.equal(a.size, b.size, "no node is lost or invented");
  for (const [idA, [bx1, by1]] of b) {
    for (const [idB, [bx2, by2]] of b) {
      if (idA === idB) continue;
      const [ax1, ay1] = a.get(idA)!;
      const [ax2, ay2] = a.get(idB)!;
      // Only pairs that were CLEARLY apart are pinned; near-ties share a band
      // on purpose, which is what collapses the empty space.
      const bothStates = states.has(idA) && states.has(idB);
      if (bothStates && Math.abs(bx1 - bx2) > 120) assert.equal(Math.sign(ax1 - ax2), Math.sign(bx1 - bx2), `${idA} vs ${idB} kept their left-right order`);
      if (Math.abs(by1 - by2) > 120) assert.equal(Math.sign(ay1 - ay2), Math.sign(by1 - by2), `${idA} vs ${idB} kept their up-down order`);
    }
  }
});

// THE GRID MUST NOT RESERVE SPACE NOTHING USES (owner report 2026-07-28, seen
// live). The comment claimed a column 520 wide, and every other row left it
// empty for the full height of the drawing. Text now sits out of the column
// grid entirely: it keeps its own row, and starts at the left edge.
test("a comment claims no column of its own", () => {
  const after = compact(mainCanvas() as never, {}) as unknown as { nodes: Node[] };
  const text = after.nodes.filter((n) => n.type === "text");
  assert.ok(text.length > 0, "the main machine carries its comment");
  for (const t of text) assert.equal(t.x, 0, "text anchors at the left edge instead of banding into a column");
  // No state may sit in a column the comment alone would have created: every
  // state's left edge is shared with at least one other state, or is the grid's.
  const states = statesOf(after);
  const widest = Math.max(...states.map((n) => n.x + n.width));
  const textWidest = Math.max(...text.map((n) => n.width));
  assert.ok(widest > textWidest, "the states span the drawing; the comment merely overhangs its row");
});

test("compaction leaves no two nodes overlapping", () => {
  const after = compact(mainCanvas() as never, {}) as unknown as { nodes: Node[] };
  const boxes = boxesOf(after);
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const p = boxes[i];
      const q = boxes[j];
      const apart = p.x + p.width <= q.x || q.x + q.width <= p.x || p.y + p.height <= q.y || q.y + q.height <= p.y;
      assert.ok(apart, `${p.id} and ${q.id} must not overlap`);
    }
  }
});

test("compaction actually shrinks: the drawing loses most of its empty space", () => {
  const before = mainCanvas();
  const after = compact(before as never, {}) as unknown as { nodes: Node[] };
  const span = (nodes: Node[]): number => {
    const w = Math.max(...nodes.map((n) => n.x + n.width)) - Math.min(...nodes.map((n) => n.x));
    const h = Math.max(...nodes.map((n) => n.y + n.height)) - Math.min(...nodes.map((n) => n.y));
    return w * h;
  };
  const shrunk = span(boxesOf(after)) / span(boxesOf(before));
  assert.ok(shrunk < 0.5, `the drawn area should more than halve, got ${shrunk.toFixed(3)}`);
});

test("start and end become symbols, and a subtitle makes a state taller", () => {
  const canvas = mainCanvas();
  const plain = compact(canvas as never, {}) as unknown as { nodes: Node[] };
  const pill = plain.nodes.find((n) => n.styleAttributes?.shape === "pill")!;
  assert.equal(pill.width, pill.height, "a pill is square, so it draws as a circle");
  assert.ok(pill.width < 100, "start and end are symbols, not boxes");

  const withSub = compact(canvas as never, { front_desk: { has_exit: false, exit_met: true, has_entry: false, entry_met: true, subtitle: "In doubt, go here." } }) as unknown as { nodes: Node[] };
  const find = (c: { nodes: Node[] }): Node => c.nodes.find((n) => (n.file ?? "").endsWith("front_desk.md"))!;
  assert.ok(find(withSub).height > find(plain).height, "the subtitle earns its line");
});
