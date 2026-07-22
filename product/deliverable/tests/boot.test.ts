// The boot: unbooted sessions are instructed, the surface is gated until
// admission, and attesting the contract hash admits — one round-trip.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { boot, newSession, assertAdmitted, composeContract, PRE_BOOT_TOOLS } from "../engine/boot.ts";
import { Rejection } from "../engine/errors.ts";

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "se-boot-"));
  mkdirSync(join(root, "product", "deliverable", "brand"), { recursive: true });
  mkdirSync(join(root, "product", "spec"), { recursive: true });
  writeFileSync(join(root, "product", "deliverable", "brand", "voice.md"), "Write plainly. Short sentences.\n");
  writeFileSync(join(root, "product", "spec", "handover.md"), "# Handover\n\nThe state.\n");
  return root;
}

test("boot: contract -> attest -> admitted, with the handover served", () => {
  const root = fixture();
  try {
    const session = newSession();

    const step1 = boot(root, session);
    assert.equal(step1.step, "attest");
    assert.match((step1 as { contract: string }).contract, /Write plainly/);
    assert.match((step1 as { contract: string }).contract, /Everything goes through the server/);
    assert.equal(session.admitted, false);

    const step2 = boot(root, session, (step1 as { contract_hash: string }).contract_hash);
    assert.equal(step2.step, "admitted");
    assert.match((step2 as { handover?: string }).handover ?? "", /The state/);
    assert.equal(session.admitted, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a wrong or stale contract hash is refused (SE-C-006)", () => {
  const root = fixture();
  try {
    const session = newSession();
    boot(root, session);
    assert.throws(
      () => boot(root, session, "0".repeat(64)),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-006",
    );
    assert.equal(session.admitted, false);
    // The contract changes (voice edited) -> the old hash no longer admits.
    const { hash: oldHash } = composeContract(root);
    writeFileSync(join(root, "product", "deliverable", "brand", "voice.md"), "New voice.\n");
    assert.throws(
      () => boot(root, session, oldHash),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-006",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the surface is gated until admission; next/boot/help stay legal (SE-C-005)", () => {
  const session = newSession();
  for (const tool of PRE_BOOT_TOOLS) assertAdmitted(session, tool); // never throws
  let rejection: Rejection | undefined;
  try {
    assertAdmitted(session, "se_set_apply");
  } catch (e) {
    rejection = e as Rejection;
  }
  assert.ok(rejection instanceof Rejection);
  assert.equal(rejection.clause, "SE-C-005");
  assert.equal(rejection.remedy.tool, "se_boot");

  session.admitted = true;
  assertAdmitted(session, "se_set_apply"); // admitted: everything legal
});
