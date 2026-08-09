// Test scaffolding: a fresh temp project root carrying the REAL boot
// machine (copied from this repo), so buildServer() compiles the same
// drawing the shipped server does.

import { spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync, statSync, symlinkSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { contentHash } from "../engine/hash.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

// Test roots carry a COPY of the engine with no node_modules above it; the
// env override points ripgrep resolution (and every spawned condition
// script) at the REAL repo's npm-provided binary. Without it, tests pass
// only on machines with a PATH rg — the exact hole a Windows run found.
try {
  process.env.SE_RG_PATH ??= (createRequire(import.meta.url)("@vscode/ripgrep") as { rgPath: string }).rgPath;
} catch {
  // no npm install — rgPath() falls back to PATH rg and fails loudly if absent
}

// Walks in tests hit prepare_idle's exit scripts, and one of those IS the
// suite (engine/bin/selftest.ts) — without this guard every booted walk
// would spawn the whole suite again, recursively.
process.env.SE_SELFTEST_SKIP = "1";
// Never spawn keep-awake loops or OS shutdowns from a test session.
process.env.SE_KEEPAWAKE_DISABLE = "1";
// se_reload runs its canary but never exits the test process.
process.env.SE_RELOAD_DRY = "1";
// Condition scripts are node spawns — two per booted walk, ~200 walks per
// battery, a third of its clock (measured 2026-08-02). The suite skips the
// spawn; the files that PROVE the scripts delete this guard at their top.
process.env.SE_SCRIPT_SKIP = "1";

// A TEST ROOT BORROWS WHAT IS READ-ONLY AND COPIES WHAT IS WRITTEN. The
// old version copied four trees per case — 679 files, 721ms, times every
// case in the suite — and that synchronous copy was holding the suite back.
//
// The ENGINE is only ever read, imported and spawned, so it is linked, not
// copied. That one link also removes the 233-file yaml copy, which existed
// ONLY because a bare specifier had to resolve upward from a COPIED
// engine: node resolves a link to its real path, so a linked engine
// resolves its imports inside the template, where yaml is kept.
//
// The MACHINES are copied, because tests WRITE them — the compiler's error
// cases deliberately put rubbish in a .canvas. That is not a hypothetical:
// linking them poisoned the shared template with "{ this is not a canvas"
// and broke every later case in the run.
//
// THE LINKS POINT AT A TEMPLATE, NEVER AT THE REPOSITORY (owner ruling,
// 2026-07-30). That ruling is what kept the incident above to a throwaway
// directory instead of the working tree.
//
// THE TEMPLATE IS READ-ONLY, so a stray write FAILS LOUDLY rather than
// silently corrupting the next case. If a tree ever does need writing, it
// moves from BORROWED to COPIED and pays the copy.
//
// THE TEMPLATE INVALIDATES ITSELF. Its name carries a fingerprint of the
// sources — every file's path, size and modification time — so editing an
// engine module produces a different name and a fresh build. A stale
// template cannot be used, because it cannot be found.
const BORROWED = [join("project", "deliverable", "engine")];
// A test root should look like a real product, or the checks it runs are
// checking something else. brand.json and palette.css are what a product IS
// configured by, and preflight now demands both.
const COPIED = [
  join("project", "deliverable", "machines"),
  "project/guidance".replace("/", sep),
  join("project", "deliverable", "brand", "brand.json"),
  join("project", "deliverable", "brand", "palette.css"),
];
// A linked engine resolves its imports from where it REALLY lives, which
// is the template — so the yaml package has to sit above it THERE. Copied
// into the template once, instead of into every case.
const YAML_REL = join("project", "deliverable", "node_modules", "yaml");

function fingerprint(): string {
  const parts: string[] = [];
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) {
        const s = statSync(p);
        parts.push(`${p}:${s.size}:${s.mtimeMs}`);
      }
    }
  };
  for (const rel of BORROWED) walk(join(REPO_ROOT, rel));
  // The dependency's manifest stands in for the package: upgrade it and
  // the template rebuilds, without walking hundreds of files every run.
  const pkg = statSync(join(REPO_ROOT, YAML_REL, "package.json"));
  parts.push(`yaml:${pkg.size}:${pkg.mtimeMs}`);
  return contentHash(parts.join("\n")).slice(0, 16);
}

