// THE QUERY VERB AND THE BM25 SIBLING — read-only lane doors over the trace
// corpus. dsp-lane-door owns this file; the functions themselves live in
// query.ts (el-query-evaluator) and disposition.ts (el-coupling-disposer).
//
// Both verbs answer over the same corpus the file lane already reads, and
// both refuse rather than guess: an unknown query field names the legal
// fields (SE-C-144, engine/query.ts), and a coupling proposal never drops a
// candidate silently (req-bm25-candidates-need-disposition) — every
// candidate the ranker returns gets a disposition row, stamped pending,
// before the caller sees the list.
import { rankCandidateCouplings, recordCouplingDisposition } from "./disposition.ts";
import type { ToolDef } from "./mcp.ts";
import { answerStructuredQuery } from "./query.ts";

export function queryTools(rootOf: (rel?: string) => string): ToolDef[] {
  return [
    {
      name: "se_query",
      title: "se.query",
      description:
        "Read-only structured query over the trace corpus: nodes, edges (via a node's own frontmatter refs), states and notes. Filter by kind and equals/not_equals clauses, name the fields you want back. An unknown field is refused by name, listing every field the matched kind actually carries (SE-C-144) \u2014 never a silent empty column.",
      inputSchema: {
        type: "object",
        properties: {
          kind: { type: "string", description: "the node type to query, e.g. requirement, raid, function" },
          filters: {
            type: "object",
            properties: {
              and: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    field: { type: "string" },
                    equals: { type: "string" },
                    not_equals: { type: "string" },
                  },
                  required: ["field"],
                },
              },
            },
          },
          fields: { type: "array", items: { type: "string" }, description: "the fields each returned row carries" },
        },
        required: ["kind", "fields"],
      },
      handler: (args) =>
        answerStructuredQuery(rootOf(), {
          kind: String(args.kind),
          fields: (Array.isArray(args.fields) ? args.fields : []).map(String),
          ...(args.filters !== undefined
            ? { filters: args.filters as { and?: { field: string; equals?: string; not_equals?: string }[] } }
            : {}),
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
