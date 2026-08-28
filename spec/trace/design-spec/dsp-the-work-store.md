---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: dsp-the-work-store
type: "[[design-spec]]"
statement: every write to a piece of work, in one place — minted on entry, matched by identity on re-entry, placed, taken and settled
realizes:
  - el-work-store
  - if-work-store-to-work-offer
  - if-work-offer-to-work-store
  - if-work-store-to-walk-engine
  - if-work-store-to-record-store
  - if-record-store-to-work-store
  - if-holding-pen-to-work-store
  - if-work-store-to-work-registry
files:
  - deliverable/engine/workstore.ts
  - deliverable/engine/workmint.ts
  - deliverable/engine/workpen.ts
  - deliverable/engine/register.ts
  - deliverable/engine/traceup.ts
---

## The pen's third live source: the register

TWO REGISTER KINDS ARE WORK BY THEIR OWN DEFINITION. An ISSUE has happened and
hurts now. A DEBT is a shortcut taken knowingly whose cost compounds. Both are
things somebody has to do something about, and neither was on any board.

MEASURED ON THIS TREE: 108 of them stand open — 94 issues and 14 debts — and
seven carry no trigger at all.

THE OTHER KINDS ARE NOT WORK, so they do not draw. A risk has not happened, an
assumption is not work, and a decision can only be superseded. Drawing those
would put rows on the board that nobody could ever settle.

IT IS DRAWN, NEVER MINTED, exactly as a pending note and a pool token are.
Nothing is written, so nothing drifts, and a row disappears the moment its
entry stops being open.

THE TRIGGER IS THE RE-ENTRY CONDITION. meth-raid.md names the failure against
itself: an entry with no trigger is filed rather than watched, and the register
becomes a graveyard the first time nobody re-reads it. The trigger is meant to
be the live part, and nothing mechanical read it until now.

A ROW ENDS BY ITS OWN STATUS, so `drawnEndsWith` names an edit to the node
rather than a verb of this store's.

## Responsibility

EVERY WRITE TO A PIECE OF WORK IS HERE, and no other module writes one. That is
the whole reason this module exists as its own file rather than as functions
spread across the walk.

FIVE ACTS. Mint what a position owes on entry. Match standing work to its step
when a position is entered again. Place work where it will be done. Record that
a hand took it. Settle it at a terminal status.

## Behavior and constraints

A PIECE OF WORK IS ONE MARKDOWN FILE while its record is open. Frontmatter and
prose together, so the same file a person edits is the one the engine reads.

THE IDENTITY IS STAMPED AT MINT AND NEVER DERIVED FROM TEXT. A card reworded
between two entries names the same step, and matching on the heading would
orphan the finished work or mint a duplicate beside it. Both failures are
silent, which is why the identity is a stored fact rather than a computed one.

## The crossing to the walk, and how it was nearly shipped unbuilt

`if-work-store-to-walk-engine` IS THE FIRST OF THE FIVE ACTS. Mint what a
position owes on entry, from the three sources the requirement names: the
reading the state demands, the marked steps of its method, and the evidence it
must produce.

IT LIVES IN `workmint.ts`, and the pull is its one caller. The pull is the hook
because it is the verb that knows where the walk stands, and no walk makes
progress around it.

THE STATE'S OWN READING NAMES ITS METHOD CARD, so nothing has to be told which
document carries the marks.

RE-ENTRY MATCHES RATHER THAN DUPLICATES, so the hook is safe to call again and
a restart loses nothing.

THIS SPEC CLAIMED THE CROSSING BEFORE ANY CODE CROSSED IT. The claim cleared a
refusal at specify-build and no build step ever named it, so the model shipped
inert through every later check. That is written here because the gap is in the
method rather than in this design.

## The identity lives in the card, not in the text

THE RULE ABOVE CANNOT HOLD WITHOUT THIS. "Matched by identity on re-entry" needs
something stable to match ON, and the heading is not it.

SO THE CARD CARRIES THE STEP'S IDENTITY. The mark takes an optional nested part:
`#work` while it is unstamped, `#work/<step>` once it has been minted from.

