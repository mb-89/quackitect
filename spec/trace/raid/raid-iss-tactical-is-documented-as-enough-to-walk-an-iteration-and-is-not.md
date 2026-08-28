---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: raid-iss-tactical-is-documented-as-enough-to-walk-an-iteration-and-is-not
type: "[[raid]]"
kind: issue
statement: scale.ts stated that tactical runs a whole iteration end to end; a bless wants a hand strictly ABOVE the gate's weight, so tactical fills a gate and cannot sign it, and an unattended run at the default rung stops at the first gate.
owner: the owner
trigger: already live - hit at i17's gate-kickoff, 2026-08-18, on an unattended box
status: open
impact: "The default rung moved from operational to tactical on 2026-08-18 for a stated reason: an unattended run stopped at the first milestone every time. It still stops there. The stop moved from the gate's ENTRY to the gate's BLESS, one call later and the same outcome - and the comment recording the fix read as if the problem were solved, so the next unattended run would have rediscovered it."
breaks_how_badly: crippling
how_likely: expected
probe: "HALF CLOSED, 2026-08-18. The false claim is corrected in scale.ts and in se-arrive's help, so nothing now says tactical signs a gate. WHAT REMAINS OPEN is the decision the correction exposes: what rung an unattended run should be launched at, which is the owner's."
probed: 2026-08-18
source_refs:
  - i17-the-options-pool-triage-a-raw-note-into-
  - raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make
weighs_with: none
weighs_against: none
place: i14-the-ladder-engine-half-comparison-moves-
---

## BOTH COMPARISONS ARE RIGHT AND THE SENTENCE BETWEEN THEM WAS WRONG

THIS IS NOT A BUG IN EITHER CHECK, and the first diagnosis written at this
gate said it was. Correcting it here rather than leaving the wrong version
standing.

ENTERING a state refuses on `priority > autonomy`, so a hand AT the weight is
admitted. That is what lets tactical walk into a tactical gate, and it is what
the 2026-08-18 default change fixed.

BLESSING refuses on `autonomy <= priority`, so it wants a hand strictly ABOVE.
That is the design of 2026-08-04, in its own words: a gate's submitted form
needs a hand above it. A reviewer one rung above the work being reviewed is
the whole point of a gate, and loosening it would quietly remove the owner's
only control over their own review.

WHAT WAS WRONG was the claim written between them: "so tactical runs a whole
iteration end to end". Nobody checked the bless when that was written, and the
sentence then read as a solved problem.

## What it cost

MEASURED ON THE i17 ARRIVAL, 2026-08-18. The lane came up at tactical, which is
what se-arrive's default sends. The walk entered i17, ran M0's retro in full,
filled the kickoff gate in full - eleven fields, five register entries, a red
team and a verdict - and refused at the bless with nobody at the box to supply
a thumb.

THE WORK WAS NOT LOST, and that is worth saying: the form saves unstamped, so a
person arriving later blesses what is already written. The cost is the wait,
and on an unattended box the wait is unbounded.

## The decision this leaves the owner

TWO ANSWERS, and the choice is not the agent's.

- AN UNATTENDED RUN IS LAUNCHED AT STRATEGIC. se-arrive already says raising
  the rung is the owner's call. THE COST: strategic also admits retros,
  overhauls, seeding and draining the backlog, which scale.md deliberately
  keeps with the person. Handing over gate-signing hands those over with it,
  because the rungs are cumulative by design.
- THE GATE BRIEF REACHES THE PERSON WHEREVER THEY ARE, and they bless from
  there. That is i24, the phone loop, whose own goal line says it "is also what
  makes a cloud iteration supervisable". It costs a wait rather than a control.

WHAT IS NOT AN ANSWER: making the bless admit a hand at the gate's own weight.
That drops the half the 2026-08-04 design exists to keep.
