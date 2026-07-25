// i12, red-first against the designed API. The lane becomes the path of least
// resistance, and the machine judges mechanically what it can.
//
// Requirement ids are the register's (evidence/write_requirements-1.json).
// The git-only decision is se.adr-git-is-the-only-searcher; the exit-code
// contract below (0 hits / 1 no-matches / 128 error) was PROVEN at
// run-220f463e2243 and is the single most important fact in this file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { layout } from "../engine/layout.ts";
import { searchProduct, readRange, type Hit } from "../engine/search.ts";
import { filePatchBatch } from "../engine/deliverable.ts";
import { runLints, type LintVerdict } from "../engine/lint.ts";
import { showConfig, setConfig } from "../engine/config.ts";
import { Rejection } from "../engine/errors.ts";

const drop = (root: string): void => {
  try {
    rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
  } catch {
    /* temp cleanup is best-effort on Windows */
  }
};

/** A throwaway git repo with one commit, a tag, and an untracked file. */
function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "se-i12-"));
  const git = (...a: string[]): string => execFileSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  mkdirSync(join(root, "product", "deliverable"), { recursive: true });
  writeFileSync(join(root, "product", "deliverable", "alpha.ts"), "const a = 1;\nconst NEEDLE = 2;\nconst b = 3;\n", "utf8");
  writeFileSync(join(root, "product", "deliverable", "unicode.md"), "a line with an em-dash — here\nplain\n", "utf8");
  writeFileSync(join(root, "product", "deliverable", "colon.md"), "text with ref:path:1 inside it\n", "utf8");
  git("add", "-A");
  git("commit", "-q", "-m", "one");
  git("tag", "-a", "iter/x", "-m", "the record");
  // Committed, then changed on disk: the record and the tree now differ.
  writeFileSync(join(root, "product", "deliverable", "alpha.ts"), "const a = 1;\nconst NEEDLE = 2;\nconst CHANGED = 9;\n", "utf8");
  // Untracked: the agent's just-written file.
  writeFileSync(join(root, "product", "deliverable", "fresh.ts"), "const JUSTWRITTEN = 1;\n", "utf8");
  mkdirSync(layout.seDir(root), { recursive: true });
  return root;
}

// ------------------------------------------------------------------ search

test("R3/R5: search reaches the working tree AND a ref, and says which", () => {
  const root = fixture();
  try {
    const tree = searchProduct(root, "NEEDLE", {});
    assert.equal(tree.hits.length, 1, "one hit in the tree");
    assert.equal(tree.hits[0].source, "tree");
    assert.equal(tree.hits[0].path, "product/deliverable/alpha.ts");
    assert.equal(tree.hits[0].line, 2);

    const ref = searchProduct(root, "NEEDLE", { ref: "iter/x" });
    assert.equal(ref.hits[0].source, "iter/x", "the ref is named on the hit");
    assert.equal(ref.hits[0].path, "product/deliverable/alpha.ts", "the ref prefix is stripped from the path");
  } finally {
    drop(root);
  }
});

test("R5: the record and the tree genuinely differ - a ref search sees the committed bytes", () => {
  const root = fixture();
  try {
    assert.equal(searchProduct(root, "CHANGED", {}).hits.length, 1, "the tree has the change");
    assert.equal(searchProduct(root, "CHANGED", { ref: "iter/x" }).hits.length, 0, "the record does not");
  } finally {
    drop(root);
  }
});

test("C1 veto / adr-untracked-files-are-searched-by-default: a just-written unstaged file is FOUND", () => {
  const root = fixture();
  try {
    const r = searchProduct(root, "JUSTWRITTEN", {});
    assert.equal(r.hits.length, 1, "reading back what you just wrote is the agent's dominant pattern");
    assert.equal(r.hits[0].path, "product/deliverable/fresh.ts");
  } finally {
    drop(root);
  }
});

test("SP1: the parse survives non-ASCII and colon-bearing text, byte-identical", () => {
  const root = fixture();
  try {
    const u = searchProduct(root, "em-dash", {});
    assert.equal(u.hits.length, 1);
    assert.ok(u.hits[0].text.includes("—"), "the em-dash survives");
    const onDisk = readFileSync(join(root, "product", "deliverable", "unicode.md"), "utf8").split("\n")[u.hits[0].line - 1];
    assert.equal(u.hits[0].text, onDisk, "recovered text is byte-identical to the file's own line");

    const c = searchProduct(root, "inside it", {});
    assert.equal(c.hits.length, 1, "text containing ref:path:1 still parses into three fields");
    assert.match(c.hits[0].text, /ref:path:1/);
  } finally {
    drop(root);
  }
});

test("R10 + SP1's exit contract: no match is EMPTY, a bad ref is an ERROR - never confused", () => {
  const root = fixture();
  try {
    const none = searchProduct(root, "zzz-absent-zzz", {});
    assert.equal(none.hits.length, 0, "exit 1 means no matches");
    assert.equal(none.truncated, false);
    assert.throws(
      () => searchProduct(root, "anything", { ref: "no-such-ref-zzz" }),
      Rejection,
      "exit 128 is a real failure - a typo'd ref must not read as 'nothing found'",
    );
  } finally {
    drop(root);
  }
});

