// see dsp-the-work-store.md#responsibility
//
// EVERY WRITE TO A PIECE OF WORK IS HERE, and no other module writes one. One
// writer is what makes the merge surface countable.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { cardWork, stampCard } from "./cardwork.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { readKeys, setKeys, splitNote } from "./frontmatter.ts";
import { readNode, readNodeIfPresent, writeNode } from "./notes.ts";
import { noteFileChanged } from "./vault.ts";
// The pen reads BACKLOG back from here, so the two modules refer to each
// other. Nothing is touched at load: the reference is inside a function.
import { isDrawn, penSignal, penWork } from "./workpen.ts";

const SRC = "engine/workstore.ts";

export type WorkStatus = "open" | "in_work" | "done" | "dropped" | "superseded";
export type WorkLifetime = "record" | "state";
export type WorkSource = "reading" | "step" | "evidence" | "pen" | "hand";

/** The three ends. Everything else is a stage on the way. */
const TERMINAL: WorkStatus[] = ["done", "dropped", "superseded"];

/** Not a position. Work sits here when nobody has said where it will be done. */
export const BACKLOG = "backlog";

/** THE STATE THE BACKLOG IS DRAWN AT. The backlog is an alias for the front
 *  desk's pending bucket (owner), so a token nobody has placed shows there
 *  rather than nowhere.
 *
 *  IT IS A NAME, NOT A PLACE. The token's `place` stays `backlog`, which is what
 *  makes `bucketOf` answer `pending`. This is only where the drawing puts the
 *  count.
 *
 *  MEASURED: work minted into the backlog filed under a key called `backlog`,
 *  no state is drawn by that name, and the count went nowhere at all. */
export const BACKLOG_IS_DRAWN_AT = "front_desk";

export interface WorkItem {
  id: string;
  statement: string;
  /** The card's stamped step identity, or "" where the work came from no card. */
  step: string;
  source: WorkSource;
  source_ref: string;
  /** The position that minted it. It never moves. */
  origin: string;
  /** Where it will be done. A position, or the backlog. */
  place: string;
  status: WorkStatus;
  reason: string;
  taken_by: string;
  /** WHAT THE HAND SAID WHEN IT PICKED THIS UP. Required, like the reason on a
   *  close — see dsp-the-work-store.md#both-ends-of-a-piece-of-work-say-something */
  took_comment: string;
  lifetime: WorkLifetime;
  person_only: boolean;
  /** A GROUPING A PERSON MADE, and the only thing here they name themselves.
   *
   *  EMPTY MEANS THE PLACE IS THE BUCKET. A token carrying a bucket groups
   *  under it; one without groups under where it will be done. That fallback
   *  lives in the view, as `if(bucket, bucket, place)`, so the file stays honest
   *  — an absent bucket is absent rather than a copy of the place that drifts.
   *
   *  A PLACE IS THE MACHINE'S AND A BUCKET IS THE PERSON'S. Places come from the
   *  drawing and cannot be renamed from here. A bucket is a name somebody typed,
   *  so it can be renamed and it can be emptied.
   *
   *  DROPPING ONTO A PLACE CLEARS IT (owner). The drop says where the work will
   *  be done, which is a stronger statement than the grouping it was filed
   *  under, so the grouping goes rather than sitting on top of it. */
  bucket: string;
  /** WHICH OF A STATE'S THREE BUCKETS THIS SITS IN, when somebody said so.
   *
   *  EMPTY MEANS DERIVED, and that is the ordinary case: reading work is taken
   *  IN, everything else is produced OUT, and work nobody has placed is PENDING.
   *
   *  A DROP ON THE DRAWING SETS IT (owner). A state carries three drop zones, so
   *  landing on one is a statement about which bucket the work belongs in — and
   *  a statement nobody stored could not survive the drop.
   *
   *  `done` IS NEVER STORED HERE. Done is a filter over status, so work reaches
   *  it by finishing rather than by being put there. */
  slot: string;
  group: string;
  part_of: string;
  parts: string[];
  /** What this waits for. EMPTY IS THE ORDINARY CASE, and everything with an
   *  empty list is ready — see dsp-the-work-offer.md#behavior-and-constraints.
   *
   *  Two shapes, and the second is one fact rather than a list:
   *  `work:<id>:<outcome>` and `position:<id>`. */
  after: string[];
  /** The rung the sizing published, or "" where nothing matched. Read here,
   *  never decided here. */
  difficulty: string;
  opened: string;
  closed: string;
  body: string;
}

export interface MintDemand {
  source: WorkSource;
  source_ref: string;
  /** "" where the demand comes from something other than a marked card part. */
  step: string;
  statement: string;
  body?: string;
  person_only?: boolean;
  lifetime?: WorkLifetime;
  group?: string;
  after?: string[];
  difficulty?: string;
}

export interface MintReport {
  minted: WorkItem[];
  matched: WorkItem[];
  /** Already settled, so not re-minted. see dsp-the-work-store.md#behavior-and-constraints */
  settled: WorkItem[];
  /** Standing work the card no longer names. REPORTED, never deleted. */
  orphaned: WorkItem[];
}

function workDir(home: string): string {
  return join(home, "work");
}

function itemPath(home: string, id: string): string {
  return join(workDir(home), `${id}.md`);
}

/** A NUMBER THAT MOVES WHENEVER ANY PIECE OF WORK DOES.
 *
 *  THE PILLS ARE PUSHED, NOT POLLED, and the push only fires when something in
 *  the watched shape changes. Without this the counts moved on disk and the
 *  drawing sat still until the reader navigated — which is what made a bubble
 *  look like it needed a state change to appear.
 *
 *  IT IS A STAT, NEVER A READ. Hashing the contents would mean reading every
 *  item on a two-second loop. Size plus modification time answers the same
 *  question for one syscall each, and a settle rewrites the file so both move.
 *
 *  THE FOLDER'S OWN MTIME IS NOT ENOUGH. It moves when a file is added or
 *  removed and stands still when one is rewritten in place — which is exactly
 *  a take and a settle, the two the reader most wants to see.
 *  see dsp-mirror-render.md#the-pills-are-pushed */
