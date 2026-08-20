---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: fn-run-a-governed-walk.mint-an-option
type: "[[function]]"
cluster: the-holding-pen
statement: turn a held stray into a durable option that can leave the machine that captured it
satisfies:
  - req-draining-to-the-pool-mints-an-option-on-trunk
  - req-a-minted-option-is-authored-never-the-note-s-own-text
  - req-a-minted-option-says-what-it-is-and-when-it-comes-back
  - req-the-raw-note-stays-local-and-is-marked-drained
  - req-the-crossing-is-the-same-act-for-a-person-and-an-agent
inputs:
  - flow-stray
  - flow-note-inbox
outputs:
  - flow-standing-option
  - flow-note-inbox
controls:
  - the statement offered by the author, which is what the crossing is made of
  - the drain's legal context, unchanged from the disposition it rides on
source_refs:
  - uc-put-a-finding-where-it-outlives-the-machine
  - vp-the-ledger
---

## Rationale

IT IS NOT hold-a-stray, AND THE SEAM IS WORTH NAMING. hold-a-stray takes a
thought out of the walk's way and gives it back later with exactly one home. Its
whole subject is the ROUND TRIP inside one machine, and its output is the inbox.

THIS FUNCTION DOES SOMETHING THAT ONE NEVER DOES: it produces an artifact that
OUTLIVES the machine. That is a different output crossing a different boundary,
and the four holes walk is what makes the distinction load-bearing — an output
nobody consumes is a missing function, and the standing option is consumed by a
reader on a machine that does not exist yet.

THEY SHARE A CLUSTER, and that is correct. `the-holding-pen` is where a stray
lives from capture to disposition, and the mint is the last act of that life.
Putting it in a new cluster would be the architecture moving, which is the tell
this iteration's column is wrong.

## Solution-neutral

COULD TWO HONESTLY DIFFERENT DESIGNS DO THIS? Yes, and one of them is the
design this iteration did not choose: a hosted store with an API, which is what
every tracker does. Nothing in the statement names a file, a repository, a
format or a commit — "leave the machine that captured it" is the demand, and
where it lands is M4's to choose.

WHAT WAS ALMOST WRITTEN AND WAS NOT: "write an option node onto trunk". That
names a technology twice, and it would have collapsed the candidate space to
the one point the assumption on the register is meant to keep falsifiable.
