// THE PULL — the machine gathers the guidance relevant to a state and
// serves it as a DERIVED field (`pulled`), never authored on the note.
// Frontmatter only, four rules, each rule IS the source label:
//   root         a doc directly in product/guidance/ applies always
//                (applies: always does the same for deeper docs)
//   applies_to   the doc names its targets: state ids, machine/*, kind: x
//   tag: <t>     the doc's tags intersect the state's tags
//   read         the state's own read arguments (entry/exit conditions)
// A doc pulled by several rules appears once, with every source listed.
// Pulling is VISIBILITY — it never gates; only conditions gate.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { contentHash } from "./hash.ts";
import { parseStateNote } from "./notes.ts";
import { type MachineDecl, type StateDecl } from "./machine.ts";

export interface GuidanceDoc {
  /** Root-relative path, forward slashes. */
  path: string;
  hash: string;
  applies?: string;
  applies_to: string[];
  tags: string[];
}

export interface PulledDoc {
  path: string;
  hash: string;
  sources: string[];
}

export function guidanceDir(root: string): string {
  return join(root, "product", "guidance");
}

function list(v: unknown): string[] {
  return typeof v === "string" && v !== ""
    ? v.split(",").map((s) => s.trim()).filter((s) => s !== "")
    : [];
}

/** Scan the guidance tree — frontmatter only, prose never parsed. */
export function scanGuidance(root: string): GuidanceDoc[] {
  const dir = guidanceDir(root);
  if (!existsSync(dir)) return [];
  const out: GuidanceDoc[] = [];
  const walk = (d: string): void => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const abs = join(d, e.name);
      if (e.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!e.name.endsWith(".md")) continue;
      const raw = readFileSync(abs, "utf8");
      const note = parseStateNote(raw);
      const fm = note.frontmatter;
      out.push({
        path: relative(root, abs).split(sep).join("/"),
        hash: contentHash(raw),
        ...(typeof fm.applies === "string" ? { applies: fm.applies } : {}),
        applies_to: list(fm.applies_to),
        tags: list(fm.tags),
      });
    }
  };
  walk(dir);
  out.sort((a, b) => a.path.localeCompare(b.path));
  return out;
}

function matchesSelector(sel: string, machineId: string, s: StateDecl): boolean {
  if (sel === s.id || sel === `${machineId}/${s.id}`) return true;
  if (sel === `${machineId}/*`) return true;
  if (sel.startsWith("kind:") && sel.slice(5).trim() === s.kind) return true;
  return false;
}

export function pulledFor(root: string, docs: GuidanceDoc[], m: MachineDecl, s: StateDecl): PulledDoc[] {
  const byPath = new Map<string, PulledDoc>();
  const add = (path: string, hash: string, source: string): void => {
    const cur = byPath.get(path);
    if (cur === undefined) byPath.set(path, { path, hash, sources: [source] });
    else if (!cur.sources.includes(source)) cur.sources.push(source);
  };
  const rootDir = guidanceDir(root);
  for (const d of docs) {
    const isRoot = dirname(join(root, d.path)) === rootDir;
    if (isRoot) add(d.path, d.hash, "root");
    else if (d.applies === "always") add(d.path, d.hash, "applies: always");
    if (d.applies_to.some((sel) => matchesSelector(sel, m.id, s))) add(d.path, d.hash, "applies_to");
    for (const t of d.tags) {
      if ((s.tags ?? []).includes(t)) add(d.path, d.hash, `tag: ${t}`);
    }
  }
  // The state's own read arguments — guidance or not, they belong in the list.
  for (const dict of [s.entry, s.exit]) {
    for (const p of dict?.read ?? []) {
      const doc = docs.find((d) => d.path === p);
      add(p, doc?.hash ?? "", "read");
    }
  }
  return [...byPath.values()];
}
