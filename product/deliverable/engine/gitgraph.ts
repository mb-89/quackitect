// THE DECISION GRAPH IS NOT A TREE, and drawing it as one loses the only
// interesting part. walking.md defines a fork as "a BLOCKING detour: the
// current item cannot continue until this is fixed; resolve it and RETURN".
// The return is a merge. A tree has no way to say it — its leaves just stop.
//
// So the graph emits as a Mermaid gitGraph: trunk, branches off it, and a
// merge back when a detour resolves. VS Code renders Mermaid in its built-in
// Markdown preview since 1.121, so nothing here needs a renderer of ours.
import type { DecisionNode } from "./decisions.ts";

/** A node's branch. Top-level points ride the trunk; anything opened UNDER
 *  something else is a detour and gets a branch of its own, named for it. */
const branchOf = (n: DecisionNode): string => (n.parent === null ? "main" : n.id);

/** Mermaid takes a quoted string, so a quote inside a brief would end it. */
const label = (text: string): string => text.replace(/"/g, "'").trim();

interface Event {
  at: string;
  kind: "open" | "close";
  node: DecisionNode;
}

/** ONLY `done` MERGES. A point that was obsoleted, reverted or deferred did
 *  not come home, and a graph that merged it anyway would claim work landed
 *  that never did. Those branches stay hanging, which is the truth. */
const RETURNS = new Set(["done"]);

export function decisionsAsGitGraph(nodes: readonly DecisionNode[]): string {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const out: string[] = ["gitGraph"];
  if (nodes.length === 0) {
    out.push(`  commit id: "nothing decided yet"`);
    return out.join("\n");
  }

  // The graph is a TIMELINE, so opening and closing are separate events and
  // both are sorted by when they happened. Emitting a node's whole life at
  // once would draw merges before the work they enclose.
  const events: Event[] = [];
  for (const node of nodes) {
    events.push({ at: node.at, kind: "open", node });
    if (node.closed_at !== undefined && RETURNS.has(node.status) && node.parent !== null) {
      events.push({ at: node.closed_at, kind: "close", node });
    }
  }
  events.sort((a, b) => a.at.localeCompare(b.at) || (a.kind === b.kind ? a.node.id.localeCompare(b.node.id) : a.kind === "open" ? -1 : 1));

  const parentBranch = (n: DecisionNode): string => {
    if (n.parent === null) return "main";
    const p = byId.get(n.parent);
    return p === undefined ? "main" : branchOf(p);
  };

  let current = "main";
  const opened = new Set<string>();
  const checkout = (branch: string): void => {
    if (current === branch) return;
    out.push(`  checkout ${branch}`);
    current = branch;
  };

  for (const ev of events) {
    const n = ev.node;
    if (ev.kind === "open") {
      const branch = branchOf(n);
      if (branch === "main") {
        checkout("main");
      } else {
        checkout(parentBranch(n));
        out.push(`  branch ${branch}`); // branch also checks the new one out
        current = branch;
        opened.add(branch);
      }
      const tag = n.status === "open" ? "" : ` tag: "${n.status}"`;
      out.push(`  commit id: "${label(`${n.id} ${n.brief}`)}"${tag}`);
    } else {
      // A detour that came home. Merging from the parent's branch is what
      // draws the line back, and it is the whole point of this renderer.
      if (!opened.has(n.id)) continue;
      checkout(parentBranch(n));
      out.push(`  merge ${n.id}`);
    }
  }
  return out.join("\n");
}

/** The frame-buffer page: one markdown file the details surface opens, with
 *  the graph in a fence VS Code renders itself. */
export function decisionsAsMarkdown(nodes: readonly DecisionNode[], heading: string): string {
  const open = nodes.filter((n) => n.status === "open").length;
  return [
    `# ${heading}`,
    "",
    `${nodes.length} points, ${open} still open.`,
    "",
    "```mermaid",
    decisionsAsGitGraph(nodes),
    "```",
    "",
  ].join("\n");
}
