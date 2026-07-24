// The session laws as refusals: commit window, run scope, toll-on-submit,
// boot-project, log hygiene. Red-first against the designed guard API.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { Rejection } from "../engine/errors.ts";
import { layout } from "../engine/layout.ts";
import { CallLog } from "../engine/calllog.ts";
import { Toll } from "../engine/toll.ts";
import { assertCommitWindow, openCommitWindow, closeCommitWindow } from "../engine/git.ts";
import { startRun, runStatus } from "../engine/run.ts";
import { boot, newSession } from "../engine/boot.ts";
import { Loop } from "../engine/loop.ts";
import { Gate } from "../engine/gate.ts";
import { assertOwned } from "../engine/ps.ts";
import { coreTools } from "../engine/tools.ts";
import type { MachineDecl } from "../engine/machine.ts";

const freshRoot = (): string => {
  const root = mkdtempSync(join(tmpdir(), "se-laws-"));
  mkdirSync(layout.seDir(root), { recursive: true });
  return root;
};

test("commit outside the bless window is refused; inside it passes; the next submit closes it", () => {
  const root = freshRoot();
  try {
    assert.throws(() => assertCommitWindow(root), Rejection, "no bless yet - no window");
    openCommitWindow(root, "grant:test");
    assert.doesNotThrow(() => assertCommitWindow(root));
    closeCommitWindow(root); // what se_loop_submit does
    assert.throws(() => assertCommitWindow(root), Rejection);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a long command returns a handle within 1s; completion is observable", async () => {
  const root = freshRoot();
  try {
    const log = new CallLog(layout.seDir(root));
    const t0 = Date.now();
    const h = startRun(root, log, `node -e "setTimeout(()=>{},1500)"`, root);
    assert.ok(Date.now() - t0 < 1000, "startRun must not block on the command");
    assert.equal(runStatus(root, h.ref).status, "running");
    await new Promise((r) => setTimeout(r, 2500));
    const done = runStatus(root, h.ref);
    assert.equal(done.status, "done");
    assert.equal(done.ok, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("an engine-filled state over the 1s grace returns a running packet; next() completes it", async () => {
  const root = freshRoot();
  try {
    const S = (id: string, kind: "work" | "terminal", edges: { to: string; role: "normal" }[], command?: string) => ({
      id,
      kind,
      statement: id,
      filled_by: (command ? "engine" : "agent") as "engine" | "agent",
      ...(command ? { command } : {}),
      guidance: "",
      evidence_form: [],
      edges,
    });
    const M: MachineDecl = {
      id: "bg",
      reentry: "restart",
      initial: "w",
      states: [
        S("w", "work", [{ to: "v", role: "normal" }]),
        S("v", "work", [{ to: "t", role: "normal" }], `node -e "setTimeout(()=>{},1500)"`),
        S("t", "terminal", []),
      ],
    };
    const loop = new Loop(root, M);
    loop.start("i-bg");
    const p = loop.submit({});
    assert.equal(p.kind, "running", "a slow battery must not block the submit");
    assert.ok(p.run_ref);
    await new Promise((r) => setTimeout(r, 2500));
    const done = loop.next();
    assert.equal(done.kind, "closed");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("se_loop_submit without an update is refused by the toll", () => {
  const root = freshRoot();
  try {
    const toll = new Toll(layout.seDir(root));
    const log = new CallLog(layout.seDir(root));
    assert.throws(() => toll.check("se_loop_submit", { evidence: { a: "b" } }, log), Rejection);
    assert.doesNotThrow(() =>
      toll.check("se_loop_submit", { evidence: { a: "b" }, update: { current_step: "s", next_milestone: "m", eta: "12:00", todo: ["[ ] t"] } }, log),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("se_boot without a named project refuses and says to ask the owner", () => {
  const root = freshRoot();
  try {
    writeFileSync(join(root, "product.json"), JSON.stringify({ product: "lawsproj" }) + "\n", "utf8");
    const session = newSession();
    assert.throws(
      () => boot(root, session, undefined, {}),
      (e: unknown) => e instanceof Rejection && /ask the owner/i.test(JSON.stringify(e)),
    );
    const step = boot(root, session, undefined, {}, "lawsproj");
    assert.equal((step as { step: string }).step, "attest");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a re-offer for the same gate replaces the live offer; dismiss clears it", () => {
  const root = freshRoot();
  try {
    const S = (id: string, kind: "work" | "gate" | "terminal", edges: { to: string; role: "normal" | "approval" }[]) => ({
      id,
      kind,
      statement: id,
      filled_by: "agent" as const,
      guidance: "",
      evidence_form: [],
      edges,
    });
    const M: MachineDecl = {
      id: "og",
      reentry: "restart",
      initial: "w",
      states: [S("w", "work", [{ to: "g", role: "normal" }]), S("g", "gate", [{ to: "t", role: "approval" }]), S("t", "terminal", [])],
    };
    const loop = new Loop(root, M);
    loop.start("i-offer");
    loop.submit({}); // fills w; the machine stands at the gate
    const p1 = loop.submit({ round: "one" });
    assert.equal(p1.kind, "gate_offered");
    const p2 = loop.submit({ round: "two" });
    assert.equal(p2.kind, "gate_offered", "same gate, fresh evidence: replace, never refuse");
    assert.notEqual(p2.offer_hash, p1.offer_hash);
    const gate = new Gate(root);
    assert.equal(gate.current()?.base_hash, p2.offer_hash, "the replacement is the live offer");
    gate.dismiss();
    assert.equal(gate.current(), null);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the log query lane filters, groups and counts", () => {
  const root = freshRoot();
  try {
    const log = new CallLog(layout.seDir(root));
    log.append({ tool: "se_a", args: {}, ok: true, duration_ms: 1 });
    log.append({ tool: "se_a", args: {}, ok: true, duration_ms: 1 });
    log.appendFailure({ tool: "se_b", args: {}, duration_ms: 1, clause: "SE-C-001", reason: "fixture" });
    const grouped = log.query({ group_by: "tool" });
    assert.equal(grouped.total, 3);
    assert.equal(grouped.groups?.se_a, 2);
    assert.equal(grouped.groups?.se_b, 1);
    const clauses = log.query({ filter: { ok: false }, group_by: "detail.clause" });
    assert.deepEqual(clauses.groups, { "SE-C-001": 1 });
    const picked = log.query({ filter: { tool: "se_b" } });
    assert.equal(picked.records?.length, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the process lane refuses foreign targets", () => {
  assert.throws(
    () => assertOwned("chrome"),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-048",
  );
  assert.doesNotThrow(() => assertOwned("board"));
});

test("apply ergonomics: execute-by-hash without resend, and fire-first direct execution", () => {
  const root = freshRoot();
  try {
    mkdirSync(join(root, "product", "spec", "ledger", "se"), { recursive: true });
    writeFileSync(
      join(root, "product", "spec", "ledger", "se", "x.md"),
      "---\nid: se.x\nkind: note\nstatement: A fixture.\n---\n\n## Body\nb\n",
      "utf8",
    );
    const apply = coreTools(root).find((t) => t.name === "se_set_apply")!;
    const ops = [{ op: "set_field", id: "se.x", field: "statement", value: "Amended." }];
    const d = apply.handler({ ops, dry_run: true }) as { diff_hash: string };
    const byHash = apply.handler({ ops: [], dry_run: false, execute_hash: d.diff_hash }) as { applied: boolean };
    assert.equal(byHash.applied, true, "the cached dry_run replays - no resend");
    const direct = apply.handler({ ops: [{ op: "set_field", id: "se.x", field: "statement", value: "Again." }], dry_run: false }) as {
      applied: boolean;
      fired_direct: boolean;
    };
    assert.equal(direct.applied, true);
    assert.equal(direct.fired_direct, true, "fire-first: no dry_run ceremony demanded");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("draining a note retires it from the inbox count", () => {
  const root = freshRoot();
  try {
    const tools = coreTools(root);
    const note = tools.find((t) => t.name === "se_note")!;
    const drain = tools.find((t) => t.name === "se_note_drain")!;
    const first = note.handler({ text: "one" }) as { captured: string; inbox_count: number };
    const second = note.handler({ text: "two" }) as { inbox_count: number };
    assert.equal(second.inbox_count, 2);
    const after = drain.handler({ ref: first.captured, disposition: "routed to the fixture" }) as { inbox_count: number };
    assert.equal(after.inbox_count, 1, "drained notes leave the count");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a failed call logs exactly one line carrying the clause", () => {
  const root = freshRoot();
  try {
    const log = new CallLog(layout.seDir(root));
    log.appendFailure({ tool: "se_test_dummy", args: {}, duration_ms: 1, clause: "SE-C-999", reason: "fixture refusal" });
    const lines = readFileSync(join(layout.seDir(root), "calls.jsonl"), "utf8").trim().split("\n");
    assert.equal(lines.length, 1);
    const rec = JSON.parse(lines[0]);
    assert.equal(rec.ok, false);
    assert.equal(rec.detail.clause, "SE-C-999");
    assert.match(rec.detail.reason, /fixture/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
