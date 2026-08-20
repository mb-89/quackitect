---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: dsp-the-one-corpus-reader
type: "[[design-spec]]"
statement: One reader answers what the corpus contains and whether a node parses, and the second reader is deleted rather than reconciled.
realizes:
  - el-corpus-reader
files:
  - deliverable/engine/trace.ts
  - deliverable/engine/stateform.ts
---

## Responsibility

ONE ANSWER PER QUESTION, INCLUDING WHEN THE ANSWER IS A FAILURE. Whichever
caller asks what the corpus holds, or whether one node parses, gets the same
answer as every other caller.

WHAT IT DOES NOT COVER. Speed. How fast the corpus is read is a different
demand with its own measure, and a standing assumption already carries whether
the checks stay affordable as the corpus grows.

## Interface

ONE FUNCTION FOR THE WHOLE CORPUS, and one for a single node. Both return the
same shape for a malformed node, and that shape is what the second reader
disagreed about.

THE MALFORMED FILE IS NAMED IN WHAT COMES BACK. Neither of the two original
messages named it, which is why the walk stopped somewhere nobody could find.

## Behavior and constraints

THE DISAGREEMENT WAS MEASURED AND NAMED BEFORE THIS SPEC WAS WRITTEN. One
reader drops a node that will not parse and treats it as absent. The other
keeps it with empty frontmatter, so a caller sees a node with no id. A third
place asserts the second behaviour.

SO THE PARSER WAS NEVER THE PROBLEM. Every reader takes the same parsing
library and agrees on a good node. The HANDLING is what differs, and it differs
only on failure.

DELETING THE SECOND READER MOVES A COST. Every form's node list comes from the
reader being removed, so those lists come from the whole corpus afterwards.
Measured: a full read is 359 ms over 1097 nodes and a stamped repeat is 11 to
13 ms, against a five-second open bound. The number is comfortable and the
dependency is real.

THE FIRST READ IN A PASS IS NOT STAMPED. Inside one pass it is; the first is
not, and that is where the 359 ms lands.

## Rationale

DELETION OVER RECONCILIATION, and the decision is
raid-dec-one-corpus-reader-and-the-second-is-deleted. Two readers held to one
contract by a check is a third thing to keep right, and the contract would be
enforced by the same kind of check that has already drifted here.

THE REQUIREMENT IS WRITTEN AS AN OUTCOME RATHER THAN AS ONE READER, on purpose.
Callers agreeing is what must be true. One reader is the obvious way and not
the only one, so the row leaves the mechanism to design and this spec is where
it is chosen.

WHAT THE TEST MUST DO, from tsp-one-answer-about-the-corpus: enumerate the
readers from the engine rather than listing them, so a reader added later joins
the comparison instead of escaping it.
