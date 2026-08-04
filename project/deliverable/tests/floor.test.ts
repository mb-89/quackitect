// THE FLOOR LAW — four steps that no change size may tailor away.
//
// The flag was authored on four rows, parsed into the row type, and read by
// nothing. The only guard anywhere was four assertions against the PATCH
// column, so setting the release gate to `none` at minor would have compiled
// a machine with no release gate and left the whole battery green.
//
// This file is the guard that was missing. It checks every size, not one, and
// it checks the REFUSAL rather than only the happy path — a compiler that
// quietly kept the step would satisfy the happy path and still be wrong.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { Rejection } from "../engine/errors.ts";
import { assertFloor, CHANGE_COLUMNS, type ChangeColumn, compileColumn, readRigorMatrix } from "../engine/rigor-matrix.ts";

const REPO = fileURLToPath(new URL("../../..", import.meta.url));

/**
 * A DEEP COPY per case. readRigorMatrix caches and its own comment says the
 * returned matrix is shared and must not be mutated — these cases strike
 * cells, so they must not touch it.
 */
function matrix(): ReturnType<typeof readRigorMatrix> {
  const src = readRigorMatrix(REPO);
  return {
    ...src,
    rows: src.rows.map((r) => ({ ...r })),
    cells: new Map([...src.cells].map(([name, row]) => [name, new Map([...row].map(([col, cell]) => [col, { ...cell }]))])),
  } as ReturnType<typeof readRigorMatrix>;
}

function refusal(fn: () => unknown): Rejection {
  try {
    fn();
  } catch (e) {
    if (e instanceof Rejection) return e;
    throw e;
  }
  throw new Error("expected a refusal, got a value");
}

const FLOOR = ["gate-kickoff", "verification", "sweep-consistency", "gate-release"];

describe("what the floor is", () => {
  test("exactly four rows declare it, and they are the ones the method names", () => {
    const flagged = matrix()
      .rows.filter((r) => r.floor)
      .map((r) => r.name)
      .sort();
    assert.deepEqual(flagged, [...FLOOR].sort());
  });

  test("every floor step survives every change size", () => {
    const mx = matrix();
    for (const column of CHANGE_COLUMNS) {
      const ids = new Set(compileColumn(mx, column).states.map((s) => s.id));
      for (const step of FLOOR) assert.ok(ids.has(step), `${step} is missing from ${column}`);
    }
  });

  test("the shipped matrix passes the check at every size", () => {
    const mx = matrix();
    for (const column of CHANGE_COLUMNS) assertFloor(mx, column);
  });
});

describe("striking a floor step is refused, at every size", () => {
  for (const step of FLOOR) {
    for (const column of CHANGE_COLUMNS) {
      test(`${step} struck at ${column}`, () => {
        const mx = matrix();
        mx.cells.get(step)!.set(column as ChangeColumn, { ...mx.cells.get(step)!.get(column as ChangeColumn)!, applies: "none" });
        const r = refusal(() => compileColumn(mx, column));
        assert.match(r.got, new RegExp(step));
        assert.match(r.got, new RegExp(column));
      });
    }
  }

  test("the refusal names the whole floor, so the reader sees what else is protected", () => {
    const mx = matrix();
    mx.cells.get("gate-release")!.set("minor", { ...mx.cells.get("gate-release")!.get("minor")!, applies: "none" });
    const r = refusal(() => compileColumn(mx, "minor"));
    for (const step of FLOOR) assert.match(r.expected, new RegExp(step));
  });

  test("the remedy points at the row, and offers the honest way out", () => {
    const mx = matrix();
    mx.cells.get("verification")!.set("patch", { ...mx.cells.get("verification")!.get("patch")!, applies: "none" });
    const r = refusal(() => compileColumn(mx, "patch"));
    assert.match(String(r.remedy?.args?.glob ?? ""), /rows\/\*verification\.md/);
    assert.match(String(r.remedy?.note ?? ""), /drop `floor: true`/);
  });

  test("two struck at once are both named, not just the first", () => {
    const mx = matrix();
    mx.cells.get("verification")!.set("major", { ...mx.cells.get("verification")!.get("major")!, applies: "none" });
    mx.cells.get("gate-release")!.set("major", { ...mx.cells.get("gate-release")!.get("major")!, applies: "none" });
    const r = refusal(() => compileColumn(mx, "major"));
    assert.match(r.got, /verification/);
    assert.match(r.got, /gate-release/);
  });
});

describe("what the floor does NOT do", () => {
  // The refusal must not turn into a blanket ban on tailoring. Striking a
  // non-floor step is the matrix working as designed.
  test("a step without the flag still strikes freely", () => {
    const mx = matrix();
    const ordinary = mx.rows.find((r) => !r.floor && mx.cells.get(r.name)?.get("major")?.applies !== "none")!;
    mx.cells.get(ordinary.name)!.set("major", { ...mx.cells.get(ordinary.name)!.get("major")!, applies: "none" });
    const ids = new Set(compileColumn(mx, "major").states.map((s) => s.id));
    assert.ok(!ids.has(ordinary.name), `${ordinary.name} struck without complaint`);
  });

  // Removing the flag is the sanctioned way to strike a floor step. It is a
  // visible edit to the row, which is the whole point of refusing the quiet one.
  test("dropping the flag makes the step strikeable again", () => {
    const mx = matrix();
    const row = mx.rows.find((r) => r.name === "gate-release")!;
    (row as { floor: boolean }).floor = false;
    mx.cells.get("gate-release")!.set("minor", { ...mx.cells.get("gate-release")!.get("minor")!, applies: "none" });
    const ids = new Set(compileColumn(mx, "minor").states.map((s) => s.id));
    assert.ok(!ids.has("gate-release"));
  });
});