function freeze(dir: string): void {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) freeze(p);
    else if (e.isFile()) chmodSync(p, 0o444);
  }
}

let templateDir: string | undefined;

// THE TEMPLATE LIVES IN .se, NOT IN TEMP (owner ruling, 2026-07-30). It
// is machine-local, already ignored by git, and about 1.2 MB — the engine
// plus the yaml package. It is never deleted: if the fingerprint matches
// it is reused, and if it does not, a new one is built beside it. Keeping
// a superseded one costs a megabyte and saves the rebuild when a branch
// is switched back.
function templateHome(): string {
  const home = join(REPO_ROOT, ".se", "test-templates");
  mkdirSync(home, { recursive: true });
  return home;
}

function template(): string {
  if (templateDir !== undefined) return templateDir;
  const home = templateHome();
  const want = join(home, fingerprint());
  if (!existsSync(want)) {
    // Built under a temporary name and moved into place, so that several
    // test processes racing to build the same template cannot read a
    // half-copied one. The loser of the race just discards its work.
    const staging = mkdtempSync(join(home, "staging-"));
    for (const rel of [...BORROWED, YAML_REL]) cpSync(join(REPO_ROOT, rel), join(staging, rel), { recursive: true });
    freeze(staging);
    try {
      renameSync(staging, want);
    } catch {
      rmSync(staging, { recursive: true, force: true });
    }
  }
  templateDir = want;
  return want;
}

function borrow(root: string, rel: string): void {
  const dest = join(root, rel);
  mkdirSync(join(dest, ".."), { recursive: true });
  try {
    symlinkSync(join(template(), rel), dest, "junction");
  } catch {
    // No link privilege on this host — correctness first, speed second.
    cpSync(join(template(), rel), dest, { recursive: true });
  }
}

export function freshRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "se-v3-"));
  created.push(root);
  for (const rel of BORROWED) borrow(root, rel);
  for (const rel of COPIED) cpSync(join(REPO_ROOT, rel), join(root, rel), { recursive: true });
  mkdirSync(join(root, "project"), { recursive: true });
  cpSync(join(REPO_ROOT, "project", "AGENTS.md"), join(root, "project", "AGENTS.md"));
  return root;
}

// TEST ROOTS TIDY UP AFTER THEMSELVES. They used not to, and a single day
// of runs left 1658 of them in TEMP — enough that merely listing the
// directory became slow enough to time a tool out.
//
// The borrowed tree is unlinked FIRST and by name. Removing a junction
// deletes the link and not its target, but the target here is the shared
// template, so this does not rely on that being true.
const created: string[] = [];
process.on("exit", () => {
  for (const root of created) {
    for (const rel of BORROWED) {
      try {
        rmSync(join(root, rel), { recursive: false });
      } catch {
        // already gone, or never linked — the sweep below still runs
      }
    }
    try {
      rmSync(root, { recursive: true, force: true });
    } catch {
      // a file still held open on Windows; the next run's sweep gets it
    }
  }
});

export type Server = ReturnType<typeof buildServer>;

export async function call(server: Server, name: string, args: Record<string, unknown> = {}) {
  const res = await server.handle({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } });
  const r = res?.result as { content: { text: string }[]; isError: boolean };
  return { isError: r.isError, body: JSON.parse(r.content[0].text) as Record<string, unknown> };
}

/** WHAT THE WALK OWES, ASKED — NEVER NAMED (owner ruling 2026-08-06:
 *  moving guidance must never break a test. It broke 18 assertions, every
 *  one pinning a path no rule guarantees). The engine's route carries the
 *  way's reading list, so the suite asks IT. A doc joins or leaves this
 *  answer by joining or leaving the machine — no list here to go stale. */
export function readDocs(root: string): string[] {
  const s = new Session(root);
  return (s.packet() as { route_reads?: string[] }).route_reads ?? [];
}

/** The craft guidance, derived from its folder — a moved or added card
 *  changes the answer instead of falsifying a list. Sorted, so software
 *  precedes ux by name and callers may index. */
export function craftDocs(): string[] {
  return readdirSync(join(REPO_ROOT, "project", "guidance", "craft"))
    .filter((e) => e.endsWith(".md"))
    .sort()
    .map((e) => `project/guidance/craft/${e}`);
}

