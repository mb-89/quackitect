---
minted_in: i1
id: dsp-note-pen
type: "[[design-spec]]"
statement: strays held in one inbox until a retro drains each to exactly one home, carried by an append-only notes file
realizes:
  - "el-holding-pen"
  - "if-holding-pen-to-front-desk"
files:
  - "project/deliverable/engine/notes.ts"
  - "project/deliverable/engine/inbox.ts"
---

## Responsibility

A stray lands in one call and moves nothing. The inbox lists what
pends; draining marks a disposition with its payload — done and
obsolete anywhere with the where, carried and backlog only in the
retro. Parked notes stay on file and re-drain when their ready-when
comes true.

## The retros mechanical half

The retro's mechanical half (v2's req-retro-drain): disposition a note;
 drained notes leave the inbox count. An unknown ref is refused.
 Re-draining is legal, EXCEPT a second drain to backlog: the first one
 already minted a work token, and a second would mint a duplicate.

 judgmentAllowed SPLITS IT (owner discussion 2026-07-29). The drain was
 retro-only, so the front desk could ADD to the inbox and never take
 anything out — and the desk's own method opens by weighing an inbox it
 was not allowed to correct. The ceremony is worth keeping where a
 judgment is actually made, and nowhere else.

## State notes

State notes — plain markdown files a drawn state points at. The v2 note
grammar without the ledger: frontmatter carries the machine-facing fields,
`## Guidance` and `## Evidence form` are sections, the first `# ` heading
is the statement.

Frontmatter is REAL YAML (owner ruling: Obsidian-editable). Lists may be
YAML lists (Obsidian renders them as chips) or comma-separated strings —
both are accepted everywhere a list is expected. Conditions are FLAT
keys: exit_read, exit_script, entry_<type> — nested dictionaries render
as JSON blobs in Obsidian Properties and are refused by the compiler.

## True while the stamp was minted inside the files

True while the stamp was minted inside the file's own timestamp tick.
 A same-length rewrite in that tick keeps the stamp identical, so a
 provisional entry is never served from the stamp — it re-reads until
 a read observes the mtime cold. Measured 2026-08-10: 4 of 20 external
 rewrites vanished behind an identical stamp on Windows' ~16 ms tick.

## There is no watcher here

THERE IS NO WATCHER HERE, AND THAT IS A DECISION (owner question, tried and
 measured 2026-08-09).

 A watcher would be told what moved instead of asking per access, which is
 worth 28,064 stats in one record entry. One was built. The suite refused it
 in four places, and the clearest was a product law:

   "a state note edited on disk binds the NEXT call, no reload"

 WHY NO WATCHER CAN KEEP THAT PROMISE. A watch event is ASYNCHRONOUS. Between
 a write landing on disk and the event arriving, the model holds the old
 text, and a read in that gap is wrong. This is not fs.watch being flaky; it
 is what asynchronous notification IS. Go's watchers have the same gap, and a
 more reliable library closes none of it.

 SO A WATCHER CAN ONLY EVER BE AN OPTIMISATION WITH A CORRECTNESS FALLBACK —
 and the fallback is the stat, on the same path, so the watcher saves nothing
 where it matters.

 WHERE ONE DOES BELONG: the mirror. Re-rendering when the disc changes is
 strictly better than polling every second, and a render is not a claim — a
 late repaint costs nobody anything. That is a different door and a real win;
 see the note on the poll storm.

 THE ACTUAL FIX FOR THE COST IS SHAPE, NOT NOTIFICATION. One stat per access
 is cheap. Sixty-six sweeps of the same corpus in one operation is the
 defect, and it is fixed by collecting the input once and passing it down
 (software.md, input-process-output).

## The write door

