---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: req-a-minted-option-says-what-it-is-and-when-it-comes-back
type: "[[requirement]]"
statement: "The system shall refuse a mint whose statement is empty or whose re-entry condition is empty, and shall accept an explicit statement that the option cannot be stated cleanly yet."
kind: functional
verify_method: test
breaks_if_removed: "The pool fills with items nobody can act on. An option with no statement is a stray that got promoted; an option with no condition never comes back, which is what makes a backlog a graveyard. And without the third line an author facing a genuinely unstatable stray has only two moves left — guess, or drop it — and both lose the finding."
breaks_how_badly: crippling
refines:
  - uc-put-a-finding-where-it-outlives-the-machine
source_refs:
  - vp-what-is-learned-outlives-the-machine
  - ref-triage-and-option-pools-2026
  - project/deliverable/engine/inbox.ts "backlog parks the note for a later migration — where: ready when … is then required"
priority: must
---

## Detail

| line | binding |
| --- | --- |
| a statement | non-empty, and it is the author's own — the previous row governs how that is checked |
| a re-entry condition | non-empty; the shape `ready when <condition>` is already required by the drain today |
| the unstatable form | a statement saying the option cannot be stated cleanly yet IS a valid statement, and the option stands as an open question |

THE THIRD LINE IS WHY THIS IS ONE ROW AND NOT TWO. Demanding a statement and
allowing "I cannot state this" look like opposite demands and are one: both say
the author must SAY SOMETHING DELIBERATE. What is refused is silence, never
honesty.

WHAT IS NOT DEMANDED, and the absence is deliberate: that the condition be
machine-evaluable. Linear's snooze wakes by itself, at a time or on new
activity; ours is a sentence a person re-reads at a retro
(ref-triage-and-option-pools-2026). Demanding more here would change what a
re-entry condition IS, and that is out of scope.

## Pass line

Metric: minted options carrying an empty statement or an empty condition.
Target: zero. And a mint offering the unstatable form is ACCEPTED — a test that
only proves refusals would let an over-strict check pass.
