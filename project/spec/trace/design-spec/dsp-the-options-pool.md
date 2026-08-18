---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: dsp-the-options-pool
type: "[[design-spec]]"
statement: the crossing from a machine-local capture to a durable option — one module that mints and reads, one argument added to the drain, and one reader pointed at the corpus instead of the note store
realizes:
  - el-holding-pen
  - el-front-desk
files:
  - project/deliverable/engine/pool.ts
  - project/deliverable/engine/inbox.ts
  - project/deliverable/engine/survey.ts
  - project/deliverable/engine/tools.ts
  - project/deliverable/engine/errors.ts
  - project/guidance/refusals.md
---

## The shape

ONE NEW MODULE AND THREE EDITS. `engine/pool.ts` owns everything about an
option: where it lives, how one is written, how they are read back. The three
edits are the seams that reach it.

- `inbox.ts` — the drain gains a `statement`, and a backlog disposition now
  mints before it marks the note drained.
- `survey.ts` — the backlog list stops reading `.se/notes.jsonl` and reads the
  pool.
- `tools.ts` — `se_note_drain` gains the argument, so the lane can hand one in.

WHY A MODULE AND NOT A FUNCTION IN inbox.ts. The pool is read by things that
have nothing to do with notes — the survey today, the desk tomorrow — and
importing the note store to read a list of options would tie two lifetimes
together that the whole design keeps apart.

## Where an option lives

`project/spec/trace/option/opt-<slug>.md`, a corpus node like any other.

THAT IS raid-asm-the-pool-is-a-node-kind-under-project-spec MADE CONCRETE, and
it is what buys the identity sweep for free: prose-inspect walks
`project/spec` recursively, so a minted option is swept for leaked names and
paths on the day it exists. Probed 2026-08-18 and it holds.

THE FRONTMATTER IS WHAT THE CASES READ BACK, no more:

| key | what it carries |
| --- | --- |
| `id` | `opt-` plus a slug of the statement, made unique |
| `type` | `"[[option]]"`, so the corpus reader types it |
| `statement` | the authored sentence |
| `ready_when` | the re-entry condition, from the drain's own `where` |
| `source` | the ref of the note it was authored from |

## The refusal, and why it is its own clause

A MINT WHOSE STATEMENT IS THE NOTE'S OWN TEXT IS REFUSED, typed as SE-C-140,
with the overlapping run quoted back.

IT IS NOT SE-C-046. A missing argument and a present-but-copied one are
different mistakes with different remedies: one says "fill this in", the other
says "you filled it in with the thing that must not travel". A remedy that
cannot be told apart from the other case is a diagnosis rather than a remedy.

THE CHECK IS A LONGEST-COMMON-RUN, over words rather than characters, with
whitespace and case flattened. A run of six or more words shared with the note
is a copy; anything shorter is vocabulary.

WHY SIX. Shorter and an honest rewrite of a one-line note trips it — the
statement and the note are ABOUT the same thing, so they share nouns. Longer
and a pasted sentence fragment walks through. The number is a judgement and it
is written here rather than buried, so the first run of real data can move it.

WHAT IT DOES NOT CATCH is a reworded private sentence, and that is
raid-asm-a-verbatim-overlap-check-catches-the-paste-that-matters. The check
makes the lazy path illegal; it does not make the honest path easier.

## The reading

`standingOptions(root)` loads every option node and hands back id, statement,
ready_when and source. The survey maps that into the shape its callers already
expect, so nothing downstream of the survey changes at all.

THE WINDOW STAYS WHOLE. `counts.backlog` is the number of standing options,
always, and `backlog_window` says what was shown and what remains. That is
already how the survey windows its notes; the pool inherits it rather than
inventing a second convention.

## What is deliberately NOT here

- NO MERGE. There is no way to drain a note INTO an existing option, and the
  duplicate risk names that as the first thing worth stealing.
- NO WAKE. `ready_when` is a sentence nobody evaluates.
- NO DELETE. An option leaves the pool by being committed to, and that path is
  not built here either.
- NO SURFACE. i23 owns those.

## The options pool

THE OPTIONS POOL — where a stray stops being machine-local.

A CAPTURE IS A DUMP AND A WORK TOKEN IS AN ARTIFACT, and the whole module
exists to keep those two things apart. `.se/notes.jsonl` is written mid-walk
by whoever noticed something, may carry anything, and is never committed. A
work token is authored, states what it is and when it comes back, and lands
on trunk where any clone can read it.

THE THING IS A WORK TOKEN AND THE COLLECTION IS THE POOL (owner ruling
2026-08-18). `option` was taken: it is the morphological chart's cell, 95
nodes deep, declared by machines/items/option.md with its own folder and its
own schema. This module first wrote into that folder, and the survey began
offering every design alternative the project had ever enumerated as work
somebody could commit to. The owner: "You can't have two notes that are both
named options and mean different things."

NOTHING CROSSES BY BEING COPIED. The statement is written by the person or
the agent doing the drain, and `mintToken` refuses one that carries the
note's own text. That refusal is the only mechanical defence the privacy
line has, and `guardNoSecondDoor` is what stops anything else writing here.

WHY IT IS NOT PART OF inbox.ts. The pool is read by things that have nothing
to do with notes — the survey today, the desk tomorrow — and importing the
note store to read a list of tokens would tie two lifetimes together that
the design keeps apart.

## What a secret looks like when it is one

WHAT A SECRET LOOKS LIKE WHEN IT IS ONE WORD.

 THE RUN CHECK CANNOT REACH THESE AND NEVER COULD. An address, a path or a
 password is a SINGLE token, so no run of six words contains it — and it is
 the ordinary shape of a leak, not an adversarial one. An author who writes
 "reach out to maria@example.com" has copied nothing and leaked everything.

 Found by i17's own verification, 2026-08-18, which minted three tokens
 carrying a third party's address, home directory and password past a check
 that was working exactly as designed.

## What stands open

WHAT STANDS OPEN — one mechanical answer: open expeditions, open
iterations, pending notes, and the standing WORK TOKENS in the pool with
their ready-when — read from the repository, never from a machine-local store.

BOTH HANDS ASK IT (owner ruling 2026-07-28). The agent calls se_survey;
the person clicks it in the mirror. It lived inside the tool handler and
so was reachable only by the agent, which made "what is open" a question
the owner had to route through someone else. One implementation, two
doors.

## The finished set moved to iterations

THE FINISHED SET MOVED TO iterations.ts AT i34, as RECORD_FINISHED. It was
defined here and nowhere else, so the survey knew a shipped record was not
open and itList did not — and on 2026-08-16 i28 stood in the container's
list and not in the survey's, with nothing saying they disagreed.

itList NOW APPLIES IT ITSELF, so this file no longer needs its own copy and
no longer needs to filter.

## The pool is read from the repository

THE POOL IS READ FROM THE REPOSITORY, NEVER FROM THE NOTE STORE (i17).
It used to list `backlogNotes`, which live in `.se/` — machine-local and
gitignored — so two clones disagreed about what the project was holding and
neither was wrong. Measured 2026-08-18: a fresh clone reported 0 parked
options while the machine that parked them reported 205.

AN UNDRAINED CAPTURE IS NOT AN OPTION and deliberately never enters here.
It has not been judged, and this list is what somebody may commit to. The
pending count above stays the separate signal it always was.
