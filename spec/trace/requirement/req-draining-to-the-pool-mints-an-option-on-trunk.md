---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: req-draining-to-the-pool-mints-an-option-on-trunk
type: "[[requirement]]"
statement: When a pending note is drained to the pool, the system shall write an option node into the repository, carrying the author's statement, the re-entry condition and a reference to the note it came from.
kind: functional
verify_method: test
breaks_if_removed: Nothing produced by a drain leaves the machine. Every parked option stays in .se/notes.jsonl, which .gitignore excludes, so no other clone can read it and a released box takes it with it. That is the present state, and it is what uc-put-a-finding-where-it-outlives-the-machine and uc-see-the-whole-pool-from-any-clone both fail on.
breaks_how_badly: crippling
refines:
  - uc-put-a-finding-where-it-outlives-the-machine
  - uc-see-the-whole-pool-from-any-clone
source_refs:
  - vp-the-ledger
  - raid-asm-the-pool-is-a-node-kind-under-project-spec
  - spec/iterations/i17-the-options-pool-triage-a-raw-note-into-/record.md "Yes, the work token is i17 options pool" (owner ruling 2026-08-17)
priority: must
---

## Detail

| what the node carries | binding |
| --- | --- |
| the statement | what the option is, written for a reader who has never seen the note |
| the re-entry condition | what has to be true for it to come back |
| the source | the ref of the note it was authored from |

THE NODE IS A CORPUS NODE, under `spec/`, read by the same reader,
walked by the same sweep and swept for leaked identities by the same
prose-inspect pass. That is the assumption the whole minor column rests on and
it is on the register, not hidden here.

## Pass line

A drain to the pool, on a clean clone, produces a file the corpus reader loads
and the sweep walks. Metric: options minted that a fresh clone cannot read.
Target: zero.

## Behaviour

A LIFECYCLE EARNS ITS PLACE HERE, because the participant test is the whole
question this row exists for — the note is created by a capture, and until this
row nothing created the option at all.

    (nothing) -> pending:  a capture writes a note
    pending   -> drained:  a disposition is chosen
    drained   -> ends there, for done and obsolete and carried
    drained   -> minted:   the pool disposition ALSO authors an option
    (nothing) -> minted:   never — an option with no note behind it cannot exist

THE LAST LINE IS THE ONE THAT PAYS. It says the pool has exactly one door, so a
later convenience that writes an option directly is a change to this row rather
than an addition beside it.
