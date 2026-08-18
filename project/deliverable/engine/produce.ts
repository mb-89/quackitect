// THE TWO PRODUCING ACTS (dsp-the-producing-acts, el-vehicle-producer,
// el-project-producer).
//
// ONE MECHANISM SEEN TWICE. Both take a destination somebody named, refuse if
// it is occupied, write a whole tree into it, write one small file saying what
// the tree is, and make one commit. The difference is the last file and
// nothing else.
//
//   A VEHICLE gets an upstream file naming the engine it came from.
//   A DRIVEN PROJECT gets a record naming which vehicle drives it.
//
// COPY, NEVER CLONE (raid-dec-a-vehicle-is-a-copy-with-a-one-way-upstream-link,
// on the owner's ruling of 2026-08-18: "You can still git init it and make an
// initial commit. That's okay. But it shouldn't point back to the original.").
// A clone had to be filtered — the history came along and the remote had to be
// considered. A copy starts empty and nothing has to be stripped.
//
// AND IT IS BOUNDED BY WHAT IT PRODUCES. The bound travels with the act, so
// the isolation guarantee is a property of the act rather than a rule somebody
// has to remember.

import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { withActBound } from "./actbound.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { SE_VERSION } from "./version.ts";

/** Names that never travel, wherever they appear in the tree.
 *
 *  `.git` RIDES THIS LIST AS A NAME because it is a directory in a normal
 *  checkout and a FILE in a worktree checkout. Missing the file case once made
 *  an export re-use the live repository, found in a smoke test. The copy makes
 *  its own repository from scratch now, so the guard is belt and braces rather
 *  than load-bearing — it stays because the failure it prevents is silent and
 *  the check is one line. */
const EXCLUDE_DIRS = new Set([
  ".git",
  ".worktrees",
  ".se",
  "node_modules",
  ".claude",
  ".copilot",
  "dist",
  ".obsidian",
  ".vscode",
  ".github",
  "scratchpad",
]);
const EXCLUDE_FILES = new Set([".git", ".mcp.json", "Thumbs.db", ".DS_Store"]);

/** The one path under an excluded `.github` that a produced tree cannot do
 *  without. It is the Copilot host's whole prompt layer. */
const PROMPT_LAYER_IN_GITHUB = join("project", ".github", "instructions", "protocol.instructions.md");

/** WHAT TRAVELS INTO A PRODUCED TREE.
 *
 *  ONE LIST, BECAUSE TWO LISTS DRIFT. package.ts's own comment said "the same
 *  list the export excludes" while they were in fact two, and the difference
 *  was 20.8 MB of the engine's own release archives travelling into every
 *  vehicle, plus the one file below that must NOT be dropped. Found by the i16
 *  tester on 2026-08-18, reading both lists side by side.
 *
 *  THE ROOT `.claude` IS THE ONE EXCEPTION, and it is the wire without which
 *  the arrival hook is dead weight (i35, 2026-08-17). `.claude` is excluded by
 *  name wherever it appears, which is right for `project/.claude` — that one is
 *  GENERATED, placed by the arrival or the editor, and gitignored. The
 *  repository root carries a different file: it is committed, and it is the
 *  only thing a fresh clone reads at session start, so it is what fires the
 *  arrival.
 *
 *  FOUND BY USING THE PACKAGE RATHER THAN BUILDING IT. The 4.5.0 archive
 *  carried both arrival scripts and nothing that called them, so a receiver
 *  would have shipped a product whose headline feature never fires. The
 *  producing act reproduced that exact defect until this list was shared. */
