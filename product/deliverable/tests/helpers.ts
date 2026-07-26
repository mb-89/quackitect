// Test scaffolding: a fresh temp project root carrying the REAL boot
// machine (copied from this repo), so buildServer() compiles the same
// drawing the shipped server does.
import { cpSync, mkdtempSync } from "node:fs";
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
  return root;
}

export type Server = ReturnType<typeof buildServer>;

export async function call(server: Server, name: string, args: Record<string, unknown> = {}) {
  const res = await server.handle({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } });
  const r = res?.result as { content: { text: string }[]; isError: boolean };
  return { isError: r.isError, body: JSON.parse(r.content[0].text) as Record<string, unknown> };
}

/** A server driven through the whole boot sequence into idle. */
export async function bootedServer(root: string): Promise<Server> {
  const server = buildServer(root);
  for (let i = 0; i < 6; i++) {
    const step = await call(server, "se_boot");
    if (step.isError) throw new Error(`boot failed: ${JSON.stringify(step.body)}`);
    if (step.body.booted === true) return server;
  }
  throw new Error("boot did not converge in 6 steps");
}
