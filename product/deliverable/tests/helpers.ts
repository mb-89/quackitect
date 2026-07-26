// Test scaffolding: a fresh temp project root carrying the REAL boot
// machine (copied from this repo), so buildServer() compiles the same
// drawing the shipped server does.
import { cpSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildServer } from "../engine/tools.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

export function freshRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "se-v3-"));
  cpSync(join(REPO_ROOT, "product", "deliverable", "machines"), join(root, "product", "deliverable", "machines"), {
    recursive: true,
  });
  // The preflight verifies read paths — the workspace contract is one of them.
  mkdirSync(join(root, "workspace"), { recursive: true });
  cpSync(join(REPO_ROOT, "workspace", "AGENTS.md"), join(root, "workspace", "AGENTS.md"));
  return root;
}

export type Server = ReturnType<typeof buildServer>;

export async function call(server: Server, name: string, args: Record<string, unknown> = {}) {
  const res = await server.handle({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } });
  const r = res?.result as { content: { text: string }[]; isError: boolean };
  return { isError: r.isError, body: JSON.parse(r.content[0].text) as Record<string, unknown> };
}

/** A server ticked through the whole boot walk into idle. */
export async function bootedServer(root: string): Promise<Server> {
  const server = buildServer(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, confirm: true });
    if (step.isError) throw new Error(`walk failed: ${JSON.stringify(step.body)}`);
    if (step.body.booted === true) return server;
  }
  throw new Error("the walk did not reach idle in 8 ticks");
}
