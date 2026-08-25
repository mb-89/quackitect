// Test scaffolding: a fresh temp project root carrying the REAL boot
// machine (copied from this repo), so buildServer() compiles the same
// drawing the shipped server does.

import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { Rejection } from "../engine/errors.ts";
import { contentHash } from "../engine/hash.ts";
import { proofFor } from "../engine/readproof.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

// Test roots carry a COPY of the engine with no node_modules above it; the
// env override points ripgrep resolution (and every spawned condition
// script) at the REAL repo's npm-provided binary. Without it, tests pass
// only on machines with a PATH rg — the exact hole a Windows run found.
try {
  process.env.SE_RG_PATH ??= (createRequire(import.meta.url)("@vscode/ripgrep") as { rgPath: string }).rgPath;
} catch {
  // no npm install — rgPath() falls back to PATH rg and fails loudly if absent
}

// Walks in tests hit prepare_desk's exit scripts, and one of those IS the
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
const BORROWED = [join("deliverable", "engine")];
// A test root should look like a real product, or the checks it runs are
// checking something else. brand.json and palette.css are what a product IS
// configured by, and preflight now demands both.
const COPIED = [
  join("deliverable", "machines"),
  "guidance".replace("/", sep),
  join("deliverable", "brand", "brand.json"),
  join("deliverable", "brand", "palette.css"),
  // THE FORMATTER IS CONFIGURED BY THIS FILE, and without it biome checks a
  // DIFFERENT TREE than the product does. Its own includes list is the whole
  // point: engine, tests and the vscode sources — never the copied machines
  // and guidance a test root also carries.
  //
  // MEASURED 2026-08-17, in a root that had biome but not its config: 133 files
  // checked instead of the product's set, 47 warnings, and --error-on-warnings
  // turned that into a non-zero exit. se_test's battery returns early on a
  // failed format step, so tests/nesting.test.ts saw 1 result where it expects 4.
  join("deliverable", "biome.json"),
];
// A linked engine resolves its imports from where it REALLY lives, which
// is the template — so the yaml package has to sit above it THERE. Copied
// into the template once, instead of into every case.
const YAML_REL = join("deliverable", "node_modules", "yaml");
// BIOME IS LINKED, NEVER COPIED, and the difference is 127 MB against the
// template's 1.2 MB.
//
// WHY IT HAS TO BE HERE AT ALL. se_test's battery runs biome as its FIRST
// script and returns early when it exits non-zero, so a root that cannot reach
// biome reports one result where the case expects four. BIOME_BIN resolves
// relative to tools.ts's own path, and the engine is BORROWED — node resolves
// the link to its real path — so it looks inside this template and finds a
// node_modules holding exactly one package.
//
// MEASURED 2026-08-17: tests/nesting.test.ts read 1 !== 4 for that reason, on
// both platforms, since the link resolves the same way on each.
const BIOME_REL = join("deliverable", "node_modules", "@biomejs");

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
  const biome = statSync(join(REPO_ROOT, BIOME_REL, "biome", "package.json"));
  parts.push(`biome:${biome.size}:${biome.mtimeMs}`);
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
    // AFTER THE FREEZE, DELIBERATELY. freeze walks with readdirSync and chmods
    // what it finds, and a directory link is walked THROUGH — so linking first
    // would set the repository's own biome read-only.
    try {
      symlinkSync(join(REPO_ROOT, BIOME_REL), join(staging, BIOME_REL), "junction");
    } catch {
      // No link privilege on this host — correctness first, size second.
      cpSync(join(REPO_ROOT, BIOME_REL), join(staging, BIOME_REL), { recursive: true });
    }
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
  mkdirSync(root, { recursive: true });
  cpSync(join(REPO_ROOT, "AGENTS.md"), join(root, "AGENTS.md"));
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
  let body = JSON.parse(r.content[0].text) as Record<string, unknown>;
  if (body.bounded === true) body = await readBoundedAnswer(server, body);
  return { isError: r.isError, body };
}

async function readBoundedAnswer(server: Server, bounded: Record<string, unknown>): Promise<Record<string, unknown>> {
  const next = bounded.next as { tool?: string; args?: Record<string, unknown> } | undefined;
  if (next?.tool !== "se_file_read") throw new Error(`bounded answer has no readable spill: ${JSON.stringify(bounded)}`);
  const args = next.args ?? {};
  let offset = Number(args.char_offset ?? 0);
  const limit = Number(args.char_limit ?? 3_000);
  let whole = "";
  for (;;) {
    const res = await server.handle({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "se_file_read", arguments: { path: args.path, char_offset: offset, char_limit: limit } },
    });
    const raw = res?.result as { content: { text: string }[]; isError: boolean };
    if (raw.isError) throw new Error(`spill read failed: ${raw.content[0]?.text ?? "no body"}`);
    const page = JSON.parse(raw.content[0].text) as {
      content: string;
      char_range: { to: number; of: number };
    };
    whole += page.content;
    if (page.char_range.to >= page.char_range.of) return JSON.parse(whole) as Record<string, unknown>;
    offset = page.char_range.to;
  }
}