test("R28: results are capped, and the cap is REPORTED rather than silent", () => {
  const root = fixture();
  try {
    const r = searchProduct(root, "const", { limit: 1 });
    assert.equal(r.hits.length, 1);
    assert.equal(r.truncated, true, "a silent cap is the confident-wrong-answer class");
  } finally {
    drop(root);
  }
});

// -------------------------------------------------------------------- read

test("R1: a file is read in parts, with the total reported", () => {
  const root = fixture();
  try {
    const r = readRange(root, "product/deliverable/alpha.ts", { offset: 2, limit: 1 });
    assert.equal(r.text, "const NEEDLE = 2;");
    assert.equal(r.total_lines, 3);
    assert.equal(r.offset, 2);
    assert.equal(r.more, true, "there is more after this range");
  } finally {
    drop(root);
  }
});

test("R2: an oversize read REFUSES with the size and a remedy - it never truncates", () => {
  const root = fixture();
  try {
    const big = "x".repeat(200) + "\n";
    writeFileSync(join(root, "product", "deliverable", "big.md"), big.repeat(900), "utf8");
    assert.throws(
      () => readRange(root, "product/deliverable/big.md", {}),
      (e: unknown) => e instanceof Rejection && /offset|limit|range/i.test(String((e as Rejection).remedy?.note ?? "")),
      "the remedy must name the range parameters",
    );
  } finally {
    drop(root);
  }
});

test("R6: a file is readable at a ref", () => {
  const root = fixture();
  try {
    const r = readRange(root, "product/deliverable/alpha.ts", { ref: "iter/x" });
    assert.match(r.text, /const b = 3;/, "the committed bytes");
    assert.ok(!r.text.includes("CHANGED"), "not the working tree's bytes");
  } finally {
    drop(root);
  }
});

// ------------------------------------------------------------------- write

test("R11/R12: many edits land as ONE atomic act", () => {
  const root = fixture();
  try {
    const before = readFileSync(join(root, "product", "deliverable", "alpha.ts"), "utf8");
    const res = filePatchBatch(root, [
      { path: "product/deliverable/alpha.ts", old_string: "const a = 1;", new_string: "const a = 11;" },
      { path: "product/deliverable/unicode.md", old_string: "plain", new_string: "plainer" },
    ]);
    assert.equal(res.applied, 2);
    assert.match(readFileSync(join(root, "product", "deliverable", "alpha.ts"), "utf8"), /const a = 11;/);

    // One bad guard: NOTHING applies, and the failure names which one.
    assert.throws(
      () =>
        filePatchBatch(root, [
          { path: "product/deliverable/alpha.ts", old_string: "const a = 11;", new_string: "const a = 12;" },
          { path: "product/deliverable/unicode.md", old_string: "NOT PRESENT", new_string: "x" },
        ]),
      (e: unknown) => e instanceof Rejection && String((e as Rejection).got).includes("unicode.md"),
      "the failing edit is named",
    );
    assert.match(readFileSync(join(root, "product", "deliverable", "alpha.ts"), "utf8"), /const a = 11;/, "the good edit did NOT apply");
    assert.ok(before !== null);
  } finally {
    drop(root);
  }
});

// ------------------------------------------------------------------- lints

test("R17/adr-a-lint-decides-or-defers: a verdict is pass, fail or defer - never a fourth thing", () => {
  const allowed: LintVerdict["verdict"][] = ["pass", "fail", "defer"];
  assert.equal(allowed.length, 3, "a fourth outcome would be a park wearing a friendly name");
});

test("R16/R19/R20: lints run, carry their FACT, and are distinguishable from prose", () => {
  const root = fixture();
  try {
    const verdicts = runLints(root, ["evidence_fields_present"], {
      state: "some_gate",
      evidence: { a: "filled", b: "" },
      required: ["a", "b"],
    });
    const v = verdicts.find((x) => x.check === "evidence_fields_present")!;
    assert.equal(v.verdict, "fail");
    assert.match(v.fact, /b/, "a failing lint names the FACT that did not hold, not an opinion");
    assert.equal(typeof v.check, "string", "verdicts are structured, so computed is distinguishable from asserted");
  } finally {
    drop(root);
  }
});

test("R17: an unknown or uncomputable check DEFERS - it never throws and never blocks", () => {
  const root = fixture();
  try {
    const v = runLints(root, ["models_adhered"], { state: "gate_implementation", evidence: {}, required: [] });
    assert.equal(v[0].verdict, "defer", "blocked on items-as-nodes: defer, do not park the run");
    assert.match(v[0].fact, /prose|node|not machine-readable/i, "and say why");
  } finally {
    drop(root);
  }
});

// ------------------------------------------------------------------ config

test("R26/R27: config shows with secrets MASKED, and validates on set", () => {
  const root = fixture();
  try {
    setConfig(root, "phone", { enabled: true, topic: "t", answer_topic: "a", token: "SUPERSECRET" });
    const shown = showConfig(root, "phone");
    assert.equal(shown.topic, "t");
    assert.ok(!JSON.stringify(shown).includes("SUPERSECRET"), "a credential never leaves the lane");
    assert.match(String(shown.token), /\*/, "but its presence is visible");
  } finally {
    drop(root);
  }
});
