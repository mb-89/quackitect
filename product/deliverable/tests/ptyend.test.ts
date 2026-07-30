// THE SESSION CLEANS UP AFTER ITSELF (owner, 2026-07-30): when the machine
// reaches end, the server posts /pty/end and the terminal host ends its
// agent — politely first (/exit after the output settles), then by force.
// The host exits with the agent, so end leaves no strays holding ports.
import { strict as assert } from "node:assert";
import { spawn } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const PTY = fileURLToPath(new URL("../engine/bin/se-pty.ts", import.meta.url));

test("POST /pty/end ends the agent: settle, /exit, then the insist kill", async () => {
  const port = 7391;
  // An "agent" that ignores /exit on purpose — the insist path must take it
  // down, and the host must exit with it.
  const child = spawn(
    process.execPath,
    [PTY, "--pty-port", String(port), "--", process.execPath, "-e", "process.stdin.resume(); console.log('agent up'); setInterval(() => {}, 1000)"],
    {
      env: { ...process.env, SE_PTY_END_QUIET_MS: "200", SE_PTY_END_INSIST_MS: "500", SE_PTY_END_CAP_MS: "3000" },
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
    },
  );
  try {
    const until = Date.now() + 15_000;
    let up = false;
    while (Date.now() < until) {
      try {
        up = (await fetch(`http://localhost:${port}/pty/alive`)).ok;
        if (up) break;
      } catch {
        // not listening yet
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    assert.ok(up, "the terminal host came up");
    const res = await fetch(`http://localhost:${port}/pty/end`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason: "test over" }),
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ending: true });
    const gone = await new Promise<boolean>((resolve) => {
      const t = setTimeout(() => resolve(false), 20_000);
      child.on("exit", () => {
        clearTimeout(t);
        resolve(true);
      });
    });
    assert.ok(gone, "the terminal host exited after ending its agent");
  } finally {
    child.kill();
  }
});
