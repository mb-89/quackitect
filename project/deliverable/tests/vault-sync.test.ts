import { strict as assert } from "node:assert";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { Vault, vaultFor } from "../engine/vault.ts";
import { call, freshRoot } from "./helpers.ts";

test("successful MCP file tools update the warm model synchronously", async (t) => {
  const root = freshRoot();
  const vault = vaultFor(root);
  t.after(() => vault.stop());
  const session = new Session(root);
  session.setAutonomy(1);
  session.setEmergency(true);
  const server = buildServer(root, session);

  const created = await call(server, "se_file_write", {
    path: "project/model-created.md",
    content: "---\nstatus: draft\n---\nModel note\n",
    base_hash: null,
  });
  assert.equal(created.isError, false, JSON.stringify(created.body));
  assert.equal(vault.get("model-created.md")?.status, "draft");

  const patched = await call(server, "se_file_patch", {
    ops: [{ path: "project/model-created.md", old_string: "status: draft", new_string: "status: ready" }],
  });
  assert.equal(patched.isError, false, JSON.stringify(patched.body));
  assert.equal(vault.get("model-created.md")?.status, "ready");

  const replaced = await call(server, "se_file_replace", {
    glob: "project/model-created.md",
    pattern: "status: ready",
    replacement: "status: done",
    expect_count: 1,
  });
  assert.equal(replaced.isError, false, JSON.stringify(replaced.body));
  assert.equal(vault.get("model-created.md")?.status, "done");

  const linked = await call(server, "se_file_write", {
    path: "project/model-link.md",
    content: "[[model-created]]\n",
    base_hash: null,
  });
  assert.equal(linked.isError, false, JSON.stringify(linked.body));

  const moved = await call(server, "se_file_move", {
    from: "project/model-created.md",
    to: "project/renamed/model-note.md",
  });
  assert.equal(moved.isError, false, JSON.stringify(moved.body));
  assert.equal(vault.get("model-created.md"), undefined);
  assert.equal(vault.get("renamed/model-note.md")?.status, "done");
  const linkedFile = vault.get("model-link.md")?.file as Record<string, unknown> | undefined;
  assert.match(JSON.stringify(linkedFile?.links), /renamed\/model-note/);

  const changed = replaced.body.changed as { hash: string }[];
  const deleted = await call(server, "se_file_delete", {
    path: "project/renamed/model-note.md",
    base_hash: changed[0].hash,
  });
  assert.equal(deleted.isError, false, JSON.stringify(deleted.body));
  assert.equal(vault.get("renamed/model-note.md"), undefined);

  const reconciledPath = join(root, "project", "reconciled.md");
  writeFileSync(reconciledPath, "---\nstatus: recovered\n---\nRecovered\n");
  assert.equal(vault.reconcile(), 1);
  assert.equal(vault.get("reconciled.md")?.status, "recovered");
  rmSync(reconciledPath);
  assert.equal(vault.reconcile(), 1);
  assert.equal(vault.get("reconciled.md"), undefined);
});

test("Parcel watcher recovers changes made while stopped", async (t) => {
  const root = freshRoot();
  const vault = new Vault(root);
  vault.build();
  t.after(() => vault.stop());

  await vault.live();
  const snapshot = join(root, ".se", "vault-watcher.snapshot");
  assert.equal(existsSync(snapshot), true);
  await vault.stop();

  writeFileSync(join(root, "project", "missed.md"), "---\nstatus: missed\n---\nMissed while stopped\n");
  await vault.live();

  assert.equal(vault.get("missed.md")?.status, "missed");
});
