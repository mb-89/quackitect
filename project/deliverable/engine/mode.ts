// WHERE A SATELLITE RUNS: its own process, a worker thread, or this thread.
//
// THE SEPARATION IS ALWAYS THERE. That is the whole design of this setting and
// it is what makes three modes cheap instead of three products.
//
// Owner rulings 2026-08-14, in order, because the third one is what settled it:
//
// 1. "Make it multiprocess by default, and I can flip if I want."
// 2. "The fused single process mode shouldn't exist. Either we do threaded or
//    we do multiprocessing. The structural difference is too big."
// 3. "Is this a problem if we design it in a way that we always assume it's
//    going to be core and satellites and have a separation always? Can I flip
//    between all three?"
//
// THE THIRD ANSWERS THE SECOND. The structural difference the second ruling
// objected to only existed because the fused mode was proposed as BYPASSING
// the split. If the core, the satellite and the channel are always there, then
// running in this thread is not a different architecture — it is the same one
// with the shortest possible crossing.
//
// So there is ONE architecture and THREE TRANSPORTS:
//
// - PROCESS. A child process per satellite. A crash is isolated; it costs a
//   process start and an IPC hop.
// - THREAD. A worker thread per satellite. Handles and start-up are shared;
//   a hard crash takes the machine with it.
// - INLINE. A direct call in this thread. No crossing cost at all.
//
// WHAT INLINE IS FOR, and it is not "the old behaviour". It is the BASELINE
// the other two are measured against: same structure, same routing, same
// naming clause, zero transport. Subtract it and what is left is what the
// crossing actually costs on the machine that matters.
//
// THE ONE RULE THAT KEEPS THIS HONEST: THE CROSSING MARSHALS, EVEN INLINE.
// An inline crossing that hands back a live object reference would work
// beautifully and would make the other two fail at the moment somebody
// switched — the classic case of a fast path that quietly stops obeying the
// contract the slow paths keep. Inline serialises like the others. It is
// allowed to be faster, never to be laxer.
//
// IT IS SESSION STATE, NOT PRODUCT STATE. It lives under `.se/`, host-local
// and uncommitted, exactly like the autonomy dial, which the owner ruled must
// never be committed. What suits one machine's cores is not a fact about the
// product.
//
// raid-asm-the-target-machine-is-many-throttled-cores says the target is many
// weak cores, and its probe is written and UNRUN. This setting is how that
// probe finally gets run on the machine it is about.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { seDir } from "./paths.ts";

export type RunMode = "process" | "thread" | "inline";

/** Ordered most isolated to least, which is the order a surface should offer
 *  them in: the cost and the safety move together down the list. */
export const RUN_MODES: RunMode[] = ["process", "thread", "inline"];

/** One line each, for whatever surface offers the choice. The person picking
 *  a transport should not have to read this file. */
export const MODE_HELP: Record<RunMode, string> = {
  process: "a child process per record — a crash stays with the record that caused it",
  thread: "a worker thread per record — cheaper to start, and a hard crash takes everything",
  inline: "no crossing at all — the baseline the other two are measured against",
};

/** The default (owner ruling 2026-08-14). */
export const DEFAULT_MODE: RunMode = "process";

const FILE = "mode.json";

const isMode = (v: unknown): v is RunMode => typeof v === "string" && (RUN_MODES as string[]).includes(v);

/** WHAT THE PERSON LAST CHOSE, or the default.
 *
 *  An unreadable or unrecognised file answers the DEFAULT rather than throwing.
 *  A setting that can stop the engine starting is worse than one that is
 *  occasionally ignored. */
export function readMode(root: string): RunMode {
  return storedMode(root).mode;
}

/** Set it. The person's hand does this from the mirror; a launch argument does
 *  it for one run without writing anything. */
export function writeMode(root: string, mode: RunMode): RunMode {
  if (!isMode(mode)) throw new Error(`unknown run mode: ${String(mode)} — one of ${RUN_MODES.join(", ")}`);
  const dir = seDir(root);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, FILE), `${JSON.stringify({ mode }, null, 2)}\n`, "utf8");
  return mode;
}

/** THE MODE THIS RUN ACTUALLY USES.
 *
 *  A launch argument wins over the stored choice and does NOT overwrite it, so
 *  a one-off measurement run cannot silently change what the person picked. */
export function modeForRun(root: string, argMode?: string): RunMode {
  if (argMode !== undefined && argMode !== "") {
    if (!isMode(argMode)) throw new Error(`unknown run mode: ${argMode} — one of ${RUN_MODES.join(", ")}`);
    return argMode;
  }
  return readMode(root);
}

/** BOTH ANSWERS FROM ONE READ.
 *
 *  packet() is on the hot path — recordDone paints green across the whole
 *  corpus — and asking readMode and modeWasChosen separately costs two file
 *  hits per call. Over two hundred nodes that blew the drift budget by 107 ms.
 *
 *  The catch branch keeps modeWasChosen's exact meaning: a file that exists
 *  but holds garbage still counts as chosen, and answers the default. */
export function storedMode(root: string): { mode: RunMode; chosen: boolean } {
  const file = join(seDir(root), FILE);
  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as { mode?: unknown };
    return { mode: isMode(raw.mode) ? raw.mode : DEFAULT_MODE, chosen: true };
  } catch {
    return { mode: DEFAULT_MODE, chosen: existsSync(file) };
  }
}

/** Has a mode ever been chosen, or is the default answering?
 *
 *  The surface needs to tell them apart: "process, because nobody has chosen"
 *  reads differently from "process, because you chose it". */
export function modeWasChosen(root: string): boolean {
  return existsSync(join(seDir(root), FILE));
}
