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
