// THE QUERY VERB AND THE BM25 SIBLING — read-only lane doors over the trace
// corpus. dsp-lane-door owns this file; the functions themselves live in
// query.ts (el-query-evaluator) and disposition.ts (el-coupling-disposer).
//
// se_query executes a harvested .base file's own declared view against the
// vault through the SAME pinned subset the mirror widget already uses
// (engine/tables.ts) — it does not invent a second grammar. An unknown
// requested field is refused by name, listing the view's own column order
// (SE-C-144). se_couplings never drops a candidate silently: every candidate
// the ranker returns gets a disposition row, stamped pending, before the
// caller sees the list.
import { rankCandidateCouplings, recordCouplingDisposition } from "./disposition.ts";
import type { ToolDef } from "./mcp.ts";
import { answerStructuredQuery } from "./query.ts";

export function queryTools(rootOf: (rel?: string) => string): ToolDef[] {
  return [
    {
      name: "se_query",
      title: "se.query",
      description:
        "Read-only lane door over a harvested .base query file: names the base and (optionally) which of its declared views to run, executes that view's own filter/sort against the vault through the pinned Bases subset, and returns rows projected to the view's own column order. An unknown requested field is refused by name, listing the view's own legal columns (SE-C-144) — never a silent empty column.",
      inputSchema: {
        type: "object",
        properties: {
          base: { type: "string", description: "vault-relative path to a .base file, e.g. spec/queries/requirements.base" },
          view: { type: "string", description: "the view name inside the base; defaults to its first declared view" },
          fields: { type: "array", items: { type: "string" }, description: "column override; defaults to the view's own order" },
        },
        required: ["base"],
      },
      handler: (args) =>
        answerStructuredQuery(rootOf(), {
          base: String(args.base),
          ...(args.view !== undefined ? { view: String(args.view) } : {}),
          ...(Array.isArray(args.fields) ? { fields: args.fields.map(String) } : {}),
        }),
    },
    {
      name: "se_couplings",
      title: "se.couplings",
      description:
        "BM25 retrieval sibling: given a change description, rank corpus nodes the graph's own edges do not already name as coupled, and return one disposition row per candidate (status pending) so nothing the ranker proposes is silently dropped. Below the relevance threshold returns an explicit empty result, never a guess.",
      inputSchema: {
        type: "object",
        properties: {
          change_description: { type: "string", description: "plain-language description of the change under consideration" },
        },
        required: ["change_description"],
      },
      handler: (args) => {
        const root = rootOf();
        const ranked = rankCandidateCouplings(root, String(args.change_description));
        return { candidates: ranked, dispositions: recordCouplingDisposition(root, ranked) };
      },
    },
  ];
}