export function workSignal(home: string | undefined): number {
  if (home === undefined) return 0;
  const dir = workDir(home);
  if (!existsSync(dir)) return 0;
  let sum = 0;
  try {
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".md")) continue;
      const s = statSync(join(dir, name));
      sum += s.size + s.mtimeMs;
    }
  } catch {
    // A folder read that fails is a signal of zero, never a thrown render.
  }
  return sum;
}

/** EVERY PLACE A PIECE OF WORK CAN LIVE, and the editor reads all of them.
 *
 *  THERE IS NO BOUND RECORD, and there is no work tree either. A token is seen
 *  whether or not the walk stands in the record holding it, so two iterations
 *  with open work both show, and nobody enters an iteration to look at its work.
 *
 *  TWO HOMES, SPLIT BY WHETHER THE WORK TRAVELS. `.se/` holds everything
 *  private, which is anything that does not leave this machine. A record's own
 *  folder holds everything persistent.
 *
 *  see dsp-the-work-store.md#one-home-for-reading-and-writing */
export function workHomes(root: string): string[] {
  const out = [privateHome(root)];
  for (const kind of ["iterations", "expeditions"]) {
    const dir = join(root, "spec", kind);
    if (!existsSync(dir)) continue;
    try {
      for (const name of readdirSync(dir)) {
        const home = join(dir, name);
        if (existsSync(workDir(home))) out.push(home);
      }
    } catch {
      // A folder that cannot be listed contributes no homes, and never throws
      // a render.
    }
  }
  return out;
}

export interface AllWork {
  items: WorkItem[];
  unreadable: { path: string; why: string }[];
  /** Which home holds each id, so an act names an id and nothing else. */
  homeById: Map<string, string>;
}

/** EVERY PIECE OF WORK THE PROJECT HOLDS, wherever it lives.
 *
 *  THE PEN RIDES ALONG, AND IT HAS NO HOME. Pending notes and standing pool
 *  tokens are work by every test that matters, and they were invisible here —
 *  so the retro showed nothing owed and the desk showed no backlog.
 *
 *  A DRAWN ITEM IS NEVER FILED IN `homeById`, on purpose. An act that names a
 *  home then refuses instead of writing a status nothing would read back.
 *
 *  WHAT THE PEN COSTS, because the call site hides it. Measured on 255 items,
 *  238 of them drawn: the whole read is 30.5 ms and the pen is 15.8 ms of it.
 *  The pool is 154 files, so the pen scales with the backlog and the store half
 *  does not. */
/** THE LAST ANSWER, AND THE STAMP IT WAS COMPUTED FROM.
 *
 *  COUNT THE ASKS, NOT THE MILLISECONDS. A packet asks this ONCE PER STATE, so
 *  a record of sixty-four states read every work file sixty-four times.
 *
 *  MEASURED on this tree: 315 items, 23 ms an ask, 1,495 ms for sixty-four of
 *  them. That was the whole of a hop which owed nothing at all — no reading, no
 *  script, no form. The stamp costs 1.6 ms an ask instead.
 *
 *  THE STAMP IS THE ONE THAT ALREADY EXISTS. `allWorkSignal` stats the homes
 *  and the two live sources, so a write anywhere moves it and the next ask
 *  recomputes. Nothing is stored that anybody reads as an answer.
 *
 *  THE READ CREDIT IS PART OF THE KEY. A reading token settles from it, so an
 *  answer computed without it is a different answer rather than a stale one.
 *  see guidance/craft/software.md#derive-on-every-look-but-never-re-derive-what-has-not-changed */
let lastAll:
  | {
      root: string;
      signal: number;
      credit: ReadCredit | undefined;
      items: WorkItem[];
      unreadable: { path: string; why: string }[];
      homeById: Map<string, string>;
    }
  | undefined;

export function readAllWork(root: string, isRead?: ReadCredit): AllWork {
  const signal = allWorkSignal(root);
  if (lastAll === undefined || lastAll.root !== root || lastAll.signal !== signal || lastAll.credit !== isRead) {
    const items: WorkItem[] = [];
    const unreadable: { path: string; why: string }[] = [];
    const homeById = new Map<string, string>();
    for (const home of workHomes(root)) {
      const got = readWorkReporting(home, isRead);
      for (const i of got.items) {
        items.push(i);
        homeById.set(i.id, home);
      }
      unreadable.push(...got.unreadable);
    }
    items.push(...penWork(root));
    lastAll = { root, signal, credit: isRead, items, unreadable, homeById };
  }
  // FRESH CONTAINERS, THE SAME ITEMS. A caller that sorts or pushes its own
  // rows must not be editing the next caller's answer.
  return { items: [...lastAll.items], unreadable: [...lastAll.unreadable], homeById: new Map(lastAll.homeById) };
}

/** HOW MANY WORDS A TITLE MAY CARRY. */
export const TITLE_WORDS = 4;

/** THE WORDS IN A TITLE, counted the way a reader counts them.
 *
 *  EVERY SEPARATOR IS A WORD BREAK — a space, an underscore, a dash, a slash, a
 *  colon. Joining words with punctuation to fit more in is the workaround this
 *  counts against rather than around. */
export function titleWords(said: string): string[] {
  return said.split(/[^\p{L}\p{N}]+/u).filter((w) => w !== "");
}

