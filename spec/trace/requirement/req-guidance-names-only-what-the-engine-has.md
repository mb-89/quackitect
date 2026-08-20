---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: req-guidance-names-only-what-the-engine-has
type: "[[requirement]]"
statement: The guidance shall name only lane verbs the engine registers, file paths that resolve from the project root, and refusal clauses the engine can raise.
kind: constraint
verify_method: test
breaks_if_removed: A name that resolves to nothing costs the reader three to five calls to discover it was never there, and a verb that does not exist raises no typed refusal, so it hands back no remedy at the moment the reader is already stuck.
breaks_how_badly: corrosive
refines:
  - uc-walk-a-record-on-a-smaller-model
source_refs:
  - "owner ruling: the mechanical work should run on a cheap model, because the token cost of the big models is too high for cloud sessions"
  - "measured on the i15 walk: the contract named machines/stopat.md, the reader passed it to se_file_read verbatim, and two refusals and a glob went by before the file was found at deliverable/machines/stopat.md"
  - "measured on the same sweep: 22 paths across the guidance did not resolve as written, and a section headed 'se_package builds the artifact' named a verb that has never existed"
  - deliverable/tests/guidance-verbs.test.ts
priority: must
---

## The three names

A LANE VERB. The engine registers a fixed set. A page naming one outside it
teaches a call that raises no typed refusal, because there is nothing to
refuse — so the reader gets no clause and no remedy.

A FILE PATH. The lane resolves every path from the project root, and says so.
A path written relative to the folder its author was standing in reads as
correct and is unusable.

A REFUSAL CLAUSE. Every typed rejection ships its own section as the remedy.
A clause the page does not carry is a dead pointer handed over at the exact
moment the reader is stuck.

## The one way to name what is not there

A SECTION MAY NAME AN UNBUILT VERB BY CARRYING THE WORDS `NOT BUILT YET`, and
a retired clause by carrying `RETIRED`. The marker is the reader's warning and
the check's exemption at once, so a section cannot have one without the other.

WHY A MARKER RATHER THAN A BAN. A decision to build a thing is worth recording
before the thing exists. What is not acceptable is recording it in a tense
that claims it already does.

## Why it is a constraint rather than a quality

IT IS A PROPERTY OF WHAT WE WRITE, not a behaviour under load. There is no
scenario and no response measure — a name either resolves or it does not.

## Why it is mechanical rather than a review habit

BOTH HALVES ARE SET MEMBERSHIP. Whether a sentence is TRUE is judgment;
whether the verb it names is registered is a lookup. The cheap half is
therefore checked rather than reviewed, and the review's attention goes to the
half a check cannot reach.

THE PRIOR ART FOR NOT DOING THIS is the two defects that stood for weeks in a
corpus that is read every session by careful readers. Neither survived the
first mechanical pass.

## What the row does NOT say

IT DOES NOT ASK THAT THE GUIDANCE BE TRUE. A page can name only real verbs and
still describe them wrongly, which is a different failure and a different row.

IT DOES NOT COVER PROSE OUTSIDE THE GUIDANCE. The engine's own comments, the
spec's evidence and a record's notes are not what a walking agent is served as
instruction.
