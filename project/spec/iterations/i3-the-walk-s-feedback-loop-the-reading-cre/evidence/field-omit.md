---
form: field-omit
by: agent
signed_off: 2026-08-13T12:14:54.223Z
authors: agent
files:
---

# Evidence form / field-omit

## current_situation

A rigor cell could do exactly two things: keep a state or strike it, and swap its guidance prose. The fields hung off the row, one set shared by all four sizes. So "keep the step but ask less here" was a sentence in a note asking whoever walked to be brief — a judgment made fresh every time, by whoever happened to be there. The owner ruled it must be mechanical.

## built

machine.ts and rigor-matrix.ts.

- `EvidenceField` gains `omit?: string[]` — the change sizes that do not ask this field. ABSENT MEANS ASKED EVERYWHERE, so a key nobody wrote can never delete a question. The safe direction for a typo is to ask too much.
- `rowState(row, column?)` filters the row's fields by the column. Without a column nothing is dropped, so the whole-matrix view still shows every question a row can ask.
- `refuseBadOmit` refuses an omit naming something that is not a change size, and one naming all four — a field asked nowhere should be deleted, not hidden.
- The column compiler refuses a work state trimmed to zero fields. That is striking the state quietly, and striking it says so plainly.

PROVEN LIVE, not only by test. draft-vision declares four questions and served exactly one when the walk reached it.

Cases: tests/field-omit.test.ts — five, including that the matrix view still shows an omitted field.

## follow_up

Two rows use it: draft-vision and frame-delta. Every other row still serves its whole form wherever it applies. Recorded as raid-asm-an-omit-is-authored-honestly, with its probe: the engine cannot tell a field dropped for good reason from one dropped to make a form shorter.

## anything_else

