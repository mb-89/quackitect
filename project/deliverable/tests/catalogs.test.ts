// THE CATALOGUES ARE READ, NEVER REMEMBERED.
//
// Owner ruling 2026-08-08: a known set becomes a selector, and editing the
// markdown must change the selector. The failure this file exists to catch is
// the comfortable one — somebody pastes the twelve SCAMPER operators into the
// engine, everything works, and the card and the form drift apart for a month
// before anybody notices they disagree.
//
// So the tests below are mostly NEGATIVE. They assert the engine does not know
// the answers, and that it gets them from the file.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { catalogItems, trizParameterItems } from "../engine/catalogs.ts";
import type { EvidenceField } from "../engine/machine.ts";
import { parseStateNote } from "../engine/notes.ts";
import { parseEvidence } from "../engine/rigor-matrix.ts";
import { type FieldArgs, fieldArgsFor } from "../engine/stateform.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const METHODS = join(REPO_ROOT, "project", "deliverable", "machines", "methods");
const ENGINE = join(REPO_ROOT, "project", "deliverable", "engine");

/** Every catalogue any method card declares, so a new one is covered the day
 *  it is written rather than the day somebody remembers this file. */
function declaredCatalogs(): { file: string; name: string }[] {
  const out: { file: string; name: string }[] = [];
  for (const f of readdirSync(METHODS).filter((n) => n.endsWith(".md"))) {
    const line = readFileSync(join(METHODS, f), "utf8")
      .split("\n")
      .find((l) => l.startsWith("catalog:"));
    if (line !== undefined) out.push({ file: f, name: line.slice("catalog:".length).trim() });
  }
  return out;
}

