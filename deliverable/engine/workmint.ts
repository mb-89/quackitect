// THE CROSSING FROM THE WALK TO THE WORK STORE. It realizes
// if-work-store-to-walk-engine, which was specified and never built.
//
// see dsp-the-work-store.md#responsibility — "Mint what a position owes on
// entry" is the first of the store's five acts, and until this module existed
// nothing called it. The model was built and inert.
//
// THREE SOURCES, and the requirement names all three: the READING a state
// demands, the MARKED STEPS of its method, and the EVIDENCE it must produce.
import { join } from "node:path";
import { anchorOf, upwardFrom } from "./traceup.ts";
import type { MintDemand } from "./workstore.ts";
import { demandsFromCard } from "./workstore.ts";

/** Which of the documents a state demands is its METHOD CARD.
 *
 *  A state's reading names the card among the documents it demands, and only
 *  that one carries marks. Three signals, because the corpus uses all three:
 *  the methods folder, the method guidance folder, and the `meth-` prefix every
 *  card's own filename carries. */
function isMethodCard(path: string): boolean {
  return path.includes("machines/methods/") || path.includes("guidance/method/") || /(^|\/)meth-[^/]*\.md$/.test(path);
}

function tail(path: string): string {
  const cut = path.lastIndexOf("/");
  return (cut < 0 ? path : path.slice(cut + 1)).replace(/\.md$/, "");
}

/** What one state owes when it is entered.
 *
 *  A SOURCE THAT IS EMPTY CONTRIBUTES NOTHING, rather than an empty
 *  placeholder. A state demanding no reading owes no reading item.
 *
 *  A CARD THAT WILL NOT PARSE REFUSES ENTRY. `demandsFromCard` throws before
 *  anything is written, and the throw travels: a partial set reads exactly like
 *  a complete one, so no set is better than half of one. */
/** WHICH VERBS MEAN A STATE BUILDS SOMETHING. A state that can write is a state
 *  whose work rests on the design input. */
const WRITES = ["se_file_write", "se_file_patch", "se_file_delete", "se_file_move", "se_file_replace"];

/** WHAT A BUILDING STATE OWES READING OF: the chain above the thing it builds.
 *
 *  THE ENGINE COMPUTES IT rather than anybody listing it. A state builds one
 *  named artifact; that artifact records what it realizes, which records what it
 *  refines, to the root. Walking those edges is the demand.
 *
 *  NOT THE WHOLE CORPUS, AND NOT ONE FILE SOMEBODY NAMED. A blanket demand for
 *  every design document makes every building state owe sixty reads, most of
 *  them about something else. The trace is what narrows it honestly.
 *
 *  READING IS SHARED, so this costs far less than it looks. A document proven
 *  once satisfies every piece of work pointing at it, whichever state minted
 *  them, so the total is the union across the record rather than the sum. */
function chainAbove(machineRoot: string, stateId: string, recordHome: string | undefined): string[] {
  if (recordHome === undefined) return [];
  const anchor = anchorOf(machineRoot, stateId);
  return anchor === undefined ? [] : upwardFrom(machineRoot, anchor);
}

/** ONE — the reading the state demands, as the step's own children.
 *
 *  THE STATE IS THE PARENT and the reading is what hangs off it. Nothing else
 *  has to model that: a piece of work already records the position it was
 *  minted at, so the step and its reading are joined there.
 *
 *  EVERY READING TOKEN IS EPHEMERAL. It goes when the state completes, which is
 *  what `lifetime: state` means. The step outlives it; the reading does not.
 *
 *  AND IT IS A NO-OP FOR WHOEVER HOLDS IT. Nobody files evidence against one.
 *  The token carries a link, and the read credit closes it — here and at every
 *  other state that wanted the same document.
 *  see dsp-the-work-store.md#a-reading-token-settles-from-the-reading */
function readingDemands(reading: string[], difficulty: string): MintDemand[] {
  return reading.map((path) => ({
    source: "reading" as const,
    source_ref: path,
    step: "",
    statement: `Read ${tail(path)}`,
    difficulty,
    lifetime: "state" as const,
  }));
}

/** TWO — the marked steps of its method.
 *
 *  A STATE REACHES ITS CARD BY TAG FAR MORE OFTEN THAN BY `entry.read`, so the
 *  set to read marks from is everything the state PULLS, not only what it
 *  demands proof of reading. The two answer different questions: reading is what
 *  a hand must take in, and the marks are what the state must produce.
 *
 *  MEASURED BEFORE THIS: 305 marked parts across 73 cards produced ZERO step
 *  work. Thirteen of twenty-one shared states name no card in `entry.read` at
 *  all — boot, the front desk and the overhaul among them — so a person watching
 *  a boot saw nothing appear.
 *  see dsp-the-work-store.md#one-home-for-reading-and-writing */
function stepDemands(machineRoot: string, cards: string[], difficulty: string): MintDemand[] {
  const out: MintDemand[] = [];
  for (const path of cards) {
    if (!isMethodCard(path)) continue;
    const abs = join(machineRoot, path);
    for (const d of demandsFromCard(abs)) {
      // THE REF IS ROOT-RELATIVE, and that is a privacy rule rather than a
      // tidiness one. The card is read by absolute path, and an absolute path on
      // this machine carries the account name of whoever ran it. A work item
      // lands in version control, so it keeps the path the repository knows.
      //
      // THE ANCHOR IS PRESERVED rather than rebuilt: the slug that names the
      // part is not always the stamped step, and rebuilding would point at a
      // heading that does not exist.
      const ref = d.source_ref.startsWith(abs) ? path + d.source_ref.slice(abs.length) : d.source_ref;
      out.push({ ...d, source_ref: ref, difficulty });
    }
  }
  return out;
}

/** THREE — the evidence it must produce. An optional field is not owed. */
function evidenceDemands(fields: { name: string; required?: boolean }[], difficulty: string): MintDemand[] {
  return fields
    .filter((f) => f.required !== false)
    .map((f) => ({
      source: "evidence" as const,
      source_ref: f.name,
      step: "",
      statement: `Fill ${f.name.replace(/_/g, " ")}`,
      difficulty,
    }));
}

/** ZERO — the trace above what this state builds, for a state that can write.
 *  see dsp-the-work-store.md#a-building-state-owes-its-own-trace */
function readingFor(machineRoot: string, decl: StateShape, recordHome: string | undefined): string[] {
  const reading = [...(decl.entry?.read ?? [])];
  if (!(decl.legal_tools ?? []).some((t) => WRITES.includes(t))) return reading;
  for (const path of chainAbove(machineRoot, decl.id ?? "", recordHome)) {
    if (!reading.includes(path)) reading.push(path);
  }
  return reading;
}

interface StateShape {
  id?: string;
  entry?: Record<string, string[]>;
  evidence_form?: { name: string; required?: boolean }[];
  complexity?: { judgement: string };
  legal_tools?: string[];
}

export function demandsForState(machineRoot: string, decl: StateShape, recordHome?: string, pulled: string[] = []): MintDemand[] {
  const difficulty = decl.complexity?.judgement ?? "";
  const reading = readingFor(machineRoot, decl, recordHome);
  // A CARD NAMED BY BOTH PATHS IS READ ONCE. Reading it twice would mint every
  // one of its steps twice, and the two copies would differ in nothing.
  const cards = [...reading];
  for (const path of pulled) if (!cards.includes(path)) cards.push(path);
  return [
    ...readingDemands(reading, difficulty),
    ...stepDemands(machineRoot, cards, difficulty),
    ...evidenceDemands(decl.evidence_form ?? [], difficulty),
  ];
}