/** A TOKEN NAMES ITS WORK IN FOUR WORDS. It does not describe it.
 *
 *  A TITLE THAT DOES NOT FIT ON A BAR IS NOT A TITLE. The surface draws the
 *  work in hand beside the position, and a sentence there is unreadable at a
 *  glance — which is the whole reason the chip exists.
 *
 *  THE DETAIL ALREADY HAS A HOME. Whatever the title cannot hold goes after a
 *  forward slash on the same line, and lands in the token's body — which is
 *  what a reader opens the token for. */

/** A LINE OPENING A PIECE OF WORK: a four-word NAME, a forward slash, then the
 *  DETAIL. It is the shape the note entry already takes, because a reader
 *  typing one is typing the other.
 *
 *  THE DETAIL IS THE POINT. Four words NAME the work and cannot carry what was
 *  asked for, so a token holding nothing else leaves the next hand — a person,
 *  or another agent — with no idea what to do with it.
 *
 *  NO SLASH MEANS NO DETAIL, never a refusal. Naming a stray is the cheap act,
 *  and demanding prose for a one-line capture would stop people opening tokens
 *  at all. */
export function splitWorkLine(said: string): { statement: string; body: string } {
  const cut = said.indexOf("/");
  if (cut < 0) return { statement: said.trim(), body: "" };
  return { statement: said.slice(0, cut).trim(), body: said.slice(cut + 1).trim() };
}

/** THE FOUR-WORD RULE.
 *
 *
 *  ONLY A HAND IS HELD TO IT. A title derived from a card's heading is the
 *  card author's sentence, and refusing it here would refuse the engine's own
 *  minting rather than teaching anybody anything. */
export function refuseLongTitle(said: string, act: string): void {
  const words = titleWords(said);
  if (words.length <= TITLE_WORDS) return;
  throw new Rejection({
    clause: CLAUSES.WORK_TITLE_TOO_LONG,
    expected: `a title of ${TITLE_WORDS} words or fewer`,
    got: `${words.length} words — "${said}"`,
    remedy: {
      tool: "se_work",
      args: { act, id: "", comment: `${words.slice(0, TITLE_WORDS).join(" ")} / ${said}` },
      note: "name the work in four words, then a forward slash, then everything else — the detail lands in the token's body, where the next hand looks for it. An underscore, a dash and a colon all count as a space, so joining words does not fit more in.",
    },
    source: "engine/workstore.ts title",
  });
}

/** THE PIECE OF WORK IN HAND at one of these positions, or nothing.
 *
 *  TAKEN BEATS MERELY OPEN. A hand marks work before it acts, so an item
 *  carrying a holder is the one being worked. With nothing taken, the oldest
 *  open item at the position is what the walk owes next.
 *
 *  DRAWN WORK IS NEVER IN HAND. A note or a pool token is reported from a live
 *  source and nobody is holding it.
 *
 *  ONE DECIDER, TWO READERS. The bar draws this and the nudge asks about it, so
 *  a second answer would let the surface and the question disagree about what
 *  the walk is doing. */
export function inHandAt(root: string, active: string[]): WorkItem | undefined {
  const at = new Set(active);
  const here = readAllWork(root).items.filter((i) => at.has(i.place) && !isSettled(i) && !isDrawn(i.id));
  if (here.length === 0) return undefined;
  const taken = here.filter((i) => i.taken_by !== "");
  // WITH SEVERAL TAKEN, THE NEWEST IS THE ONE IN HAND. A hand that picks up a
  // second piece has moved onto it, and showing the older one names work the
  // reader can see is not happening.
  //
  // WITH NOTHING TAKEN, THE OLDEST IS WHAT IS OWED NEXT, which is the opposite
  // order and the right one for a queue.
  if (taken.length > 0) return [...taken].sort((a, b) => b.opened.localeCompare(a.opened))[0];
  return [...here].sort((a, b) => a.opened.localeCompare(b.opened))[0];
}

/** THE PRIVATE SOURCE. It never travels and never enters version control. */
export function privateHome(root: string): string {
  return join(root, ".se");
}

/** WHERE A NEW PIECE OF WORK LANDS. Two sources, and the LIFETIME decides.
 *
 *  EPHEMERAL WORK IS PRIVATE BY DEFINITION. `lifetime: state` means the token is
 *  deleted when its state completes, so committing it writes a file whose whole
 *  purpose is to be thrown away. It goes to `.se/`.
 *
 *  PERSISTENT WORK TRAVELS WITH ITS RECORD. It is the evidence of how that
 *  record was worked, so it goes in the record's own folder.
 *
 *  THE WALK DOES NOT DECIDE THIS. Where the agent happens to stand is not a fact
 *  about the work. Before this, one home was picked from the walk and the
 *  lifetime was never consulted — so every ephemeral reading token was
 *  committed, and `.se/` held no work at all. */
export function homeFor(root: string, place: string, lifetime: WorkLifetime): string {
  if (lifetime === "state") return privateHome(root);
  const seg = place.split("/").filter((s) => s !== "");
  const kind = seg[0];
  if (seg.length >= 2 && (kind === "iterations" || kind === "expeditions")) {
    const home = join(root, "spec", kind, String(seg[1]));
    if (existsSync(home)) return home;
  }
  return privateHome(root);
}

/** WHERE A PIECE OF WORK LANDS, AND HOW LONG IT LIVES. One answer, because the
 *  removal reads the FIELD: a file sitting in the private home while claiming to
 *  persist is one the removal walks straight past.
 *
 *  NOTHING OUTSIDE A RECORD PERSISTS. The desk, boot, the retro and the overhaul
 *  all clear when they are left, so work added at one of them goes with it.
 *
 *  THE BACKLOG IS THE EXCEPTION. It is a bucket rather than a position, it holds
 *  candidates for scope until something pulls them in, and no state leaving ever
 *  clears it. */
