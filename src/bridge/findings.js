// Every finding the battery's rules answer over the tree, past the tests and
// past the rules the tree's own language server holds. The check reads this
// list, and the server hands it to that language server, so the problems panel
// and the battery read one list. The server restarts when this code moves.
// [[spec/design_output/lsp]]

import {
  CONFIG_DIR,
  fromJson as codeRows,
} from "../../.claude/skills/level0/lib/code.js";
import { SCHEMA } from "../../.claude/skills/level0/lib/config.js";
import { codeFaults } from "../../.claude/skills/level0/lib/magic.js";
import { isDraft } from "../../.claude/skills/level0/lib/paths.js";
import { SIZED } from "../../.claude/skills/level0/lib/size.js";
import { stopFolderIsData, treeOf } from "../../.claude/skills/level0/lib/tree.js";
import { faultIn, fromJson, unreasoned } from "../../.claude/skills/level0/lib/vale.js";
import { withoutFalsePast } from "../engine/tense.js";
import { whereIs } from "../engine/tools.js";
import {
  faultsIn as faultsInGrid,
  RULE as GRID,
  lineOf,
} from "../extension/lib/grid.js";
import { assemble } from "../scripts/styles.js";

// The folders no rule reads: the private folder, the packages, git, and a draft under an underscore. [[spec/design_output/tree#the-tree-handed-in]]
export const PARKED = [
  "{.se,node_modules,.git,.claude/types,.claude/worktrees}/**",
  "**/_*",
];
export const OURS = `--glob=!{${PARKED.join(",")}}`;
const SKIP = new Set([".git", "node_modules", ".se", ".claude", ".claude-plugin"]);
const PROSE = /\.(md|markdown|txt)$/i;
const WHOLE = ".";

// Which front draws a finding in the editor already, so the panel draws each once. [[spec/design_output/lsp]]
export const FROM = { vale: "vale", biome: "biome", tree: "tree" };

// Answers every finding over the paths named, and the fault that stops Vale reading. [[spec/design_output/lsp]]
export async function findingsOver(it, asked) {
  // A path the disk no longer holds carries no finding, so no source reads it. [[spec/design_output/level0#a-crash-writes-its-error]]
  const where = asked.filter(
    (one) => one === WHOLE || it.disk.exists(it.join(it.root, one)),
  );
  if (!where.length) return { found: [], fault: "" };
  const ran = await it.proc.start([...valeArgvOf(it), OURS, ...where], {
    cwd: it.root,
  });
  const fault =
    faultIn(ran.stdout) ||
    (ran.exitCode !== 0 && !ran.stdout ? String(ran.stderr ?? "").trim() : "");
  if (fault) return { found: [], fault };

  const rows = new Map();
  for (const one of fromJson(ran.stdout)) {
    const file = showOf(it, one.file);
    rows.set(file, [...(rows.get(file) ?? []), one]);
  }
  const found = [];
  // The pull reads its ticket through readsText too, so both name one list. [[spec/design_output/pull#the-voice-reads-the-evidence]]
  for (const file of walkOver(it, where)) {
    const shown = showOf(it, file);
    found.push(...readsText(it, shown, it.disk.read(file), rows.get(shown) ?? []));
    rows.delete(shown);
  }
  // Vale reads a file the walk passes, and the tense reader alone reads its rows. [[spec/design_output/level0#the-tense-reader]]
  const rest = readThrough(it, [...rows.values()].flat());
  found.push(...rest.map((one) => from(one, FROM.vale)));
  // The check names what stands past a ceiling as a warning, and the write door refuses the growth. [[spec/design_output/level0#the-size-ceiling]]
  for (const file of walkOver(it, where, SIZED)) {
    for (const one of codeFaults(it.disk.read(file), showOf(it, file), it.ceilings)) {
      found.push(from(one, FROM.tree));
    }
  }
  if (where.includes(WHOLE)) {
    const tree = treeOf({ disk: it.disk, root: it.root });
    found.push(...stopFolderIsData(tree).map((one) => from(one, FROM.tree)));
  }
  found.push(...gridOver(it, where).map((one) => from(one, FROM.tree)));
  if (it.biome)
    found.push(...(await biomeOver(it, where)).map((one) => from(one, FROM.biome)));
  return { found, fault: "" };
}

// A closed ticket is history, and no rule reads it, the way isHistory in src/lsp/history.go reads it. [[spec/design_output/lsp#a-closed-ticket-is-history]]
// A closed ticket stands as history, so neither the check nor the write door reads it against the schema. [[spec/tickets/a-closed-ticket-takes-writes]]
export function standsClosed(text) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(String(text ?? ""))?.[1] ?? "";
  return /^state:\s*closed\s*$/m.test(front);
}

export function pastHistory(it, found) {
  const history = new Map();
  const isHistory = (file) => {
    const shown = showOf(it, file ?? "");
    if (!/^spec\/tickets\/.*\.md$/.test(shown)) return false;
    if (!history.has(shown)) {
      const at = it.join(it.root, shown);
      history.set(shown, standsClosed(it.disk.exists(at) ? it.disk.read(at) : ""));
    }
    return history.get(shown);
  };
  return found.filter((one) => !isHistory(one.file));
}