OBSIDIAN RENDERS A SLASH AS TAG NESTING, so every stamped part still sits under
`#work` and one click still lists them all. The mechanism costs the reader
nothing.

THE STAMP IS TAKEN FROM THE WORDING ONCE AND NEVER AGAIN. First mint reads the
heading, makes a slug, and writes it into the tag. Reword the heading afterwards
and the tag does not move, which is exactly the property that stops an orphan.

STAMPING IS IDEMPOTENT. A part that already carries an identity is left alone,
so minting from the same card twice writes nothing the second time.

## Two identities, and confusing them loses work

THE STEP IDENTITY BELONGS TO THE CARD and is shared by every record that mints
from it. `elements` names a step of the decomposition method, wherever it runs.

THE ITEM IDENTITY BELONGS TO ONE RECORD at one position. Two records working the
same card hold two different items that name the same step.

A DESIGN WITH ONE IDENTITY BREAKS ONE WAY OR THE OTHER. Share the item and two
records overwrite each other's progress. Stamp a fresh step id per record and a
reworded card orphans the work anyway, because the card can only carry one.

PLACE AND STATUS ARE SEPARATE FIELDS. Place is a position or the backlog. Status
is open, in work, or one of the terminal kinds. A design folding them loses the
case that matters most: work that is finished but still sitting where it was
done.

A CLOSE AT ANYTHING OTHER THAN DONE REFUSES UNTIL A REASON STANDS. The refusal
carries the remedy, and the reason lands on the item rather than in a log.

THE TAKE IS A WRITE AND IT GOES THROUGH HERE. The offer hands work out and names
back what was taken; it never writes. One writer is what makes the merge surface
countable.

## Three crossings the module serves, and none of them is a write of work

IT READS THE STANDING POSITION, on every mint, place and settle. No open record
means no position, and a mint then has nowhere to land, so it refuses rather
than minting into nothing. This is one of the two reads this module serves
itself, and the reason the cut is on writes rather than on reads.

IT TAKES A JUDGED ITEM FROM THE HOLDING PEN. An item leaving the pen has been
judged by somebody and arrives already authored, with the condition that says
when it is ready. A refused write leaves it exactly as it was, pending and still
in the pen's count.

IT REPORTS A SETTLE TO THE WORK REGISTRY, so one call still answers for
everything running out of sight. Settling is idempotent and the first outcome
stands, so a repeated report changes nothing.

## What it does not do

IT DOES NOT ANSWER WHAT IS READY, and it does not count what is owed. Those run
on every look at a position, and putting them here would put a derivation on
every entry into every position.

IT DOES NOT FOLD, ARCHIVE OR CLOSE. Closing is a record-level act. At close this
module hands its whole set over and stops owning it.

IT DOES NOT DECIDE WHETHER A POSITION MAY BE LEFT. It reports what settled and
what moved; the judgment is the walk's.

## The seam that matters

THE HANDOVER AT CLOSE. This module stops owning the work and the record store
starts owning its folded shape. Getting it wrong loses work rather than slowing
it, so the order is write the folded file, commit it, then remove the folder —
never the reverse.

## What it costs, named rather than discovered

ONE WRITER MEANS ONE MERGE SURFACE. Two hands working the same position write
the same files, and the decision accepting that names the fix if it fails.

THE COST OF A MINT IS MEASURED, 2026-08-26, once this module existed. The script
is `scratchpad/measure-a-mint.ts`.

- A REAL CARD OF FIVE PARTS costs 18.52 ms whole, read and stamp and every file
  written.
- A RE-ENTRY costs 7.58 ms and writes nothing, which is the common case.
- FORTY ITEMS AT ONCE cost 117.78 ms, which is four times larger than any
  position that exists.

WHAT IT IS NOT. It times the ACT, not a hop, because the walk does not call this
module yet. So it is a floor on the hop's extra cost rather than the hop's own
number, and [[exp-what-one-mint-costs]] says so in its own words.

## A reading token settles from the reading

A reading token is a no-op for whoever holds it. Nobody submits evidence to it.

