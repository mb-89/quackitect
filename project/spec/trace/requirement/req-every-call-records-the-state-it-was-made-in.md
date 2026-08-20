---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-every-call-records-the-state-it-was-made-in
type: "[[requirement]]"
statement: "When the lane records a call, the record shall carry the state the walk stood in as a field of its own rather than inside an argument, so the log can be grouped by it."
kind: functional
verify_method: test
breaks_if_removed: "Attribution needs two coordinates. Knowing which model answered two hundred calls says nothing about which of fifty-three states it walked, so the model stamp alone answers no question anybody asked."
breaks_how_badly: crippling
refines:
  - uc-attribute-a-finished-walk
source_refs:
  - "uc-attribute-a-finished-walk step 2"
  - "uc-attribute-a-finished-walk ext 2a"
  - "raid-iss-a-call-cannot-be-attributed-to-the-state-it-was-made-in"
priority: must
---

## Detail

THE VALUE IS ALREADY KNOWN WHERE THE CALL IS SERVED, which is the same place
the acting role is stamped and for the same stated reason: the code that knows
writes it, and nothing downstream infers it.

IT MUST BE A FIELD. The state rides inside a narration record's arguments today
and grouping cannot reach it, which is why the retro's per-step cost column has
stood documented as impossible since 2026-08-17.

EVERY COORDINATE OR NONE. The record grows the model field and this one in one
edit; shipping either alone looks like progress and moves nothing.

AND THERE ARE THREE OF THEM, corrected 2026-08-20. This line said "BOTH
COORDINATES OR NEITHER" while the record had no way to say which hand made a
call. `req-every-call-records-the-part-its-caller-played` is the third, and it
joins this edit rather than queueing behind it.

A NOTE ON HOW ITS ABSENCE IS ESTABLISHED, because this iteration got it wrong
once: read the record's own declaration. Grouping by a missing key returns a
single bucket, and so does grouping by any word at all.