// The rules the language server holds nowhere yet, which the lint lays beside the server's list. [[spec/design_output/lsp#a-port-serves-the-list]]
export function aloneOver(it, asked) {
  const where = asked.filter(
    (one) => one === WHOLE || it.disk.exists(it.join(it.root, one)),
  );
  const found = [];
  for (const file of walkOver(it, where)) {
    const shown = showOf(it, file);
    for (const one of unreasoned(it.disk.read(file)))
      found.push(from({ ...one, file: shown }, FROM.tree));
  }
  if (where.includes(WHOLE)) {
    const tree = treeOf({ disk: it.disk, root: it.root });
    found.push(...stopFolderIsData(tree).map((one) => from(one, FROM.tree)));
  }
  found.push(...gridOver(it, where).map((one) => from(one, FROM.tree)));
  return pastHistory(it, found);
}

// One guard answers both fronts, because a tool standing nowhere is no tool. [[spec/design_output/lsp#one-checker-every-front-asks]]
export function biomeFor(files, root, known) {
  const at = whereIs(files, root, "biome", known);
  return files.exists(at) ? at : "";
}

// The levels that refuse a write, the ones the lint names. [[spec/design_output/pull#the-voice-reads-the-evidence]]
export const REFUSES = new Set(["error", "warning"]);

// A ticket's text held in memory, read the way the lint reads its file: the lint's Vale call with the text on stdin, then readsText. It keeps what refuses on the lines the caller names. The pull, the open, the note and the retro's mint read here. [[spec/design_output/pull#the-voice-reads-the-evidence]]
export function voiceOver(it, path, text, span = {}) {
  if (!it.vale || !String(text ?? "").trim()) return [];
  let ran;
  try {
    ran = it.proc.run([...valeArgvOf(it), `--path=${path}`], {
      stdin: text,
      cwd: it.root,
    });
  } catch {
    return [];
  }
  if (faultIn(ran.stdout)) return [];
  const first = span.first ?? 1;
  const last = span.last ?? Number.POSITIVE_INFINITY;
  return readsText(it, path, text, fromJson(ran.stdout)).filter(
    (fault) => REFUSES.has(fault.severity) && fault.line >= first && fault.line <= last,
  );
}

// The Vale call the lint and the pull share, on the config the assembly writes. A caller adds the paths or the stdin path. [[spec/design_output/pull#the-voice-reads-the-evidence]]
export function valeArgvOf(it) {
  return [it.vale, `--config=${configOf(it)}`, "--output=JSON", "--no-exit"];
}

// One file's reading past Vale: the tense reader over Vale's rows, then every marker naming no reason. The lint and the pull both read a file here. [[spec/design_output/pull#the-voice-reads-the-evidence]]
export function readsText(it, file, text, rows) {
  return [
    ...withoutFalsePast(text, rows).map((one) => from(one, FROM.vale)),
    ...unreasoned(text).map((one) =>
      from({ ...one, file: showOf(it, file) }, FROM.tree),
    ),
  ];
}

// Every road hands Vale the config the assembly writes over the pair of roots, so a project's own rule reads here as it does at the door. [[spec/design_output/vehicle#the-styles-assemble-once]]
function configOf(it) {
  const method = it.method ?? it.root;
  const work = it.work ?? it.root;
  return assemble(it.disk, { method, work, itself: method === work }).config;
}

// What a reading names, sorted, so a case holds one front's list against the other's. [[spec/design_output/lsp#one-checker-every-front-asks]]
export function linesNamed(found) {
  return [...(found ?? [])]
    .map((one) => `${one.file ?? ""}:${one.line}:${one.rule}`)
    .sort();
}

function from(one, source) {
  return { ...one, source };
}

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

// [[spec/design_output/level0#the-tense-reader]]
export function readThrough(it, found) {
  const byFile = new Map();
  for (const one of found) {
    byFile.set(one.file, [...(byFile.get(one.file) ?? []), one]);
  }
  const kept = [];
  for (const [file, list] of byFile) {
    let text = "";
    try {
      text = it.disk.read(it.join(it.root, file));
    } catch {}
    kept.push(...withoutFalsePast(text, list));
  }
  return kept;
}

// [[spec/design_output/extension#the-grid-check]]
function gridOver(it, where) {
  const at = it.join(it.root, SCHEMA);
  const reaches = where.some((one) =>
    SCHEMA.startsWith(showOf(it, it.join(it.root, one))),
  );
  if (!reaches || !it.disk.exists(at)) return [];
  const text = it.disk.read(at);
  return faultsInGrid(JSON.parse(text)).map((one) => ({
    file: SCHEMA,
    rule: GRID,
    line: lineOf(text, one.key),
    column: 1,
    message: one.why,
    severity: "error",
  }));
}

async function biomeOver(it, where) {
  const code = await it.proc.start(
    [
      it.biome,
      "lint",
      `--config-path=${CONFIG_DIR}`,
      "--reporter=json",
      "--max-diagnostics=none",
      ...where,
    ],
    { cwd: it.root },
  );
  return codeRows(code.stdout, where[0]).filter((one) => !isDraft(one.file));
}
