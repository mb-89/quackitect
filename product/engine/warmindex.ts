// The warm index (B1): SQLite + FTS5, derived entirely from the ledger files.
// Deletable at any time; rebuild is the only write path. Node's built-in
// sqlite — zero dependencies.
import { DatabaseSync } from "node:sqlite";
import { edgeKind } from "./edges.ts";
import type { Ledger } from "./store.ts";

export interface IndexedNode {
  id: string;
  module: string;
  kind: string;
  statement: string;
  hash: string;
}

export interface SearchHit {
  id: string;
  statement: string;
  snippet: string;
}

export class WarmIndex {
  private db: DatabaseSync;

  constructor(path: string = ":memory:") {
    this.db = new DatabaseSync(path);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY, module TEXT NOT NULL, kind TEXT NOT NULL,
        statement TEXT NOT NULL, hash TEXT NOT NULL, breaks_if_removed TEXT
      );
      CREATE TABLE IF NOT EXISTS edges (
        src TEXT NOT NULL, kind TEXT NOT NULL, dst TEXT NOT NULL, suspects TEXT NOT NULL,
        PRIMARY KEY (src, kind, dst)
      );
      CREATE VIRTUAL TABLE IF NOT EXISTS fts USING fts5(id UNINDEXED, statement, body);
    `);
  }

  /** Rebuild from a loaded ledger — files alone are the input. */
  rebuild(ledger: Ledger): void {
    this.db.exec("BEGIN");
    try {
      this.db.exec("DELETE FROM nodes; DELETE FROM edges; DELETE FROM fts;");
      const insNode = this.db.prepare(
        "INSERT INTO nodes (id, module, kind, statement, hash, breaks_if_removed) VALUES (?, ?, ?, ?, ?, ?)",
      );
      const insEdge = this.db.prepare("INSERT INTO edges (src, kind, dst, suspects) VALUES (?, ?, ?, ?)");
      const insFts = this.db.prepare("INSERT INTO fts (id, statement, body) VALUES (?, ?, ?)");
      for (const n of ledger.nodes.values()) {
        insNode.run(n.id, n.module, n.kind, n.statement, n.hash, n.breaks_if_removed ?? null);
        insFts.run(n.id, n.statement, n.body);
        for (const [ek, targets] of Object.entries(n.edges)) {
          const decl = edgeKind(ek);
          for (const t of targets) insEdge.run(n.id, ek, t, decl?.suspects ?? "source");
        }
      }
      this.db.exec("COMMIT");
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }

  node(id: string): IndexedNode | undefined {
    const row = this.db.prepare("SELECT id, module, kind, statement, hash FROM nodes WHERE id = ?").get(id);
    return row ? ({ ...row } as unknown as IndexedNode) : undefined;
  }

  count(): number {
    return (this.db.prepare("SELECT COUNT(*) c FROM nodes").get() as { c: number }).c;
  }

  allHashes(): Map<string, string> {
    const out = new Map<string, string>();
    for (const row of this.db.prepare("SELECT id, hash FROM nodes ORDER BY id").all() as unknown as IndexedNode[]) {
      out.set(row.id, row.hash);
    }
    return out;
  }

  /** BM25-ranked snippets with anchors, never whole files (§5). */
  search(query: string, limit = 10): SearchHit[] {
    return this.db
      .prepare(
        "SELECT id, statement, snippet(fts, 2, '[', ']', ' … ', 12) AS snippet FROM fts WHERE fts MATCH ? ORDER BY bm25(fts) LIMIT ?",
      )
      .all(query, limit)
      .map((r) => ({ ...r }) as unknown as SearchHit);
  }

  edgesFrom(src: string): { kind: string; dst: string }[] {
    return this.db
      .prepare("SELECT kind, dst FROM edges WHERE src = ? ORDER BY kind, dst")
      .all(src)
      .map((r) => ({ ...r }) as unknown as { kind: string; dst: string });
  }

  edgesTo(dst: string): { kind: string; src: string }[] {
    return this.db
      .prepare("SELECT kind, src FROM edges WHERE dst = ? ORDER BY kind, src")
      .all(dst)
      .map((r) => ({ ...r }) as unknown as { kind: string; src: string });
  }

  close(): void {
    this.db.close();
  }
}
