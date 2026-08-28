---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-gate-judges-on-the-work-minted-and-finished-before-it
type: "[[requirement]]"
statement: When a gate is reached, the system shall put in front of it the pieces of work minted and finished before it, as the basis it judges on.
kind: functional
verify_method: test
breaks_if_removed: A gate goes on reading forms while the work itself carries the evidence, so the two describe the same phase and only their disagreement is visible.
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-read-what-the-system-owes-and-what-it-is-doing
source_refs:
  - "record.md lines 98 to 101: a gate looks at the tokens minted and finished before it, and that is the basis it judges on, in place of the evidence it reads today"
  - req-settled-work-is-the-evidence-inside-a-record
  - req-gate-shows-the-evidence-form
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

IT FOLLOWS FROM THE SETTLED WORK BEING THE EVIDENCE. If a finished work token
IS the evidence, then a gate reading a separate form is reading a copy, and
the copy is the thing that goes stale.

WHAT THE GATE GETS. Everything minted in the phase behind it and everything
finished there, with each work token's own reason where it closed any way but
done.

WHAT DOES NOT CHANGE. The rounds, the verdict and the bless. A gate still
verifies, validates and red-teams; this row changes what it verifies against.

THE SEAM WITH THE STANDING ROW. req-gate-shows-the-evidence-form demands the
gate be presented the form itself rather than a summary of it. That demand is
unchanged and this row is its successor in the new vocabulary: what is shown
is the work, never a summary of the work.

WHY IT IS CRIPPLING. A gate is the one place a milestone can be refused. A
gate judging a copy can pass a phase whose actual work tokens were never
settled.