The token carries a LINK to the document it wants. That link is its whole
content, and it is what `source_ref` holds.

The read credit closes it. That is the same credit every other reader in this
system already keys on: the person's checkbox, a proof recorded on a passing
step, or a current buffered read. `Session.documentRead` answers for all three
in one place.

### One read closes it everywhere

The credit is a single ledger, not a per-position one.

So a document read at one position settles every token that wanted it, at every
position. Two build steps sharing one design input cost one read between them,
not one each.

This is the same rule the reading already followed. A document is read once and
the walk stops asking for it.

### The settle is lazy, and it writes nothing

The file on disk stays `open`. Nothing sweeps the folder to close it.

`readWorkReporting` takes the credit and reports the token as done when it is
asked. That is the whole mechanism, and it lives in one function.

A token may therefore sit unsettled on disk forever without being wrong. Being
asked is what produces the answer.

### What it means for the buckets

A reading token counts in the INPUT bucket while its document is unread.

The moment the document is credited, the same token counts in DONE. Nothing
moved and nothing was written; the filter changed its mind because the ledger
did.

## A build step is persistent and its reading is not

The build step is the parent. Its reading tokens are the children.

Nothing extra models that. A piece of work already records the position it was
minted at, so the step and its reading are joined there.

### The reading goes when the state does

Every reading token carries `lifetime: state`. The state completing removes it.

The step outlives it. Whatever the step produced stays in the record as
evidence; what it had to read to get there does not.

Re-entering the state mints the reading again. That costs nothing when the
documents still stand read, because the credit settles the fresh tokens the
moment anything asks.

### Which documents, and why not all of them

The chain above what the state builds. A state builds one named artifact, and
that artifact records what it realizes, which records what it refines, up to the
root.

Walking those edges is the demand. `chainAbove` in `engine/workmint.ts` does
the walking.

A blanket demand for every design document would make each building state owe
sixty reads, most about something else. The trace is what narrows it honestly.

### Shared, so the total is a union rather than a sum

Two build steps under one design input both point at that document.

Reading it once settles both. So the cost of the whole record is the number of
distinct documents, not the number of tokens.

## A building state owes its own trace

A state that can WRITE owes the reading of everything above what it builds.

The state's id names the artifact: a build step called `the-work-store` builds
`dsp-the-work-store`. That convention is the anchor, and nothing else has to be
told which document a state is about.

### The engine walks the edges rather than anybody listing them

From the anchor, the walk follows the UPWARD edges to the root.

- a design spec `realizes` an element or an interface
- an element `implements` a requirement
- an interface `carries` a flow
- a requirement `refines` a use case
- a use case `refines` a story
- a test spec `verifies` or `demonstrates`

`upwardFrom` in `engine/traceup.ts` does the walking. It is breadth-first, it
refuses to loop, and a reference pointing at nothing is skipped rather than
thrown on.

### Not the whole corpus, and not one file somebody named

A blanket demand for every design document makes each building state owe sixty
reads, most of them about something else.

A hand-written list rots the day somebody adds a requirement.

The trace is what narrows it honestly: only what the thing under construction
actually descends from.

### It costs less than it looks

Reading is shared. A document proven once satisfies every token pointing at it,
whichever state minted them.

So the record's total is the UNION of the documents its build steps demand, not
the sum per state.

### The reference stays root-relative

A work token lands in version control, so it keeps the path the repository
knows. An absolute path on a developer's machine carries that person's account
name, and that is a privacy rule rather than a tidiness one.

## Both ends of a piece of work say something

Starting a piece of work writes a line. Finishing it writes another, whichever
way it finished.

Both carry a COMMENT, and the comment may not be empty. It works like a commit
message.

### Why it is required rather than offered

An optional comment is an empty comment. The hand that just did the work is the
only one who can say what happened, and it is the one with the least reason to
bother.

So the store refuses. `take` refuses without a comment; `settle` refuses without
a reason, on EVERY close including `done`.

Finishing is the moment a person most wants a sentence, and that is exactly the
close that used to need none.

