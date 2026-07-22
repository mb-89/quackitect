// se.deliverable — the realization lane. The agent never opens product/
// directly; it lists, reads, patches and writes deliverable files through
// here. Every write is CAS-guarded (§8: the write carries its own
// precondition), so a human edit can never be clobbered.
//
// "Deliverable", not "code": code is one realization kind among several
// (owner ruling — CAD, drawings, procedures may follow).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { Rejection } from "./errors.ts";
import { sha256 } from "./hash.ts";
import { layout } from "./layout.ts";

const SRC = "engine/deliverable.ts";

/** Resolve a deliverable-relative path; refuse escapes (SE-C-060). */
function resolveInside(root: string, path: string): string {
  const base = resolve(layout.deliverable(root));
  const abs = resolve(base, path);
  if (abs !== base && !abs.startsWith(base + sep)) {
    throw new Rejection({
      clause: "SE-C-060",
      expected: "a path inside product/deliverable",
      got: path,
      remedy: {
        tool: "se.deliverable.list",
        args: { glob: "**" },
        note: "paths are relative to the deliverable root; the ledger has its own lane (se.set.apply)",
      },
      source: SRC,
    });
  }
  return abs;
}

export function listDeliverable(root: string, dir = "."): { path: string; kind: "file" | "dir" }[] {
  const abs = resolveInside(root, dir);
  if (!existsSync(abs)) {
    throw new Rejection({
      clause: "SE-C-061",
      expected: "an existing directory",
      got: dir,
      remedy: { tool: "se.deliverable.list", args: { dir: "." }, note: "start at the deliverable root" },
      source: SRC,
    });
  }
  const base = resolve(layout.deliverable(root));
  return readdirSync(abs, { withFileTypes: true })
    .filter((e) => e.name !== "node_modules" && !e.name.startsWith("."))
    .map((e) => ({
      path: relative(base, join(abs, e.name)).replaceAll(sep, "/"),
      kind: e.isDirectory() ? ("dir" as const) : ("file" as const),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export interface DeliverableFile {
  path: string;
  hash: string;
  content: string;
}

export function readDeliverable(root: string, path: string): DeliverableFile {
  const abs = resolveInside(root, path);
  if (!existsSync(abs)) {
    throw new Rejection({
      clause: "SE-C-061",
      expected: "an existing deliverable file",
      got: path,
      remedy: { tool: "se.deliverable.list", args: { dir: dirname(path) }, note: "list first; paths are deliverable-relative" },
      source: SRC,
    });
  }
  const content = readFileSync(abs, "utf8");
  return { path, hash: sha256(content), content };
}

/**
 * Whole-file write. base_hash is the CAS precondition: null claims the file
 * is new; otherwise it must match the current disk hash.
 */
export function writeDeliverable(root: string, path: string, content: string, baseHash: string | null): DeliverableFile {
  const abs = resolveInside(root, path);
  const exists = existsSync(abs);
  if (baseHash === null && exists) {
    throw new Rejection({
      clause: "SE-C-062",
      expected: "a fresh path for base_hash: null",
      got: `${path} already exists`,
      remedy: { tool: "se.deliverable.read", args: { path }, note: "read it, then write with its hash as base_hash" },
      source: SRC,
    });
  }
  if (baseHash !== null) {
    if (!exists) {
      throw new Rejection({
        clause: "SE-C-061",
        expected: "an existing file for a hash-guarded write",
        got: path,
        remedy: { tool: "se.deliverable.write", args: { path, content: "<content>", base_hash: null }, note: "create it with base_hash: null" },
        source: SRC,
      });
    }
    const onDisk = sha256(readFileSync(abs, "utf8"));
    if (onDisk !== baseHash) {
      throw new Rejection({
        clause: "SE-C-063",
        expected: `disk hash ${baseHash}`,
        got: onDisk,
        remedy: { tool: "se.deliverable.read", args: { path }, note: "the file moved underneath you; re-read and re-apply your change" },
        source: SRC,
      });
    }
  }
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, "utf8");
  return { path, hash: sha256(content), content: "" };
}

/**
 * Exact-match patch: old_string must occur exactly once. The match is the
 * precondition, so no base_hash is needed; pass one to double-guard.
 */
export function patchDeliverable(
  root: string,
  path: string,
  oldString: string,
  newString: string,
  baseHash?: string,
): DeliverableFile {
  const current = readDeliverable(root, path);
  if (baseHash !== undefined && baseHash !== current.hash) {
    throw new Rejection({
      clause: "SE-C-063",
      expected: `disk hash ${baseHash}`,
      got: current.hash,
      remedy: { tool: "se.deliverable.read", args: { path }, note: "re-read, then re-send the patch" },
      source: SRC,
    });
  }
  const count = current.content.split(oldString).length - 1;
  if (count !== 1) {
    throw new Rejection({
      clause: "SE-C-064",
      expected: "old_string occurring exactly once",
      got: `${count} occurrences in ${path}`,
      remedy: {
        tool: "se.deliverable.patch",
        args: { path, old_string: "<longer, unique excerpt>", new_string: newString },
        note: count === 0 ? "not found — re-read the file, the text may have changed" : "add surrounding lines until the match is unique",
      },
      source: SRC,
    });
  }
  const next = current.content.replace(oldString, newString);
  writeFileSync(resolveInside(root, path), next, "utf8");
  return { path, hash: sha256(next), content: "" };
}
