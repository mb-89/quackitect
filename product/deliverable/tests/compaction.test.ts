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

test("compaction keeps who is left of, right of, above and below whom", () => {
  const before = mainCanvas();
  const after = compact(before as never, {}) as unknown as { nodes: Node[] };
  const b = new Map(boxesOf(before).map((n) => [n.id, centre(n)]));
  const a = new Map(boxesOf(after).map((n) => [n.id, centre(n)]));
  assert.equal(a.size, b.size, "no node is lost or invented");
  for (const [idA, [bx1, by1]] of b) {
    for (const [idB, [bx2, by2]] of b) {
      if (idA === idB) continue;
      const [ax1, ay1] = a.get(idA)!;
      const [ax2, ay2] = a.get(idB)!;
      // Only pairs that were CLEARLY apart are pinned; near-ties share a band
      // on purpose, which is what collapses the empty space.
      if (Math.abs(bx1 - bx2) > 120) assert.equal(Math.sign(ax1 - ax2), Math.sign(bx1 - bx2), `${idA} vs ${idB} kept their left-right order`);
      if (Math.abs(by1 - by2) > 120) assert.equal(Math.sign(ay1 - ay2), Math.sign(by1 - by2), `${idA} vs ${idB} kept their up-down order`);
    }
  }
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