export function landing(root: string, place: string): { home: string; lifetime: WorkLifetime } {
  const home = homeFor(root, place, "record");
  const persists = place === BACKLOG || home !== privateHome(root);
  return { home, lifetime: persists ? "record" : "state" };
}

/** The home a hand-added piece lands in. Its LIFETIME comes from the same
 *  answer — see `landing`, and never decide one without the other. */
export function homeForPlace(root: string, place: string): string {
  return landing(root, place).home;
}

/** WHICH HOME HOLDS ONE PIECE OF WORK. The editor posts an id and nothing
 *  else, because the reader never had to know which record it came from. */
export function homeOf(root: string, id: string): string | undefined {
  for (const home of workHomes(root)) if (readOne(home, id) !== null) return home;
  return undefined;
}

/** The signal across every home, so a change anywhere moves the bubbles.
 *
 *  THE PEN COUNTS TOO. Its work is drawn from two live sources with no work
 *  folder of their own, so a captured note moved the retro's pill on disk and
 *  the drawing sat still until an unrelated write nudged the number. */
export function allWorkSignal(root: string): number {
  let sum = penSignal(root);
  for (const home of workHomes(root)) sum += workSignal(home);
  return sum;
}

/** What two entries into one position match ON.
 *
 *  see dsp-the-work-store.md#the-identity-lives-in-the-card-not-in-the-text
 *  A card part matches on its stamped step, which survives a rewording. Anything
 *  else matches on where it came from, which is a path or a field name. */
function keyOf(d: { step: string; source: WorkSource; source_ref: string }): string {
  return d.step === "" ? `${d.source}:${d.source_ref}` : `step:${d.step}`;
}

/** The item's id, DERIVED from the position and the match key rather than drawn
 *  at random.
 *
 *  TWO HANDS MINTING ONE POSITION PRODUCE THE SAME FILE, which is what makes the
 *  merge surface trivial. A random id would give the same step two items and no
 *  way to tell they were one. */
function idFor(position: string, key: string): string {
  return `wk-${createHash("sha256").update(`${position}\0${key}`).digest("hex").slice(0, 10)}`;
}

function parseItem(raw: string, where: string): WorkItem {
  const k = readKeys(raw, where);
  const str = (key: string, fallback = ""): string => (typeof k[key] === "string" ? (k[key] as string) : fallback);
  return {
    id: str("id"),
    statement: str("statement"),
    step: str("step"),
    source: str("source", "hand") as WorkSource,
    source_ref: str("source_ref"),
    origin: str("origin"),
    place: str("place", BACKLOG),
    status: str("status", "open") as WorkStatus,
    reason: str("reason"),
    taken_by: str("taken_by"),
    took_comment: str("took_comment"),
    lifetime: str("lifetime", "record") as WorkLifetime,
    bucket: str("bucket"),
    slot: str("slot"),
    person_only: k.person_only === true,
    group: str("group"),
    part_of: str("part_of"),
    parts: Array.isArray(k.parts) ? (k.parts as string[]) : [],
    after: Array.isArray(k.after) ? (k.after as string[]) : [],
    difficulty: str("difficulty"),
    opened: str("opened"),
    closed: str("closed"),
    body: splitNote(raw).body.trim(),
  };
}

/** THE FOUR BUCKETS. Three hold what is still owed and one holds what is done.
 *
 *  DONE IS A FILTER OVER STATUS, NEVER A PLACE. A finished piece keeps the
 *  position it was worked at. It leaves its old bucket by being counted here,
 *  not by being moved.
 *
 *  PENDING DOES NOT BLOCK, and it is the backlog's. Work nobody has placed yet
 *  sits there, so the bucket has a real source rather than a stub.
 *
 *  ONE DECIDER, THREE SURFACES. The drawing's pills, the editor's groups and
 *  the walk's own account all ask this, so none of them can disagree about
 *  where a piece of work is.
 *  see dsp-the-bucket-editor.md#the-four-buckets */
export type Bucket = "in" | "pending" | "out" | "done";

export function bucketOf(item: WorkItem): Bucket {
  if (isSettled(item)) return "done";
  // A SAID SLOT WINS OVER A DERIVED ONE (owner). Each state carries three drop
  // zones, so a reader can put work in a bucket the derivation would not have
  // chosen — and a statement nothing stored could not survive the drop.
  //
  // `done` IS NEVER SAID, only reached. It is a filter over status, which is
  // why the settled test above this one is not something a slot can override.
  if (item.slot === "in" || item.slot === "pending" || item.slot === "out") return item.slot;
  if (item.place === BACKLOG) return "pending";
  return item.source === "reading" ? "in" : "out";
}

/** Frontmatter with the empties left OUT. A field that restates nothing is
 *  noise, and an empty one is worse than absent. */
function frontOf(i: WorkItem): Record<string, unknown> {
  const out: Record<string, unknown> = {
    id: i.id,
    type: "[[work]]",
    statement: i.statement,
    source: i.source,
    source_ref: i.source_ref,
    origin: i.origin,
    place: i.place,
    status: i.status,
    lifetime: i.lifetime,
    person_only: i.person_only,
    opened: i.opened,
  };
  if (i.step !== "") out.step = i.step;
  if (i.reason !== "") out.reason = i.reason;
  if (i.taken_by !== "") out.taken_by = i.taken_by;
  if (i.took_comment !== "") out.took_comment = i.took_comment;
  // AN EMPTY BUCKET IS NOT WRITTEN. Absent is what "the place is the bucket"
  // reads as, and an empty string would group every unbucketed token together.
  if (i.bucket !== "") out.bucket = i.bucket;
  // AN UNSAID SLOT IS ABSENT, not empty. Absent is what "derive it" reads as.
  if (i.slot !== "") out.slot = i.slot;
  if (i.group !== "") out.group = i.group;
  if (i.part_of !== "") out.part_of = i.part_of;
  if (i.parts.length > 0) out.parts = i.parts;
  if (i.after.length > 0) out.after = i.after;
  if (i.difficulty !== "") out.difficulty = i.difficulty;
  if (i.closed !== "") out.closed = i.closed;
  return out;
}

