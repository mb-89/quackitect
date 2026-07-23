// se.get.node — one node, mode: outline | section | full. Defaults to
// outline (§15: most reads need the skeleton, not 400 lines). Every result
// carries the node id and its hash (§5 cross-cutting rules).
import { Rejection } from "./errors.ts";
import { listSections, getSection } from "./sections.ts";
import { serializeNode } from "./node.ts";
import type { Ledger } from "./store.ts";

export type GetMode = "outline" | "section" | "full";

export interface NodeOutline {
  id: string;
  hash: string;
  kind: string;
  statement: string;
  breaks_if_removed?: string;
  edges: Record<string, string[]>;
  fields: string[];
  sections: string[];
}

export interface NodeSection {
  id: string;
  hash: string;
  section: string;
  content: string;
}

export interface NodeFull {
  id: string;
  hash: string;
  content: string;
}

export function getNode(ledger: Ledger, id: string, mode: GetMode = "outline", section?: string): NodeOutline | NodeSection | NodeFull {
  const node = ledger.nodes.get(id);
  if (!node) {
    throw new Rejection({
      clause: "SE-C-012",
      expected: "an existing node id",
      got: id,
      remedy: {
        tool: "se_get_search",
        args: { query: id.split(".").pop() ?? id },
        note: "search for the node first; ids are module-qualified (module.local-id)",
      },
      source: "engine/get.ts getNode",
    });
  }
  switch (mode) {
    case "outline":
      return {
        id: node.id,
        hash: node.hash,
        kind: node.kind,
        statement: node.statement,
        ...(node.breaks_if_removed !== undefined ? { breaks_if_removed: node.breaks_if_removed } : {}),
        edges: node.edges,
        fields: Object.keys(node.extra),
        sections: listSections(node.body).map((s) => s.heading),
      };
    case "section": {
      if (!section) {
        throw new Rejection({
          clause: "SE-C-015",
          expected: "a section name with mode=section",
          got: "none",
          remedy: { tool: "se_get_node", args: { id, mode: "outline" }, note: "outline lists the node's sections" },
          source: "engine/get.ts getNode",
        });
      }
      const s = getSection(node.body, section);
      if (!s) {
        throw new Rejection({
          clause: "SE-C-015",
          expected: `an existing section of ${id}`,
          got: section,
          remedy: { tool: "se_get_node", args: { id, mode: "outline" }, note: "outline lists the node's sections" },
          source: "engine/get.ts getNode",
        });
      }
      return { id: node.id, hash: node.hash, section: s.heading, content: s.content };
    }
    case "full":
      return { id: node.id, hash: node.hash, content: serializeNode(node) };
  }
}