### Where each one lands

The take's comment lands on the item as `took_comment`. The close's lands as
`reason`.

On the item, never in a log. The item is what a person reads six months later,
and a reason in a log is a reason nobody finds.

The feed line follows from the call, because every lane call is logged. Nothing
writes a second copy.

### The door is one verb with three acts

One verb, three acts. `act: take` picks a piece up, `act: settle` ends it, and
`act: restate` renames what it is.

Take and settle demand `comment`, and the store refuses an empty one. A settle
takes an optional `status`: `done` by default, `dropped` or `superseded` where
the work stopped rather than finished.

RESTATE CARRIES THE NEW STATEMENT IN `comment`. A fourth argument for one act
would leave every other call carrying an empty field.

THE LANE OFFERS WHAT THE SURFACE OFFERS. A hand at the keyboard could rename a
token while a hand on the walk could not, which made the act list above true of
one door and false of the other.

IT IS LEGAL WHEREVER THE WALK STANDS, because a hand reports on its own work
wherever it is doing it.

Until this verb existed nothing outside the tests called `take` or `settle`, so
the refusal was correct and unreachable. A rule nothing can trip is not a rule.

## A token opens an editor

PRESSING A WORK ROW OPENS AN EDITOR FOR IT. Owner, 2026-08-26: "Clicking the
token does not open an editor." It was drag-only, and nothing answered a press.

### Three acts, and no more

A HAND MAY DO EXACTLY THREE THINGS to one piece of work.

- RESTATE it. Change what the work says it is.
- TAKE it. Put a hand on it, with a comment.
- SETTLE it. Close it as `done` or `dropped`, with a comment.

EVERYTHING ELSE BELONGS TO THE MACHINE. The place, the source and the status
are the engine's. The comments and the timestamps are a record of something
that happened, and rewriting the past is not editing.

### The store holds every rule, and the route holds none

THE SURFACE AND THE LANE GET THE SAME ANSWER because they call the same writer.
The empty-comment refusal, the already-taken refusal and the person-only
refusal all live in the store.

The browser checks the comment too, before the round trip. That is a COURTESY
and never the rule. A hand that defeats it still meets the store's refusal.

### The panel ships folded with the row

NOTHING IS FETCHED ON THE PRESS. The card is already whole in the document, so
a round trip would buy nothing and would put a wait between the press and the
panel.

A SETTLED PIECE SHOWS NO BUTTONS. Both its ends are written, and the panel is
then a reading of what was said.

### The person is the hand, and the record says so

A PRESS ON THE SURFACE IS THE PERSON'S. The take records `the person`, not the
walker. Recording it as the walker's would erase who actually did it, which is
the one thing the field is for.

RENAMING NEEDS NO COMMENT. It changes what the work SAYS IT IS, which is
neither of the two ends the log records.

## One home for reading and writing

EVERY READER AND EVERY WRITER ASKS THE SAME QUESTION and gets the same answer.
Where work lives is ONE method, never an expression repeated at each call site.

TWO HOMES, SPLIT BY WHETHER THE WORK TRAVELS.

- A RECORD'S OWN FOLDER holds work that persists past its state.
- THE PRIVATE FOLDER `.se/` holds work that never leaves this machine: every
  ephemeral token, and anything minted while no record is bound.

`Session.workHome()` IS THE ONE ANSWER for a caller inside the walk.
`workHomes()` is the one answer for a caller that must read both.

WHY IT IS A METHOD AND NOT AN EXPRESSION. The two writers carried the private
half and the seven readers did not.

The engine then wrote work the card could not see. The served editor said no
record was open while eleven pieces of work sat on disk.

THE READER READS BOTH SOURCES. A surface showing what is owed shows the
record's work and the private work together.

A person does not care which of the two a token happens to live in, and the
split is a storage fact rather than something the surface should teach.

## Work drawn from a live source

TWO STORES ALREADY HELD WORK BEFORE THIS ONE EXISTED, and neither can be moved
in without losing what makes it what it is.

- THE PENDING NOTES. A raw note may carry anything private, so it stays local
  and never enters version control.
