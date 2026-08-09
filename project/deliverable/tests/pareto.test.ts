// THE FRONT IS ARITHMETIC, so it gets arithmetic's tests.
//
// evaluate-set asked a person to TYPE the non-dominated set and the
// eliminations. The owner read the form and asked who eliminates — nobody
// does. These are the properties a typed answer could get wrong with nothing
// checking it.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { PARETO_PLOT_EDITOR } from "../engine/editors/pareto-plot.ts";
import { pareto, readScores } from "../engine/pareto.ts";

const AXES = ["speed", "cost"];
const at = (id: string, speed: number, cost: number) => ({ id, scores: { speed, cost } });

describe("the front", { concurrency: true }, () => {
  test("a candidate beaten everywhere is out, and the one that beat it is named", () => {
    const r = pareto([at("a", 5, 5), at("b", 3, 3)], AXES);
    assert.deepEqual(r.front, ["a"]);
    assert.deepEqual(r.eliminated, [{ id: "b", by: "a", lost_on: ["speed", "cost"] }]);
  });

  // THE WHOLE POINT OF SET-BASED DESIGN. A trade is not a loss, and collapsing
  // one is the premature narrowing the method exists to prevent.
  test("a trade keeps both alive", () => {
    const r = pareto([at("fast", 5, 1), at("cheap", 1, 5)], AXES);
    assert.deepEqual(r.front, ["fast", "cheap"]);
    assert.deepEqual(r.eliminated, []);
  });

  // At least as good EVERYWHERE and better ONCE. Equal on everything is not
  // domination — neither can throw the other out.
  test("two identical candidates both survive", () => {
    const r = pareto([at("a", 3, 3), at("b", 3, 3)], AXES);
    assert.deepEqual(r.front, ["a", "b"]);
  });

  test("better on one axis and equal on the rest is domination", () => {
    const r = pareto([at("a", 4, 3), at("b", 3, 3)], AXES);
    assert.deepEqual(r.front, ["a"]);
    assert.deepEqual(r.eliminated[0].lost_on, ["speed"], "and it says which axis did it");
  });
});

describe("the two corners", { concurrency: true }, () => {
  test("utopia takes the best of each axis, wherever it came from", () => {
    const r = pareto([at("fast", 5, 1), at("cheap", 1, 4)], AXES);
    assert.deepEqual(r.utopia, { speed: 5, cost: 4 }, "no candidate is there, which is the normal case");
    assert.equal(
      r.front.some((id) => id === "fast" && r.utopia.speed === 5 && r.utopia.cost === 4),
      true,
    );
  });

  // NADIR IS OVER THE FRONT, NOT THE WHOLE SET. Taken over everything it is
  // the worst of the losers, which says nothing about the decision.
  test("nadir reads the front, not the eliminated", () => {
    const r = pareto([at("fast", 5, 1), at("cheap", 1, 4), at("awful", 0, 0)], AXES);
    assert.deepEqual(r.front, ["fast", "cheap"]);
    assert.deepEqual(r.nadir, { speed: 1, cost: 1 }, "awful scored 0 twice and does not touch it");
  });
});

describe("what the front cannot tell you", { concurrency: true }, () => {
  // The method: all-options-equal has two readings — the decision does not
  // matter, or a discriminating criterion is missing. The form has to ask.
  test("an axis nobody differs on is named", () => {
    const r = pareto([at("a", 3, 5), at("b", 3, 1)], AXES);
    assert.deepEqual(r.flat, ["speed"]);
  });

  // AN UNSCORED CELL IS NOT A ZERO. Treating it as one eliminates a candidate
  // on a cell nobody filled, which is the worst way to be wrong: confident,
  // and shaped exactly like a result.
  test("a hole stops a pair being judged, and the hole is reported", () => {
    const r = pareto(
      [
        { id: "a", scores: { speed: 5, cost: 5 } },
        { id: "b", scores: { speed: 1 } },
      ],
      AXES,
    );
    assert.deepEqual(r.front, ["a", "b"], "b is not eliminated by a cell nobody filled");
    assert.deepEqual(r.incomplete, [{ id: "b", axes: ["cost"] }]);
  });
});

