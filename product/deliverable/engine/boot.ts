// The boot (§6 unbooted → project_selected; §7 admission grant).
//
// A session starts knowing nothing. The boot takes it from initial to the
// state where se.loop.next works:
//   1. lock onto the product (nameplate-recognized; recents recorded for
//      the future picker)
//   2. receive the contract — the project's general guidance (rules +
//      voice), served by the server, never baked into AGENTS.md
//   3. attest by returning the contract's hash — the same hash-as-grant
//      mechanism as the write lane; one round-trip per session
// Admission writes the session lock (product root + active import roots) —
// the workspace fence reads it — and hands over a PROJECTION of live state,
// never a hand-written file.
//
// Admission is per-session, per-shim (in-memory): a reclaimed VM or fresh
// process boots again, by design.
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { boardUrl, pokeBoard, spawnBoard } from "./board.ts";
import { Rejection } from "./errors.ts";
import { sha256 } from "./hash.ts";
import { readJsonFile } from "./jsonio.ts";
import { layout } from "./layout.ts";
import { loadModules, type ModuleStatus } from "./modules.ts";
import { projectState, renderHandover } from "./project.ts";

export interface Session {
  admitted: boolean;
  project?: string;
  contractHash?: string;
}

export function newSession(): Session {
  return { admitted: false };
}

/** Tools legal before admission. */
export const PRE_BOOT_TOOLS: ReadonlySet<string> = new Set(["se_loop_next", "se_boot", "se_help"]);

const GENERAL_RULES = `# The contract

You work through the se MCP server, and you do what it tells you.

## Hard rules

- Everything goes through the server. Also git. Also reads. Also file
  SEARCH: locating a file is lane work, not harness work. Pass this rule
  to every subagent you spawn.
- Before any direct harness tool touches or looks for product content
  (read, grep, glob, find, shell), call se_help first. No logged miss, no
  direct tool. The workspace fence enforces this; the call log proves it
  at review.
- Never write an ad-hoc script for something SE should do. Ask se_help
  first.
- You never push. The owner pushes.
- Commit narrow: se_git add with an explicit \`--\` pathspec, never a
  broad add. Editor droppings ride along otherwise.
- Gates are offers. A human blesses through their own channel. You park
  or wait; you do not poll a judgment surface.
- Discuss first. When the owner opens a discussion, nothing is built,
  opened, or committed until the owner says go. Collect, propose, wait.
  Opening an iteration counts as work.

## The boot ritual (chat side)

- Recite the contract's core in one visible message.
- Ask ONE question, once: proceed, and with which project.
- Then run to idle with no further questions.
- At idle, say so: "idle — what next?" with the options.
- Never start an iteration unasked. Idle is a stop, not a springboard.

## The lanes (the loop will hand you the right one)

- Ledger: se_get_*, se_set_apply (dry_run -> diff hash -> execute).
- Files: se_file_list / search / read / patch / write / delete (CAS).
- Shell: se_run. Git: se_git (allowlisted). Waiting: se_wait.

## Call discipline

- Batch known-target reads into ONE message; every separate call costs
  a full round-trip. Go sequential only when the next call depends on
  the previous result.
- Prefer one whole-file write over three or more patches when you hold
  the whole file. Prefer one surgical patch in a big file you don't.

## Voice — how to write every output
`;

export function composeContract(root: string): { contract: string; hash: string } {
  const voicePath = join(layout.deliverable(root), "brand", "voice.md");
  const voice = existsSync(voicePath)
    ? readFileSync(voicePath, "utf8")
    : "(no voice guide found — write plainly, short sentences, lists)";
  const contract = `${GENERAL_RULES}\n${voice.trim()}\n`;
  return { contract, hash: sha256(contract) };
}

/** The product name: nameplate if present, folder name until then. */
export function productName(root: string): { name: string; nameplate: boolean } {
  const path = layout.nameplatePath(root);
  if (!existsSync(path)) return { name: basename(resolve(root)), nameplate: false };
  const decl = readJsonFile<{ product?: string }>(path);
  return { name: decl.product ?? basename(resolve(root)), nameplate: true };
}