/** WAIT FOR A RUN BY READING THE ACCOUNT, which is how a walker learns it too.
 *  There is no status verb: a run reports itself on the `work` block of every
 *  lane answer, so any call will do and se_pull is the cheapest. */
export async function waitForTestJob(server: Server, job: string): Promise<Record<string, unknown>> {
  for (;;) {
    const response = await call(server, "se_pull", {
      update: { op: "update", brief: "Read the run off the account" },
    });
    const account = (response.body.work ?? []) as { job?: string; running?: boolean }[];
    const entry = account.find((e) => e.job === job);
    if (entry !== undefined && entry.running === false) return entry as Record<string, unknown>;
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
}

/** The craft guidance, derived from its folder — a moved or added card
 *  changes the answer instead of falsifying a list. Sorted, so software
 *  precedes ux by name and callers may index. */
export function craftDocs(): string[] {
  return readdirSync(join(REPO_ROOT, "guidance", "craft"))
    .filter((e) => e.endsWith(".md"))
    .sort()
    .map((e) => `guidance/craft/${e}`);
}

/** THE NAMED SUBJECTS. A handful of tests are ABOUT a specific page — the
 *  voice split, the contract's projection, the method the kickoff demands.
 *  They take the path from HERE, so a guidance move edits one line and the
 *  layout is pinned nowhere else (the testlint enforces that). */
export const GUIDANCE = {
  dir: "guidance",
  contract: "guidance/contract.md",
  voice: "guidance/voice.md",
  refusalsPage: "guidance/refusals.md",
  bootMethod: "guidance/method/boot.md",
  frontDeskMethod: "guidance/method/front-desk.md",
  retroMethod: "guidance/method/retro.md",
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
  for (const p of new Set([...reads, ...guidanceRoots()])) session.humanCheck(p);
}

/** CREDIT THE AGENT'S READING, PAGED, until the whole surface is read.
 *
 *  `.se/reading.md` IS THE READING, and reading it credits every document it
 *  carries. Tests read it WHOLE in one call, which worked for as long as the
 *  guidance corpus stayed under the whole-file read cap.
 *
 *  IT CROSSED THE CAP ON 2026-08-16, at 120,452 characters against 120,000 —
 *  452 over, from one section added to refusals.md. Every read was refused
 *  with SE-C-103, so nothing was credited, so every state with a reading
 *  demand refused. Four cases across two files failed pointing at front_desk,
 *  and none of them was about front_desk.
 *
 *  IT IS A SELF-CONSUMING QUEUE, NOT A FILE. Every read CREDITS what it read
 *  and the surface is rebuilt without it, so `total_lines` shrinks between
 *  calls — 2559, 2205, 1984, 1738 across four pages, measured 2026-08-16.
 *  Paging it by advancing offsets therefore SKIPS content: offset 401 lands
 *  past where the unread text moved to.
 *
 *  SO IT IS ALWAYS READ FROM THE TOP, over and over, until it stops shrinking.
 *  That is what the pull does one document at a time, and it is the only
 *  correct way to consume a surface that edits itself under the reader. */
export async function creditReading(
  server: unknown,
  call: (s: never, name: string, args: Record<string, unknown>) => Promise<{ body: Record<string, unknown> }>,
): Promise<void> {
  let previous = -1;
  for (let round = 0; round < 60; round++) {
    // A WIDE PAGE, because the cost here is the number of ROUNDS and not the
    // size of one. The surface shrinks as it is credited, so a narrow page is
    // re-read from the top many times over. MEASURED 2026-08-25: this setup is
    // paid once per case and clear-jump.test.ts spent 85 seconds on 8 cases,
    // a fifth of the whole battery's floor.
    const r = await call(server as never, "se_file_read", { path: ".se/reading.md", offset: 1, limit: 5000 });
    const body = r.body as { content?: string; total_lines?: number };
    if (typeof body.content !== "string") break;
    const lines = body.total_lines ?? 0;
    if (lines === previous) break; // nothing left to credit
    previous = lines;
  }
  // AND EVERY ROOT THE HUMAN CHECKED, read directly.
  //
  // `assertHandover` demands that the agent hold EVERY path the human ticked:
  // "the human checked these as read while driving — your head must hold them
  // too". checkDocs ticks every guidance root, and the reading surface only
  // ever offers what the ROUTE needs — three documents where the human had
  // seven. The four left over blocked every hop, naming front_desk.
  //
  // READING A DOCUMENT CREDITS IT, which the engine's own remedy says: "Reading
  // through se_file_read credits too."
  // EACH READ STILL PAYS ITS OWN TOLL, and these are se_file_read calls rather
  // than pull hops. The pull's READING LOOP is exempt now (owner ruling
  // 2026-08-18) because the machine forces those hops and no judgment happens
  // on them. A direct read is a choice, so it pays like anything else — and
  // crediting the whole guidance root is fifteen of them in a row.
  const paying = { op: "update", brief: "reading guidance to credit the walk" };
  for (const p of guidanceDocs()) {
    await call(server as never, "se_file_read", { path: p, update: paying });
  }
}

/** A BOOTED SESSION, BUILT ONCE FOR A WHOLE FILE.
 *
 *  WHY THIS EXISTS. Standing a session at the front desk with both read proofs
 *  in hand costs about 900 ms of pure I/O: 400 to lay down the product tree,
 *  330 to read the guidance corpus, the rest to compile and walk. Under the
 *  parallel battery that same work takes seven seconds, because forty-two files
 *  are doing it at once. A file paying it per case pays it eight times.
 *
 *  MEASURED: clear-jump.test.ts spent 65 of the battery's 361 seconds, and
 *  every one of its eight cases opened with the identical boot.
 *
 *  IT CANNOT BE COPIED, and that was tried first. The walk's position and BOTH
 *  read proofs live on the Session, not on disk — a fresh session opened on a
 *  copy of a booted root lands back at `start` owing three reads. So the thing
 *  that is shared is the session itself.
 *
 *  SO THE CASES SHARE ONE, AND EACH RESETS IT. `reset()` walks back to the
 *  front desk in about 100 ms, against 900 for a fresh boot.
 *
 *  A FILE USING THIS RUNS ITS CASES SERIALLY. One session cannot be in two
 *  places, so `describe` must not carry `concurrency: true`. */
export interface SharedDesk {
  s: SessionLike;
  server: unknown;
  /** Walk back to the front desk, so the next case starts where the last began. */
  reset: () => Promise<void>;
}

type SessionLike = {
  active: () => string[];
  advance: () => Promise<unknown>;
  humanCheck: (p: string) => unknown;
  packet: () => unknown;
};

let deskPromise: Promise<SharedDesk> | undefined;

export function sharedDesk(
  makeSession: (root: string) => SessionLike,
  makeServer: (root: string, s: SessionLike) => unknown,
  call: (s: never, name: string, args: Record<string, unknown>) => Promise<{ body: Record<string, unknown> }>,
): Promise<SharedDesk> {
  deskPromise ??= (async (): Promise<SharedDesk> => {
    const root = freshRoot();
    const s = makeSession(root);
    checkDocs(s);
    for (let i = 0; i < 10; i++) {
      if (s.active()[0] === "front_desk") break;
      await s.advance();
    }
    if (s.active()[0] !== "front_desk") throw new Error(`boot did not reach the front desk, it reached ${s.active()[0]}`);
    const server = makeServer(root, s);
    await creditReading(server, call);
    const reset = async (): Promise<void> => {
      if (s.active()[0] === "front_desk") return;
      await call(server as never, "se_aim", { to: "front_desk", go: true });
      if (s.active()[0] !== "front_desk") {
        throw new Error(`the shared desk could not be reset — it stands at ${s.active().join(", ")}`);
      }
    };
    return { s, server, reset };
  })();
  return deskPromise;
}

/** The guidance root documents, derived from the folder rather than named. A
 *  doc joins the set by existing there — the same rule checkDocs uses, so the
 *  two cannot drift apart. */
export function guidanceRoots(): string[] {
  return readdirSync(join(REPO_ROOT, "guidance"), { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => `guidance/${e.name}`);
}

/** EVERY guidance document, roots and subfolders alike.
 *
 *  checkDocs ticks the ROOTS plus whatever the route happened to demand, and a
 *  route demand can sit anywhere — `method/boot.md` is one. So the agent's set
 *  has to be the superset, or assertHandover blocks on whatever the human
 *  ticked and the agent was never offered.
 *
 *  DERIVED, NEVER NAMED. Naming the four that bit today would leave the fifth
 *  to bite next month. */
export function guidanceDocs(): string[] {
  const out: string[] = [];
  const walk = (abs: string, rel: string): void => {
    for (const e of readdirSync(abs, { withFileTypes: true })) {
      if (e.isDirectory()) walk(join(abs, e.name), `${rel}/${e.name}`);
      else if (e.name.endsWith(".md")) out.push(`${rel}/${e.name}`);
    }
  };
  walk(join(REPO_ROOT, "guidance"), "guidance");
  return out;
}

/** A test root with a real repository in it. Anything that lists
 *  expeditions runs git, and a root without .git refuses before it answers.
 *
 *  THE REPOSITORY IS A FIXTURE (owner direction 2026-08-02, the pytest
 *  shape): one template repo per process, its .git copied per case. Three
 *  git spawns per case became one directory copy; every case still owns a
 *  fresh, isolated repository, so nothing a test proves changes. */
let gitTemplate: string | undefined;
export function gitInit(root: string, commit = false): void {
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
    // GIT DOES NOT REWRITE LINE ENDINGS IN A TEST REPOSITORY.
    //
    // ON WINDOWS THE GLOBAL DEFAULT TURNS EVERY LF INTO CRLF on checkout, and
    // `git add` then prints a warning per file about the round trip. A fixture
    // repository holds a copy of the product tree, so that is hundreds of
    // warning lines on one call, for a conversion no case is about.
    //
    // MEASURED: a pin inside sizing-on-the-pull failed with `git add` reporting
    // nothing but LF-will-be-replaced warnings. Whatever made the status
    // non-zero, the noise is what made the failure unreadable.
    g(t, "config", "core.autocrlf", "false");
    g(t, "config", "core.safecrlf", "false");
    gitTemplate = t;
  }
  cpSync(join(gitTemplate, ".git"), join(root, ".git"), { recursive: true });
  if (commit) {
    const seedPaths = ["deliverable/machines", "deliverable/brand", "deliverable/biome.json", "guidance", "AGENTS.md"];
    if (existsSync(join(root, "spec"))) seedPaths.push("spec");
    g(root, "add", ...seedPaths);
    g(root, "commit", "-q", "-m", "seed");
  }
}

// proofFor IS RE-EXPORTED, NEVER MIRRORED (owner, 2026-08-18). It used to be a
// hand-kept copy of the engine's probe maths with a comment saying so, and the
// comment did not stop it going stale. engine/readproof.ts is the one source.
// It is imported at the top of this file and re-exported here, because callers
// inside this file use it too.
export { proofFor };

/** Return the structured refusal a synchronous operation is expected to throw. */
export function refusal(fn: () => unknown): Rejection {
  try {
    fn();
  } catch (error) {
    if (error instanceof Rejection) return error;
    throw error;
  }
  throw new Error("expected a refusal, got a value");
}

/** Return the structured refusal an asynchronous operation is expected to reject with. */
export async function refusalAsync(fn: () => Promise<unknown>): Promise<Rejection> {
  try {
    await fn();
  } catch (error) {
    if (error instanceof Rejection) return error;
    throw error;
  }
  throw new Error("expected a refusal, got a value");
}

/** Return a refusal after asserting that no untyped error escaped the test boundary. */
export function refusalChecked(fn: () => unknown): Rejection {
  try {
    fn();
  } catch (error) {
    assert.ok(error instanceof Rejection, `a typed refusal, not ${String(error)}`);
    return error;
  }
  throw new assert.AssertionError({ message: "expected a refusal, got a result" });
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

/** A LEAVING JUDGMENT IS STILL BEING REACHED.
 *
 *  Since i51 the engine ANSWERS the call rather than holding it, so an attempt
 *  to leave a step whose check is still running is refused with SE-C-112. That
 *  refusal is an instruction to try again, never a failure.
 *
 *  A BOOT HELPER THAT TREATS IT AS A FAILURE DIES WHENEVER THE MACHINE IS BUSY.
 *  Measured in the full suite: prepare_desk runs five scripts, and against 153
 *  other suites they outlast the handback bound, so a case that passed alone
 *  failed in the battery. */
export function judgmentStillRunning(x: unknown): boolean {
  const o = x as { clause?: string; got?: string; message?: string } | null;
  if (o?.clause !== "SE-C-112") return false;
  return `${o.got ?? ""} ${o.message ?? ""}`.includes("STILL RUNNING");
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
  s.setTarget("front_desk");
  // A PULL THAT ANSWERS "still running" HAS NOT MOVED, so it must not spend one
  // of the bounded attempts. The two counters keep the move budget honest while
  // letting the walk wait for a judgment that is still being reached.
  let moves = 0;
  let waits = 0;
  while (moves < 8 && waits < 300) {
    await readEverything(s);
    if (s.active()[0] === "front_desk") return s;
    let packet: unknown;
    try {
      packet = await s.pull();
    } catch (e) {
      if (!judgmentStillRunning(e)) throw e;
      waits++;
      await new Promise((r) => setTimeout(r, 100));
      continue;
    }
    // A REFUSAL CAN RIDE INSIDE A GOOD ANSWER. The pull reports the stopped
    // step rather than throwing, so a "still running" that arrives this way
    // looks like an ordinary answer and would spend a move for no movement.
    if (judgmentStillRunning((packet as { refusal?: unknown } | undefined)?.refusal)) {
      waits++;
      await new Promise((r) => setTimeout(r, 100));
      continue;
    }
    moves++;
    if (s.active()[0] === "front_desk") return s;
  }
  throw new Error(`the pull did not reach the front desk: ${JSON.stringify(s.active())}`);
}

/** Boot an EXISTING server by pulling, exactly as a real agent does: do
 *  what each answer says. WITH a session, the person's hand aims at idle
 *  first (the agent cannot free-aim — a choice exists only where one was
 *  offered); WITHOUT one, the walk follows the session's default target
 *  and rests at the front desk. */
export async function pullBoot(server: Server, session?: Session): Promise<void> {
  if (session !== undefined) session.setTarget("front_desk");
  let moves = 0;
  let waits = 0;
  while (moves < 12 && waits < 300) {
    const r = await call(server, "se_pull");
    // EITHER SHAPE IS A WAIT, NEVER A MOVE: the refusal can arrive as the whole
    // answer, or ride inside a good one as the stopped step's own reason.
    if (judgmentStillRunning(r.body) || judgmentStillRunning((r.body as { refusal?: unknown }).refusal)) {
      waits++;
      await new Promise((res) => setTimeout(res, 100));
      continue;
    }
    if (r.isError) throw new Error(`boot pull failed: ${JSON.stringify(r.body)}`);
    moves++;
    if (r.body.pull === "read") {
      const doc = r.body.document as { content?: string } | undefined;
      if (doc?.content === undefined) throw new Error(`read with no document: ${JSON.stringify(r.body)}`);
      const proof = await call(server, "se_pull", { form: { read: proofFor(doc.content) } });
      if (proof.isError) throw new Error(`the reading proof failed: ${JSON.stringify(proof.body)}`);
      continue;
    }
    const where = r.body.where as string[];
    if (where.includes("front_desk")) return;
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

/** THE MIRROR'S SOURCE, which is no longer one file. render.ts was split into
 *  the server-side HTML, the stylesheet and the browser application, because
 *  one file holding all three read as one job and was three. A test asking
 *  "does the page do X" wants the whole layer, not whichever third X landed
 *  in — so it asks here and survives the next split. */
export function mirrorSources(): { rel: string; text: string }[] {
  return [
    "render.ts",
    // THE SURFACE IS SEVERAL FILES NOW. The resolver moved the whole view
    // computation out of the renderer, and the reader's place moved out with
    // it. A guard that reads only render.ts is reading a fraction of the
    // surface, and it reports the code it cannot see as missing rather than as
    // moved — which is exactly what four of these cases did.
    "viewmodel.ts",
    "renderclient-place.ts",
    "renderclient.ts",
    "renderclient-detail.ts",
    "renderclient-walk.ts",
    "renderclient-form.ts",
    "renderclient-panel.ts",
    "renderclient-log.ts",
    "renderclient-live.ts",
    "renderstyle.ts",
  ].map((f) => ({
    rel: f,
    text: readFileSync(join(REPO_ROOT, "deliverable", "engine", f), "utf8"),
  }));
}

/** The same, as one string, for a test that only greps. */
export function mirrorSource(): string {
  return mirrorSources()
    .map((s) => s.text)
    .join("\n");
}

/** THE WHOLE LANE, wherever its verbs live. tools.ts assembles the registry
 *  and the four verb groups declare their own entries — a guard that reads
 *  the lane's source must see all five or it is reading a fraction of it. */
export function laneSources(): { rel: string; text: string }[] {
  return ["tools.ts", "tools-file.ts", "tools-run.ts", "tools-desk.ts", "tools-query.ts"].map((f) => ({
    rel: f,
    text: readFileSync(join(REPO_ROOT, "deliverable", "engine", f), "utf8"),
  }));
}

export function laneSource(): string {
  return laneSources()
    .map((s) => s.text)
    .join("\n");
}
