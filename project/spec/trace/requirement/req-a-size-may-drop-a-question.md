---
minted_in: i3
id: req-a-size-may-drop-a-question
type: "[[requirement]]"
statement: Where a step's field names a change size as one that does not ask it, the engine shall serve that size a form without the field, and shall serve every other size the field unchanged.
kind: functional
verify_method: test
breaks_if_removed: Keeping a step but asking less of it stays a judgment. The guidance asks whoever is walking to be brief, freshly, every time, and how brief is decided by whoever happens to be there.
breaks_how_badly: corrosive
refines:
  - uc-be-handed-the-method
source_refs:
  - "engine/machine.ts EvidenceField.omit"
  - "engine/rigor-matrix.ts rowState, the column filter"
  - "the owner's ruling 2026-08-13: the trim must be mechanical, marked in the row"
  - raid-asm-an-omit-is-authored-honestly
priority: must
---

## Detail

- ABSENT MEANS ASKED EVERYWHERE. A key nobody wrote must never delete a
  question; the safe direction for a typo is to ask too much.
- An omit naming something that is not a change size refuses at read time.
- A field omitted at every size refuses. Nothing would ever ask it, so
  deleting the field says the same thing honestly.
- A work step trimmed to no fields refuses. Striking the step says that
  plainly; trimming it to nothing says it quietly.
- The whole-matrix view is not a size. Somebody reading the matrix sees every
  question a row can ask.

## Behaviour

    row authored     -> asked:    no size names this field
    row authored     -> trimmed:  a size names it in omit
    trimmed          -> asked:    at every size the omit does not name
    trimmed          -> refused:  the omit names every size, or an unknown one

The state that must not exist is a step standing in the walk with no question
to answer. That is a strike wearing a trim's clothes, and it refuses.
