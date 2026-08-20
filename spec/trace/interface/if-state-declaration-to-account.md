---
minted_in: i9
id: if-state-declaration-to-account
type: "[[interface]]"
statement: What the declaration resolved, and which generated consumer it was asked on behalf of, reaches the record so a later reader can tell a drifted consumer from a wrong path.
source: el-state-declaration
destination: el-account
carries:
  - flow-resolved-target
form: append
source_refs:
  - decompose-structure at i9, the element matrix's owed cell
  - req-acts-carry-role-and-channel
---

An append that does not wait. The declaration answers, the answer lands in the
record, and nothing blocks on it.

## What crosses

THE RESOLVED TARGET AND WHO ASKED. The second half is what this crossing adds
over the resolution seam's own record: when a generated consumer has drifted, the
symptom is a path that resolves differently depending on which consumer asked,
and only the asker's name makes that visible.

## Why append rather than call

NOTHING DECIDES ON IT. The write guard's crossing waits because the answer
decides whether a write lands. This one is evidence after the fact.