export function travels(root: string, src: string): boolean {
  const rel = relative(root, src);
  if (rel === "" || rel.startsWith("..")) return rel === "";
  const parts = rel.split(sep);
  // THE PROMPT LAYER'S COPILOT HALF LIVES UNDER A `.github`, and `.github` is
  // excluded by name. It is a declared METHOD FILE — paths.ts calls the prompt
  // layer "method that does not live under a method folder... every tree needs
  // it and no tree owns it" — so a tree without it has lost one host's whole
  // prompt layer while the other two hosts keep theirs.
  //
  // THE DIRECTORIES ON ITS PATH TRAVEL WITH IT, because a filter that refuses a
  // directory is never asked about its children.
  //
  // FOUND BY THE i16 TESTER, 2026-08-18, in the very fix that shared this list.
  // Adopting the packaging script's exclusions wholesale is what dropped it —
  // the cost of merging two lists rather than deciding which one was wrong.
  if (rel === PROMPT_LAYER_IN_GITHUB || PROMPT_LAYER_IN_GITHUB.startsWith(rel + sep)) return true;
  if (rel === ".claude" || parts[0] === ".claude") {
    // fall through — the root one travels
  } else if (parts.some((p) => EXCLUDE_DIRS.has(p))) return false;
  if (EXCLUDE_FILES.has(parts[parts.length - 1])) return false;
  // THE RECORDS STAY HOME. `project/spec` is this tree's own expeditions, its
  // iterations AND its trace, and every part of it describes work the receiver
  // never did.
  if (parts[0] === "project" && parts[1] === "spec") return false;
  return true;
}

const BRAND = join("project", "deliverable", "brand", "brand.json");
const README_TEMPLATE = join("project", "deliverable", "brand", "README.entry.md");
const UPSTREAM = join("project", "deliverable", "vendor", "upstream", "upstream.json");
const SPEC = join("project", "spec");

/** The record a driven tree carries, at its root so a person opening the
 *  folder can see why it behaves as it does. */
export const DRIVEN_RECORD = "driven-by.json";

/** AN IDENTITY IS MINTED, NEVER DERIVED FROM A NAME.
 *
 *  A name cannot be one. Two people can produce copies called Atlas, and a
 *  driven tree recording "atlas" would then resolve to whichever the machine
 *  found first — failing with a WRONG answer rather than an absent one, which
 *  is the worst of the three states the driven record exists to separate.
 *
 *  raid-dec-a-driven-tree-names-which-copy-drives-it left this open in as many
 *  words: "what a copy's identity is must be decided and has not been". This is
 *  the decision, taken where the identity is actually minted. */
const mintIdentity = (): string => randomBytes(6).toString("hex");

/** The id has to survive being a folder name, an npm name and an editor
 *  command id, so it is reduced to what all three accept. */
const slugOf = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function refuse(expected: string, got: string, note: string, source: string): never {
  throw new Rejection({
    clause: CLAUSES.PRODUCE_REFUSED,
    expected,
    got,
    remedy: { tool: "se_file_list", args: { dir: "." }, note },
    source,
  });
}

/** REFUSE BEFORE WRITING ANYTHING. A failed act that leaves half a tree behind
 *  is worse than one that leaves nothing, because the half looks finished. */
function requireEmpty(dest: string, source: string): void {
  if (existsSync(dest) && readdirSync(dest).length > 0) {
    refuse(
      "an empty destination",
      `${dest} already holds ${readdirSync(dest).length} entr${readdirSync(dest).length === 1 ? "y" : "ies"}`,
      "name an empty folder, or an absent one. Producing into somebody else's work is how a tree ends up half theirs and half ours.",
      source,
    );
  }
}

