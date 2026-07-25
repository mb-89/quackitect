// GUARD (adr-iteration-resolved-roots): every iteration-scoped tool - the file
// lane, se_git, se_run, the ledger tools - MUST resolve its working root through
// the ONE resolver (coreTools' activeRoot()), never the bound trunk `root`. When
// an iteration lives in a worktree, its file/repo/ledger work lands THERE; the
// trunk-rooted server routes to it. A worktree is a full checkout, so resolution
// is per-CALL (the whole root), never per-file.
//
// This is the "honored in future changes" guard the owner asked for: a new tool
// that touches iteration-scoped state and binds `root` instead of activeRoot()
// breaks either the behavioural checks (if it is one of the covered lanes) or
// the source-scan below (which forbids the bare-root call shapes outright).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { loadMachine } from "../engine/machines/load.ts";
import { Loop } from "../engine/loop.ts";
import { provisionWorktree } from "../engine/worktree.ts";
import { coreTools } from "../engine/tools.ts";
import type { ToolDef } from "../engine/mcp.ts";
import { plantMachines } from "./fixtures.ts";

const git = (c: string, cwd: string): string => execSync(`git ${c}`, { cwd, encoding: "utf8" }).trim();

/** A trunk fixture: a git repo with the machines planted and committed. */
function trunkFixture(): string {
  const root = mkdtempSync(join(tmpdir(), "wta-trunk-"));
  git("init -b main", root);
  plantMachines(root);
  execSync(`git add -A && git -c user.email=t@t -c user.name=t commit -m base`, { cwd: root });
  return root;
}

/** The lean machine with a no-op verify command (no external suite in a fixture). */
function lean(root: string) {
  const m = loadMachine(root, "lean")!;
  return { ...m, states: m.states.map((s) => (s.id === "verify" ? { ...s, command: 'node -e "process.exit(0)"' } : s)) };
}

/** A tool handler off a trunk-rooted surface (admission is a server guard, not the handler's). */
function handler(root: string, name: string): (args: Record<string, unknown>) => any {
  const t = (coreTools(root) as ToolDef[]).find((x) => x.name === name);
  assert.ok(t, `tool ${name} is on the surface`);
  return t!.handler as (args: Record<string, unknown>) => any;
}

test("GUARD: with an open WORKTREE iteration, se_file_write lands in the worktree, NOT trunk", () => {
  const root = trunkFixture();
  try {
    const w = provisionWorktree(root, "it-a");
    new Loop(w.root, lean(w.root)).start("it-a"); // the OPEN instance is worktree-resident
    const rel = "product/GUARD_MARKER.txt";
    handler(root, "se_file_write")({ path: rel, content: "x", base_hash: null });
    assert.ok(existsSync(join(w.root, rel)), "the write landed in the worktree");
    assert.ok(!existsSync(join(root, rel)), "the write did NOT touch trunk");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("GUARD: se_file_read reads from the open worktree, not trunk", () => {
  const root = trunkFixture();
  try {
    const w = provisionWorktree(root, "it-b");
    new Loop(w.root, lean(w.root)).start("it-b");
    handler(root, "se_file_write")({ path: "product/READ_ME.txt", content: "worktree-content", base_hash: null });
    const res = handler(root, "se_file_read")({ path: "product/READ_ME.txt" });
    assert.equal(res.content, "worktree-content", "read the worktree copy the write created");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("GUARD: se_run's cwd resolves to the open worktree, NOT trunk", () => {
  const root = trunkFixture();
  try {
    const w = provisionWorktree(root, "it-c");
    new Loop(w.root, lean(w.root)).start("it-c");
    const res = handler(root, "se_run")({ command: 'node -e "process.stdout.write(process.cwd())"' });
    assert.equal(res.args.cwd, w.root, "se_run ran with cwd = the worktree root");
    assert.notEqual(res.args.cwd, root, "se_run did NOT run on trunk");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("GUARD: with NO open worktree iteration, the tools stay on the trunk root", () => {
  const root = trunkFixture();
  try {
    const rel = "product/TRUNK_MARKER.txt";
    handler(root, "se_file_write")({ path: rel, content: "x", base_hash: null });
    assert.ok(existsSync(join(root, rel)), "with no worktree open, the write stays on trunk");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("GUARD (source): no iteration-scoped call site binds the bare trunk root", () => {
  const src = readFileSync(join(import.meta.dirname, "..", "engine", "tools.ts"), "utf8");
  // The single resolver must exist and the ledger must derive from it.
  assert.match(src, /const activeRoot = \(\): string =>/, "the activeRoot resolver is present");
  assert.match(src, /const ledgerRoot = \(\): string => layout\.ledger\(activeRoot\(\)\)/, "ledgerRoot derives from activeRoot");
  // The forbidden shapes: a file/repo/run call bound to the bare `root`. A new
  // tool that reintroduces any of these binds trunk and must fail here.
  const forbidden = [
    "fileList(root,",
    "fileSearch(root,",
    "fileRead(root,",
    "fileWrite(root,",
    "filePatch(\n          root,",
    "fileDelete(root,",
    "git(root,",
    "runCommand(log(), String(args.command), root)",
    "loadLedger(ledgerRoot)", // must be ledgerRoot() (the call), not the fn value
  ];
  for (const shape of forbidden) {
    assert.ok(!src.includes(shape), `iteration-scoped tool binds the bare trunk root: "${shape}" - route it through activeRoot()/ledgerRoot()`);
  }
});
