---
minted_in: i3-the-walk-s-feedback-loop-the-reading-cre
id: req-the-size-is-read-by-one-extractor
type: "[[requirement]]"
statement: The engine shall read a blessed change size with the same extractor that validated the choice, taking the chosen option alone and never scanning the surrounding reasoning.
kind: functional
verify_method: test
breaks_if_removed: An iteration records a size nobody chose. The reasoning beside the choice names other sizes in passing, and whichever the scanner meets first wins.
breaks_how_badly: fatal
refines:
  - uc-be-handed-the-method
source_refs:
  - "engine/stateform.ts chosenOption, built on the form's own choiceOf"
  - "engine/session.ts kickoffSizeFromForm"
  - "tests/change-size.test.ts, which pins the exact field that bit"
  - "observed live 2026-08-13: i3 recorded patch from a field whose choice was minor"
priority: must
---

## Detail

- One extractor serves both ends. The gate's check and the recorded size must
  never be able to disagree about what was chosen.
- The rationale is not scanned. A field reading `minor — ... a new line is not
  a patch` records minor, and the word `patch` inside the reasoning is text.
- An unrecognised choice records nothing rather than guessing.

## Behaviour

    field filled     -> validated:  the gate checks the choice against the sizes
    validated        -> blessed:    the person rules
    blessed          -> recorded:   the same extractor reads it again
    recorded         -> compiled:   the column becomes the walk

The failure removed here is a `validated -> recorded` pair that disagree. On
2026-08-13 the gate validated `minor` and the record took `patch`, because the
recorder scanned the whole field in column order and `patch` came first.
Eleven approved steps were struck and the build never ran.