THE WRITE DOOR, beside the read one.

 Every write that lands on a file the model may hold goes through here, so
 the model is TOLD rather than left to discover it. Outside a pass the stat
 would catch it anyway; inside one the epoch short-circuits before the stat,
 and an untold write is served stale for the rest of the operation.

 IT WAS A HOLE UNTIL 2026-08-09. forgetPath existed and had no callers at
 all — the door's own comment claimed "a lane write calls forgetPath" and
 nothing did. A rule nobody calls is a comment.

## The pass is opened by hand

THE PASS IS OPENED BY HAND, AND THAT IS THE SECOND TIME THIS WAS SETTLED.

An AUTOMATIC pass was tried on 2026-08-09: the first door access in a turn
of the event loop opens one, a microtask closes it. The reasoning was that a
synchronous region is exactly one turn, so no interval of trust exists at
all — only the indivisible region in which nothing else can run.

SEVEN TESTS REFUSED IT, and one of them is a product law:

  "a row edited now reaches the walk's machine with no pull at all"

The others were the archive missing a closed expedition, a re-signed claim
not standing again, and the item register dropping a held assumption. All
the same fault: a caller writes through something other than the lane, then
reads back inside the same turn, and gets what it wrote over.

SO THE RULE IS: a pass covers an operation that only READS. Route and the
mirror's render qualify and are wrapped. Anything that writes while it walks
does not, and asking per access is what keeps it correct.

The first attempt was a 2,000 ms window (same day, five tests). Shrinking
the window from seconds to microseconds did not change the class of the bug
— which is the finding worth keeping.

## The one door onto a repo file

THE ONE DOOR ONTO A REPO FILE. Read it once, split it once, parse it once,
 and hand the same answer to everyone until the file moves.

 IT LIVES HERE BECAUSE THIS IS THE FILE-AND-PARSE LAYER. It was drafted in
 trace.ts, which imports parseStateNote from here — a cycle. The door belongs
 under everything that reads, not beside one of its readers.

 MEASURED, 2026-08-09. Entering one record made 9,755 readFileSync calls
 over a 328-node corpus: the same files read thirty times over, 2.6 s of a
 4 s call, all of it BLOCKING. A CPU profile could not see it — 301 ticks,
 20.6 % JavaScript. The engine was not computing, it was waiting.

 WHY ONE DOOR AND NOT FIVE STAMPS. Four separate caches came first — the
 corpus, the lines, the item template, the claim verdict — each with its own
 key and its own freshness check. Together they cost 39,857 stats and left
 the three biggest readers untouched, because those readers called
 readFileSync themselves and no cache stood in the way. Caches that do not
 compose cannot be reasoned about; a door can.

 THE STAT IS THE DESIGN, NOT A PLACEHOLDER (settled 2026-08-09, the
 no-watcher block above — this line once promised a watcher and the same
 day's measurement ruled one out). Fewer asks come from the pass, never
 from a longer leash.

 BYTES ARE THE BASE LAYER (2026-08-10). fileRead reads through here too,
 so one store serves the engine's text readers and the lane's byte reader.
 The byte cache that briefly lived in files.ts folded in here.

## No trust window

NO TRUST WINDOW. It was tried on 2026-08-09 and the suite refused it in
four places, one of them a product law: "a state note edited on disk binds
the NEXT call, no reload" (editsafety). fs.watch is asynchronous, so
between a write and its event the model is stale, and this system's
guarantee has no room for that gap.

THE ANSWER IS NOT A LONGER LEASH, IT IS FEWER ASKS. One stat per access is
cheap; 21,648 of them is the defect, and that is a SHAPE problem — collect
the input once per operation and pass it down (software.md, input-process
-output). A cache cannot fix a call count.

## A provisional entry never hits on its stamp

A PROVISIONAL ENTRY NEVER HITS ON ITS STAMP. The clock below DENIES
trust, never extends it — which is why it survives the no-clock ruling
(2026-08-10): a file whose mtime sits inside the current timestamp tick
may have been rewritten same-length behind an identical stamp, so it is
re-read until some read finds the mtime cold and the stamp becomes
meaningful.
