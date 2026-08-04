// THE DECISION GRAPH IS NOT A TREE, and drawing it as one loses the only
// interesting part. walking.md defines a fork as "a BLOCKING detour: the
// current item cannot continue until this is fixed; resolve it and RETURN".
//
// So the graph emits as a Mermaid gitGraph. VS Code renders Mermaid in its
// built-in Markdown preview since 1.121, so nothing here needs a renderer.
//
// THE SHAPE (owner design, 2026-07-31):
//
// - The trunk is the checklist. One commit per point, top to bottom.
// - The updates on a point become a BRANCH off it, and that branch does not
//   come back. Work reported on a point is not a detour that returns; it is
//   the story of that point, and merging it would draw a return that never
//   happened.
// - The LAST update is the one that settled the point, so it carries the
//   closing mark. The trunk bubble carries it too, so the checklist reads
//   straight down without following every branch.
import type { DecisionNode } from "./decisions.ts";

/** How long a point's line may be. The graph reads as a checklist, and a
 *  full brief pushes the column so wide the shape stops being visible. */
const LABEL_CAP = 52;

/** Mermaid takes a quoted string, so a quote inside a brief would end it. */
const label = (text: string): string => {
  const flat = text.replace(/"/g, "'").replace(/\s+/g, " ").trim();
  if (flat.length <= LABEL_CAP) return flat;
  const cut = flat.slice(0, LABEL_CAP);
  const space = cut.lastIndexOf(" ");
  return `${(space > LABEL_CAP * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
};

/** A tick for what landed, and a distinct mark for what did not. An open
 *  point carries a FIGURE SPACE (U+2007) — a blank the width of a digit that
 *  HTML will not collapse, so every line starts at the same column and the
 *  eye finds the unfinished one by the gap.
 *
 *  EXPORTED so nothing has to retype it. A test that spelled the blank as an
 *  ordinary space failed against a line that looked identical on screen. */
export const MARK: Record<string, string> = {
  open: " ",
  done: "✓",
  obsolete: "✗",
  reverted: "↩",
  deferred: "→",
};

/** THE DOT ITSELF CARRIES THE VERDICT.
 *
 *  Mermaid cannot draw text inside a commit circle — there is no such thing
 *  in the grammar. What it does have is a commit TYPE, and a colour for the
 *  highlighted ones. So a settled point becomes a HIGHLIGHT commit in green,
 *  and the tick leaves the label.
 *
 *  gitInv0..7 are per-branch, and mermaid reuses them cyclically past eight,
 *  so every one is set to the same green and any branch reads alike. */
const DONE_GREEN = "#3fb950";
const GIT_INV = ["gitInv0", "gitInv1", "gitInv2", "gitInv3", "gitInv4", "gitInv5", "gitInv6", "gitInv7"];

/** A BRANCH NAME IS A TOKEN. Mermaid's checkout takes one identifier, so a
 *  trunk called "the plan" makes `checkout the plan` a parse error at the
 *  second word — which is exactly how this was found. */
const token = (text: string): string => text.replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "trunk";

const byTime = (a: DecisionNode, b: DecisionNode): number => a.at.localeCompare(b.at) || a.id.localeCompare(b.id);

export function decisionsAsGitGraph(nodes: readonly DecisionNode[], trunkName = "the plan"): string {
  const trunk = token(trunkName);
  // TB reads as a CHECKLIST — top to bottom, one line per point, with the
  // text horizontal beside its dot.
  //
  // parallelCommits drops mermaid's TEMPORAL spacing, which pads rows apart
  // by how far apart in time they were. Every point already owns a row, so
  // that padding buys nothing and costs the screen.
  //
  // The theme is NOT set. ux.md says take the colour from the host, and
  // naming a theme here would fight the editor's own light or dark.
  const init =
    `%%{init: {'themeVariables': {'commitLabelFontSize': '11px', ` +
    GIT_INV.map((v) => `'${v}': '${DONE_GREEN}'`).join(", ") +
    `}, 'gitGraph': {'rotateCommitLabel': false, 'parallelCommits': true, 'mainBranchName': '${trunk}'}}}%%`;
  const out: string[] = [init, "gitGraph TB:"];
  if (nodes.length === 0) {
    out.push(`  commit id: "nothing decided yet"`);
    return out.join("\n");
  }

  const children = new Map<string, DecisionNode[]>();
  const roots: DecisionNode[] = [];
  for (const n of nodes) {
    if (n.parent === null) roots.push(n);
    else {
      let kids = children.get(n.parent);
      if (!kids) {
        kids = [];
        children.set(n.parent, kids);
      }
      kids.push(n);
    }
  }
  roots.sort(byTime);

  /** done paints the dot, so its tick leaves the words. The others keep a
   *  glyph, because a shape alone cannot say WHY something did not land. */
  const commit = (status: string, brief: string): string => {
    const done = status === "done";
    const mark = done ? "" : `${MARK[status] ?? MARK.open} `;
    return `  commit id: "${mark}${label(brief)}"${done ? " type: HIGHLIGHT" : ""}`;
  };

  for (const point of roots) {
    out.push(commit(point.status, point.brief));

    // Everything reported under this point, however deeply — the graph shows
    // ONE branch per point, because a branch per nesting level draws a
    // staircase nobody can read.
    const told: DecisionNode[] = [];
    const gather = (id: string): void => {
      for (const k of (children.get(id) ?? []).slice().sort(byTime)) {
        told.push(k);
        gather(k.id);
      }
    };
    gather(point.id);
    if (told.length === 0) continue;

    const branch = token(point.id);
    out.push(`  branch ${branch}`);
    told.forEach((k, i) => {
      // The last one settled the point, so it wears the point's verdict. The
      // rest are the work, and stay plain.
      const last = i === told.length - 1;
      out.push(last ? commit(point.status, k.brief) : `  commit id: "${MARK.open} ${label(k.brief)}"`);
    });
    // NO MERGE. The branch is where the point was worked, not a detour that
    // came home, and a merge line would claim a return that never happened.
    out.push(`  checkout ${trunk}`);
  }
  return out.join("\n");
}

/** The frame-buffer page: one markdown file the details surface opens, with
 *  the graph in a fence VS Code renders itself. */
export function decisionsAsMarkdown(nodes: readonly DecisionNode[], heading: string, trunk = "the plan"): string {
  const open = nodes.filter((n) => n.status === "open").length;
  return [
    `# ${heading}`,
    "",
    `${nodes.length} points, ${open} still open.`,
    "",
    "```mermaid",
    decisionsAsGitGraph(nodes, trunk),
    "```",
    "",
  ].join("\n");
}
