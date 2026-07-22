// The boot (§6 unbooted → project_selected; §7 admission grant).
//
// A session starts knowing nothing. The boot takes it from initial to the
// state where se.loop.next works:
//   1. log onto the project (single project today; the dimension exists)
//   2. receive the contract — the project's general guidance (rules +
//      voice), served by the server, never baked into AGENTS.md
//   3. attest by returning the contract's hash — the same hash-as-grant
//      mechanism as the write lane; one round-trip per session
// Until admitted, the surface refuses everything except next, boot, help.
//
// Admission is per-session, per-shim (in-memory): a reclaimed VM or fresh
// process boots again, by design.
import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { Rejection } from "./errors.ts";
import { sha256 } from "./hash.ts";
import { layout } from "./layout.ts";
import { loadModules, type ModuleStatus } from "./modules.ts";

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

- Everything goes through the server. Also git. Also reads. Pass this
  rule to every subagent you spawn.
- Never write an ad-hoc script for something SE should do. Ask se_help
  first. That call is checked at review.
- You never push. The owner pushes.
- Gates are offers. A human blesses through their own channel. You park
  or wait; you do not poll a judgment surface.

## The lanes (the loop will hand you the right one)

- Ledger: se_get_*, se_set_apply (dry_run -> diff hash -> execute).
- Deliverable: se_deliverable_list / read / patch / write (hash-guarded).
- Shell: se_run. Git: se_git (allowlisted). Waiting: se_wait.

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
  handover?: string;
  note: string;
}

export function boot(root: string, session: Session, contractHash?: string): BootStep1 | BootAdmitted {
  const project = basename(resolve(root));
  const modules = loadModules(root);
  if (session.admitted) {
    return { step: "admitted", project, modules, note: "already admitted — se_loop_next continues" };
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
  const handoverPath = join(root, "product", "spec", "handover.md");
  return {
    step: "admitted",
    project,
    modules,
    ...(existsSync(handoverPath) ? { handover: readFileSync(handoverPath, "utf8") } : {}),
    note: "admitted. The handover above is your state; se_loop_next is your next call.",
  };
}

/** Dispatch guard: the surface is gated until admission (§7). */
export function assertAdmitted(session: Session, toolName: string): void {
  if (session.admitted || PRE_BOOT_TOOLS.has(toolName)) return;
  throw new Rejection({
    clause: "SE-C-005",
    expected: "an admitted session (the boot: log on, read the contract, attest its hash)",
    got: `unadmitted call to ${toolName}`,
    remedy: { tool: "se_boot", args: {}, note: "one round-trip: se_boot returns the contract + hash; se_boot with contract_hash admits you" },
    source: "engine/boot.ts assertAdmitted",
  });
}