function writeItem(home: string, item: WorkItem): void {
  mkdirSync(workDir(home), { recursive: true });
  const where = itemPath(home, item.id);
  writeNode(where, setKeys(`---\n---\n\n${item.body}\n`, frontOf(item), where));
  // THE INDEX HEARS IT AT ONCE. The editor draws from the vault, and a write
  // nobody announced left the reader looking at the state before their own act
  // until they reloaded the whole surface.
  //
  // IT IS HERE AND NOT IN EACH CALLER, so no future writer can forget.
  // see ux.md#nothing-a-person-does-needs-a-reload
  noteFileChanged(where);
}

export function readWork(home: string): WorkItem[] {
  const dir = workDir(home);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => parseItem(readNode(join(dir, f)), join(dir, f)));
}

/** Whether a piece of work has reached one of the three ends. */
export function isSettled(i: WorkItem): boolean {
  return TERMINAL.includes(i.status);
}

/** Whether one document already stands read. */
export type ReadCredit = (path: string) => boolean;

/** A READING TOKEN SETTLES FROM THE READING, never from a submit.
 *
 *  Nobody files evidence against one. The token carries a link to a document,
 *  and the read credit is what closes it.
 *
 *  ONE READ CLOSES IT EVERYWHERE. The credit is a single ledger, so a document
 *  read at one position settles every token that wanted it, at every position.
 *  Two build steps sharing a design input cost one read, not two.
 *
 *  THE SETTLE IS LAZY AND WRITES NOTHING. The file on disk stays open until
 *  something asks, and this is the asking.
 *  see dsp-the-work-store.md#a-reading-token-settles-from-the-reading */
function settledByReading(i: WorkItem, isRead: ReadCredit | undefined): WorkItem {
  if (isRead === undefined || i.source !== "reading" || TERMINAL.includes(i.status)) return i;
  if (i.source_ref === "" || !isRead(i.source_ref)) return i;
  return { ...i, status: "done", reason: "the document stands read" };
}

/** The same read, but an unreadable item is REPORTED rather than thrown.
 *
 *  see dsp-the-work-offer.md#failure-behaviour — a count that quietly omits one
 *  is worse than a count that refuses, so the caller is handed both lists and
 *  decides. `readWork` still throws, which is right for a writer. */
export function readWorkReporting(home: string, isRead?: ReadCredit): { items: WorkItem[]; unreadable: { path: string; why: string }[] } {
  const dir = workDir(home);
  if (!existsSync(dir)) return { items: [], unreadable: [] };
  const items: WorkItem[] = [];
  const unreadable: { path: string; why: string }[] = [];
  for (const f of readdirSync(dir)
    .filter((n) => n.endsWith(".md"))
    .sort()) {
    const p = join(dir, f);
    try {
      items.push(settledByReading(parseItem(readNode(p), p), isRead));
    } catch (err) {
      unreadable.push({ path: p, why: `${(err as Error).message}`.split("\n")[0] });
    }
  }
  return { items, unreadable };
}

export function readOne(home: string, id: string): WorkItem | null {
  const p = itemPath(home, id);
  const raw = readNodeIfPresent(p);
  return raw === undefined ? null : parseItem(raw, p);
}

function mustRead(home: string, id: string): WorkItem {
  const item = readOne(home, id);
  if (item !== null) return item;
  throw new Rejection({
    clause: CLAUSES.REQUIRED_ARGS,
    expected: "a piece of work this record holds",
    got: `no item named ${id} under ${workDir(home)}`,
    remedy: { tool: "se_file_list", args: { dir: workDir(home) }, note: "list what stands, then name one of those ids" },
    source: SRC,
  });
}

/** The demands one marked card makes, stamping it on the way through.
 *
 *  THE STAMP HAPPENS HERE because minting is the moment the identity is first
 *  needed, and stamping at any other time would be a write nobody asked for. */
export function demandsFromCard(cardPath: string): MintDemand[] {
  const raw = readNode(cardPath);
  // A CARD THAT WILL NOT PARSE REFUSES HERE, before a single item is written.
  // A partial set reads exactly like a complete one.
  readKeys(raw, cardPath);
  const stamped = stampCard(raw);
  if (stamped.stamped > 0) writeNode(cardPath, stamped.text);
  return cardWork(stamped.text).map((p) => ({
    source: "step" as const,
    source_ref: `${cardPath}#${p.slug}`,
    step: p.step,
    statement: p.title,
    body: p.body,
  }));
}

function newItem(position: string, d: MintDemand, now: string): WorkItem {
  return {
    id: idFor(position, keyOf(d)),
    statement: d.statement,
    step: d.step,
    source: d.source,
    source_ref: d.source_ref,
    origin: position,
    place: position,
    status: "open",
    reason: "",
    taken_by: "",
    took_comment: "",
    lifetime: d.lifetime ?? "record",
    // A FRESH PIECE OF WORK CARRIES NO BUCKET. Its place is its grouping until
    // somebody files it under a name of their own.
    bucket: "",
    // A FRESH PIECE OF WORK DERIVES ITS BUCKET. Reading is taken in, everything
    // else is produced out, and nobody has said otherwise yet.
    slot: "",
    person_only: d.person_only === true,
    group: d.group ?? "",
    part_of: "",
    parts: [],
    after: d.after ?? [],
    difficulty: d.difficulty ?? "",
    opened: now,
    closed: "",
    body: d.body ?? "",
  };
}

