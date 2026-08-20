// el-query-evaluator (fn-run-a-governed-walk.answer-a-structured-query).
// dsp-query-evaluator.
//
// THE VERB EXECUTES A .base VIEW, IT DOES NOT INVENT A GRAMMAR. record.md's
// own DONE LOOKS LIKE names "our own reader over Obsidian Bases compatible
// files" \u2014 so this reads a harvested .base file's own filter/sort/order,
// runs it against the vault through the SAME pinned subset the mirror widget
// already uses (engine/tables.ts), and projects to the view's own column
// list. Two query grammars in one engine is exactly what the ADR's
// conformance-fixtures discipline exists to prevent (adr-query-in-engine.md).

import { join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { type BaseSpec, type BaseView, loadBase, type Row, readVault, selectRows, vaultDir } from "./tables.ts";

export interface QueryRequest {
  /** Vault-relative path to a .base file, e.g. "spec/queries/requirements.base". */
  base: string;
  /** View name inside the base. Defaults to the base's first view. */
  view?: string;
  /** Column override. Defaults to the view's own `order`. Any name outside
   *  the view's order is refused by name (SE-C-144) \u2014 the view IS the
   *  pinned column list; there is no wider frontmatter escape hatch here. */
  fields?: string[];
}

export interface QueryResult {
  rows: Record<string, unknown>[];
}

function pickView(spec: BaseSpec, name: string | undefined): BaseView {
  const view = name === undefined ? spec.views[0] : spec.views.find((v) => v.name === name);
  if (view === undefined) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected:
        spec.views.length > 0
          ? `a view in this base: ${spec.views.map((v) => v.name).join(", ")}`
          : "a view \u2014 this base declares none",
      got: name ?? "(none named)",
      remedy: {
        tool: "se_query",
        args: { base: "<the same base>", view: spec.views[0]?.name ?? "<name a view>", fields: [] },
        note: "name one of the base's own declared views",
      },
      source: "engine/query.ts pickView",
    });
  }
  return view;
}

function field(row: Row, name: string): unknown {
  if (!name.includes(".")) return row[name];
  let cur: unknown = row;
  for (const part of name.split(".")) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export function answerStructuredQuery(root: string, request: QueryRequest): QueryResult {
  const spec = loadBase(join(vaultDir(root), request.base));
  const view = pickView(spec, request.view);
  const legal = new Set(view.order);
  const requested = request.fields ?? view.order;
  const unknown = requested.filter((f) => !legal.has(f));
  if (unknown.length > 0) {
    throw new Rejection({
      clause: CLAUSES.QUERY_UNKNOWN_FIELD,
      expected: `a field this view's own order carries \u2014 legal fields: ${[...legal].sort().join(", ")}`,
      got: `field${unknown.length > 1 ? "s" : ""} ${unknown.map((f) => `"${f}"`).join(", ")}`,
      remedy: {
        tool: "se_query",
        args: { base: request.base, view: view.name, fields: [...legal].sort().slice(0, 3) },
        note: "ask again with a field this view's own order carries \u2014 the legal list rides the refusal",
      },
      source: "engine/query.ts answerStructuredQuery",
    });
  }
  const matched = selectRows(spec, view, readVault(root));
  const rows = matched.map((r) => {
    const out: Record<string, unknown> = {};
    for (const f of requested) out[f] = field(r, f);
    return out;
  });
  return { rows };
}
