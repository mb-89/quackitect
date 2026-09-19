// Every finding the battery's rules answer over the tree, past the tests and
// past the rules the tree's own language server holds. The check reads this
// list, and the server hands it to that language server, so the problems panel
// and the battery read one list. The server restarts when this code moves.
// [[spec/design_output/lsp]]

import { join } from "node:path";
import {
  CONFIG_DIR,
  fromJson as codeRows,
} from "../../.claude/skills/level0/lib/code.js";
import { SCHEMA } from "../../.claude/skills/level0/lib/config.js";
import { codeFaults } from "../../.claude/skills/level0/lib/magic.js";
import { isDraft } from "../../.claude/skills/level0/lib/paths.js";
import { SIZED } from "../../.claude/skills/level0/lib/size.js";
import { stopFolderIsData, treeOf } from "../../.claude/skills/level0/lib/tree.js";
import {
  CONFIG,
  faultIn,
  fromJson,
  unreasoned,
} from "../../.claude/skills/level0/lib/vale.js";
import {
  faultsIn as faultsInGrid,
  RULE as GRID,
  lineOf,
} from "../extension/lib/grid.js";
import { readTools, whereIs } from "../scripts/tools.js";
import { asks } from "./config.js";
import { withoutFalsePast } from "./tense.js";

// The folders no rule reads: the private folder, the packages, git, and a draft under an underscore. [[spec/design_output/tree#the-reader]]
export const PARKED = [
  "{.se,node_modules,.git,.claude/types,.claude/worktrees}/**",
  "**/_*",
];
export const OURS = `--glob=!{${PARKED.join(",")}}`;
const SKIP = new Set([".git", "node_modules", ".se", ".claude", ".claude-plugin"]);
const PROSE = /\.(md|markdown|txt)$/i;
const WHOLE = ".";
// The route the language server asks, spelled again in src/lsp/bridge.go because a Go module imports no JavaScript. [[spec/design_output/lsp]]
export const FINDINGS = "/findings";

// Which front draws a finding in the editor already, so the panel draws each once. [[spec/design_output/lsp]]
export const FROM = { vale: "vale", biome: "biome", tree: "tree" };

// Answers every finding over the paths named, and the fault that stops Vale reading. [[spec/design_output/lsp]]
export async function findingsOver(it, where) {
  const ran = await it.proc.start(
    [it.vale, `--config=${CONFIG}`, "--output=JSON", "--no-exit", OURS, ...where],
    { cwd: it.root },
  );
  const fault =
    faultIn(ran.stdout) ||
    (ran.exitCode !== 0 && !ran.stdout ? String(ran.stderr ?? "").trim() : "");
  if (fault) return { found: [], fault };

  const found = readThrough(it, fromJson(ran.stdout)).map((one) =>
    from(one, FROM.vale),
  );
  for (const file of walkOver(it, where)) {
    for (const one of unreasoned(it.disk.read(file))) {
      found.push(from({ ...one, file: showOf(it, file) }, FROM.tree));
    }
  }
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

// The server's answer to GET /findings, over the paths the query names or the whole tree. [[spec/design_output/lsp]]
export async function findingsFor(box, url) {
  const asked = new URL(String(url), "http://here").searchParams.getAll("path");
  const known = readTools(box.disk, box.method);
  const got = await findingsOver(
    {
      disk: box.disk,
      proc: box.proc,
      join,
      root: box.method,
      vale: whereIs(box.disk, box.method, "vale", known),
      biome: whereIs(box.disk, box.method, "biome", known),
      ceilings: {
        function: asks(box, "code.functionLines"),
        file: asks(box, "code.fileLines"),
      },
    },
    asked.length ? asked : [WHOLE],
  );
  return { ok: !got.fault, found: got.found, fault: got.fault };
}

function from(one, source) {
  return { ...one, source };
}

// [[spec/design_output/tree#the-reader]]
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
    try {
      into(path);
    } catch {
      if (wanted.test(path)) out.push(path);
    }
  }
  return out;
}

// A path reads relative to the root in forward slashes, whichever slash either one arrives in. [[spec/design_output/tree#the-reader]]
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
