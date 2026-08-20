---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: cand-whoever-holds-the-hands-decides
name: "Whoever holds the hands decides"
statement: "Publish a two-part difficulty and a rung name and never a model, make the no-match a value rather than a silence, and leave the mapping from rung to worker entirely to whoever holds the fleet."
type: "[[candidate]]"
picks:
  - "[[opt-the-difficulty-is-declared-by-hand-on-the-cell]]"
  - "[[opt-difficulty-splits-into-judgement-and-reading]]"
  - "[[opt-name-the-driver-per-state-not-per-milestone]]"
  - "[[opt-the-block-names-a-rung-and-never-a-model]]"
  - "[[opt-the-no-match-is-a-returned-value-not-an-absence]]"
  - "[[opt-publish-the-difficulty-and-let-consumers-choose-their-own-hand]]"
  - "[[opt-a-driver-claim-cannot-be-made-without-a-driver-or-a-reason]]"
  - "[[opt-name-the-acceptable-over-driving-rate-in-advance]]"
  - "[[opt-the-record-carries-both-the-named-driver-and-the-one-that-answered]]"
---

## What it leans on

IT TRADES OUR ASSUMPTIONS FOR SOMEBODY ELSE'S CAPABILITY.

- Two assumptions stop being needed rather than being weakened.
  raid-asm-one-model-list-serves-every-host-the-engine-supports and
  raid-asm-the-model-ladder-is-a-total-order both concern a roster this line does
  not hold.
- A party exists that can read a rung and act on it. IT DOES, corrected
  2026-08-20. This line spent the whole comparison carrying "IT DOES NOT" on the
  authority of nbr-the-driver-that-performs-the-spawn, which itself said the
  receiver reads and cannot act. Both were wrong. The party is the walking
  agent, and it acts by handing the step to a stronger hand — contract rule 11
  and `project/guidance/method/subagents.md` § Which model. THIS LINE'S LARGEST
  DECLARED LEAN IS THEREFORE NOT A LEAN AT ALL, and it was scored while it read
  as one.
- The judgement and reading figures are separable in practice. Argued from two
  worked examples in the corpus and never measured.

AND ITS ACCOUNTABILITY IS HALF A MECHANISM, WHICH IT SHOULD BE READ AS ADMITTING. It names an acceptable over-driving rate in advance because that is the only half of measuring that lives on our side of the boundary. We can state the tolerance; we cannot observe what actually answered, because under this line nothing of ours ever knew which model the rung resolved to. Every other candidate can reconcile a named driver against a real one, and this one is asking a receiver it does not control to report against a number it did not choose.

THE ONE THING IT LEANS ON THAT IS SETTLED is the shape of the no-match value,
verified at the primary — OASIS XACML 3.0, 22 January 2013 — where NotApplicable
and Indeterminate are distinct returned results.


## Grafted at graft-onto-the-winner, 2026-08-20

ONE AXIS WAS WON BY LOSERS AND IT IS THE ONE THIS CANDIDATE IS WORST ON.
req-the-actor-is-recorded-where-the-call-is-served: 0 here, 2 for
cand-the-reader-beside-the-walk, 1 for the two eliminated lines.

