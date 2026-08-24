// THE SPAWN CHECK — did the guide actually put a second hand on the work?
//
// THE LANE STILL STARTS NOTHING. req-the-machine-names-a-driver-and-starts-nothing
// is a must graded fatal, and this script does not touch it: it reads the job
// registry and reports. The spawn is the guide's act, performed through the
// harness, and se_run {agent} is how the guide declares it to the record.
//
// WHAT IT PROVES AND WHAT IT DOES NOT. It proves a hand was registered. It
// cannot prove that hand did the work, and it is not meant to — the retro
// weighs the share each part took, from the part stamped on every call. A
// guide doing too much is a signal to fix the system, never a refusal here.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const jobs = join(root, ".se", "jobs");

/** THE MOST WALKERS THIS RECORD MAY RUN WITH, READ FROM THE RECORD ITSELF.
 *
 *  IT IS A CEILING, NOT A QUOTA (owner ruling 2026-08-23). The kickoff sets
 *  the maximum; the guide spawns fewer whenever fewer is right.
 *
 *  ZERO IS THE DEFAULT (owner ruling 2026-08-23, taken on the evidence).
 *  Delegated WRITING was measured over a full day and lost: three hands each
 *  spent about fifteen minutes rebuilding context the guide already held. The
 *  prior art agrees — reads parallelise and writes do not — so a record asks
 *  for a walker deliberately rather than inheriting one.
 *
 *  A REVIEWER AND A RESEARCHER ARE UNAFFECTED. Neither counts here, and both
 *  earned their cost the same day: a cold reviewer found two real gaps in a
 *  gate the guide had blessed, and a researcher produced the evidence this
 *  default rests on.
 *
 *  THE NUMBER LIVES WHERE IT WAS DECIDED: the kickoff gate's own evidence, in
 *  the record's folder. There is exactly one place to read and one place to
 *  change, and it travels with the record.
 *
 *  IT WAS BRIEFLY KEPT IN `.se/settings.json` AND THAT WAS WRONG. Session state
 *  is global to the session, so a per-record number kept there leaks into every
 *  other record and gives two sources that can disagree. Owner ruling, same
 *  day: build it so it works, rather than building it twice.
 *
 *  THE ENGINE NAMES THE RECORD in SE_MACHINE, because only the walk knows
 *  which one it stands in. A record folder is `<machine-id>-<slug>`.
 *
 *  UNREADABLE MEANS ZERO, and that is now the safe direction rather than the
 *  loud one. A record that has not asked for a walker does not get one. */