const writeJson = (p: string, value: unknown): void => {
  mkdirSync(join(p, ".."), { recursive: true });
  // WITHOUT A BOM, deliberately. Windows PowerShell's utf8 encoding emits one
  // and JSON.parse refuses the file it produces — the defect that reported the
  // owner's declared root as undeclared in July.
  writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

/** Read a tree's own brand fact. */
function brandOf(root: string, source: string): { name: string; id: string; instance?: string } {
  const p = join(root, BRAND);
  if (!existsSync(p)) {
    refuse(
      "a tree with a brand fact at its root",
      `${p} does not exist`,
      "a producing act runs from a complete tree; this one has no name to give.",
      source,
    );
  }
  const parsed = JSON.parse(readFileSync(p, "utf8").replace(/^﻿/, "")) as { name?: unknown; id?: unknown; instance?: unknown };
  if (typeof parsed.name !== "string" || typeof parsed.id !== "string") {
    refuse(
      "a brand fact carrying a name and an id",
      `${p} carries ${JSON.stringify(parsed)}`,
      "the product name is one fact and this is the file that holds it.",
      source,
    );
  }
  return { name: parsed.name, id: parsed.id, instance: typeof parsed.instance === "string" ? parsed.instance : undefined };
}

function copyTree(from: string, to: string): void {
  cpSync(from, to, { recursive: true, filter: (src) => travels(resolve(from), resolve(src)) });
}

/** REFUSE RATHER THAN HALF-PRODUCE, INCLUDING PAST THE FIRST BYTE.
 *
 *  The guards before the copy stop the act cleanly. Everything AFTER it can
 *  still throw — a `.git` that survived, a missing README template, no `git` on
 *  the path — and each of those would leave a tree on disk that looks finished.
 *
 *  req-an-act-writes-only-the-tree-it-produced says why that is the worse
 *  failure: "a failed spawn that leaves half a tree behind is worse than one
 *  that leaves nothing, because the half looks like a product."
 *
 *  THE DESTINATION WAS EMPTY OR ABSENT, proved by requireEmpty before anything
 *  was written, so removing it on failure destroys nothing that was not ours. */
function cleanUpAfter<T>(dest: string, act: () => T): T {
  // LEAVE IT AS IT WAS FOUND, which is two different states. requireEmpty
  // accepts a destination that exists and is empty AND one that does not exist
  // at all, so "clean up" means returning to whichever it was. Deleting a
  // folder somebody made by hand is its own small surprise, and the first
  // version of this did exactly that — caught by its own test.
  const existed = existsSync(dest);
  try {
    return act();
  } catch (e) {
    // THE CLEANUP MUST NOT REPLACE THE ORIGINAL FAILURE. `gitInit` creates a
    // live repository immediately before the last places this can throw, and on
    // Windows a held handle turns "the README template is missing" into a
    // lock-file permission error — the wrong error in the reader's hands,
    // pointing at the wrong thing entirely.
    try {
      rmSync(dest, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      if (existed) mkdirSync(dest, { recursive: true });
    } catch {
      // The original is what the caller needs. A destination left behind is a
      // worse outcome than a clean one; a misreported cause is worse than both.
    }
    throw e;
  }
}

/** A fresh repository with one commit and NO REMOTE. A git remote is somewhere
 *  you fetch from and, with one wrong flag, push to. */
function gitInit(dest: string, name: string, id: string, message: string): void {
  const git = (...args: string[]): void => {
    execFileSync("git", args, { cwd: dest, stdio: "ignore" });
  };
  git("init", "-q", "-b", "main");
  // A LOCAL identity rides .git/config, so commits work on a machine that
  // never configured git.
  git("config", "user.name", name);
  git("config", "user.email", `made@${id}.local`);
  git("add", "-A");
  git("commit", "-q", "-m", message);
}

export interface VehicleRequest {
  dest: string;
  name: string;
  abbr: string;
}

export interface Produced {
  dest: string;
  id: string;
  instance: string;
}

/** Produce a VEHICLE: a complete independent descendant of this tree, under a
 *  new name, which records where it came from and can reach it by no mechanism
 *  at all. */
export function produceVehicle(root: string, req: VehicleRequest, source: string): Produced {
  const dest = resolve(req.dest);
  const name = (req.name ?? "").trim();
  const abbr = (req.abbr ?? "").trim();
  // ALL THREE ARE REQUIRED, with no fallback to this tree's own name. A
  // forgotten argument would ship this product to somebody else under our
  // name, which is how the shipped export learned to demand them.
  if (name === "")
    refuse(
      "a name for the vehicle",
      "nothing",
      "say what to call it. There is no fallback to this product's own name, on purpose.",
      source,
    );
  if (abbr.length < 2 || abbr.length > 3) {
    refuse(
      "an abbreviation of two or three letters",
      abbr === "" ? "nothing" : `'${abbr}'`,
      "say what to abbreviate it to, in two or three letters.",
      source,
    );
  }
  const id = slugOf(name);
  if (id === "")
    refuse(
      "a name with letters or digits in it",
      `'${name}'`,
      "the id is made from the name, and this name leaves nothing to make one from.",
      source,
    );
  requireEmpty(dest, source);
  const engine = brandOf(root, source);
  const instance = mintIdentity();

  return cleanUpAfter(dest, () =>
    withActBound(dest, source, () => {
      copyTree(root, dest);
      if (existsSync(join(dest, ".git"))) {
        refuse(
          "a copy with no repository in it",
          `a .git survived the copy into ${dest}`,
          "refusing to init over live history — the copy makes its own repository.",
          source,
        );
      }
      // The machine writes its records here, so the home exists from the start.
      mkdirSync(join(dest, SPEC), { recursive: true });
      // ONE FILE RENAMES THE WHOLE SYSTEM. Every branded surface renders from it
      // at launch, so nothing else in the tree has to be rewritten.
      writeJson(join(dest, BRAND), { name, id, abbr: abbr.toUpperCase(), instance });
      // A FRESH FRONT DOOR. This tree's README is about THIS tree, which is noise
      // to whoever receives the copy. The text lives once, in the template.
      const readme = readFileSync(join(root, README_TEMPLATE), "utf8")
        .replaceAll("$PRODUCT$", name)
        .replaceAll("$PRODUCT_ABBR$", abbr.toUpperCase());
      writeFileSync(join(dest, "README.md"), readme, "utf8");
      // WHERE IT CAME FROM: an identity and a version, never an address. That is
      // the difference between a record and a remote, and it is the whole reason
      // the file is safe.
      writeJson(join(dest, UPSTREAM), {
        id: engine.id,
        name: engine.name,
        version: SE_VERSION,
        vendored: new Date().toISOString().slice(0, 10),
      });
      gitInit(dest, name, id, `${name} — a fresh start, history stays home`);
      return { dest, id, instance };
    }),
  );
}

export interface DrivenRecord {
  id: string;
  instance: string;
  version: string;
}

/** Produce a DRIVEN PROJECT: a tree for work that is not this system's own,
 *  carrying none of the method and one record saying whose it is. */
export function produceProject(
  root: string,
  req: { dest: string; name: string },
  source: string,
): { dest: string; driven_by: DrivenRecord } {
  const dest = resolve(req.dest);
  const name = (req.name ?? "").trim();
  if (name === "") refuse("a name for the project", "nothing", "say what to call it.", source);
  requireEmpty(dest, source);
  const me = brandOf(root, source);
  // A DRIVING TREE MUST ALREADY HAVE AN IDENTITY. It is not minted here.
  //
  // THIS USED TO MINT ONE INTO THE LAUNCHER'S OWN BRAND FILE, before the bound
  // opened, justified as "what a normal run of the system records anyway". The
  // i16 tester checked that justification and it is false: nothing else in the
  // product ever writes `instance`, `loadBrand` never writes at all, and the
  // walk reads only the name. So it was not a normal recording — it was the one
  // write this act made outside the tree it produces, which is exactly what
  // req-an-act-writes-only-the-tree-it-produced forbids.
  //
  // A PRODUCED VEHICLE ALWAYS HAS ONE, minted by produceVehicle. Only a tree
  // that predates the idea can lack it, and the fix there is one edit to that
  // tree's own brand file, made deliberately by whoever owns it.
  const instance = me.instance;
  if (instance === undefined) {
    refuse(
      "a driving tree that knows its own identity",
      `${join(root, BRAND)} carries no "instance"`,
      'add one to the brand file: a stable opaque value, e.g. "instance": "7f3a9c21b4d0". A driven tree records WHICH copy drives it, and a copy that cannot say who it is cannot be recorded.',
      source,
    );
  }
  const driven_by: DrivenRecord = { id: me.id, instance, version: SE_VERSION };

  return cleanUpAfter(dest, () =>
    withActBound(dest, source, () => {
      mkdirSync(dest, { recursive: true });
      // WHAT, NEVER WHERE. A path goes stale the moment either tree moves, and
      // it then fails with a WRONG answer rather than an absent one.
      writeJson(join(dest, DRIVEN_RECORD), driven_by);
      gitInit(dest, name, slugOf(name) || "project", `${name} — a fresh start`);
      return { dest, driven_by };
    }),
  );
}

export interface DrivenAnswer {
  /** Is this a driven project at all? Absence is an answer, never a guess. */
  driven: boolean;
  /** The record that was looked for, named so a refusal can say it. */
  looked_for: string;
  /** Did the identity resolve to a copy this machine can reach? */
  resolved?: boolean;
  /** The identity the record names, for a refusal that names WHAT and not where. */
  identity?: string;
  /** Why an identity did not resolve. */
  why?: string;
}

/** THE THREE STATES A TREE CAN BE IN, which is the whole point of writing the
 *  record at all. Without it there are only two and the system can only guess.
 *
 *  - No record: this is not a driven project.
 *  - A record naming a copy this machine has never seen: present, unresolvable.
 *  - A record that resolves: come up.
 *
 *  THE THIRD STATE CANNOT BE REACHED YET, and saying so is the honest answer.
 *  Resolving an identity to a copy needs something on the machine that holds
 *  which copies it has seen, and that register does not exist. Until it does,
 *  a present record answers `resolved: false` with the reason — which is a
 *  named gap rather than a wrong answer. */
export function drivenBy(tree: string): DrivenAnswer {
  const p = join(resolve(tree), DRIVEN_RECORD);
  if (!existsSync(p)) return { driven: false, looked_for: DRIVEN_RECORD };
  let parsed: Partial<DrivenRecord>;
  try {
    parsed = JSON.parse(readFileSync(p, "utf8").replace(/^﻿/, "")) as Partial<DrivenRecord>;
  } catch (e) {
    // A MALFORMED RECORD IS A FOURTH CASE and it refuses loudly rather than
    // falling through to "not a driven project".
    throw new Rejection({
      clause: CLAUSES.PRODUCE_REFUSED,
      expected: `a driven record that parses, e.g. {"id": "atlas", "instance": "…", "version": "…"}`,
      got: `${p} does not parse: ${(e as Error).message}`,
      remedy: {
        tool: "se_file_read",
        args: { path: DRIVEN_RECORD },
        note: "fix the JSON by hand. A record nobody can read must never pass for a tree that has none.",
      },
      source: "engine/produce.ts",
    });
  }
  return {
    driven: true,
    looked_for: DRIVEN_RECORD,
    resolved: false,
    identity: `${parsed.id ?? "?"} (${parsed.instance ?? "?"}) at ${parsed.version ?? "?"}`,
    why: "no register of copies this machine has seen exists yet, so an identity cannot be turned into a tree",
  };
}

/** ONE DOOR FOR BOTH ACTS, for a surface that has one button per kind and one
 *  call to make.
 *
 *  AN UNKNOWN KIND IS REFUSED, never defaulted. Defaulting would produce the
 *  WRONG KIND of tree from a typo, and a wrong tree that looks finished is the
 *  failure this whole cluster is grouped around. */
export function produce(
  root: string,
  req: { kind: string; dest: string; name: string; abbr?: string },
  source: string,
): Produced | { dest: string; driven_by: DrivenRecord } {
  if (req.kind === "vehicle") return produceVehicle(root, { dest: req.dest, name: req.name, abbr: req.abbr ?? "" }, source);
  if (req.kind === "project") return produceProject(root, { dest: req.dest, name: req.name }, source);
  refuse(
    "kind to be 'vehicle' or 'project'",
    `'${req.kind}'`,
    "say which of the two acts you mean — they differ in what they write, and guessing would make the wrong kind of tree.",
    source,
  );
}
