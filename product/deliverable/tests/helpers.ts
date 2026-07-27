// Test scaffolding: a fresh temp project root carrying the REAL boot
// machine (copied from this repo), so buildServer() compiles the same
// drawing the shipped server does.
import { cpSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { contentHash } from "../engine/hash.ts";
import { buildServer } from "../engine/tools.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

// Test roots carry a COPY of the engine with no node_modules above it; the
// env override points ripgrep resolution (and every spawned condition
// script) at the REAL repo's npm-provided binary. Without it, tests pass
// only on machines with a PATH rg — the exact hole a Windows run found.
try {
  process.env.SE_RG_PATH ??= (createRequire(import.meta.url)("@vscode/ripgrep") as { rgPath: string }).rgPath;
} catch {
  // no npm install — rgPath() falls back to PATH rg and fails loudly if absent
}

// Walks in tests hit prepare_idle's exit scripts, and one of those IS the
// suite (engine/bin/selftest.ts) — without this guard every booted walk
// would spawn the whole suite again, recursively.
process.env.SE_SELFTEST_SKIP = "1";
// Never spawn keep-awake loops or OS shutdowns from a test session.
process.env.SE_KEEPAWAKE_DISABLE = "1";

export function freshRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "se-v3-"));
  cpSync(join(REPO_ROOT, "product", "deliverable", "machines"), join(root, "product", "deliverable", "machines"), {
    recursive: true,
  });
  // Condition scripts are repo files — prepare_idle's preflight needs the engine.
  cpSync(join(REPO_ROOT, "product", "deliverable", "engine"), join(root, "product", "deliverable", "engine"), {
    recursive: true,
  });
  // The engine imports the yaml package; a bare specifier resolves upward
  // from the COPIED engine, so the package must exist there too.
  cpSync(
    join(REPO_ROOT, "product", "deliverable", "node_modules", "yaml"),
    join(root, "product", "deliverable", "node_modules", "yaml"),
    { recursive: true },
  );
  // The preflight verifies read paths — the guidance tree and the workspace
  // contract are among them.
  cpSync(join(REPO_ROOT, "product", "guidance"), join(root, "product", "guidance"), { recursive: true });
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

/** The boot read list + the root guidance the pull demands at entry. */
export const READ_DOCS = [
  "workspace/AGENTS.md",
  "product/guidance/contract.md",
  "product/guidance/voice.md",
  "product/guidance/walking.md",
] as const;

/** The agent's proof-of-read, earned the honest way: hash of each doc as
 *  it stands on disk (exactly what se_file_read would have returned). */
export function readHashesFor(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of READ_DOCS) out[p] = contentHash(readFileSync(join(root, ...p.split("/"))));
  return out;
}

/** The human's side of the same proof: check every boot doc in the mirror. */
export function checkDocs(session: { humanCheck: (p: string) => unknown }): void {
  for (const p of READ_DOCS) session.humanCheck(p);
}

/** A server ticked through the whole boot walk into idle — supplying the
 *  read hashes on every tick, as the agent's hand must. */
export async function bootedServer(root: string): Promise<Server> {
  const server = buildServer(root);
  const read_hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes });
    if (step.isError) throw new Error(`walk failed: ${JSON.stringify(step.body)}`);
    if (step.body.booted === true) return server;
  }
  throw new Error("the walk did not reach idle in 8 ticks");
}
