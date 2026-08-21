// VS CODE'S EXTENSION REGISTRY, WRITTEN SO IT CANNOT DESTROY WHAT IT FINDS.
//
// A linked extension folder is NOT discovered on its own. VS Code loads what
// its own registry lists, `~/.vscode/extensions/extensions.json`, so an
// installer that links a folder must add an entry beside it.
//
// THAT FILE HOLDS EVERY EXTENSION THE PERSON HAS. One element VS Code cannot
// read makes it reject the whole file, and the person sees every extension
// uninstall itself at once. The rules below exist only to make that
// impossible — see software.md#a-file-another-program-owns for the failure
// that taught them.
//
// THREE RULES, AND EACH ONE ANSWERS A MEASURED BREAK.
//
// - An element with no `identifier.id` is DROPPED, never carried. Carrying it
//   makes the damage permanent: every later run writes it back.
// - The output is ALWAYS a JSON array. A writer that emits an object when the
//   list happens to hold one entry breaks a machine that has no other
//   extension.
// - A write that would lose an id is ROLLED BACK. Verifying only that our own
//   entry arrived passes while every other extension is gone.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

export type Identifier = { id: string; uuid?: string };

/** One extension as VS Code records it. Unknown keys are carried verbatim,
 *  because the file belongs to VS Code and not to us. */
export type ExtensionEntry = { identifier: Identifier; [key: string]: unknown };

export type Upsert = {
  entries: ExtensionEntry[];
  /** The ids already there that this write must not lose. */
  carried: string[];
  /** Elements dropped because nothing could identify them. */
  dropped: number;
  /** Entries recovered from inside a wrapper a previous writer left behind. */
  unwrapped: number;
  /** Our own id was already listed, and this entry replaces it. */
  replaced: boolean;
  /** The file on disk was not JSON at all. */
  unreadable: boolean;
};

type Counts = { dropped: number; unwrapped: number };

/** Pull every readable entry out of whatever shape the file is in.
 *
 *  A healthy file is a flat array. A file an earlier writer reshaped can nest
 *  the real entries under a `value` key, which is what a PowerShell JSON
 *  round-trip produces for a collection inside a collection. Both are read;
 *  anything else is counted and left behind. */
function collect(node: unknown, out: ExtensionEntry[], counts: Counts): void {
  if (Array.isArray(node)) {
    for (const n of node) collect(n, out, counts);
    return;
  }
  if (node !== null && typeof node === "object") {
    const o = node as Record<string, unknown>;
    const ident = o.identifier as Identifier | undefined;
    if (ident && typeof ident.id === "string" && ident.id !== "") {
      out.push(o as ExtensionEntry);
      return;
    }
    if (Array.isArray(o.value)) {
      counts.unwrapped++;
      collect(o.value, out, counts);
      return;
    }
  }
  counts.dropped++;
}

/** The new list, given the file's current text and the entry to add. Pure:
 *  nothing is read or written here, so the decision can be tested alone. */
export function upsert(text: string | null, entry: ExtensionEntry): Upsert {
  const counts: Counts = { dropped: 0, unwrapped: 0 };
  let parsed: unknown = [];
  let unreadable = false;
  if (text !== null && text.trim() !== "") {
    try {
      parsed = JSON.parse(text);
    } catch {
      unreadable = true;
      parsed = [];
    }
  }

  const found: ExtensionEntry[] = [];
  collect(parsed, found, counts);

  const id = entry.identifier.id;
  const kept: ExtensionEntry[] = [];
  const ids = new Set<string>();
  let replaced = false;
  for (const e of found) {
    if (e.identifier.id === id) {
      replaced = true;
      continue;
    }
    // A REPEATED ID IS A BROKEN INSTALL, not two extensions. Keeping the first
    // is what VS Code does with a folder pair, and it keeps this write honest
    // about which ids it promises to preserve.
    if (ids.has(e.identifier.id)) continue;
    ids.add(e.identifier.id);
    kept.push(e);
  }

  return {
    entries: [...kept, entry],
    carried: [...ids],
    dropped: counts.dropped,
    unwrapped: counts.unwrapped,
    replaced,
    unreadable,
  };
}

/** What is wrong with a registry file, in the terms VS Code judges it by. An
 *  empty list means the file is fit to load. */
export function problemsIn(text: string, mustContain: string[]): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return [`the file is not JSON: ${(e as Error).message}`];
  }
  if (!Array.isArray(parsed)) {
    return ["the file is not a JSON array, and VS Code rejects every entry when the top level is not one"];
  }
  const problems: string[] = [];
  const ids = new Set<string>();
  for (let i = 0; i < parsed.length; i++) {
    const ident = (parsed[i] as { identifier?: Identifier } | null)?.identifier;
    if (!ident || typeof ident.id !== "string" || ident.id === "") {
      problems.push(`entry ${i} carries no identifier.id, which makes VS Code reject the whole file`);
      continue;
    }
    ids.add(ident.id);
  }
  for (const id of mustContain) {
    if (!ids.has(id)) problems.push(`${id} is missing from the file this write would leave behind`);
  }
  return problems;
}

/** The entry for an extension folder, in the shape VS Code writes for itself.
 *  `dir` is the folder inside the extensions directory, linked or copied. */
export function entryFor(dir: string, pkg: { name: string; publisher: string; version: string }, installedAt: number): ExtensionEntry {
  return {
    identifier: { id: `${pkg.publisher}.${pkg.name}` },
    version: pkg.version,
    location: { $mid: 1, path: `/${dir.replace(/\\/g, "/")}`, scheme: "file" },
    relativeLocation: basename(dir),
    metadata: { installedTimestamp: installedAt, source: "vsix" },
  };
}

export type WriteReport = {
  registry: string;
  carried: string[];
  dropped: number;
  unwrapped: number;
  replaced: boolean;
  unreadable: boolean;
  /** The previous file, always kept. */
  backup: string | null;
  /** The previous file kept under its own name, because it was damaged. */
  rescued: string | null;
};

/** Add the entry to the registry, or leave the registry exactly as it was.
 *
 *  There is no third outcome. The write is read back and judged before this
 *  returns, and a file that fails the judgement is replaced by the one that
 *  was there before. */
export function writeRegistry(registry: string, entry: ExtensionEntry, stamp: string): WriteReport {
  const before = existsSync(registry) ? readFileSync(registry, "utf8") : null;
  const result = upsert(before, entry);

  let backup: string | null = null;
  let rescued: string | null = null;
  if (before !== null) {
    backup = `${registry}.bak`;
    writeFileSync(backup, before, "utf8");
    if (result.unreadable || result.dropped > 0 || result.unwrapped > 0) {
      rescued = `${registry}.broken-${stamp}`;
      writeFileSync(rescued, before, "utf8");
    }
  }

  writeFileSync(registry, JSON.stringify(result.entries), "utf8");

  const problems = problemsIn(readFileSync(registry, "utf8"), [...result.carried, entry.identifier.id]);
  if (problems.length > 0) {
    if (before !== null) writeFileSync(registry, before, "utf8");
    throw new Error(
      [
        "the extension registry was NOT changed, because the write would have broken it:",
        ...problems.map((p) => `  ${p}`),
        before === null ? "  nothing was there before, so nothing was restored" : `  the file was restored from ${backup}`,
      ].join("\n"),
    );
  }

  return {
    registry,
    carried: result.carried,
    dropped: result.dropped,
    unwrapped: result.unwrapped,
    replaced: result.replaced,
    unreadable: result.unreadable,
    backup,
    rescued,
  };
}
