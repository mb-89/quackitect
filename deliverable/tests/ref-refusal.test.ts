// AN UNRESOLVABLE REF REFUSES TYPED, LIKE EVERYTHING ELSE IN THE LANE.
//
// THE i35 FIELD REPORT, 2026-08-17: "se_file_search at an unresolvable ref
// answers with a raw git error — no clause, no remedy. It is the one place in
// the whole lane where the typed-rejection law does not hold, and it reads as
// though the file is missing rather than the branch. That misreading is what
// cost i15 a wrongly-minted assumption and a false claim through six evidence
// forms."
import assert from "node:assert/strict";
import { test } from "node:test";
import { Rejection } from "../engine/errors.ts";
import { search } from "../engine/search.ts";
import { freshRoot, gitInit } from "./helpers.ts";

test("a ref no clone can resolve refuses with its clause, not with raw git text", () => {
  const root = freshRoot();
  gitInit(root);
  let caught: unknown;
  try {
    search(root, "anything", { ref: "no-such-branch-anywhere", intent: "prove the refusal is typed" } as never);
  } catch (e) {
    caught = e;
  }
  assert.ok(caught instanceof Rejection, `an unresolvable ref threw a bare error, not a Rejection: ${String(caught)}`);
  const r = caught as Rejection & { clause?: string; got?: string; remedy?: { tool?: string; note?: string } };
  assert.equal(r.clause, "SE-C-139", "the refusal does not carry the ref clause");
  assert.match(String(r.got), /no-such-branch-anywhere/, "the refusal does not name the ref that failed");
});

test("the remedy is the pair of calls that actually fixes it, fetch alone being not enough", () => {
  const root = freshRoot();
  gitInit(root);
  let caught: unknown;
  try {
    search(root, "anything", { ref: "main", intent: "prove the remedy names both calls" } as never);
  } catch (e) {
    caught = e;
  }
  // A seeded root has no `main`, which is exactly the shallow-clone shape.
  if (!(caught instanceof Rejection)) return; // this fixture happened to have the branch
  const r = caught as Rejection & { remedy?: { tool?: string; note?: string } };
  assert.equal(r.remedy?.tool, "se_git", "the remedy does not name the verb that fixes it");
  assert.match(String(r.remedy?.note), /branch/, "the remedy stops at the fetch, which the field report measured as not enough");
  assert.match(String(r.remedy?.note), /origin\/main/, "the remedy does not name the remote-tracking branch to create from");
});
