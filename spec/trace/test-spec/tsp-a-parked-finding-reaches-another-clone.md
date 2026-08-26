---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: tsp-a-parked-finding-reaches-another-clone
type: "[[test-spec]]"
statement: A finding parked on one machine is offered to an engineer on a clone that never held it, verified by demonstration across two clones of one origin.
method: demonstration
demonstrates:
  - sty-see-what-the-other-machine-may-pull-from
verifies:
  - none — this spec demonstrates a story end to end, so the demonstrates edge above carries its trace; the one requirement mentioning either story is req-open-work-is-answered-from-the-repository-not-a-local-store and its verify method is test; every requirement was checked for a mention of either story
files:
  - none — the procedure below is the definition; the observed sessions are the evidence
---

## Why this spec exists

TWO MUST STORIES ARRIVED WITH NO DEMONSTRATION. i17 minted them both, and its
three other specs verify requirements by test and by inspection. A test proves
the mechanism; neither story is about the mechanism. Both are about a finding
CROSSING from one machine to another, and one box cannot show a crossing.

THE COVERAGE LAW CAUGHT IT AT gate-validation, which is the same place it
caught i34's deleted demonstration. The route refused to leave the gate until a
demonstration-method spec named each story.

## Scope

What the two stories promise between them:

- A finding stated once on a box nobody is watching is readable after the box
  is gone.
- An engineer on a fresh clone is offered work that was parked on a machine
  they have never touched.

WHAT IS DELIBERATELY OUT: the migration of what is already parked. Those notes
live in a machine-local store on one laptop, and moving them is its own act
with its own report.

## Approach

System level, on two real clones of one origin. Not staged: clone B is made
after the mint and configured by nobody for this.

The fixture in `tests/pool-offer.test.ts` reproduces the READING half of this
as closely as one box can — a root holding the repository with an empty local
note store, which is the only state where reading the wrong source is visible.
It cannot reproduce the crossing, because the crossing needs a second machine.

## Procedure

1. On machine A, run a walk with no person present. Let it capture a real
   finding with `se_note`.
2. At the retro on machine A, drain that note to `backlog` with its
   `where` and its `statement`. Observe: a work token file appears under
   `spec/trace/work-token/`.
3. Read the raw note store on machine A. Observe: the note is still there,
   marked drained, and its text has not moved.
4. Read the minted token. Observe: it carries the authored statement and the
   re-entry condition, and none of the note's own words.
5. Commit and push. Release machine A.
6. On machine B, clone the origin. Do not copy `.se`.
7. Run `se_survey` on machine B. Observe: the token is offered, with its
   statement and its ready-when, and the count matches what machine A minted.
8. Observe that machine B's own note store is empty, so the offer can only
   have come from the repository.

## What this demonstration CANNOT show, and why it says so

THE PRIVACY LINE IS NOT DEMONSTRABLE BY WATCHING IT WORK. Step 4 observes that
one token carries no leaked text. It cannot observe that no token ever will,
and the check behind it has limits that are pinned by cases rather than by this
procedure — a bare name walks through, and so does a paste with a word
inserted.

SO STEP 4 IS A SPOT CHECK, NOT A GUARANTEE.
`raid-asm-a-verbatim-overlap-check-catches-the-paste-that-matters` carries the
open question, and it stays open until the pool has enough content to probe.

## Not yet performed

THIS PROCEDURE HAS NOT BEEN RUN. i17 built the mechanism on a cloud box holding
one clone, and gate-validation passed with an override saying exactly this: the
mechanism is green on both halves and the crossing between two machines has
never been watched.

The first real run of step 2 happens at the next retro on the owner's machine,
and its first act is owed a report of what did not fit.
