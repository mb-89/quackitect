---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: req-a-minted-option-is-authored-never-the-note-s-own-text
type: "[[requirement]]"
statement: When a drain offers a statement that appears verbatim in the raw note, the system shall refuse the mint and name the text it recognised.
kind: constraint
verify_method: test
breaks_if_removed: "The hard line has no mechanical defence at all. A rewrite that is really a paste passes every other check, because no other check can tell authoring from copying — and a raw note may carry anything an agent dumped into it. A leak on trunk cannot be undone: SE-C-002 forbids rewriting history, so superseded content stays."
breaks_how_badly: fatal
refines:
  - uc-put-a-finding-where-it-outlives-the-machine
source_refs:
  - raid-risk-the-rewrite-carries-the-private-sentence-across
  - spec/iterations/i17-the-options-pool-triage-a-raw-note-into-/record.md "RAW NOTES NEVER ENTER VERSION CONTROL... That is a hard line and it does not bend."
  - vp-the-ledger
priority: must
---

## Detail

| the check | binding |
| --- | --- |
| the trigger | the offered statement occurs, whitespace and case flattened, inside the raw note |
| the response | the mint is refused, nothing is written, and the refusal quotes the overlapping text |
| what is NOT refused | a statement that shares words with the note — only a verbatim run is recognised |

THE CHECK IS CHEAP AND IT IS NOT COMPLETE, and both halves matter. It catches
the paste, which is the easy failure and the likely one. It cannot catch an
author who reworded a private sentence, and it must never be described as
though it could.

WHY FATAL RATHER THAN CRIPPLING. Strike this row and the product still
completes every use case — and the truthful one-sentence description changes,
because "raw notes never enter version control" stops being true of it.

## Pass line

Metric: mints accepted whose statement occurs verbatim in the source note.
Target: zero. Measured by test with a note and a paste, not by inspection.