describe("the catalogues", { concurrency: true }, () => {
  test("every declared catalogue comes back with something in it", () => {
    const declared = declaredCatalogs();
    assert.ok(declared.length >= 3, `the method cards declare catalogues — found ${declared.length}`);
    for (const { file, name } of declared) {
      assert.ok(catalogItems(REPO_ROOT, name).length > 0, `${name}, declared by ${file}, resolves to nothing`);
    }
  });

  test("a catalogue nobody declares is empty rather than an exception", () => {
    assert.deepEqual(catalogItems(REPO_ROOT, "no-such-catalogue"), []);
  });

  // THE ANTI-DRIFT TEST. A file holding SEVERAL items of one catalogue holds a
  // copy of that catalogue, and the card has stopped being its only home.
  //
  // THREE, NOT ONE. The first cut refused a single item and went red on
  // `// Reverse reachability from terminals` in machine.ts — ordinary English
  // that happens to be a SCAMPER letter. A guard that cries at prose gets
  // switched off, and then it guards nothing at all.
  test("no engine file holds a copy of a catalogue", () => {
    const files = readdirSync(ENGINE, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".ts"));
    const offenders: string[] = [];
    for (const name of declaredCatalogs().map((c) => c.name)) {
      const items = catalogItems(REPO_ROOT, name);
      for (const f of files) {
        const text = readFileSync(join(ENGINE, f), "utf8");
        const hits = items.filter((i) => new RegExp(`\\b${i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text));
        if (hits.length >= 3)
          offenders.push(`engine/${f.replace(/\\/g, "/")} holds ${hits.length} of ${name}: ${hits.slice(0, 3).join(", ")}`);
      }
    }
    // The message NAMES THE FILE. Asserting on the joined source instead prints
    // a megabyte of engine at whoever broke it, which is what it did once.
    assert.deepEqual(
      offenders,
      [],
      `a catalogue is written into the engine, and its card is meant to be its only home: ${offenders.join("; ")}`,
    );
  });

  // The offer follows the file, which is the whole claim. Prove it by moving
  // the file rather than by reading the code that reads it.
  test("editing the card edits the offer", () => {
    const root = mkdtempSync(join(tmpdir(), "se-catalog-"));
    const dir = join(root, "project", "deliverable", "machines", "methods");
    mkdirSync(dir, { recursive: true });
    const card = join(dir, "meth-example.md");
    const write = (items: string[]): void => {
      writeFileSync(
        card,
        ["---", "kind: method", "catalog: example", "catalog_sections: THE LIST", "---", "", "## THE LIST", "", ...items, ""].join("\n"),
        "utf8",
      );
    };
    write(["- Alpha — the first one.", "- Beta — the second."]);
    assert.deepEqual(catalogItems(root, "example"), ["Alpha", "Beta"]);
    write(["- Alpha — the first one.", "- Beta — the second.", "- Gamma — added just now."]);
    assert.deepEqual(catalogItems(root, "example"), ["Alpha", "Beta", "Gamma"], "no cache stands between the card and the offer");
  });

  test("a numbered list is a catalogue too, and a gloss never reaches the cell", () => {
    const root = mkdtempSync(join(tmpdir(), "se-catalog-"));
    const dir = join(root, "project", "deliverable", "machines", "methods");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "meth-numbered.md"),
      [
        "---",
        "kind: method",
        "catalog: numbered",
        "catalog_sections: PRINCIPLES",
        "---",
        "",
        "## PRINCIPLES",
        "",
        "1. Segmentation",
        "2. **Extraction** — pull the part out.",
        "",
        "## SOMETHING ELSE",
        "",
        "- Not this one.",
        "",
      ].join("\n"),
      "utf8",
    );
    assert.deepEqual(catalogItems(root, "numbered"), ["Segmentation", "Extraction"]);
  });
});

// THE MIDDLE LAYER, which had no test and was where the silence lived.
//
// Every cluster column was declared right and every one of them read as free
// text (owner, 2026-08-08). Both ends were fine: the note declared its picks,
// and the editor drew what it was given. Nothing checked what came out between.
describe("the offers a finder actually makes", { concurrency: true }, () => {
  const tableField = (state: string, field: string): EvidenceField => {
    const file = join(REPO_ROOT, "project", "deliverable", "machines", "states", `${state}.md`);
    const note = parseStateNote(readFileSync(file, "utf8"));
    const hit = parseEvidence(note.frontmatter, state, note.body).find((f) => f.name === field);
    assert.ok(hit !== undefined, `${state} declares a field called ${field}`);
    return hit;
  };
  const argsOf = (state: string, field: string): FieldArgs => fieldArgsFor(tableField(state, field), REPO_ROOT, REPO_ROOT);

  test("a literal rides beside a live source, so the offer is complete before the live one fills", () => {
    const args = argsOf("find_without", "trims");
    // The repo's own trace has no clusters yet, which is precisely the state
    // the report came from. The three literals must still be offered.
    assert.deepEqual(args.picks.who_takes_over, ["the environment", "the user", "nobody"]);
    assert.deepEqual(
      args.pick_sources.who_takes_over,
      ["$clusters", "the environment", "the user", "nobody"],
      "and the source survives for the empty message",
    );
  });

  test("a catalogue reaches the column that offers it", () => {
    const contradiction = argsOf("find_contradiction", "contradictions");
    assert.equal(contradiction.picks.improving.length, 39, "all 39 standard parameters");
    assert.deepEqual(contradiction.picks.separation, ["IN TIME", "IN SPACE", "IN RELATION", "IN LEVEL", "NONE"]);
    assert.equal(argsOf("find_by_heuristic", "sweep").picks.heuristic.length, 8, "every rule in the catalogue");
    assert.equal(argsOf("find_by_transforming", "sweep").picks.operator.length, 12, "SCAMPER's seven and SIT's five");
  });

  // EVERY PICK IS CLOSED UNLESS IT SAYS OTHERWISE, and the comparison cards are
  // the only thing in the repo that says otherwise.
  test("no finder declares a free pick", () => {
    for (const [state, field] of [
      ["find_without", "trims"],
      ["find_contradiction", "contradictions"],
      ["find_by_heuristic", "sweep"],
      ["find_by_transforming", "sweep"],
      ["find_analogy", "abstractions"],
      ["build_chart", "chart"],
    ]) {
      assert.deepEqual(argsOf(state, field).pick_free, [], `${state}.${field} constrains every picked column`);
    }
  });
});

describe("the vendored TRIZ parameters", { concurrency: true }, () => {
  test("all 39 come through, each carrying its software equivalent", () => {
    const items = trizParameterItems(REPO_ROOT);
    assert.equal(items.length, 39, "the matrix indexes 39 parameters both ways");
    assert.ok(
      items.every((i) => /^\d+ \S/.test(i)),
      "every offer leads with the parameter number, because the grid is indexed by it",
    );
    assert.ok(
      items.filter((i) => i.includes("(")).length >= 35,
      "the software equivalent rides along — it is what step 2 of the method actually needs",
    );
  });

  test("a missing vendored file offers nothing rather than failing the render", () => {
    assert.deepEqual(trizParameterItems(mkdtempSync(join(tmpdir(), "se-notriz-"))), []);
  });
});
