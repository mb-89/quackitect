---
form: form-checks
by: agent
signed_off: 2026-08-14T17:52:20.053Z
authors: agent
files: null
---

# Evidence form / form-checks

## current_situation

Twelve chunks were signed. This is the thirteenth and last, and the join at `build-steps/end` has been waiting on it.

The statement promises THREE things, and two of them had notes standing against them before the chunk began. A chunk promising three is not done with one.

## built

THE VOICE LINT RUNS AT SUBMIT, and the card decides which of its rules bite.

`voiceProblems` in `engine/stateform.ts` runs `lintProse` over every prose field at submit. `blockingRules` in `engine/lint.ts` reads `blocking:` from `machines/lint/voice-lint.md`, and only a rule named there refuses.

THE DEFAULT IS `wall` ALONE. It is already law at the lane — SE-C-125 refuses a wall of prose, and no renderer can invent the paragraphs an author did not write. Naming it here makes one rule behave the same way in both places.

WHY NOT ALL OF THEM. A gate that can only say yes teaches people to skim, and so does one that says no about a comma. `lintProse` returns findings with NO severity field, so making them all refuse would put `sentence-run` in the way of every form in the product. The list is data, so the next rule joins deliberately rather than by a code change.

ONLY PROSE IS LINTED. A table, a checklist and a reference list are structure, and running sentence rules over them would flag the shape of a form rather than anything anybody wrote.

AN UNREADABLE CARD BLOCKS NOTHING. A missing file must never start refusing every submit in the product.

A GRADE OUTSIDE ITS CATALOGUE REFUSES.

`bin/grades-complete.ts` used to ask only that the key was NON-EMPTY, and a mint comment is non-empty. The exposure chart asked that the VALUE was on the scale. Two checks, two standards, and the weaker one guarded the state.

It now reads the catalogue through `catalogItems`, from the card that declares it. Editing `meth-likelihood-scale` changes what passes, in the same breath. It refuses three things: an empty grade, a grade still carrying its mint comment, and a grade off the scale — naming what the entry said and what the scale offers.

AN EMPTY CATALOGUE IS A RED, NEVER A PASS. If the card moves or its heading is renamed, accepting everything would be the same silent hole this closes.

A NODE-TABLE CELL THAT LOST ITS TAIL CANNOT PASS SILENTLY.

`nodeTableProblems` refuses a cell ending in an ellipsis, naming the row and the column.

Proof: `tests/voice-at-submit.test.ts` 5 of 5, and `forms`, `testlint`, `cage`, `stophook` all green beside it — test jobs `test-mst8uq5d-10` and `test-mst8u0wu-9`. `npx tsc --noEmit` exits 0.

THE GRADE CHECK WAS PROVEN ON THE REAL REGISTER, which is better evidence than a fixture. Run against trunk it named 18 live entries carrying words nobody put on the scale: certain, likely, possible, unlikely, rare. Run against this record's tree it is green, because the branch already corrected them.

## follow_up

ALL THIRTEEN CHUNKS NOW HAVE CODE AND A SIGNED FORM. The join at `build-steps/end` should close on this one.

THE 18 OFF-SCALE ENTRIES ON TRUNK ARE NOT FIXED, and they are not this chunk's to fix. They are corrected on the record's branch and stale on trunk — the tree split this record exists to close. Levelling moves them, and levelling needs the git adapter `satellite-process` built.

WHOEVER LANDS THIS RECORD SHOULD RUN `grades-complete` AGAINST TRUNK AFTERWARDS. If the branch's corrections did not come across, the check now says so by name instead of passing green.

No notes parked from this chunk. Two were read and one of them is corrected below.

## anything_else

THE NOTE ABOUT THE NODE-TABLE NAMES A MECHANISM THAT DOES NOT EXIST, and the guard was built anyway.

`note-324983b06229` says the node-table truncates a long cell. It does not.

What I checked, rather than assumed:

- No string literal in the whole deliverable writes an ellipsis character.
- No `maxlength` or `maxLength` appears anywhere in it.
- Neither `bindView` (the read half) nor `bindThrough` (the write half) shortens a cell. The write hands `withFrontmatter` the value whole.
- No trace node in the corpus carries an ellipsis-cut value today. The two hits are prose in a test-spec discussing one.

So the cut came from somewhere this code cannot see — a host, or the author's own abbreviation. All four affected experiments were rewritten by hand at the time, which is consistent with either.

THE GUARD DOES NOT NEED THE CULPRIT. Whatever cut it, a frontmatter value that trails off is not an answer, and the outcome that must not stand is the SILENT one: the form shows the whole text, the node carries a fragment, and the ellipsis reads as style rather than as loss.

The code says all of this in its own comment, so nobody later reads the guard as evidence that the engine was the culprit.
