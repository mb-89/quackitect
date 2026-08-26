---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: el-door-write-guard
type: "[[element]]"
statement: The caller inside the write path that asks the rule about the one file in front of it, and refuses a write that would add an ungoverned reach or a departure stating no reason.
kind: existing
realization: reuse
group: the-door-regime
implements:
  - fn-govern-a-conversation-under-a-stated-rule.refuse-a-departure-that-states-no-reason
satisfies:
  - req-a-wrong-act-never-passes-silently
  - req-call-answers-in-one-second
source_refs:
  - "[[cand-the-narrow-guard]]"
  - "[[raid-dec-a-departure-carries-a-written-reason-that-cannot-be-left-empty]]"
  - "[[raid-iss-the-refusal-hands-the-author-a-placeholder-where-the-reason-goes]]"
  - deliverable/engine/files.ts:449 — the standing call site
---

## What it does

It runs inside the write, on the content being written, before anything lands.

Its reach is ONE FILE. It is handed the root, one path and the content, and it
reads at most the file it is about to overwrite. It never reads the tree.

## The four early exits, in order

Each one is cheaper than the next, so the common case costs almost nothing.

- The path is outside the governed set.
- The content does not trip the predicate.
- The module holds the door, or is recorded as a departure.
- The file ALREADY tripped the predicate before this write.

The last one is the one that surprises people. A file already in breach stays
editable, so the guard never blocks the repair along with the fault.

## What it refuses

Two things, and the second is new.

- A write that would add an ungoverned reach. Typed, naming the clause, carrying
  the exact call to make instead.
- A departure entry whose reason is empty.

## The remedy stops pre-filling the reason

THIS IS A CORRECTION TO THE STANDING SHAPE, not an addition.
[deliverable/engine/widgets.ts](deliverable/engine/widgets.ts) line 166 writes
the reason slot as literal placeholder text, and nothing checks it was replaced.

An author following that remedy verbatim produces a bullet that looks answered
and says nothing. The generalised guard hands over a remedy with the slot
visibly empty.

## What crosses its boundary

- From [[el-door-rule]] — the predicate and both lists.
- To [[el-departure-list]] — the remedy that appends an entry.

## The budget

The measured bound is one second per lane call. Observed writes run at 4 to 12
milliseconds. A content-only check plus at most one file read leaves two orders
of magnitude of headroom.

A CORPUS-READING CHECK AT WRITE TIME HAS NEVER BEEN EXERCISED, and this element
is shaped so that it never has to be.

## The failure mode that decides it

A departure written through a channel this guard cannot see. The shell is such a
channel today, and
[[raid-asm-every-write-that-adds-a-departure-passes-through-the-lane]] carries
it. It fails silently and toward permission, and [[el-door-sweep]] is what
catches it.
