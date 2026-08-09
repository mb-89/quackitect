// THE CARD LIST IS THE PRODUCT'S, AND ITS ORDER IS THE NUMBERING.
//
// The numbers are muscle memory. Two things must therefore hold forever: the
// order in project/deliverable/views/cards.md is the order on screen, and a card that is not
// built yet still occupies its number rather than letting the rest shift up.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { bindings, loadCards } from "../engine/cards.ts";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));

test("the card order in the product's table is the numbering", () => {
  const cards = loadCards(ROOT);
  assert.ok(cards.length >= 2, "the product declares cards");
  cards.forEach((c, i) => {
    assert.equal(c.n, i + 1, "row order numbers the card");
  });
  assert.equal(cards[0].title, "chat", "chat is card one");
  assert.equal(cards[0].widget, "terminal", "and it shows the terminal");
});

// An empty `shows` cell is the whole point of the placeholder rule.
test("a card that is not built keeps its number", () => {
  const cards = loadCards(ROOT);
  const unbuilt = cards.filter((c) => c.widget === undefined);
  assert.ok(unbuilt.length > 0, "the table carries placeholders");
  for (const c of unbuilt) {
    assert.ok(c.n >= 1, "a placeholder still holds a number");
    assert.ok(c.title !== "", "and still says what it will be");
  }
  // The numbers must be a gapless run — a dropped placeholder would show up
  // here as a hole, which is exactly the renumbering we forbid.
  assert.deepEqual(
    cards.map((c) => c.n),
    cards.map((_, i) => i + 1),
    "no card is skipped",
  );
});

// A missing config must not break another product that never wrote one.
test("a product with no card table still gets a mirror", () => {
  const cards = loadCards(fileURLToPath(new URL("./nowhere-at-all/", import.meta.url)));
  assert.ok(cards.length > 0, "the fallback list stands in");
  assert.equal(cards[0].n, 1, "and it is numbered the same way");
});

// THE LEGEND RENDERS FROM THE REGISTRY (owner, 2026-07-29). A hand-kept list
// drifts, and a stale legend is worse than none.
test("every card contributes its key to the registry by itself", () => {
  const cards = loadCards(ROOT);
  const keys = bindings(cards);
  for (const c of cards) {
    const hit = keys.find((b) => b.keys === String(c.n));
    assert.ok(hit !== undefined, `card ${c.n} declares its key`);
    assert.equal(hit.label, c.title, "and the legend names the card it promotes");
  }
  assert.ok(keys.length > cards.length, "the registry carries more than the card keys");
  for (const b of keys) assert.ok(b.label !== "", "no binding shows up blank in the legend");
});