function walkerCeiling(): number {
  const machine = process.env.SE_MACHINE ?? "";
  if (machine === "") return 0;
  const base = join(root, "spec", "iterations");
  let dir = "";
  try {
    dir = readdirSync(base).find((n) => n === machine || n.startsWith(`${machine}-`)) ?? "";
  } catch {
    return 0;
  }
  if (dir === "") return 0;
  try {
    const txt = readFileSync(join(base, dir, "evidence", "gate-kickoff.md"), "utf8");
    const section = txt.split(/^## /m).find((p) => p.startsWith("walkers"));
    if (section === undefined) return 0;
    const found = /\d+/.exec(section.slice("walkers".length));
    if (found === null) return 0;
    const n = Number(found[0]);
    return Number.isInteger(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

interface Record {
  id?: string;
  kind?: string;
  command?: string;
  started?: number;
  session?: string;
  running?: boolean;
  role?: string;
}

/** THE LAST LINE WINS. A job's file is append-only, so the newest record is
 *  the standing one — the same reading the engine's own loader uses. */
function last(file: string): Record | undefined {
  const lines = readFileSync(file, "utf8").trimEnd().split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line === undefined || line.trim() === "") continue;
    try {
      return JSON.parse(line) as Record;
    } catch {
      // A torn line is not an answer. Keep looking further back.
    }
  }
  return undefined;
}

function all(): Record[] {
  if (!existsSync(jobs)) return [];
  const out: Record[] = [];
  for (const name of readdirSync(jobs)) {
    if (!name.endsWith(".jsonl")) continue;
    const rec = last(join(jobs, name));
    if (rec !== undefined) out.push(rec);
  }
  return out;
}

/** WHICH SESSION IS RUNNING NOW. `.se/settings.json` carries it, written by
 *  `persistSettings()` in `session.ts` from `process.env.SE_SESSION`.
 *
 *  THIS USED TO KEY ON THE NEWEST BOOT JUDGMENT INSTEAD, and that was wrong
 *  in a way that only showed up after a reload. Reloading the engine reruns
 *  boot and writes a FRESH `judgment-boot-*` job, so every hand registered
 *  before the reload instantly stopped counting. The state this check guards
 *  is read-only, so nobody standing there could spawn a new hand to satisfy
 *  it — the walk was trapped, silently, because the check still ran green
 *  right up until the reload that broke it.
 *
 *  THE SESSION ID SURVIVES A RELOAD; THE BOOT RECORD DOES NOT. Keying on it
 *  instead means a hand registered earlier in the same session still counts,
 *  however many times the engine reloads in between.
 *
 *  MISSING OR UNREADABLE MEANS NO SESSION TO MATCH, so nothing is counted —
 *  the loud direction, same as `handsDial()` above. */
function currentSession(): string | undefined {
  try {
    const s = JSON.parse(readFileSync(join(root, ".se", "settings.json"), "utf8")) as { session?: unknown };
    return typeof s.session === "string" && s.session !== "" ? s.session : undefined;
  } catch {
    return undefined;
  }
}

// THE NUMBER IS A CEILING, NEVER A QUOTA (owner ruling 2026-08-23). The
// kickoff sets the MOST hands this record may run with. Spawning fewer is
// always allowed, and spawning none at a given state is allowed too.
//
// SO THIS CHECK NO LONGER ASKS "DID YOU SPAWN". It used to, and that was the
// wrong question: it forced a hand onto work the guide could do faster, which
// is the exact waste the dial exists to stop. The guide decides at each spawn
// state whether this phase earns a hand.
//
// WHAT IT DOES ASK is whether more hands stand than the record agreed to. A
// ceiling nobody enforces is a suggestion, and the A/B needs the arms to mean
// what they say.
const ceiling = walkerCeiling();

const records = all();
const session = currentSession();

// A JOB WITH NO SESSION RECORDED PREDATES THIS CHANGE. It is neither stale
// nor found — there is nothing to compare it against, so it is ignored
// rather than guessed at either way.
// A CEILING COUNTS WHAT IS RUNNING, NEVER WHAT HAS EVER RUN. The first
// version counted every hand of this session, finished ones included, so the
// ceiling filled up permanently and could never be freed again.
//
// AND THE REMEDY IT PRINTED COULD NOT WORK. It said to close the finished
// hands, but `settleOperation` is a no-op on a job that already ended, so the
// call succeeded and changed nothing. The walk was trapped at a read-only
// state by a check whose own advice was impossible to follow.
const stale = records.filter((r) => r.kind === "agent" && r.session !== undefined && r.session !== session);
// ONLY WALKERS COUNT (owner ruling 2026-08-23). A reviewer buys separation at
// a gate and a researcher buys reading nobody has done. Neither competes for
// the walking slot, and a reviewer that filled it stranded the next phase
// outright — measured the same day, on the state this check guards.
//
// A HAND WITH NO ROLE COUNTS. It predates the field, and the conservative
// direction is the one that cannot quietly raise the ceiling.
const found = records.filter(
  (r) =>
    r.kind === "agent" &&
    r.session !== undefined &&
    r.session === session &&
    r.running === true &&
    (r.role === undefined || r.role === "walker"),
);

if (found.length > ceiling) {
  process.stderr.write(
    `this record agreed to at most ${String(ceiling)} walker(s); ${String(found.length)} stand registered this session.\n\n` +
      "THE KICKOFF SET THE CEILING and the record is walking past it. Close the\n" +
      'hands that are done with se_run {agent_done: "<id>"}, or raise the number\n' +
      "at the kickoff gate and say why.\n",
  );
  process.exit(1);
}

// A CEILING OF ZERO MAKES THIS STATE A PASS-THROUGH, and it says so rather
// than printing a green that reads like a spawn happened.
//
// IT IS THE DEFAULT, NOT AN OMISSION. A record asks for a walker deliberately;
// one that has not asked runs none, and this state has nothing to do.
//
// IT IS STILL WALKED, AND THAT IS THE PART THAT IS NOT FIXED. Skipping it
// outright needs a machine that can disable a state, which does not exist. The
// state passes through without asking the agent for anything, which is as far
// as the mechanism reaches today.
if (ceiling === 0) {
  process.stdout.write("no walkers for this record. The ceiling is zero, so this state is a pass-through\n");
  if (found.length > 0) {
    process.stdout.write(`${String(found.length)} walker(s) registered anyway, which is the ceiling exceeded rather than met\n`);
  }
  process.exit(0);
}

// SAY WHAT WAS COUNTED, and say what was ignored. A reader who sees the ids
// catches a wrong answer in a second; a bare green hides it.
process.stdout.write(`${String(found.length)} walker(s) running, ceiling ${String(ceiling)}\n`);
for (const h of found) process.stdout.write(`  ${h.id ?? "(no id)"}  ${h.command ?? ""}\n`);
if (stale.length > 0) process.stdout.write(`${String(stale.length)} older hand(s) ignored, from before this session\n`);
process.exit(0);
