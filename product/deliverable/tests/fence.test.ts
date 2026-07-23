// The workspace fence: locked roots deny direct harness access (exit 2),
// the workspace exemption and unlocked paths pass (exit 0). Spawned like
// the real PreToolUse hook: payload on stdin, lock files under the state
// base.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";

const FENCE = join(import.meta.dirname, "..", "bin", "se-fence.ts");

async function runFence(stateDir: string, payload: object): Promise<{ code: number; stderr: string }> {
  const proc = spawn(process.execPath, [FENCE], {
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, SE_STATE_DIR: stateDir },
  });
  let stderr = "";
  proc.stderr.on("data", (d: Buffer) => (stderr += d.toString()));
  proc.stdin.end(JSON.stringify(payload));
  const [code] = (await once(proc, "exit")) as [number];
  return { code, stderr };
}

function fixture(): { stateDir: string; product: string; imported: string } {
  const stateDir = mkdtempSync(join(tmpdir(), "se-fence-state-"));
  const product = mkdtempSync(join(tmpdir(), "se-fence-prod-"));
  const imported = mkdtempSync(join(tmpdir(), "se-fence-imp-"));
  mkdirSync(join(stateDir, "prod"), { recursive: true });
  writeFileSync(
    join(stateDir, "prod", "lock.json"),
    JSON.stringify({
      product: "fence-fixture",
      locked_roots: [product, imported],
      workspace_exempt: join(product, "workspace"),
    }) + "\n",
    "utf8",
  );
  return { stateDir, product, imported };
}

test("locked product and import roots are denied; workspace and outside paths pass", async () => {
  const { stateDir, product, imported } = fixture();
  try {
    const denied = await runFence(stateDir, {
      tool_name: "Read",
      tool_input: { file_path: join(product, "product", "spec", "x.md") },
    });
    assert.equal(denied.code, 2);
    assert.match(denied.stderr, /fence-fixture/);
    assert.match(denied.stderr, /se_file_search/);

    const imp = await runFence(stateDir, { tool_name: "Edit", tool_input: { file_path: join(imported, "kb.md") } });
    assert.equal(imp.code, 2);

    const ws = await runFence(stateDir, {
      tool_name: "Edit",
      tool_input: { file_path: join(product, "workspace", "notes.md") },
    });
    assert.equal(ws.code, 0);

    const outside = await runFence(stateDir, { tool_name: "Read", tool_input: { file_path: join(tmpdir(), "free.txt") } });
    assert.equal(outside.code, 0);
  } finally {
    for (const d of [stateDir, product, imported]) rmSync(d, { recursive: true, force: true });
  }
});

test("shell commands containing a locked root are denied; workspace-scoped commands pass", async () => {
  const { stateDir, product, imported } = fixture();
  try {
    const denied = await runFence(stateDir, {
      tool_name: "Bash",
      tool_input: { command: `grep -r needle "${product}"` },
    });
    assert.equal(denied.code, 2);

    const ws = await runFence(stateDir, {
      tool_name: "Bash",
      tool_input: { command: `cat "${join(product, "workspace", "a.txt")}"` },
    });
    assert.equal(ws.code, 0);

    const free = await runFence(stateDir, { tool_name: "Bash", tool_input: { command: "echo hello" } });
    assert.equal(free.code, 0);

    // The machine-local state dir shares the product's folder name — legal.
    const state = await runFence(stateDir, {
      tool_name: "Bash",
      tool_input: { command: `tail ~/.se/${product.split(/[\\/]/).pop()}/calls.jsonl` },
    });
    assert.equal(state.code, 0);
  } finally {
    for (const d of [stateDir, product, imported]) rmSync(d, { recursive: true, force: true });
  }
});

test("no locks, malformed input, malformed lock: the fence never blocks", async () => {
  const empty = mkdtempSync(join(tmpdir(), "se-fence-empty-"));
  const broken = mkdtempSync(join(tmpdir(), "se-fence-broken-"));
  try {
    const none = await runFence(empty, { tool_name: "Read", tool_input: { file_path: "C:/anything" } });
    assert.equal(none.code, 0);

    mkdirSync(join(broken, "p"), { recursive: true });
    writeFileSync(join(broken, "p", "lock.json"), "not json", "utf8");
    const bad = await runFence(broken, { tool_name: "Read", tool_input: { file_path: "C:/anything" } });
    assert.equal(bad.code, 0);
  } finally {
    for (const d of [empty, broken]) rmSync(d, { recursive: true, force: true });
  }
});
