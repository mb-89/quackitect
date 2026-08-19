// A DRAWN FIELD SAYS IT WAS DRAWN.
//
// MEASURED ON THE RIGOR MATRIX: 23 of its 86 evidence fields take their answer
// from somewhere the engine can reach — another field's output, a live pool, a
// key written back onto the nodes — and the served form said nothing about
// which. A computed view and an empty page arrive looking identical.
//
// SO THE SAME FORM INVITES TWO OPPOSITE MISTAKES. A reader who takes the
// drawing for an empty page types prose over it. A reader who takes an empty
// page for a drawing stamps it unread. Both were seen on the i15 walk, and
// neither is carelessness: nothing on the page distinguished them.
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { fieldAct } from "../engine/stateform.ts";

test("a field that reads another field's output is a RULE, not a page to write", () => {
  // reverse-sensitivity's own declaration: the flip conditions are computed
  // from evaluate-set's scores, and a credible ruling is a click.
  assert.equal(fieldAct({ reads: "evaluate-set#scores" }), "rule");
});

test("a field picking from a live pool is a rule", () => {
  // partition-functions: the engine clusters and orders; the agent moves rows.
  assert.equal(fieldAct({ picks: { cluster: ["$clusters"] } }), "rule");
});

test("a field whose items come from a live source is a rule", () => {
  // gate-kickoff's retro_drained walks whatever is in the inbox right now.
  assert.equal(fieldAct({ items: ["$inbox"] }), "rule");
});

test("a field writing a key back onto the nodes is a rule", () => {
  assert.equal(fieldAct({ writes: "cluster" }), "rule");
});

test("a field with no source but the agent is AUTHORED", () => {
  assert.equal(fieldAct({}), "author");
  assert.equal(fieldAct({ items: ["a literal item", "another"] }), "author");
  assert.equal(fieldAct({ reads: "", writes: "", picks: {} }), "author");
});

test("every act the rigor matrix declares is one of the two, and both occur", () => {
  // A guard on the corpus rather than on the function: if every field came back
  // the same way the distinction would be decorative, and this is what says it
  // is not.
  const rows = fileURLToPath(new URL("../machines/rigor_matrix/rows/", import.meta.url));
  let ruled = 0;
  let authored = 0;
  for (const f of readdirSync(rows).filter((n) => n.endsWith(".md"))) {
    const fm = readFileSync(rows + f, "utf8").split(/^---$/m)[1] ?? "";
    const ev = fm.split(/^evidence:$/m)[1] ?? "";
    const stop = ev.search(/^[a-z_]+:/m);
    for (const c of (stop >= 0 ? ev.slice(0, stop) : ev).split(/^ {2}- name:/m).slice(1)) {
      const has = (k: string) => new RegExp(`^ {4}${k}:`, "m").test(c);
      const live = /\$[a-z-]+/.test(c);
      const act = fieldAct({
        reads: has("reads") ? "x" : "",
        writes: has("writes") ? "x" : "",
        picks: has("picks") ? { c: ["x"] } : {},
        items: live ? ["$live"] : [],
      });
      if (act === "rule") ruled++;
      else authored++;
    }
  }
  assert.ok(ruled > 0, "no field in the whole matrix is drawn by the engine");
  assert.ok(authored > 0, "every field in the matrix is drawn, which cannot be right");
});
