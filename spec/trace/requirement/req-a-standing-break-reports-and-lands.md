---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: req-a-standing-break-reports-and-lands
type: "[[requirement]]"
statement: If a bound check finds a break that did not arrive with the write being made, then the engine shall land the write and report the break on the result rather than refusing it.
kind: functional
verify_method: test
breaks_if_removed: A check aims its refusal at whoever edits next. An unrelated edit inherits debt somebody else made, the rational move becomes routing around the check, and a check people route around is worse than no check.
breaks_how_badly: fatal
refines:
  - uc-keep-the-corpus-sound-at-the-write
source_refs:
  - raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus
  - note-8355729c239a
  - req-no-agent-act-destroys-work
  - uc-keep-the-corpus-sound-at-the-write extension 2b
priority: must
---

## Detail

THIS ROW AND `req-a-write-that-breaks-the-corpus-refuses` ARE ONE SEAM
SEEN FROM TWO SIDES. Neither is complete without the other, and the axis
between them is not severity.

WHO CAUSED THE BREAK DECIDES. Not how serious it is, and not how
confident the check is.

- THE WRITE CAUSED IT — refuse. The author is present, the fix is theirs,
  and it is cheapest now.
- THE CORPUS ALREADY CARRIED IT — land and report. The author did not
  cause it and may have no idea what it is about.

## What "report" must mean to count

A REPORT NOBODY READS IS THE SAME AS NO CHECK. Three things follow.

- IT RIDES THE WRITE'S OWN RESULT, so the author sees it without asking.
- IT NAMES THE DIFFERENCE, not the category. "The register lists
  raid-x; the folder does not hold it" rather than "register drift".
- IT DOES NOT BLOCK, and it does not need acknowledging. An
  acknowledgement is a refusal with better manners.

## The owner's ruling this rests on

AN ORPHAN IS NOT CHASED. That is why the register-versus-folder check
reports a named difference rather than refusing, and this row generalises
that ruling to every check whose subject predates the write.

## What it rules out

A CHECK MAY NOT REFUSE ON A CORPUS-WIDE CONDITION. "Every story links a
proving run" is a property of the corpus, so it reports. The demand for
it lives at the state that owns stories, where somebody can act on it.

## Behaviour

NO MODEL WANTED. It is one conditional on one input. A state model would
invent states that do not exist.
