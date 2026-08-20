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
the account does. Under the declared architecture it records the NAMED driver and
never the answering one: nothing in this tree learns which model served a call
(raid-dec-the-block-names-a-rung-and-never-a-model), so req-every-call-records-the-model-that-answered-it
stands unmet by construction and is put to gate-architecture rather than papered
over here.

Boundary: the interfaces the element matrix mints for its flows.

Realization: the call log, the trace loader and the reference store.
