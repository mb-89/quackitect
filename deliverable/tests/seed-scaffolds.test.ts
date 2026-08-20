// The pin writes every seeded sub-machine's placeholder in its own act —
// realizes tsp-seeded-scaffolds (req-pin-writes-seeded-scaffolds). Before
// this, a route through a seeded-but-unauthored machine refused SE-C-112
// and somebody hand-copied placeholders.
import { strict as assert } from "node:assert";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { itSeed, itSeededRel, pinIteration } from "../engine/iterations.ts";
import { compileColumn, readRigorMatrix } from "../engine/rigor-matrix.ts";
import { freshRoot, gitInit } from "./helpers.ts";

const seededKinds = (root: string, size: "minor" | "major"): string[] =>
  compileColumn(readRigorMatrix(root), size)
    .states.filter((s) => s.submachine !== undefined)
    .map((s) => s.submachine as string)
    .filter((k) => !existsSync(join(root, "deliverable", "machines", `${k}.canvas`)));

describe("the pin's scaffolds", { concurrency: true }, () => {
  test("blessing the kickoff writes a placeholder for every seeded drawing, none missing", () => {
    const root = freshRoot();
    gitInit(root);
    const it = itSeed(root, "the scaffold case", "the pin writes the placeholders");
    const r = pinIteration(root, it, "minor");
    assert.ok(Number(r.states) > 0);
    for (const kind of seededKinds(root, "minor")) {
      const abs = join(it.path, itSeededRel(it.id, kind));
      assert.ok(existsSync(abs), `the pin scaffolds ${kind}`);
      assert.match(readFileSync(abs, "utf8"), /none: /, `${kind} says why nothing runs yet`);
    }
  });

  test("an authored drawing is never overwritten by a later pin", () => {
    const root = freshRoot();
    gitInit(root);
    const it = itSeed(root, "the escalation case", "authored drawings survive the re-pin");
    pinIteration(root, it, "minor");
    const kinds = seededKinds(root, "minor");
    assert.ok(kinds.length > 0, "the column seeds at least one drawing");
    const authored = join(it.path, itSeededRel(it.id, kinds[0]));
    const drawing = [
      "---",
      "steps:",
      "  - id: c1",
      '    statement: "the authored chunk"',
      "    depends_on: []",
      "    realization: code",
      "---",
      "",
    ].join("\n");
    writeFileSync(authored, drawing, "utf8");
    pinIteration(root, it, "major");
    assert.equal(readFileSync(authored, "utf8"), drawing, "the escalation left the authored drawing alone");
  });
});