/** What a position owes on entry, and what it already had.
 *
 *  ENTERING TWICE MINTS NO DUPLICATE. Settled work is not re-minted, open work
 *  is matched and its wording refreshed, and work the card no longer names is
 *  REPORTED rather than deleted — that decision is a person's. */
export function mint(home: string, position: string, demands: MintDemand[], now: string): MintReport {
  if (position.trim() === "") {
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: "an open record, so a mint has a position to land on",
      got: "no standing position",
      remedy: { tool: "se_pull", args: {}, note: "open or re-enter a record; work cannot be minted into nothing" },
      source: SRC,
    });
  }
  const standing = readWork(home).filter((i) => i.origin === position);
  const byKey = new Map(standing.map((i) => [keyOf(i), i]));
  const report: MintReport = { minted: [], matched: [], settled: [], orphaned: [] };
  const asked = new Set<string>();

  // DECIDE EVERYTHING FIRST, THEN WRITE. A throw partway through would leave a
  // partial set behind, and a partial set reads exactly like a complete one.
  const pending: WorkItem[] = [];
  for (const d of demands) {
    const key = keyOf(d);
    // A KEY SEEN TWICE IN ONE LIST IS ONE PIECE OF WORK. Two demands sharing a
    // key derive the same id, so writing both puts one file down twice and
    // reports two items where one exists.
    if (asked.has(key)) continue;
    asked.add(key);
    const had = byKey.get(key);
    if (had === undefined) {
      const made = newItem(position, d, now);
      pending.push(made);
      report.minted.push(made);
    } else if (TERMINAL.includes(had.status)) {
      report.settled.push(had);
    } else {
      // THE WORDING AND THE POINTER MOVE TOGETHER. Refreshing the statement
      // alone left `source_ref` naming the slug the heading used to have, so a
      // reader following it landed on an anchor that no longer exists.
      if (had.statement !== d.statement || had.source_ref !== d.source_ref) {
        had.statement = d.statement;
        had.source_ref = d.source_ref;
        pending.push(had);
      }
      report.matched.push(had);
    }
  }
  for (const i of pending) writeItem(home, i);
  for (const i of standing) {
    if (!asked.has(keyOf(i)) && !TERMINAL.includes(i.status)) report.orphaned.push(i);
  }
  return report;
}

/** MINT INTO BOTH SOURCES, each demand landing in the home its lifetime names.
 *
 *  ONE CALL FOR THE CALLER. A caller that split them itself would be a second
 *  place deciding where work lives, and the two would drift.
 *
 *  BOTH HOMES ARE VISITED even when one gets no demands this round, because the
 *  mint is also what reconciles: standing work the card no longer names is
 *  reported, and a home nobody visited reports nothing about it. */
export function mintBothSources(root: string, position: string, demands: MintDemand[], now: string): MintReport {
  const { home: lands, lifetime: allowed } = landing(root, position);
  // THE PLACE DECIDES THE LIFETIME, and it decides it in BOTH directions.
  //
  // OUTSIDE A RECORD EVERYTHING IS EPHEMERAL. A position resolving to no record
  // has only the private home, and work landing there goes when its state
  // completes whatever the demand asked for.
  //
  // INSIDE A RECORD EVERYTHING A STATE MINTS PERSISTS. A done token IS the
  // evidence of how that record was worked, so it travels with it.
  //
  // A DEMAND NO LONGER CARRIES ITS OWN ANSWER. Letting the card name a lifetime
  // made it a second decider, and the two drifted: a reading demand asking for
  // `state` filed itself privately from inside a record, where the ruling says
  // it persists.
  //
  // A HAND-OPENED TOKEN IS NOT THIS. `se_work {act: "open"}` writes straight to
  // the private home. That is the agent talking rather than a state minting,
  // and it is meant to be thrown away when the state is left.
  const asked = demands.map((d) => ({ ...d, lifetime: allowed }));
  reclaim(root, position, lands, allowed);
  return mint(lands, position, asked, now);
}

/** BRING A STATE'S WORK HOME BEFORE MINTING, so nothing is ever created twice.
 *
 *  A TOKEN IS CREATED ONCE AND NEVER RECREATED. It is reopened, moved or
 *  settled — never minted again under the same id.
 *
 *  MINTING PER HOME BROKE THAT. `mint` matches only what stands in the home it
 *  was handed, so when `landing` changed its answer the new home saw nothing
 *  standing and minted the whole card again. The copy left behind was reported
 *  `orphaned` and nothing removed it. Measured on i63: nine of the gate's ten
 *  evidence fields held two files each, same id, different lifetime.
 *
 *  THE FILE MOVES AND THE FIELD MOVES WITH IT, because the removal reads the
 *  field. A file sitting in the record folder while claiming to be ephemeral is
 *  one the removal walks straight past.
 *
 *  A HAND-OPENED TOKEN STAYS WHERE IT IS. Its source says `hand`, it belongs to
 *  no card, and it is the agent's own channel — committing one would put in
 *  version control the very thing that is meant to be thrown away. */
function reclaim(root: string, position: string, lands: string, allowed: WorkLifetime): void {
  for (const other of workHomes(root)) {
    if (other === lands) continue;
    for (const had of readWork(other)) {
      if (had.place !== position || had.source === "hand") continue;
      writeItem(lands, { ...had, lifetime: allowed });
      rmSync(itemPath(other, had.id), { force: true });
    }
  }
}

/** Move work. BOTH ENDS MOVE IN ONE ACT, which is why there is no separate
 *  release: a move that lands without releasing would owe the work twice. */