// THE PICTURE, measured on the markup it produces. Parallel coordinates,
// because a scatter only works for two objectives and a real criteria set is
// five or fifteen.
describe("the drawing", { concurrency: true }, () => {
  const draw = (candidates: { id: string; scores: Record<string, number> }[], axes: string[]): string => {
    const fn = new Function("name", "fl", "args", PARETO_PLOT_EDITOR.render) as (
      n: string,
      f: { content: string },
      a: Record<string, unknown>,
    ) => string;
    return fn("front", { content: "" }, { pareto: { axes, candidates, result: pareto(candidates, axes) } });
  };

  test("one axis per criterion and one line per candidate", () => {
    const html = draw([at("fast", 5, 1), at("cheap", 1, 5), at("awful", 0, 0)], AXES);
    assert.equal((html.match(/class="sfppline"/g) ?? []).length, 3, "the eliminated one is drawn too");
    assert.match(html, /data-cand="awful"[^>]*opacity="0.35"/, "faint, because the front means nothing without what it beat");
    assert.match(html, /data-cand="fast"[^>]*opacity="1"/);
  });

  test("both corners are drawn, and neither is a candidate", () => {
    const html = draw([at("fast", 5, 1), at("cheap", 1, 4)], AXES);
    assert.match(html, />utopia</);
    assert.match(html, />nadir</);
    assert.equal((html.match(/class="sfppline"/g) ?? []).length, 2, "the corners are reference lines, not series");
  });

  // THE SCALE IS ABSOLUTE. A fitted axis would stretch three poor candidates
  // across the full height and make them look like a healthy spread.
  test("the scale is fixed at the anchors, not fitted to the data", () => {
    const poor = draw([at("a", 1, 1), at("b", 0, 2)], AXES);
    for (const v of ["0", "1", "2", "3", "4", "5"]) {
      assert.ok(poor.includes(`>${v}</text>`), `the ${v} gridline is drawn even though nothing reaches it`);
    }
  });

  test("it says out loud what the arithmetic can see and a reader might not", () => {
    assert.match(draw([at("a", 3, 5), at("b", 3, 1)], AXES), /Every candidate scores alike on speed/);
    assert.match(draw([at("fast", 5, 1), at("cheap", 1, 5)], AXES), /Nothing was eliminated/);
    const holed = draw(
      [
        { id: "a", scores: { speed: 5, cost: 5 } },
        { id: "b", scores: { speed: 1 } },
      ],
      AXES,
    );
    assert.match(holed, /Not fully scored/);
  });

  test("nothing scored says so rather than drawing an empty grid", () => {
    assert.match(draw([], AXES), /Fill the score table and the front draws itself/);
  });

  // A DERIVED FIELD STORES NOTHING (owner ruling 2026-08-08). The first cut
  // wrote the front into the field so the gate could read it without
  // recomputing — which is the second copy this design exists to avoid, and it
  // drifts from the scores the moment one number changes.
  test("the plot collects nothing at all", () => {
    assert.equal(PARETO_PLOT_EDITOR.collect.trim(), "", "no serialiser, so there is no stored copy to disagree with the scores");
  });
});

describe("reading the score table", { concurrency: true }, () => {
  test("the stored rows come back as candidates and axes", () => {
    const table = [
      "| candidate | axis | score | anchor | prior_art |",
      "| --- | --- | --- | --- | --- |",
      "| [[cand-thin]] | [[req-speed]] | 5 | beyond prior art | names the comparison |",
      "| [[cand-thin]] | [[req-cost]] | 2 | partial | |",
      "| [[cand-fat]] | [[req-speed]] | 3 | solid baseline | |",
    ].join("\n");
    const { candidates, axes } = readScores(table);
    assert.deepEqual(axes, ["req-speed", "req-cost"]);
    assert.equal(candidates.length, 2);
    assert.deepEqual(candidates[0], { id: "cand-thin", scores: { "req-speed": 5, "req-cost": 2 } });
    assert.deepEqual(candidates[1].scores, { "req-speed": 3 }, "the missing cell stays missing");
  });

  test("the header and the rule are not scores", () => {
    const { candidates } = readScores(["| candidate | axis | score |", "| --- | --- | --- |"].join("\n"));
    assert.deepEqual(candidates, []);
  });
});
