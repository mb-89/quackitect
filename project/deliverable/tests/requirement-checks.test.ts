// THE DECLARED CHECKS FIRE FOR EVERY HAND (owner order 2026-08-06): the
// requirement template declares its rules in frontmatter, and conformance()
// applies them — the same path the agent's submit and a person's panel edit
// both run through. THE FIXTURE IS MINTED FROM THE TEMPLATE, never written by
// hand, so a template change flows through with no test edit.
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { conformance, earsShapeOK, itemTemplate, loadTrace } from "../engine/trace.ts";
import { freshRoot } from "./helpers.ts";

/** Mint a conforming node from the template itself: every TODO field gets the
 *  override or a filler, every declared default stays. */
function mint(root: string, id: string, overrides: Record<string, string>, body = ""): void {
  const tpl = itemTemplate(root, "requirement");
  assert.ok(tpl, "the requirement template exists");
  const lines: string[] = ["---", `id: ${id}`, `type: "[[requirement]]"`];
  for (const f of tpl.fields) {
    const v = overrides[f] ?? tpl.defaults[f];
    if (v === undefined) continue; // an unanswered TODO field stays absent
    if (f === "refines" || f === "source_refs") {
      lines.push(`${f}:`);
      for (const item of v.split(",")) lines.push(`  - ${item.trim()}`);
    } else {
      lines.push(`${f}: ${v}`);
    }
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (!tpl.fields.includes(k)) lines.push(`${k}: ${v}`);
  }
  lines.push("---", "", body);
  const dir = join(root, "project/spec/trace/requirement");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${id}.md`), lines.join("\n"), "utf8");
}

/** The conformance findings for one freshly minted node. */
function findings(root: string, id: string): string[] {
  const node = loadTrace(root).find((n) => n.id === id);
  assert.ok(node, `${id} loads`);
  return conformance(root, node);
}

const GOOD = {
  statement: "When the walk reaches a gate, the engine shall refuse the pass within 200 ms.",
  kind: "functional",
  verify_method: "test",
  breaks_if_removed: "a gate would pass unreviewed and the bless would mean nothing",
  // A ROW SAYS HOW BADLY IT BREAKS, not just what breaks (owner ruling
  // 2026-08-08). The scale and its per-level test are meth-damage-scale.
  breaks_how_badly: "fatal",
  refines: "uc-take-a-step",
  source_refs: "none",
  priority: "must",
};

describe("the requirement template's declared checks", () => {
  test("a clean row passes every check", () => {
    const root = freshRoot();
    mint(root, "req-clean", GOOD);
    assert.deepEqual(findings(root, "req-clean"), []);
  });

  // A REQUIREMENT CANNOT BE WRITTEN UNGRADED (owner ruling 2026-08-08). The
  // ordering reads the grade, and a row without one sorts as the middle — so
  // leaving it blank would be the quiet way to land anywhere in the ranking.
  test("a row with no damage grade is unanswered, and a wrong one is refused", () => {
    const root = freshRoot();
    const { breaks_how_badly, ...ungraded } = GOOD;
    mint(root, "req-ungraded", ungraded);
    assert.match(findings(root, "req-ungraded").join(" "), /unanswered — .*breaks_how_badly/);

    mint(root, "req-misgraded", { ...GOOD, breaks_how_badly: "annoying" });
    assert.match(findings(root, "req-misgraded").join(" "), /breaks_how_badly is "annoying" — one of fatal/);
  });

  test("a weasel word is named", () => {
    const root = freshRoot();
    mint(root, "req-weasel", { ...GOOD, statement: "When asked, the engine shall respond quickly." });
    const f = findings(root, "req-weasel");
    assert.equal(f.length, 1);
    assert.ok(f[0]?.includes("quickly"), f[0]);
  });

  test("a statement outside the five shapes is refused", () => {
    const root = freshRoot();
    mint(root, "req-shape", { ...GOOD, statement: "Fast startup shall be provided under all circumstances always." });
    const f = findings(root, "req-shape");
    assert.ok(
      f.some((x) => x.includes("EARS")),
      f.join(" / "),
    );
  });

  test("the if-shape demands its then", () => {
    assert.equal(earsShapeOK("If the disk fills, the engine shall stop."), false);
    assert.equal(earsShapeOK("If the disk fills, then the engine shall stop."), true);
  });

  test("an exemption with a reason waives the shape", () => {
    const root = freshRoot();
    mint(root, "req-exempt", {
      ...GOOD,
      statement: "The register derives via query, and hand edits shall never land in it.",
      ears: "exempt — adr-derived-tables rules the wording",
    });
    assert.deepEqual(findings(root, "req-exempt"), []);
  });

  test("a bare exemption is itself a finding", () => {
    const root = freshRoot();
    mint(root, "req-bare", { ...GOOD, ears: "exempt" });
    const f = findings(root, "req-bare");
    assert.ok(
      f.some((x) => x.includes("without a reason")),
      f.join(" / "),
    );
  });

  test("an escape clause is named", () => {
    const root = freshRoot();
    mint(root, "req-escape", { ...GOOD, statement: "When polled, the engine shall answer where possible." });
    const f = findings(root, "req-escape");
    assert.ok(
      f.some((x) => x.includes("where possible")),
      f.join(" / "),
    );
  });

  test("a kind outside the vocabulary is refused", () => {
    const root = freshRoot();
    mint(root, "req-kind", { ...GOOD, kind: "performance" });
    const f = findings(root, "req-kind");
    assert.ok(
      f.some((x) => x.includes("functional | quality | constraint | interface")),
      f.join(" / "),
    );
  });

  test("a TBD marker is counted wherever it stands", () => {
    const root = freshRoot();
    mint(root, "req-tbd", { ...GOOD, statement: "When asked, the engine shall answer within TBD ms." });
    const f = findings(root, "req-tbd");
    assert.ok(
      f.some((x) => x.includes("TBD")),
      f.join(" / "),
    );
  });

  test("a quality without its scenario section is refused, with it it passes", () => {
    const root = freshRoot();
    mint(root, "req-quality", { ...GOOD, kind: "quality" });
    assert.ok(
      findings(root, "req-quality").some((x) => x.includes("## Scenario")),
      "the bare quality is refused",
    );
    const root2 = freshRoot();
    mint(
      root2,
      "req-quality2",
      { ...GOOD, kind: "quality" },
      "## Scenario\n\n- source: a person | stimulus: a pull | artifact: the engine | environment: normal load | response: an answer | response measure: within 200 ms for 95 % of pulls\n",
    );
    assert.deepEqual(findings(root2, "req-quality2"), []);
  });

  test("the minted skeleton is unanswered, never check-flagged", () => {
    const root = freshRoot();
    const tpl = itemTemplate(root, "requirement");
    assert.ok(tpl);
    mint(root, "req-skel", Object.fromEntries(tpl.fields.filter((f) => tpl.defaults[f] === undefined).map((f) => [f, `TODO — ${f}`])));
    const f = findings(root, "req-skel");
    assert.equal(f.length, 1, f.join(" / "));
    assert.ok(f[0]?.includes("unanswered"), f[0]);
  });
});

/** A requirement carrying only what the derivation reads: its type and its
 *  verified_by addresses, quoted the way the author-tests state writes them. */
function mintVerified(root: string, id: string, addresses: string[]): void {
  const dir = join(root, "project/spec/trace/requirement");
  mkdirSync(dir, { recursive: true });
  const lines = ["---", `id: ${id}`, 'type: "[[requirement]]"', "verified_by:"];
  for (const a of addresses) lines.push(`  - "${a}"`);
  lines.push("---", "");
  writeFileSync(join(dir, `${id}.md`), lines.join("\n"), "utf8");
}

// A TEST NODE IS DERIVED, ONE PER TEST FILE (owner ruling 2026-08-10). The
// requirement carries the mapping in verified_by — a source file cannot hold
// trace frontmatter — and the loader folds the addresses into typed nodes so
// the trace graph's test slice draws.
describe("the tests ride the requirements into the corpus", { concurrency: true }, () => {
  test("verified_by folds into one test node per file, pointing at every requirement it verifies", () => {
    const root = freshRoot();
    mintVerified(root, "req-a", ["tests/route.test.ts :: the route weighs the slider", "tests/pull.test.ts :: the reading is owed"]);
    mintVerified(root, "req-b", ["tests/route.test.ts :: a second case: colons survive"]);
    const nodes = loadTrace(root);
    const route = nodes.find((n) => n.id === "tests/route.test.ts");
    const pull = nodes.find((n) => n.id === "tests/pull.test.ts");
    assert.ok(route !== undefined && pull !== undefined, "one node per test file");
    assert.equal(route.type, "test");
    assert.deepEqual(route.refines, ["req-a", "req-b"]);
    assert.deepEqual(pull.refines, ["req-a"]);
    assert.equal(route.statement, "2 cases verifying 2 requirements");
    // The yaml quotes stay in the file and out of the model: the case name
    // reads back whole, colon and all, findable in the hay.
    assert.ok(route.hay?.includes("a second case: colons survive"));
    // A derived node is never conformance-checked — nobody authors it.
    assert.deepEqual(conformance(root, route), []);
  });
});
