// Vale's rows over the paths a lint asks, each file's rows kept under its
// content hash, so a lint after a small change hands Vale the changed files
// alone and answers what a run over every file answers.
// [[spec/tickets/the-check-runs-fast-again]]

import { dirname } from "node:path";
import { RUN } from "../../.claude/skills/level0/lib/folders.js";
import { faultIn } from "../../.claude/skills/level0/lib/vale.js";

// Where the lint keeps the rows it read. [[spec/tickets/the-check-runs-fast-again]]
export const CACHE = `${RUN}/vale-rows.json`;
// Past this many changed files, or past this many characters of their names, Vale walks the paths asked itself, so a cold box and a Windows command line read the way a walk reads them. [[spec/tickets/the-check-runs-fast-again]]
export const NAMED_MOST = 200;
export const ARGV_MOST = 20000;
// The folders Vale's glob parks at any depth, the way PARKED in findings.js names them. [[spec/design_output/tree#the-tree-handed-in]]
const PARKED = new Set([".se", "node_modules", ".git"]);
const PARKED_UNDER = [
  ".claude/types",
  ".claude/skills/level0/.claude-plugin/types",
  ".claude/worktrees",
];
const WHOLE = ".";

// Vale's answer over the paths asked, as Vale prints it: the rows kept for each file unchanged, and a run over the rest. [[spec/tickets/the-check-runs-fast-again]]
export async function valeRowsOver(it, argv, where) {
  const at = it.join(it.root, ...CACHE.split("/"));
  const files = filesUnder(it, where);
  const key = configKey(it, argv);
  const held = heldAt(it, at, key);
  const hashes = new Map(files.map((one) => [one, hashOf(it, one)]));
  const missed = files.filter((one) => held[one]?.hash !== hashes.get(one));
  let fresh = {};
  let whole = false;
  if (missed.length) {
    whole = !namesFit(missed);
    const ran = await it.proc.start([...argv, ...(whole ? where : missed)], {
      cwd: it.root,
    });
    if (faultIn(ran.stdout) || (ran.exitCode !== 0 && !ran.stdout)) return ran;
    fresh = byFile(it, ran.stdout);
  }
  const out = {};
  const kept = where.includes(WHOLE) ? {} : { ...held };
  for (const one of files) {
    const read = whole || missed.includes(one);
    const rows = read ? (fresh[one] ?? []) : held[one].rows;
    kept[one] = { hash: hashes.get(one), rows };
    if (rows.length) out[one] = rows;
  }
  it.disk.makeDir(dirname(at));
  it.disk.write(at, JSON.stringify({ key, files: kept }));
  return { exitCode: 0, stdout: JSON.stringify(out), stderr: "" };
}

// The changed files go to Vale by name while their names stay short. [[spec/tickets/the-check-runs-fast-again]]
export function namesFit(names) {
  return names.length <= NAMED_MOST && names.join(" ").length <= ARGV_MOST;
}

// A path Vale's glob parks: a parked folder at any depth, a draft under an underscore, or a folder under .claude a box writes. [[spec/design_output/tree#the-tree-handed-in]]
export function parked(path) {
  const parts = path.split("/");
  if (parts.some((one) => PARKED.has(one) || one.startsWith("_"))) return true;
  return PARKED_UNDER.some((one) => path === one || path.startsWith(`${one}/`));
}

// Every file under the paths asked that Vale's walk reaches, named from the root. [[spec/tickets/the-check-runs-fast-again]]
export function filesUnder(it, where) {
  const out = new Set();
  const into = (rel) => {
    const path = rel === WHOLE ? it.root : it.join(it.root, ...rel.split("/"));
    let entries;
    try {
      entries = it.disk.list(path);
    } catch {
      if (rel !== WHOLE && !parked(rel)) out.add(rel);
      return;
    }
    for (const one of entries) {
      const next = rel === WHOLE ? one.name : `${rel}/${one.name}`;
      if (parked(next)) continue;
      if (one.kind === "dir") into(next);
      else out.add(next);
    }
  };
  for (const one of where) {
    const rel = fromRoot(it, one);
    if (rel === WHOLE || it.disk.exists(it.join(it.root, ...rel.split("/")))) into(rel);
  }
  return [...out].sort();
}

// The key the rows stand under: the config, every file of the styles it names, and the Vale binary, so a changed rule reads every file again. [[spec/tickets/the-check-runs-fast-again]]
export function configKey(it, argv) {
  const config = String(argv.find((one) => String(one).startsWith("--config=")) ?? "");
  const path = it.join(it.root, ...config.slice("--config=".length).split("/"));
  const parts = [`vale ${binaryOf(it, argv[0])}`];
  if (!it.disk.exists(path)) return parts.join("\n");
  parts.push(`config ${it.disk.hash(path)}`);
  const styles = /^StylesPath\s*=\s*(.+)$/m.exec(it.disk.read(path))?.[1]?.trim();
  if (styles) {
    const under = it.join(dirname(path), ...styles.split("/"));
    for (const one of filesIn(it, under))
      parts.push(`${one} ${it.disk.hash(it.join(under, one))}`);
  }
  return parts.join("\n");
}

function binaryOf(it, bin) {
  try {
    return `${it.disk.size(bin)} ${it.disk.modified(bin)}`;
  } catch {
    return String(bin);
  }
}

function filesIn(it, at, rel = "") {
  const out = [];
  let entries = [];
  try {
    entries = it.disk.list(rel ? it.join(at, ...rel.split("/")) : at);
  } catch {
    return out;
  }
  for (const one of entries) {
    const next = rel ? `${rel}/${one.name}` : one.name;
    if (one.kind === "dir") out.push(...filesIn(it, at, next));
    else out.push(next);
  }
  return out.sort();
}

// The rows the cache holds under this key, or none where the key moved or the file reads broken. [[spec/tickets/the-check-runs-fast-again]]
function heldAt(it, at, key) {
  try {
    const held = JSON.parse(it.disk.read(at));
    return held?.key === key && held.files && typeof held.files === "object"
      ? held.files
      : {};
  } catch {
    return {};
  }
}

function hashOf(it, rel) {
  try {
    return it.disk.hash(it.join(it.root, ...rel.split("/")));
  } catch {
    return "";
  }
}

// Vale's JSON as rows a file, each file named from the root in forward slashes. [[spec/tickets/the-check-runs-fast-again]]
function byFile(it, stdout) {
  let read;
  try {
    read = JSON.parse(stdout || "{}");
  } catch {
    return {};
  }
  const out = {};
  for (const [file, rows] of Object.entries(read ?? {})) {
    if (Array.isArray(rows)) out[fromRoot(it, file)] = rows;
  }
  return out;
}

// A path named from the root in forward slashes, whether it arrives absolute or relative. [[spec/design_output/tree#the-tree-handed-in]]
function fromRoot(it, path) {
  const root = slashed(it.root);
  const said = slashed(path);
  if (said === root) return WHOLE;
  return said.startsWith(`${root}/`) ? said.slice(root.length + 1) : said;
}

function slashed(path) {
  const said = String(path).split("\\").join("/").replace(/^\.\//, "");
  return said.replace(/(.)\/+$/, "$1") || WHOLE;
}