HALF THE MECHANISM IS TAKEABLE AND THE HALF IS THE ONE ON OUR SIDE OF THE
BOUNDARY. This candidate can never record what answered — nothing of ours learns
which model the rung resolved to, which is the consequence of the choice that
earns it its host-swap point. [CORRECTED BELOW, 2026-08-20: the sentence before
this marker is false and the section headed "Can never record what answered is
wrong" says why. What is lost is the cross-check, not the record.] It can record
what it NAMED: the rung it published and the state it published it for. Grafted:
opt-the-record-carries-both-the-named-driver-and-the-one-that-answered now sits on
this line for its named half.

IT CLOSES A HOLE IN THIS CANDIDATE OWN SAFETY RULE. A record carrying neither a
named driver nor a stated reason is not a valid record — that was already here,
and it was unenforceable, because nothing recorded the named driver. Now something
does.

THE SCORE IS NOT MOVED. A second hand put this axis at 0 with this file own
sentence as its anchor, and the hand that performs a graft does not re-score it.
The addition is recorded beside the score rather than over it.

THE SCORE HAS SINCE MOVED, 2026-08-20, AND THE PARAGRAPH ABOVE IS WHY IT HAD TO.
A score was pinned to a sentence this same file later declares false. A THIRD
scorer, told which sections were added and by whom, put the axis at 1 rather
than 0, on the ground that the anchor sentence does not hold against
`req-every-call-records-the-model-that-answered-it`'s own Detail.

IT DOES NOT RISE FURTHER, and the reason is about the axis rather than this
line. `req-the-actor-is-recorded-where-the-call-is-served` is the READER'S half
— "A STAMP THAT NOTHING READS IS NOT ACCOUNTABILITY" — and no candidate on the
chart contains a reader of the acting role.

AND THE DEFECT SHAPE IS ONE THIS RECORD HAS ALREADY NAMED ELSEWHERE. A file
carrying a claim and its own correction, with no marker saying which is which,
reads as two independent observations. `cand-the-reader-beside-the-walk` had
exactly that and it was repaired; this file had it too and nobody looked.

## The must gaps, filled at run-candidates 2026-08-20

WHY THIS SECTION EXISTS. An independent must-check held all ten musts against
all four candidates. This line was found over-stating one of its own limits and
silent on another. Contract rule 5 says fill the gap before judging it.

### "Can never record what answered" is wrong, and the true limit is narrower

THIS FILE SAYS IT TWICE: "we cannot observe what actually answered, because under
this line nothing of ours ever knew which model the rung resolved to", and "This
candidate can never record what answered".

THE SECOND SENTENCE IS FALSE AND THE FIRST IS TRUE.
`req-every-call-records-the-model-that-answered-it` says in its own Detail: "the
transport hands the engine a client name and no model, so today the value can
only come from the caller." The value is SELF-REPORTED on every line, including
the three that hold a roster. Nothing about publishing a rung instead of a model
stops the caller reporting what it is.

WHAT IS ACTUALLY LOST IS THE RECONCILIATION, not the record. The other three
lines can compare a self-reported model against the model their own roster
resolved the rung to, and catch a caller that reports wrongly. This line holds no
roster, so it has nothing to compare the self-report against. THE RECORD IS
COMPLETE AND THE CROSS-CHECK IS GONE.

THAT IS A REAL COST AND IT IS SMALLER THAN THE ONE THIS FILE CLAIMED. A
self-reported field with no independent check is exactly what
`req-every-call-records-the-model-that-answered-it` asks be MARKED as
self-reported, and that requirement's own note says the mark comes off only when
the value arrives from whatever performed the spawn — which is outside every one
of the four lines.

WHAT THIS LINE CANNOT DO is compute an over-driving rate against a number it can
VERIFY.

THAT SEAM IS THIS LINE'S AND NOT THE OPTION'S, corrected 2026-08-20. This
sentence used to say the seam is one
`opt-name-the-acceptable-over-driving-rate-in-advance` "already admits". IT
ADMITS THE OPPOSITE, in capitals: "THIS ONE NEEDS NO SIGNAL AT ALL. A stated
target makes the drift visible as a gap between intention and the rating
distribution, which is computable from the ratings alone the day they are
written."

SO THE OPTION IS FINE AND THIS LINE IS THE ONE WITH THE GAP. The target is
computable here as it is anywhere; what cannot be computed here is the OTHER
side, because nothing of ours learns which model the rung resolved to. This
line's most-quoted admission of its own weakness had been attributed to a source
that denies it.

THIS PARAGRAPH USED TO END "SO THE MUST IS SATISFIED HERE AS IT IS ELSEWHERE,
marked". A cold reader called that a bare assertion and was right: nothing in
this file or its picks said a mark was written anywhere. The mark is taken
explicitly further down, uniformly across all four lines, and this sentence no
longer claims it.

### Where the difficulty lives, which this line had not said

`req-the-complexity-value-is-read-live-and-never-pinned` was restated: keep a
step's complexity out of every record's demand ledger, so that a complexity
changing reopens no standing claim.

THIS LINE DECLARES BY HAND ON THE CELL and never said what happens to that value
between the cell and the walker.

IT DOES NOT ENTER THE DEMAND LEDGER, and the reason is mechanical rather than a
promise. `demandsFor` at engine/iterations.ts:289 builds each demand from three
named things — an applies, an evidence and a shape — and `shapeOf` at :329
serialises four named keys. A complexity key on the cell reaches none of them, so
it is ignored by construction.

WHETHER IT RIDES THE COMPILED STATE IS LEFT OPEN ON PURPOSE, and that is now
legal where it was not. The restated requirement forbids the ledger and nothing
else. This line does not pick
`opt-the-complexity-rides-the-cell-the-compiled-state-already-carries`, so it
reads the cell when it sizes; picking it later would also satisfy the demand.

### Recording what the decision read — the one half this line already had

`req-a-machine-decision-repeats` demands the same decision for the same inputs
AND that the engine record what it read.

THIS LINE ALREADY PUBLISHES BOTH, and it is the only one that publishes the
input ALONGSIDE the decision as a matter of design rather than as a field added
at a gate. CORRECTED 2026-08-20: this sentence read "the only one of the four
that does", which a cold reader disputed — the reader line's input is the record
it writes back into, and the derived ladder's input can be printed for all
fifty-three rows before anything runs. THE NARROWER CLAIM IS THE TRUE ONE.

AND THE FILL BELOW IS THE SAME FILL THE OTHER THREE LINES TAKE. The three carry a
byte-identical block; this one is written differently because half of it was
already here, and saying "THIS FILL IS IDENTICAL ON ALL FOUR LINES" would have
been false in the one file where it had to be true.
Its own seams section: "THE TWO-PART DIFFICULTY AND THE RUNG NAME ARE REDUNDANT
ON PURPOSE. The pair says what the work is like; the rung says what we would
pick." The pair IS the input and the rung IS the decision, and both go out
together.

THE REDUNDANCY WAS ARGUED AS A COST — "two things to keep consistent" — and it
turns out to discharge a must. That is not a point in this line's favour at the
comparison, because a must is never scored.

THE RECORD CARRIES THE SAME PAIR beside the driver it named, on the same terms
the other three lines now take: one field on an option all four already pick.

### The self-reported mark, which no line contributes and none obstructs

`req-every-call-records-the-model-that-answered-it` ends "and marked as
self-reported wherever the lane cannot obtain the value independently", and its
Detail insists "THE MARK IS PART OF THE REQUIREMENT, not a caveat on it".

NO LINE ON THE CHART WRITES THAT MARK and no picked option mentions it. A cold
reader called the earlier sentence here — "SO THE MUST IS SATISFIED HERE AS IT IS
ELSEWHERE, marked" — a bare assertion, and it was one: nothing in this file or its
picks says a mark is written anywhere.

IT IS TAKEN NOW, uniformly across all four lines, contributed by none of them.

AND WHAT REMAINS TRUE AND SPECIFIC TO THIS LINE is the narrower thing the earlier
section got right: the other three hold a roster and can compare a self-report
against what their own mapping resolved. This line holds none, so the mark is all
it has. The record is complete and the cross-check is gone.

### A picked option this line contradicts, and how

`opt-publish-the-difficulty-and-let-consumers-choose-their-own-hand` says
"obtain-a-step-s-difficulty and reduce-a-milestone-to-one-difficulty stay". This
file says "Nothing reduces over a milestone, because nothing needs one number."

THE TWO PICKS COLLIDE AND THIS LINE RESOLVES TOWARD PER-STATE.
`opt-name-the-driver-per-state-not-per-milestone` is also on this line, and it
is the one that decides: with a unit of one there is nothing to reduce over, so
the reduction function is allocated and never called.

THAT ALLOCATION IS DELIBERATE AND IT IS RECORDED ON `el-sizing` under "One
function it implements and never calls". The conflict is shown rather than hidden
by leaving the function unallocated, and a cold reader finding it here is the
design working as intended rather than a defect.

### A rung is what this line calls the named driver, and that equivalence is stated here

TWO MUSTS SPEAK OF A DRIVER. `req-the-machine-names-a-driver-and-starts-nothing`
says "the lane shall publish the named driver on the pull".
`req-a-weaker-driver-than-named-owes-a-recorded-reason` speaks of a milestone
"walked by a driver weaker than the one it named".

THIS LINE NEVER NAMES A MODEL. It publishes a rung and a two-part difficulty, and
the record's named-driver field holds the rung.

SO THE VERDICTS ON BOTH MUSTS TURN ON WHETHER A RUNG COUNTS AS A NAMED DRIVER,
and a cold reader observed that the equivalence was asserted nowhere.

IT IS ASSERTED HERE AND IT RESTS ON THE RESTATED REGISTER RATHER THAN ON THIS
NODE'S PREFERENCE. `req-one-model-list-is-read-live-from-the-repository` was
restated to demand "the same statement of how strong a hand a step needs" and its
own note licenses "publishing a rung and holding nothing". A register that
blesses publishing a rung as the answer to how strong a hand is needed has
already made the rung the thing that is named.

WHAT THE EQUIVALENCE COSTS, said rather than hidden. A rung is a weaker name than
a model: it does not say what will run, only what class should. Everything
downstream that wants to compare named against actual is comparing a class
against an instance, and the mapping between them is outside our tree. THAT IS
THE MEASUREMENT SEAM this line already declares, restated in the vocabulary of
the musts.

## Why this one

IT STOPS ASSERTING THINGS WE CANNOT KNOW. A roster of models is a claim about
somebody else's fleet, and it ages every time a vendor ships.
raid-asm-one-model-list-serves-every-host-the-engine-supports and
raid-asm-the-model-ladder-is-a-total-order are both unproven and both become
unnecessary rather than merely weakened — nothing in our tree names a model, so
there is nothing to be wrong about.

THE STANDARD ALREADY SETTLED THE EDGE CASE. Verified at the primary,
docs.oasis-open.org/xacml/3.0, OASIS Standard 22 January 2013: an authorization
decision evaluates to Permit, Deny, Indeterminate or NotApplicable, and the last
two are kept apart on purpose — no policy matched is a different result from the
evaluation failing. Our unmatched case publishes an absence, which is
indistinguishable on the wire from a crash and from never having run.

THE TWO-PART DIFFICULTY IS WHAT MAKES THE PUBLICATION WORTH READING. How hard
the judgement is and how much has to be read are independent, and the corpus
holds both extremes — a finder state reads one method card and asks for deep
original judgement, a partition state reads forty-nine function nodes and
renders a table. One scalar tells a receiver both are `major` and lets it
choose wrongly with confidence.

## How it works

obtain-a-step-s-difficulty produces a judgement figure and a reading figure per
state. Nothing reduces over a milestone, because nothing needs one number.
resolve-a-difficulty-to-a-driver names a rung and stops; there is no roster.
publish-the-driver-outward publishes the pair and the rung, or the explicit
no-match value carrying the difficulty that found none.

A RECORD CARRYING NEITHER A NAMED DRIVER NOR A STATED REASON IS NOT A VALID
RECORD, which closes the silence in the design's only safety rule by making the
invalid case unrepresentable rather than merely checked.

## The seams, which is what this compose state is for

THE RUNG VOCABULARY IS THE INTERFACE, AND IT IS THE ONLY ONE. Everything this
candidate publishes crosses a boundary we do not control, so the vocabulary has
to be stable, documented and versioned in a way none of the other three need. The
seam is not a function call; it is a published contract, and changing it later
breaks a receiver we cannot see.

THE TWO-PART DIFFICULTY AND THE RUNG NAME ARE REDUNDANT ON PURPOSE. The pair says
what the work is like; the rung says what we would pick. A receiver that
disagrees with our rung can still use the pair, which is what makes the
publication worth reading to somebody whose fleet is not ours. That redundancy is
a cost — two things to keep consistent — and it is the price of not asserting a
roster.

THE NO-MATCH VALUE AND THE RECORD VALIDITY RULE CLOSE THE SAME HOLE FROM TWO
SIDES. NotApplicable makes the absence legible on the wire; a record carrying
neither a driver nor a reason being invalid makes it legible in the log. Taking
one without the other leaves the hole open in whichever place was not covered.

THE MEASUREMENT SEAM IS BROKEN AND THE CANDIDATE ADMITS IT. Naming an acceptable
over-driving rate needs somebody to report against it, and under this line
nothing of ours ever learns which model the rung resolved to.

## What it costs

THE BUILD COST IS THE SMALLEST OF THE THREE THAT TOUCH THE WALK and the adoption
cost is the largest. Publishing a pair and a rung is less code than resolving a
roster. What it needs instead is a party that reads the rung and acts.

THAT PARTY EXISTS, corrected 2026-08-20. This paragraph ended "the receiver
reads and cannot act", on the authority of a neighbour node that said so and was
wrong. The walking agent reads the rung and delegates the step to a stronger
hand. The adoption cost is real — somebody outside our tree still maps a rung to
a hand — but it is a mapping cost, not an absence of a party.

THE TWO-PART DIFFICULTY DOUBLES THE DECLARATION OR THE DERIVATION. Every one of
the 154 active cells probe 1 counted now carries two figures rather than one,
whichever way they are arrived at.

AND THE MAPPING ONTO A ONE-DIMENSIONAL LADDER NEEDS A RULE FOR THE CORNER where
the two axes disagree. raid-asm-the-model-ladder-is-a-total-order was already
unproven; this makes the disagreement explicit rather than creating it.

IT DOES NOT ANSWER THE QUESTION THE RECORD WAS OPENED FOR. Somebody still maps a
rung to a hand, and under this candidate that somebody is outside our tree.
CORRECTED 2026-08-20: this sentence used to end "unaudited and unreachable —
which is exactly what nbr-the-driver-that-performs-the-spawn says we cannot make
act anyway". Unreachable is false. In our own deployment the mapper is the
walking agent, which is as reachable as anything gets. Unaudited stays true, and
it is the narrower cost.

AND THE RUNG VOCABULARY BECOMES A PUBLIC INTERFACE. It has to be stable enough
for a receiver to implement against, which is a smaller version of the roster
problem rather than its absence.