/** Admission side-effect: the fence reads this to know what is locked. */
function writeLock(root: string, product: string, modules: ModuleStatus[]): void {
  const abs = resolve(root);
  const lock = {
    product,
    product_root: abs,
    locked_roots: [abs, ...modules.filter((m) => m.import_root !== undefined).map((m) => m.import_root!)],
    workspace_exempt: join(abs, "workspace"),
    at: new Date().toISOString(),
  };
  mkdirSync(layout.seDir(abs), { recursive: true });
  writeFileSync(layout.lockPath(abs), JSON.stringify(lock, null, 2) + "\n", "utf8");
}

/** Recents feed the future product picker; one line per product, deduped. */
function appendRecents(root: string, product: string): void {
  const abs = resolve(root);
  const path = layout.recentsPath();
  if (existsSync(path)) {
    const lines = readFileSync(path, "utf8").split("\n").filter((l) => l.trim() !== "");
    if (lines.some((l) => (JSON.parse(l) as { root: string }).root === abs)) return;
  } else {
    mkdirSync(join(path, ".."), { recursive: true });
  }
  appendFileSync(path, JSON.stringify({ root: abs, product, at: new Date().toISOString() }) + "\n", "utf8");
}

export interface BootStep1 {
  step: "attest";
  project: string;
  modules: ModuleStatus[];
  contract: string;
  contract_hash: string;
  note: string;
}

export interface BootAdmitted {
  step: "admitted";
  project: string;
  modules: ModuleStatus[];
  board_url: string;
  handover: string;
  note: string;
}

export function boot(
  root: string,
  session: Session,
  contractHash?: string,
  opts: { board?: boolean } = {},
): BootStep1 | BootAdmitted {
  const { name: project, nameplate } = productName(root);
  const modules = loadModules(root);
  if (session.admitted) {
    return {
      step: "admitted",
      project,
      modules,
      board_url: boardUrl(),
      handover: renderHandover(projectState(root)),
      note: "already admitted — se_loop_next continues",
    };
  }
  const { contract, hash } = composeContract(root);
  if (contractHash === undefined) {
    session.project = project;
    return {
      step: "attest",
      project,
      modules,
      contract,
      contract_hash: hash,
      note: "read the contract, then call se_boot again with contract_hash — that attestation admits this session",
    };
  }
  if (contractHash !== hash) {
    throw new Rejection({
      clause: "SE-C-006",
      expected: `the current contract hash ${hash}`,
      got: contractHash,
      remedy: { tool: "se_boot", args: {}, note: "the contract changed — re-read it and attest the fresh hash" },
      source: "engine/boot.ts",
    });
  }
  session.admitted = true;
  session.project = project;
  session.contractHash = hash;
  writeLock(root, project, modules);
  appendRecents(root, project);
  if (opts.board === true) {
    spawnBoard(root);
    pokeBoard();
  }
  return {
    step: "admitted",
    project,
    modules,
    board_url: boardUrl(),
    handover: renderHandover(projectState(root)),
    note: nameplate
      ? "admitted. The handover above is live state; se_loop_next is your next call."
      : "admitted. NOTE: no product.json nameplate at the root — create one via se_file_write ({\"product\": \"<name>\"}).",
  };
}

/** Dispatch guard: the surface is gated until admission (§7). */
export function assertAdmitted(session: Session, toolName: string): void {
  if (session.admitted || PRE_BOOT_TOOLS.has(toolName)) return;
  throw new Rejection({
    clause: "SE-C-005",
    expected: "an admitted session (the boot: lock on, read the contract, attest its hash)",
    got: `unadmitted call to ${toolName}`,
    remedy: { tool: "se_boot", args: {}, note: "one round-trip: se_boot returns the contract + hash; se_boot with contract_hash admits you" },
    source: "engine/boot.ts assertAdmitted",
  });
}