/** THE NAMED SUBJECTS. A handful of tests are ABOUT a specific page — the
 *  voice split, the contract's projection, the method the kickoff demands.
 *  They take the path from HERE, so a guidance move edits one line and the
 *  layout is pinned nowhere else (the testlint enforces that). */
export const GUIDANCE = {
  dir: "project/guidance",
  contract: "project/guidance/contract.md",
  voice: "project/guidance/voice.md",
  refusalsPage: "project/guidance/refusals.md",
  bootMethod: "project/guidance/method/boot.md",
  frontDeskMethod: "project/guidance/method/front-desk.md",
  retroMethod: "project/guidance/method/retro.md",
} as const;

/** A test that needs SOME real document to read, patch or check — not a
 *  particular one — asks here instead of naming a path. */
export function anyGuidanceDoc(): string {
  return GUIDANCE.voice;
}

/** The human's side of the read proof: check everything the way demands,
 *  asked from the session's own route. (The agent's side has no helper on
 *  purpose — its proofs are earned by reading through the lane.) */
export function checkDocs(session: { humanCheck: (p: string) => unknown; packet: () => unknown }): void {
  const reads = (session.packet() as { route_reads?: string[] }).route_reads ?? [];
  // ROOT DOCS PULL EVERYWHERE — the engine's own rule — and a suite
  // wanders past the desk after boot, so the human's proof covers the
  // guidance root too. Derived from the folder, never named: a doc joins
  // by existing there.
  const roots = readdirSync(join(REPO_ROOT, "project", "guidance"), { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => `project/guidance/${e.name}`);
  for (const p of new Set([...reads, ...roots])) session.humanCheck(p);
}

/** A test root with a real repository in it. Anything that lists
 *  expeditions runs git, and a root without .git refuses before it answers.
 *
 *  THE REPOSITORY IS A FIXTURE (owner direction 2026-08-02, the pytest
 *  shape): one template repo per process, its .git copied per case. Three
 *  git spawns per case became one directory copy; every case still owns a
 *  fresh, isolated repository, so nothing a test proves changes. */
let gitTemplate: string | undefined;
export function gitInit(root: string): void {
  const g = (cwd: string, ...a: string[]): void => {
    const r = spawnSync("git", a, { cwd, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  };
  if (gitTemplate === undefined) {
    const t = mkdtempSync(join(tmpdir(), "se-git-template-"));
    created.push(t);
    g(t, "init");
    g(t, "config", "user.email", "se@test.local");
    g(t, "config", "user.name", "se test");
    gitTemplate = t;
  }
  cpSync(join(gitTemplate, ".git"), join(root, ".git"), { recursive: true });
}

/** The engine's own proof, mirrored: engine/session.ts readingProbes. */
export function proofFor(body: string): string {
  const w = body.split(/\s+/).filter((x) => x !== "");
  if (w.length < 16) return w.join(" ");
  return [0.3, 0.6, 0.92]
    .map((at) => {
      const i = Math.min(Math.floor(w.length * at), w.length - 8);
      return w.slice(i + 4, i + 8).join(" ");
    })
    .join(" ... ");
}

/** Serve ONE document through the pull and prove it, handing back what the
 *  pull answered with. */
export async function readOne(server: Server): Promise<{ path: string; content: string; after: Record<string, unknown> } | null> {
  const r = await call(server, "se_pull");
  const doc = r.body.document as { path: string; content: string } | undefined;
  if (doc === undefined) return null;
  // THE PROOF CALL'S ANSWER RIDES BACK. Proving the LAST document is the call
  // that walks, and a caller that discards it and pulls again finds the target
  // already cleared — then reads its own success as a failure.
  const after = await call(server, "se_pull", { form: { read: proofFor(doc.content) } });
  return { ...doc, after: after.body };
}

/** Drain the reading the way an agent does: pull, take the document it
 *  serves, hand its tail back, until the pull stops asking.
 *
 *  IT RETURNS THE ANSWER THAT STOPPED THE READING, and callers must use it.
 *  That answer is often the WALK: the pull batches every hop to the next
 *  branching point, so the call that stops saying `read` is the call that
 *  moved. Pulling again to look at it throws the walk away — the target
 *  clears itself on arrival, so the extra pull correctly offers doors, and a
 *  test reads its own success as a failure.
 *
 *  This cost six cases across four files, and every one of them looked like a
 *  broken walk rather than a helper discarding its result. */
export async function readEverything(s: Session): Promise<Record<string, unknown>> {
  let r = await s.pull();
  for (let i = 0; i < 40 && r.pull === "read"; i++) {
    const doc = r.document as { content?: string } | undefined;
    if (doc?.content === undefined) throw new Error(`the pull answered read with no document: ${JSON.stringify(r)}`);
    r = await s.pull({ form: { read: proofFor(doc.content) } });
  }
  if (r.pull === "read") throw new Error("the reading never drained");
  return r;
}

/** A SESSION standing at idle, reached by pulling rather than ticking.
 *  Idle is where most pull questions are actually asked, because it is the
 *  switchboard: several doors, and one of them heavier than any slider a
 *  test would set.
 *
 *  IT COSTS A FULL BOOT WALK (about eight seconds), so a file that builds
 *  several of these dominates the suite's wall clock and wants splitting
 *  by theme — see guidance/software.md. */
export async function sessionAtIdle(root: string): Promise<Session> {
  const s = new Session(root);
  s.setAutonomy(1);
  s.setTarget("idle");
  for (let i = 0; i < 8; i++) {
    await readEverything(s);
    if (s.active()[0] === "idle") return s;
    await s.pull();
    if (s.active()[0] === "idle") return s;
  }
  throw new Error(`the pull did not reach idle: ${JSON.stringify(s.active())}`);
}

/** Boot an EXISTING server by pulling, exactly as a real agent does: do
 *  what each answer says. WITH a session, the person's hand aims at idle
 *  first (the agent cannot free-aim — a choice exists only where one was
 *  offered); WITHOUT one, the walk follows the session's default target
 *  and rests at the front desk. */
export async function pullBoot(server: Server, session?: Session): Promise<void> {
  if (session !== undefined) session.setTarget("idle");
  for (let i = 0; i < 12; i++) {
    const r = await call(server, "se_pull");
    if (r.isError) throw new Error(`boot pull failed: ${JSON.stringify(r.body)}`);
    if (r.body.pull === "read") {
      const doc = r.body.document as { content?: string } | undefined;
      if (doc?.content === undefined) throw new Error(`read with no document: ${JSON.stringify(r.body)}`);
      const proof = await call(server, "se_pull", { form: { read: proofFor(doc.content) } });
      if (proof.isError) throw new Error(`the reading proof failed: ${JSON.stringify(proof.body)}`);
      continue;
    }
    const where = r.body.where as string[];
    if (where.includes("idle") || where.includes("front_desk")) return;
  }
  throw new Error("the pull did not reach a resting place");
}

/** A fresh server pulled through the whole boot walk into IDLE — the
 *  person's aim, so the doors stand open for whatever the test drives. */
export async function bootedServer(root: string): Promise<Server> {
  const session = new Session(root);
  const server = buildServer(root, session);
  await pullBoot(server, session);
  return server;
}

/** Aim the person's hand at a state and pull the walk there, draining any
 *  reading owed on the way. Throws on any other answer, so a test that
 *  expects a refusal drives the pull itself. */
export async function pullTo(session: Session, state: string): Promise<void> {
  session.setTarget(state);
  // ARRIVAL IS WHERE THE WALK STANDS, never which call happened to carry it.
  // readEverything pulls until the answer is not `read`, so it SWALLOWS the
  // `do` that did the walking. Asking the next pull to prove the arrival then
  // fails on a walk that already succeeded: the target cleared itself on
  // arrival, so that pull correctly offers doors instead.
  //
  // A container is aimed at by its own name and lands on its start, so
  // standing inside it counts as being there.
  const arrived = (): boolean => {
    const here = session.active()[0] ?? "";
    return here === state || here.startsWith(`${state}/`);
  };
  for (let i = 0; i < 8; i++) {
    if (arrived()) return;
    await readEverything(session);
    if (arrived()) return;
    const r = (await session.pull()) as { pull?: string };
    if (arrived()) return;
    if (r.pull === "read") continue;
    throw new Error(`the pull did not walk: ${JSON.stringify(r)}`);
  }
  throw new Error("the reading never drained");
}