export function place(home: string, id: string, to: string, slot = ""): { from: string; to: string } {
  const item = mustRead(home, id);
  const from = item.place;
  const want = slot === "in" || slot === "pending" || slot === "out" ? slot : "";
  // A DROP ONTO A PLACE UNFILES IT, even when the place is the one it already
  // stands at. Returning early on an unchanged place left the bucket standing,
  // so work filed under a bucket could never be dropped back where it came
  // from — the drop landed and nothing at all happened.
  if (from === to && item.slot === want && item.bucket === "") return { from, to };
  item.place = to;
  // THE DROP SAYS WHICH BUCKET, or says nothing and the bucket derives again.
  // Landing on a state's body rather than on one of its three zones is the
  // second case, and it is how a reader takes a said slot back off.
  item.slot = want;
  // THE BUCKET GOES WITH THE MOVE (owner). A drop onto a place says where this
  // will be done, and a grouping somebody typed earlier no longer describes it.
  // Leaving both would show the token under its old bucket after it moved,
  // which reads as a move that did not happen.
  item.bucket = "";
  writeItem(home, item);
  return { from, to };
}

/** FILE WORK UNDER A NAME OF THE PERSON'S OWN.
 *
 *  IT DOES NOT MOVE ANYTHING. The place stays exactly as it was; only the
 *  grouping changes. That is the whole difference between a bucket and a place.
 *
 *  AN EMPTY NAME UNFILES IT, and the place becomes the grouping again. */
export function rebucket(home: string, id: string, bucket: string): WorkItem {
  const item = mustRead(home, id);
  item.bucket = bucket.trim();
  writeItem(home, item);
  return item;
}

/** WHETHER A PERSON MAY DRAG THIS WORK OUT OF THE STATE IT SITS AT.
 *
 *  A STATE'S CARD DEMANDS ITS WORK, and that demand is what minted the token.
 *  Dragging such a piece elsewhere leaves the state owing something no longer
 *  standing there, and re-entering the state mints it again — so the drag
 *  duplicates rather than moves.
 *
 *  A HAND-ADDED PIECE IS FREE. Nothing demanded it, nothing re-mints it, and
 *  nobody is left owing when it goes.
 *
 *  IT IS A RULE ABOUT THE HAND, NOT ABOUT THE STORE, which is why the mover
 *  itself does not enforce it. The engine's own placement genuinely moves work
 *  between positions — req-moving-work-releases-the-state-it-left — and a
 *  blanket refusal in `place` would have contradicted a standing requirement.
 *
 *  IT NEVER STOPS A BUCKET. Filing is grouping, not moving, and a bucket says
 *  nothing about where the work is done. */
export function boundToItsState(item: WorkItem): boolean {
  return item.source !== "hand" && item.origin !== "" && item.origin !== BACKLOG;
}

/** WHETHER A GROUP NAME IS A PLACE OR A BUCKET.
 *
 *  THE EDITOR GROUPS BY THE BUCKET FALLING BACK TO THE PLACE, so a heading a
 *  reader drags onto is one or the other and its text alone does not say which.
 *
 *  THE STORE KNOWS, because it can see what work already stands there. A name
 *  some token holds as its PLACE is a place; anything else is a bucket.
 *
 *  THE CLIENT CANNOT DECIDE THIS, which is why it sends the name and asks. */
export function groupIsPlace(root: string, name: string): boolean {
  if (name === BACKLOG) return true;
  return readAllWork(root).items.some((i) => i.place === name);
}

/** A BUCKET NAME NOBODY HAS USED YET.
 *
 *  FILING COMES FIRST AND NAMING COMES SECOND (owner). Pressing the button
 *  makes a bucket immediately; the reader renames it once they can see what
 *  landed in it. That is why nothing asks them for a name up front.
 *
 *  THE ENGINE PICKS IT because the engine knows what is taken. A client
 *  guessing would collide the moment two buckets were made in a row.
 *
 *  IT COUNTS UP: `unnamed`, then `unnamed 2`, and so on. */
export function freshBucket(root: string): string {
  const taken = new Set(
    readAllWork(root)
      .items.map((i) => i.bucket)
      .filter((b) => b !== ""),
  );
  if (!taken.has("unnamed")) return "unnamed";
  for (let n = 2; n < 1000; n++) {
    const name = `unnamed ${String(n)}`;
    if (!taken.has(name)) return name;
  }
  return `unnamed ${String(taken.size + 1)}`;
}

/** RENAME A BUCKET, everywhere it stands in this home.
 *
 *  A PLACE CANNOT BE RENAMED FROM HERE and a bucket can, because a place is the
 *  drawing's name for a state and a bucket is somebody's own word.
 *
 *  IT RETURNS WHAT IT TOUCHED, so a caller that renamed nothing can say so
 *  rather than reporting a success over an empty set. */
export function renameBucket(home: string, from: string, to: string): WorkItem[] {
  const want = from.trim();
  const name = to.trim();
  if (want === "") return [];
  const moved: WorkItem[] = [];
  for (const i of readWork(home)) {
    if (i.bucket !== want) continue;
    i.bucket = name;
    writeItem(home, i);
    moved.push(i);
  }
  return moved;
}

/** RENAME WHAT A PIECE OF WORK SAYS IT IS.
 *
 *  A STATEMENT IS THE ONLY FIELD A HAND MAY REWRITE. Everything else on a work
 *  item is either the machine's (place, source, status) or is a record of
 *  something that happened (the comments, the timestamps), and rewriting a
 *  record of the past is not editing.
 *
 *  AN EMPTY STATEMENT IS REFUSED, for the same reason the mint refuses one:
 *  work nobody named cannot be judged later.
 *  see dsp-the-work-store.md#a-token-opens-an-editor */
export function restate(home: string, id: string, statement: string): WorkItem {
  const item = mustRead(home, id);
  const said = statement.trim();
  if (said === "") {
    throw new Rejection({
      clause: CLAUSES.WORK_REASON_OWED,
      expected: "a statement saying what the work is",
      got: `${item.id} would be left unnamed`,
      remedy: { tool: "se_pull", args: {}, note: "send the same call with a statement" },
      source: SRC,
    });
  }
  item.statement = said;
  writeItem(home, item);
  return item;
}