- THE STANDING POOL. A work token lives on trunk, where every clone reads the
  same answer, and its statement was authored past a privacy check.

SO THE WORK IS DERIVED RATHER THAN MIGRATED. `penWork` reads both sources on
every look and returns work items nobody wrote. Nothing is stored, so nothing
can drift, and a piece of work disappears the moment its source does.

### Where each one is drawn

A PENDING NOTE IS DRAWN AT THE RETRO, in the PENDING bucket. Draining is legal
there and nowhere else, so the retro is the one position that owes a note, and
drawing it anywhere else would count it twice.

PENDING IS THE ONE BUCKET THAT DOES NOT BLOCK, and that is what a note has to
be. Drawn as `in` it counted against the green, so a single pending note kept
the retro grey and every state downstream of it with it. Measured at 86.

THE SLOT IS SAID RATHER THAN DERIVED, because the derivation reads a hand's
work as produced OUT.

A STANDING POOL TOKEN IS DRAWN AT THE BACKLOG, which is the front desk's
pending bucket. Its place stays `backlog`, exactly as a minted token nobody has
placed does, and the drawing is what puts the count at the desk.

### A drawn item has no home, and that is the guard

`readAllWork` carries the pen alongside the store and files no home for it. An
act that names a home therefore refuses rather than writing a status nothing
would ever read back — which is what
raid-risk-a-drawn-token-that-reads-a-live-source-never-settles is about.

THE REAL ACT IS NAMED INSTEAD. A note ends through `se_note_drain`; a pool
token leaves the pool by being seeded into a record.

### It reports and never blocks

A DRAWN ITEM CANNOT HOLD A STATE'S EXIT. The hold reads each home separately,
and the pen belongs to none of them.

THAT IS DELIBERATE. The retro's own rule — leave when the inbox stands at
zero — holds by authorship today, and turning it into a mechanical hold is a
separate decision with a real cost: a tree carrying eighty-five pending notes
would stop the walk at the retro until every one was judged.

### What it costs

Measured on 255 items, 238 of them drawn: the whole read is 30.5 ms and the pen
is 15.8 ms of it. The pool is 154 files, so the pen's half scales with the
backlog and the store's half does not.

### The pen moves the number the drawing watches

THE PILLS ARE PUSHED, NOT POLLED, and the push fires on a number moving. The
store's signal stats the work folders, and the pen has none of those.

SO THE PEN CARRIES ITS OWN. `penSignal` stats the note log and the pool folder,
and `allWorkSignal` adds it. Without that, capturing a note moved the retro's
count on disk and the drawing sat still until an unrelated write nudged it.

IT IS A STAT, NEVER A READ, which is the same rule the store's signal follows.
One file and one folder, one syscall each.

## The title is four words

A TOKEN NAMES ITS WORK. It does not describe it, and four words is the whole
name.

### Why the count is mechanical rather than advice

THE BAR DRAWS THE WORK IN HAND BESIDE THE POSITION. A sentence there is
unreadable at a glance, which is the one thing that chip exists for. A rule
nobody counts is a preference, and this one was written as a sentence first.

EVERY SEPARATOR COUNTS AS A SPACE. An underscore, a dash, a slash and a colon
all break a word. Joining words together to fit is the workaround the count
closes rather than catches.

### Where the detail goes

THE COMMENT ON THE ACT. Every take and every settle demands one, and the store
refuses to leave it empty, so a reader opening the token finds what the four
words could not hold.

THE TITLE IS THE HANDLE AND THE COMMENT IS THE CONTENT. Two fields with two
jobs, rather than one field doing both badly.

### Only a hand is held to it

A TITLE DERIVED FROM A CARD'S HEADING IS THE CARD AUTHOR'S SENTENCE. Refusing
it at the mint would refuse the engine's own derivation and teach nobody
anything, because no hand wrote it.

SO THE CHECK SITS ON THE TWO DOORS A HAND USES: the lane's open act, and the
surface's own entry field. Both hand back the first four words, ready to send,
and nothing is written until one of them passes.
