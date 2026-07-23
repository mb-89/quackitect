// The boot: unbooted sessions are instructed, the surface is gated until
// admission, attesting the contract hash admits — and admission writes the
// lock, records the recents line, and hands over a projection of live state.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
delete process.env.SE_SESSION_FILE; // a hosting session's admission must not leak in
import { boot, newSession, assertAdmitted, composeContract, PRE_BOOT_TOOLS } from "../engine/boot.ts";
import { layout } from "../engine/layout.ts";
import { Rejection } from "../engine/errors.ts";

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "se-boot-"));
  mkdirSync(join(root, "product", "deliverable", "brand"), { recursive: true });
  mkdirSync(join(root, "product", "spec"), { recursive: true });
  writeFileSync(join(root, "product", "deliverable", "brand", "voice.md"), "Write plainly. Short sentences.\n");
  writeFileSync(join(root, "product.json"), JSON.stringify({ product: "boot-fixture" }) + "\n", "utf8");
  return root;
}

test("boot: contract -> attest -> admitted, with lock, recents and a projected handover", () => {
  const root = fixture();
  try {
    const session = newSession();

    const step1 = boot(root, session);
    assert.equal(step1.step, "attest");
    assert.equal(step1.project, "boot-fixture"); // the nameplate names the product
    assert.match((step1 as { contract: string }).contract, /Write plainly/);
    assert.match((step1 as { contract: string }).contract, /Everything goes through the server/);
    assert.equal(session.admitted, false);

    const step2 = boot(root, session, (step1 as { contract_hash: string }).contract_hash);
    assert.equal(step2.step, "admitted");
    assert.equal(session.admitted, true);
    // The handover is a projection of live state, not a file.
    const handover = (step2 as { handover: string }).handover;
    assert.match(handover, /Generated from live state/);
    assert.match(handover, /No iteration open/);
    // Admission wrote the lock the fence reads.
    const lock = JSON.parse(readFileSync(layout.lockPath(root), "utf8"));
    assert.equal(lock.product, "boot-fixture");
    assert.ok(lock.locked_roots.length >= 1);
    assert.match(lock.workspace_exempt, /workspace/);
    // And the recents line for the picker.
    assert.match(readFileSync(layout.recentsPath(), "utf8"), /boot-fixture/);
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

test("a root without a nameplate still boots, named by folder, with the note pointing at se_file_write", () => {
  const root = mkdtempSync(join(tmpdir(), "se-boot-bare-"));
  try {
    mkdirSync(join(root, "product", "deliverable"), { recursive: true });
    const session = newSession();
    const step1 = boot(root, session);
    const step2 = boot(root, session, (step1 as { contract_hash: string }).contract_hash);
    assert.equal(step2.step, "admitted");
    assert.match((step2 as { note: string }).note, /product\.json/);
    assert.equal(existsSync(layout.lockPath(root)), true);
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
