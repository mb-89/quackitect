---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-storage-shape-chosen-for-the-archive-can-be-changed-later
fitness_candidate: true
type: "[[requirement]]"
statement: The engine shall serve closed work after the shape holding it changes, so no content already held becomes unreachable.
kind: quality
verify_method: test
breaks_if_removed: The first shape chosen is the shape forever. History is never rewritten here, so a fold format that turns out wrong cannot be unwound, and every record already folded is stuck in it.
breaks_how_badly: corrosive
refines:
  - uc-close-a-record
  - uc-browse-the-archive
source_refs:
  - raid-dec-the-volume-is-bounded-by-one-open-iteration
  - cand-files-while-open-one-file-in-version-control-once-closed
  - cand-files-while-open-evidence-once-closed
  - "scoring 2026-08-26: two candidates name an irreversible act and no axis measured the cost of being wrong"
priority: should
---

## Scenario

- source: a maintainer who has decided the chosen fold format is wrong
- stimulus: the format is changed and the tree is migrated
- artifact: every record already closed under the old format
- environment: any host, with history never rewritten
- response: everything each such record held before the change is still reachable after it
- response measure: items held before the change and unreachable after it = 0, counted per item rather than per record

## Detail

THE DEMAND IS THAT A WRONG CHOICE IS RECOVERABLE, not that no choice is ever
wrong.

A DESIGN MEETS IT by keeping the content readable by something other than the
one reader that understands the chosen shape, or by being able to write the old
shape back out.

## Why this is sharper here than elsewhere

HISTORY IS NEVER REWRITTEN IN THIS PROJECT. SE-C-002 forbids it. So a shape
that lands in a commit stays in that commit, and every record folded under a
wrong format carries it permanently.

MOST DESIGN MISTAKES ARE CHEAP HERE because the corpus is text and a script can
rewrite it. A fold is the exception: it removes the thing a script would
rewrite.

## Why it is a should rather than a must

AN ITERATION SHIPS WITHOUT IT, and the cost lands later rather than now. What
it buys is the ability to be wrong once cheaply.

## Where it came from

MINTED AFTER THE FACT. Two candidates at i63's candidates milestone each named
an irreversible act in their own prose, and nothing on the chart asked what
being wrong would cost. The scoring agent named the gap and it was carried as a
gate override before it was written down as a demand.

## Version control counts as reachable

CONTENT RECOVERABLE AT A COMMIT IS REACHABLE. A design that folds into a wrong
format has not lost what it folded, so long as the pre-fold state stands at a
commit and a reader can get at it.

THE OWNER RULED IT, 2026-08-26: reading an archived iteration is a version
control operation.

WITH ONE CONDITION, from the same ruling: it has to be clear what the commit
is. A fold that leaves the pre-fold state at a commit nothing names has not
kept it reachable, so the fold is irreversible after all.

SO A DESIGN THAT FOLDS OWES AN ADDRESS. The commit holding the pre-fold state
is recorded where a reader will find it, at the moment of folding.

## A design that chooses no shape satisfies this, and that is correct

IT LOOKS VACUOUS AND IT IS NOT. The demand is that a wrong choice be
recoverable. A design that makes no choice cannot make a wrong one, so it meets
the demand at no cost.

WHAT THAT MEANS FOR SCORING is that this row separates designs by whether their
choice is recoverable, and gives the abstainers a free pass. That is a real
property of abstaining rather than a flaw in the row. The scoring agent flagged
it on 2026-08-26 as reading like a penalty on ambition; the answer is that the
row prices risk, and taking none is genuinely cheaper.

## Why it is not the same row as the working surviving

THE TWO BITE ON THE SAME ACT and measure different things.

- THE WORKING SURVIVING asks what a record can still tell you. It is about
  content.
- THIS ROW asks whether a shape you chose can be unchosen. It is about risk.

A DESIGN CAN PASS EITHER AND FAIL THE OTHER. Folding into a lossy shape that is
perfectly re-foldable passes this and fails that. Keeping everything in a
format nothing can migrate fails this and passes that.

THE SCORING AGENT CALLED THEM "TWO AND A HALF AXES" on 2026-08-26, and that is
fair. They are not compounded, because compounding would lose the half.

## An unversioned pointer does not hold what it points at

A REFERENCE INTO CONTENT THAT MOVES holds nothing. If a record's work points at
a guidance card by name, and the card is reworded, what the work was done
against is gone. Every version of the card stands at a commit; the
correspondence between the work and the version stands at none.

SO A POINTER COUNTS ONLY WHERE IT PINS A VERSION. That is the same address
condition the deleting case carries, applied to a reference rather than to a
deletion.

THIS WAS ALSO RULED AFTER THE SCORING RAN. It is the only thing separating one
candidate from the three that abstain, and it is stated here rather than left
as the scorer's reading.

## What this row can and cannot buy

IT BARELY DISCRIMINATES NOW, and that is worth knowing before anybody leans on
it. Four of five candidates score alike. With history never rewritten and
version control counting as reachable, only a design that writes something down
in no readable form can fail, and one candidate does that through an
unversioned pointer.

THE ROW STILL EARNS ITS PLACE because it prices the one risk the folding
designs take. It is not a ranking instrument.

## What is verified

A RECORD IS FOLDED, then the fold format is changed, and every item the record
held before the fold is asked for again. The count of items that cannot be
produced, from the tree or from a commit, is the measure.
