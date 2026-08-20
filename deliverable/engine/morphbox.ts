// see dsp-decision-mathematics.md#the-morphological-box

/** One option: a cell in its cluster's row. */
export interface MorphCell {
  id: string;
  /** The option's own statement — the mechanism, in one line. */
  label: string;
  /** Which of the seven finders turned it up, for the coverage read. */
  found_by: string;
  /** Why it is out of the chart, or "" while it stands. A pruned cell still
   *  SHOWS — the chart is the whole space, including what was struck — and no
   *  line may pass through it. */
  pruned: string;
}

/** One function cluster: a row, and every option anybody found for it. */
export interface MorphRow {
  id: string;
  name: string;
  cells: MorphCell[];
}

/** One candidate: the line across the box. */
export interface MorphLine {
  id: string;
  name: string;
  statement: string;
  /** The option ids it visits, one per row. */
  picks: string[];
}

export interface MorphBox {
  rows: MorphRow[];
  lines: MorphLine[];
}

/** see dsp-decision-mathematics.md#a-wiki-link-a-path-or-a-bare-id */
export function bare(v: string): string {
  const unquoted = v.trim().replace(/^["']/, "").replace(/["']$/, "");
  const t = unquoted.trim().replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
  const target = (t.split("|")[0] ?? "").trim();
  const last = target.replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? "";
  return last.replace(/\.md$/i, "").replace(/["']$/, "").trim();
}

/** The candidate ids named in a stored table, in file order.
 *
 *  IT DECIDES THE LINE ORDER, and the line order decides the colours. The
 *  palette re-spaces as lines are added, so the order has to be something a
 *  person controls — the file they can edit — rather than whatever order the
 *  trace happens to enumerate in. */
export function storedOrder(content: string): string[] {
  const out: string[] = [];
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t.startsWith("|")) continue;
    const first = bare(t.slice(1).split("|")[0] ?? "");
    if (first.startsWith("cand-") && !out.includes(first)) out.push(first);
  }
  return out;
}

/** The stored order first, then whatever the file has not caught up with.
 *
 *  A CANDIDATE THE FILE NEVER MENTIONS IS STILL DRAWN. The nodes are the
 *  truth; the table is a rendering, and a rendering that could hide a node
 *  would make the chart quietly incomplete. */
export function orderLines(cands: MorphLine[], order: string[]): MorphLine[] {
  const byId = new Map(cands.map((c) => [c.id, c]));
  const out: MorphLine[] = [];
  for (const id of order) {
    const hit = byId.get(id);
    if (hit !== undefined && !out.some((l) => l.id === id)) out.push(hit);
  }
  for (const c of cands) if (!out.some((l) => l.id === c.id)) out.push(c);
  return out;
}

/** see dsp-decision-mathematics.md#which-rows-a-line-has-not-visited-yet */
export function unvisited(box: MorphBox, line: MorphLine): string[] {
  const picked = new Set(line.picks);
  return box.rows.filter((r) => r.id !== "" && !r.cells.some((c) => picked.has(c.id))).map((r) => r.id);
}

/** One node the chart wants written, deleted or marked. */
export interface ChartPlan {
  /** Candidates to create or update, in table order. */
  write: { id: string; name: string; statement: string; picks: string[] }[];
  /** Candidate ids whose row left the table — their notes go with it. */
  remove: string[];
  /** Options struck out of the chart, with the reason to write on each. */
  prune: { id: string; why: string }[];
}

/** WHAT A SAVED CHART MEANS FOR THE NOTES, decided here and applied by the
 *  caller. Splitting it this way is what makes it testable without a session,
 *  and it keeps every file operation on one side of the line.
 *
 *  AN EMPTY TABLE REMOVES NOTHING. A form opened and saved before anything is
 *  drawn would otherwise wipe every candidate, which is a destructive act
 *  nobody asked for. */
export function chartPlan(content: string, known: string[]): ChartPlan {
  const write: ChartPlan["write"] = [];
  const prune: ChartPlan["prune"] = [];
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (t.startsWith("|")) {
      const cells = t
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split(/(?<!\\)\|/)
        .map((c) => c.trim());
      const id = bare(cells[0] ?? "");
      if (cells.length < 4 || !id.startsWith("cand-")) continue;
      const picks = (cells[3] ?? "")
        .split(/[·,]/)
        .map((p) => bare(p))
        .filter((p) => p !== "");
      if (!write.some((w) => w.id === id)) write.push({ id, name: cells[1] ?? "", statement: cells[2] ?? "", picks });
      continue;
    }
    // A PRUNE IS A DECISION WITH A REASON, and the reason lands on the OPTION
    // rather than on the chart — a reader of the note learns why it is out
    // without finding the form that struck it.
    const hit = /^- \[\[([^\]]+)\]\]\s+—\s+(.+)$/.exec(t);
    if (hit !== null) prune.push({ id: bare(hit[1]), why: hit[2].trim() });
  }
  const keep = new Set(write.map((w) => w.id));
  return { write, remove: write.length === 0 ? [] : known.filter((id) => !keep.has(id)), prune };
}

/** What the field stores: one row per line, in drawing order.
 *
 *  A RENDERING, exactly like the node table's. The nodes are the truth and
 *  this is rebuilt from them on every look, so a candidate edited in its own
 *  note wins over whatever the file happens to hold. */
export function boxTable(box: MorphBox): string {
  const lines = ["| candidate | name | what it is | visits |", "| --- | --- | --- | --- |"];
  for (const l of box.lines) {
    lines.push(`| [[${l.id}]] | ${l.name} | ${l.statement} | ${l.picks.map((p) => `[[${p}]]`).join(" · ")} |`);
  }
  return lines.join("\n");
}

// THE PALETTE IS NOT HERE, deliberately. It lives once, in the editor's own
// behaviour source (editors/morph-box.ts, sfmbPen), because that is the only
// place that needs it. A second copy in TypeScript would be a second opinion
// about what colour line three is, and the two would drift.
