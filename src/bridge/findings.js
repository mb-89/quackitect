// The walk every reader of the tree's prose shares: the folders no rule reads,
// the files under a path, a path as the reader names it, a closed ticket read
// as history, and the levels that refuse a write.
// [[spec/design_output/lsp]] [[spec/tickets/vale-leaves-the-tree]]

import { isDraft } from "../../.claude/skills/level0/lib/paths.js";

// The folders no rule reads: the private folder, the packages, git, and a draft under an underscore. [[spec/design_output/tree#the-tree-handed-in]]
export const PARKED = [
  "{.se,node_modules,.git,.claude/types,.claude/worktrees}/**",
  "**/_*",
];
export const OURS = `--glob=!{${PARKED.join(",")}}`;
const SKIP = new Set([".git", "node_modules", ".se", ".claude", ".claude-plugin"]);
const PROSE = /\.(md|markdown|txt)$/i;

// A closed ticket stands as history, so neither the check nor the write door reads it against the schema. [[spec/tickets/a-closed-ticket-takes-writes]]
export function standsClosed(text) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(text ?? ""))?.[1] ?? "";
  return /^state:\s*closed\s*$/m.test(front);
}

// The levels that refuse a write, the ones the lint names. [[spec/design_output/pull#the-voice-reads-the-evidence]]
export const REFUSES = new Set(["error", "warning"]);

// [[spec/design_output/tree#the-tree-handed-in]]
export function walkOver(it, where, wanted = PROSE) {
  const out = [];
  const into = (path) => {
    for (const entry of it.disk.list(path)) {
      if (SKIP.has(entry.name) || isDraft(entry.name)) continue;
      const under = it.join(path, entry.name);
      if (entry.kind === "dir") into(under);
      else if (wanted.test(entry.name)) out.push(under);
    }
  };
  for (const one of where) {
    const path = it.join(it.root, one);
    // A path the disk no longer holds carries no finding, so the walk passes it. [[spec/design_output/level0#a-crash-writes-its-error]]
    if (!it.disk.exists(path)) continue;
    try {
      into(path);
    } catch {
      if (wanted.test(path)) out.push(path);
    }
  }
  return out;
}

// A path reads relative to the root in forward slashes, whichever slash either one arrives in. [[spec/design_output/tree#the-tree-handed-in]]
export function showOf(it, file) {
  const path = String(file).split("\\").join("/");
  const root = String(it.root).split("\\").join("/").replace(/\/+$/, "");
  if (path === root) return "";
  return path.startsWith(`${root}/`) ? path.slice(root.length + 1) : path;
}
