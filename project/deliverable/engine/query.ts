// el-query-evaluator (fn-run-a-governed-walk.answer-a-structured-query).
// dsp-query-evaluator: no cache, no index — loadTrace and noteOf are the
// same accessor every other reader uses, so a fresh read is the whole cost.

import { CLAUSES, Rejection } from "./errors.ts";
import type { TraceNode } from "./trace.ts";
import { loadTrace, noteOf } from "./trace.ts";

export interface QueryFilterClause {
  field: string;
  equals?: string;
  not_equals?: string;
}

export interface QueryRequest {
  kind: string;
  filters?: { and?: QueryFilterClause[] };
  fields: string[];
}

export interface QueryResult {
  rows: Record<string, string>[];
}

function fieldValue(node: TraceNode, field: string): string {
  if (field === "id") return node.id;
  if (field === "type") return node.type;
  if (field === "statement") return node.statement;
  const fm = node.file === undefined ? undefined : noteOf(node.file)?.frontmatter;
  const v = fm?.[field];
  if (v === undefined) return "";
  return Array.isArray(v) ? v.join(", ") : String(v);
}

function legalFields(nodesOfKind: TraceNode[]): Set<string> {
  const out = new Set<string>(["id", "type", "statement"]);
  for (const n of nodesOfKind) {
    if (n.file === undefined) continue;
    const fm = noteOf(n.file)?.frontmatter;
    if (fm === undefined) continue;
    for (const k of Object.keys(fm)) out.add(k);
  }
  return out;
}

export function answerStructuredQuery(root: string, request: QueryRequest): QueryResult {
  const nodesOfKind = loadTrace(root).filter((n) => n.type === request.kind);
  const legal = legalFields(nodesOfKind);
  const unknown = request.fields.filter((f) => !legal.has(f));
  if (unknown.length > 0) {
    throw new Rejection({
      clause: CLAUSES.QUERY_UNKNOWN_FIELD,
      expected: `a field kind "${request.kind}" actually carries — legal fields: ${[...legal].sort().join(", ")}`,
      got: `field${unknown.length > 1 ? "s" : ""} ${unknown.map((f) => `"${f}"`).join(", ")}`,
      remedy: {
        tool: "se_query",
        args: { kind: request.kind, fields: [...legal].sort().slice(0, 3) },
        note: "ask again with a field this kind actually carries — the legal list rides the refusal",
      },
      source: "engine/query.ts answerStructuredQuery",
    });
  }
  const clauses = request.filters?.and ?? [];
  const matched = nodesOfKind.filter((n) =>
    clauses.every((c) => {
      const v = fieldValue(n, c.field);
      if (c.equals !== undefined) return v === c.equals;
      if (c.not_equals !== undefined) return v !== c.not_equals;
      return true;
    }),
  );
  const rows = matched.map((n) => {
    const row: Record<string, string> = {};
    for (const f of request.fields) row[f] = fieldValue(n, f);
    return row;
  });
  return { rows };
}
