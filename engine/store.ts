// The ledger store: markdown files on disk are the truth; everything else is
// derived. Layout: <ledgerRoot>/<module>/<localId>.md
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { parseNode, type LedgerNode } from "./node.ts";

export interface LintFinding {
  node: string;
  rule: string;
  message: string;
}

export interface Ledger {
  root: string;
  nodes: Map<string, LedgerNode>;
  findings: LintFinding[];
}

export function loadLedger(root: string): Ledger {
  const nodes = new Map<string, LedgerNode>();
  const findings: LintFinding[] = [];
  if (!existsSync(root)) return { root, nodes, findings };

  for (const moduleEntry of readdirSync(root, { withFileTypes: true })) {
    if (!moduleEntry.isDirectory()) continue;
    const moduleDir = join(root, moduleEntry.name);
    for (const f of readdirSync(moduleDir, { withFileTypes: true })) {
      if (!f.isFile() || !f.name.endsWith(".md")) continue;
      const file = join(moduleDir, f.name);
      const node = parseNode(readFileSync(file, "utf8"), file);
      const expectedId = `${moduleEntry.name}.${basename(f.name, ".md")}`;
      if (node.id !== expectedId) {
        throw new Error(`${file}: id ${node.id} does not match path (expected ${expectedId})`);
      }
      if (nodes.has(node.id)) throw new Error(`duplicate node id: ${node.id}`);
      nodes.set(node.id, node);
    }
  }

  // Referential lint: edges must point at nodes that exist.
  for (const node of nodes.values()) {
    for (const [kind, targets] of Object.entries(node.edges)) {
      for (const t of targets) {
        if (!nodes.has(t)) {
          findings.push({ node: node.id, rule: "edge-target-missing", message: `${kind} -> ${t} does not exist` });
        }
      }
    }
    if (node.kind === "requirement" && !node.breaks_if_removed) {
      findings.push({ node: node.id, rule: "breaks-if-removed-missing", message: "mandatory on requirements (§9)" });
    }
  }
  return { root, nodes, findings };
}
