// WHICH GROUPS SHIP FOLDED IS A DECLARATION, NOT A NAME IN CODE.
//
// A group somebody wants folded must be nameable by that person, in the query,
// without editing a renderer.
//
// TWO GROUPS BURY THE PAGE TODAY. The backlog holds every standing pool token,
// 154 measured. The retro holds every pending note, 96 measured. A reader who
// came for the four rows at their own position finds neither.
//
// THE LAST CASE ASSERTS THE SERVED PAGE, and it is the one that matters. The
// cases above it prove the declaration parses and the card consults it — both
// of which passed while the owner looked at an unfolded retro.
// see ux.md#a-drawing-change-is-not-done-until-its-output-is-measured
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { parseBase } from "../engine/tables.ts";
import { warmVault } from "../engine/vault.ts";
import { workCard } from "../engine/work-card.ts";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const work = readFileSync(fileURLToPath(new URL("../views/work.base", import.meta.url)), "utf8");

describe("the query says which groups ship folded", { concurrency: true }, () => {
  test("both work views declare the backlog and the retro", () => {
    const spec = parseBase(work);

    assert.equal(spec.views.length, 2, "the editor draws two panes");
    for (const v of spec.views) {
      assert.deepEqual(v.collapsed, ["backlog", "retro"], `${v.name} folds both of the groups that bury the page`);
    }
  });

  // ABSENT MEANS NONE. A view that says nothing about folding ships every group
  // open, which is what every other base file in the tree expects.
  test("a view that declares nothing folds nothing", () => {
    const spec = parseBase("views:\n  - type: table\n    name: plain\n");

    assert.deepEqual(spec.views[0].collapsed, [], "no declaration, no folding");
  });

  test("a name is trimmed and an empty entry is dropped", () => {
    const spec = parseBase('views:\n  - type: table\n    name: messy\n    collapsed:\n      - "  backlog  "\n      - ""\n');

    assert.deepEqual(spec.views[0].collapsed, ["backlog"], "the list is cleaned rather than trusted");
  });

  // THE RENDERER NO LONGER NAMES A GROUP. If this string comes back, somebody
  // has put the decision into code again.
  test("the card takes the list from the view rather than naming a group", () => {
    const card = readFileSync(fileURLToPath(new URL("../engine/work-card.ts", import.meta.url)), "utf8");

    assert.match(card, /shutGroups\(d\.view\)/, "the view's own declaration decides");
    assert.doesNotMatch(card, /name === BACKLOG\s*;/, "and no group is hardcoded as folded");
  });

  test("every declared group is served folded, in both panes", async () => {
    await warmVault(ROOT);
    const html = workCard(ROOT, "");
    const heads = [...html.matchAll(/<tr class="tbl-group([^"]*)"[^>]*data-group="([^"]*)"/g)];

    for (const name of ["backlog", "retro"]) {
      const mine = heads.filter((h) => h[2] === name);
      assert.equal(mine.length, 2, `${name} is served as a heading in both panes`);
      for (const h of mine) assert.match(h[1], /\bshut\b/, `the served ${name} heading ships folded`);
    }
  });
});
