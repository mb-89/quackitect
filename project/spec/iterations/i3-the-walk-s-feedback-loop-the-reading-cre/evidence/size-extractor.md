---
form: size-extractor
by: agent
signed_off: 2026-08-13T12:13:51.723Z
authors: agent
files:
---

# Evidence form / size-extractor

## current_situation

The recorded size scanned the whole kickoff field for any column name, in declaration order. `patch` comes first, and i3's reasoning ended "a new line is not a patch", so an iteration blessed as MINOR was recorded as PATCH. Eleven approved steps were struck, specify-build vanished, and the build never ran.

## built

stateform.ts gains one shared extractor, and session.ts uses it.

- `chosenOption(content, options)` sits beside `choiceOf`, which is the form's OWN reader of a `<choice> — <rationale>` field. It takes the choice and matches it against the allowed set. The rationale is never scanned.
- `kickoffSizeFromForm` calls it instead of scanning.

ONE EXTRACTOR, TWO ENDS. The gate validates the choice and the record reads it back, and they now cannot disagree because they are the same function. Two readers of one field is the shape that produced the defect.

An unrecognised choice records nothing rather than guessing.

Cases: tests/change-size.test.ts — five cases, including the exact field verbatim: "minor — ... a new line is not a patch" records minor.

## follow_up

Nothing owed. The same extractor now serves any field shaped as a choice with a reason.

## anything_else

