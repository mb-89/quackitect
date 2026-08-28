---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: if-departure-list-to-door-sweep
type: "[[interface]]"
statement: The sweep reads every recorded departure with the reason its author wrote, so it can subtract what is accounted for from what it found.
source: el-departure-list
destination: el-door-sweep
carries:
  - flow-the-recorded-departure
form: a file - one markdown list per conversation, parsed into a set of module paths each with its reason text
bound: inherited — a file read inside the sweep run, with no clock of its own
source_refs:
  - "[[raid-dec-a-departure-carries-a-written-reason-that-cannot-be-left-empty]]"
  - deliverable/machines/widget-exemptions.md — the standing file, one entry
---

## Direction and cadence

ONE WAY, once per sweep run. The sweep reads; it never writes here.

WHAT WRITES HERE is the write guard's refusal remedy, and that is a different
crossing with the author in the middle of it.

## What crosses

EVERY ENTRY, WITH ITS REASON. Not just the module paths.

THAT IS DELIBERATE AND IT IS A CHANGE. The standing reader drops a bullet
carrying no reason, so a reasonless entry is invisible to everything downstream.
Passing the reason across is what lets the sweep report an entry that has one
and an entry that does not as different things.

## Failure behaviour

A MALFORMED ENTRY IS REPORTED, NEVER SKIPPED. An entry the parser cannot read
and an entry that is not there look the same to a caller that skips it, and the
second is a departure nobody declared.

AN EMPTY REASON IS REFUSED at the write guard rather than here. By the time the
sweep reads the file, an empty reason means the file was edited outside the
guarded path, which is the case
[[raid-asm-every-write-that-adds-a-departure-passes-through-the-lane]] carries.

## Why the file is the form

A FILE RATHER THAN A CALL, because a person reads this list. It is the one place
somebody can see every exception to a rule and why each was taken, without
running anything.

THAT IS WHAT THE CENTRAL SHAPE BOUGHT and what the per-site shape would have
cost. The trade is written up on
[[raid-dec-a-departure-carries-a-written-reason-that-cannot-be-left-empty]].
