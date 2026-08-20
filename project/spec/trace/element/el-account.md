---
minted_in: i1
id: el-account
type: "[[element]]"
statement: Keeps the record of what happened — every call logged with role and channel, the trace derived from files, findings landing as references with their sources.
kind: existing
realization: make
group: the-account
implements:
  - fn-run-a-governed-walk.keep-the-record
  - fn-run-a-governed-walk.stamp-who-answered-and-where
source_refs:
  - cand-thin-worktree
  - raid-dec-stable-ids
---

The account is append-only fact: the call log, the trace corpus and the
reference corpus. Ids point at authoritative text
([[raid-dec-stable-ids]]); the trace view derives from files and never
mixes sources.

## The stamp lands here, added at i38

stamp-who-answered-and-where RECORDS WHICH DRIVER WAS NAMED AND WHICH STATE THE
WALK STOOD IN, and it belongs to the account because keeping the record is what
the account does.

IT RECORDS THE ANSWERING DRIVER TOO, self-reported. Corrected 2026-08-20: this
paragraph said the declared architecture "records the NAMED driver and never the
answering one" and that
`req-every-call-records-the-model-that-answered-it` "stands unmet by
construction". BOTH ARE FALSE AGAINST THAT REQUIREMENT'S OWN DETAIL: "the
transport hands the engine a client name and no model, so today the value can
only come from the caller", and the mark that says so "is part of the
requirement, not a caveat on it".

WHAT THE ARCHITECTURE ACTUALLY GIVES UP IS THE CROSS-CHECK.
`raid-dec-the-block-names-a-rung-and-never-a-model` means nothing in this tree
learns which model a rung resolved to, so a self-reported value has nothing
independent to be compared against. The record is complete and unverifiable,
which is a narrower cost than an absent field and is exactly what the
self-reported mark exists to signal.

THE OVER-STATEMENT TRAVELLED. It was written here, quoted into a scoring anchor,
into a register entry, into a cut's promotion argument and into two candidate
files, and it took a cold pass reading the requirement rather than the citation
to stop it.

Boundary: the interfaces the element matrix mints for its flows.

Realization: the call log, the trace loader and the reference store.
