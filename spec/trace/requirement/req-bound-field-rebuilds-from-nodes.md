---
minted_in: i1
id: req-bound-field-rebuilds-from-nodes
type: "[[requirement]]"
statement: While a form field is bound to trace nodes, the engine shall rebuild the field from the nodes on every look and shall land every cell write on the node it names.
kind: functional
verify_method: test
breaks_if_removed: The form keeps a second copy of the register, and the copy wins the disagreement — the exact defect the binding replaced.
breaks_how_badly: crippling
refines:
  - uc-take-a-step
source_refs:
  - reverse-engineered from tests/binding.test.ts
priority: must
---

## Detail

- The value is read off the node, and only out of its frontmatter.
- A cell still carrying its template comment is unanswered, exactly like an empty one.
- A key owns its block list: a scalar write does not leave old items dangling, and clearing removes the key.
- A dollar sequence in an answer is written literally, never interpreted.

## Addition — work tokens

A FIELD THAT DECLARES ITSELF A SNAPSHOT IS EXCEPTED. Rebuilding on every look
is the LIVE reading, and it stays right for a field that means to be live.

WHAT CHANGED IS THAT THE FIELD NOW SAYS WHICH IT IS.
req-a-drawn-value-declares-snapshot-or-live-reading refuses a drawn value
that has not declared, and a settled snapshot then stops being rebuilt.

THE EXCEPTION IS WRITTEN ON BOTH SIDES DELIBERATELY. It stood only on the new
row, so a reader meeting this one alone would rebuild a snapshot and
reproduce the treadmill the new row exists to end. Measured on this round's
own kickoff gate: it refused to sign twice, and the retro was reopened twice,
all on a field drawn live from the notes inbox.