function refuseCommentOwed(item: WorkItem, act: string): never {
  throw new Rejection({
    clause: CLAUSES.WORK_REASON_OWED,
    expected: `a comment on the ${act}, and it may not be empty`,
    got: `${item.id} would be ${act}n with nothing said`,
    remedy: { tool: "se_pull", args: {}, note: "send the same call with a comment — it works like a commit message" },
    source: SRC,
  });
}

/** THE TAKE IS A WRITE AND IT GOES THROUGH HERE. The offer hands work out and
 *  names back what was taken; it never writes.
 *
 *  THE COMMENT IS REQUIRED, like a commit message. Starting a piece of work
 *  writes a line somebody reads, and a line with nothing in it is worse than no
 *  line: it looks like a report.
 *  see dsp-the-work-store.md#both-ends-of-a-piece-of-work-say-something */
export function take(home: string, id: string, hand: string, comment: string): WorkItem {
  const item = mustRead(home, id);
  if (comment.trim() === "") refuseCommentOwed(item, "take");
  if (item.taken_by !== "") {
    throw new Rejection({
      clause: CLAUSES.WORK_ALREADY_TAKEN,
      expected: "work no hand is on yet",
      got: `${item.taken_by} is already on ${item.id}`,
      remedy: {
        tool: "se_pull",
        args: {},
        note: "the hand holding it settles it, or the item is placed somewhere else — a retry changes nothing",
      },
      source: SRC,
    });
  }
  item.taken_by = hand;
  item.took_comment = comment.trim();
  if (item.status === "open") item.status = "in_work";
  writeItem(home, item);
  return item;
}

function refusePersonOnly(item: WorkItem): never {
  throw new Rejection({
    clause: CLAUSES.WORK_PERSON_ONLY,
    expected: "a person to settle this one",
    got: `${item.id} is marked person-only and an agent tried to settle it`,
    remedy: { tool: "se_pull", args: {}, note: "ask the person, or move the item on — there is no override argument" },
    source: SRC,
  });
}

function refuseReasonOwed(item: WorkItem, status: WorkStatus): never {
  throw new Rejection({
    clause: CLAUSES.WORK_REASON_OWED,
    expected: "a reason on every close, and it may not be empty",
    got: `${item.id} would close at ${status} with nothing said`,
    remedy: { tool: "se_pull", args: {}, note: "send the same close with a reason — it works like a commit message" },
    source: SRC,
  });
}

/** End a piece of work.
 *
 *  SETTLING IS IDEMPOTENT AND THE FIRST OUTCOME STANDS, so a repeated report
 *  changes nothing. That is what lets the registry be told twice.
 *
 *  THE REASON IS OWED ON EVERY CLOSE, `done` included. Finishing something is
 *  the moment a person most wants a sentence about it, and the hand that just
 *  did the work is the only one who can write it.
 *  see dsp-the-work-store.md#both-ends-of-a-piece-of-work-say-something */
export function settle(home: string, id: string, status: WorkStatus, opts: { reason?: string; by?: string; now: string }): WorkItem {
  const item = mustRead(home, id);
  if (TERMINAL.includes(item.status)) return item;
  if (item.person_only && (opts.by ?? "agent") !== "person") refusePersonOnly(item);
  const reason = (opts.reason ?? "").trim();
  if (reason === "") refuseReasonOwed(item, status);
  item.status = status;
  item.reason = reason;
  item.closed = opts.now;
  writeItem(home, item);
  return item;
}

/** EVERY ITEM SAYS WHICH OF TWO LIFETIMES IT HAS, so the fate is declared rather
 *  than inferred from where it happens to sit.
 *
 *  UNFINISHED HAND WORK IS CARRIED, NEVER DELETED. That is the seam, and it is
 *  about who can bring the token back. A machine-minted one — a reading, a
 *  marked step, an evidence demand — is minted again the next time the state is
 *  entered, so dropping an unfinished one loses nothing. A token a HAND opened
 *  is minted by nobody and returns from nowhere.
 *
 *  SO IT MOVES TO THE BACKLOG and the caller is told which ones moved. The
 *  backlog is the one place work sits when nobody has said where it will be
 *  done, which is exactly true of work a completing state did not finish.
 *
 *  IT IS NOT THE LEAVING GUARD, and it must not be read as one. The guard is
 *  `leavingHeldBy`, it refuses the completion outright, and emergency lifts it
 *  on purpose. This is what happens once the completion is allowed anyway.
 *
 *  MEASURED ON i63: with emergency armed the guard was lifted, fix-findings
 *  completed over seven open hand tokens, and every one was deleted with no
 *  trace and no report. */
export function completeState(home: string, position: string): { kept: WorkItem[]; removed: WorkItem[]; carried: WorkItem[] } {
  const kept: WorkItem[] = [];
  const removed: WorkItem[] = [];
  const carried: WorkItem[] = [];
  for (const i of readWork(home)) {
    if (i.place !== position && i.origin !== position) continue;
    if (i.lifetime !== "state") {
      kept.push(i);
      continue;
    }
    if (i.source === "hand" && !isSettled(i)) {
      // ONLY WHAT SITS HERE MOVES. A hand token minted here and PLACED somewhere
      // else is that other position's work, and this completion has no say in it.
      if (i.place !== position) {
        kept.push(i);
        continue;
      }
      i.place = BACKLOG;
      writeItem(home, i);
      carried.push(i);
      continue;
    }
    const gone = itemPath(home, i.id);
    rmSync(gone);
    // A DELETE IS A CHANGE TOO. An index still holding a file that is gone
    // draws work nobody can open.
    noteFileChanged(gone, true);
    removed.push(i);
  }
  return { kept, removed, carried };
}
