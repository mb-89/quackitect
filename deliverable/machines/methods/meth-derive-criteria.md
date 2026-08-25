---
kind: method
statement: "Deriving the decision criteria: the criteria list is never typed. It falls out of frontmatter on the requirements, and the weights fall out of pairwise judgments."
---

## Situation

Guidance for M4 derive-criteria. This is the one card the step draws from.

AN AGENT MAY WRITE THE ORDER DIRECTLY. The pairwise
feed exists because a person cannot hold twenty rows in their head at once. An
agent can, and walking pairs to reach an order it already holds is a tax rather
than a method.

EVERY POSITION STILL CARRIES ITS REASON. What is dropped is the pairwise WALK,
never the argument behind each place. An order with no reasons is a preference
wearing a method's clothes.

The step runs after gate-requirements and before any candidate exists. That
order is deliberate. Weights fixed before the options are known cannot be
tuned to make a favourite win.

## THE CRITERIA ARE NEVER TYPED

Nobody writes a criteria list. Nobody invents a weight.

The list is a VIEW over the requirement register, the same way the RAID
register is a view over its nodes. You edit frontmatter until the right list
falls out.

This is the [[node-table]] shape, and probe-assumptions already runs it.
The rows are nodes. The columns are frontmatter
keys. Typing in a cell writes that key on that node, and editing the note
shows in the form. There is no second copy to drift.

A criterion that exists only in the evidence document is a defect. So is a
weight nobody can recompute.

## THE TWO SOURCES

The pool comes from two places, and only two.

- The requirement register.
- The RAID register.

THERE IS NO THIRD. A stakeholder tension is a risk and lives in the register
already ([[meth-stakeholder-tensions]]). v1 modelled tensions as their own
node kind and minted zero across 27 iterations. Do not go looking for a
tensions table.

## A REGISTER ENTRY IS NOT A CRITERION

The pool is requirements. The register feeds it by POINTING, never by
standing in it.

An entry names requirements in `source_refs`. A requirement several open
entries lean on is one that matters, and that count seeds the ordering.

WHY IT CANNOT BE A ROW. A risk is a claim about what might happen; a
requirement is a demand on the system. Asking which of those matters more has
no answer, because they are not the same kind of quantity.

THIS WAS BUILT WRONG ONCE, and the card it produced is the argument. It put
"no vendor ships adjudication provenance" beside "the record arrives
prefilled" and asked which mattered more. Nobody can answer that.

A CLOSED ENTRY PULLS NOTHING. A concern somebody ruled away cannot make a
requirement matter more, and offering it again wastes the one thing this
method is trying to save.

## THE THREE-WAY SPLIT, FROM MoSCoW ALONE

The demand-versus-wish split is already on every requirement. It needs no new
field.

- `must` — a DEMAND, never a criterion.
  - It gates every candidate pass or fail at gate-candidates.
- `should` — a WISH that is scored. This is the criterion pool.
- `could` — a WISH that is recorded and not scored.
  - It joins the pool only by carrying a comparison.
  - Writing that comparison IS the promotion.

Pahl/Beitz calls this selection before evaluation. Selection asks one
question: are all demands met. Evaluation ranks the survivors.

MIXING THE TWO IS THE FIRST RULE BREIING/KNOSALA FORBIDS. A knock-out scored
as a soft axis lets a candidate buy its way past a hard demand.

## THE TWO KEYS

Two frontmatter keys carry everything the table needs. Both live on the pool
node, whether that node is a requirement or a register entry.

### `weighs_with`

The id this shares an axis with, and why, on one line.

```
weighs_with: req-every-call-logged — both measure whether the lane can be bypassed
```

Two rows that measure the same underlying thing are ONE criterion. Scoring both
counts that thing twice, and that is the co-movement defect. Naming the
partner compounds them, and the group renders as a single axis.

THIS IS THE PRUNING MECHANISM, AND THERE IS NO SECOND ONE. It is how a
register of forty wishes reaches the vital few.

The reason rides in the same line on purpose. A merge nobody justified is a
merge nobody can argue with.

### `weighs_against`

The pairwise judgments. One entry per pair, each an id and an operator.

```
weighs_against:
  - req-lane-is-the-only-door >
  - req-every-call-logged =
```

Read `>` as "this row matters more than that one". Read `=` as "these two
matter the same". The reciprocal is implied and CHECKED — if two rows each
claim `>` over the other, the engine names the contradiction.

SILENCE IS NOT EQUALITY. An unjudged pair is unanswered, and the state does
not stand while one is open. Equality is a claim and it is written.

## `=` AND `weighs_with` ARE NOT THE SAME THING

They are easy to confuse, and the difference decides how many columns the
score table has.

- `A = B` — TWO axes that matter the same. Both get scored, and both appear.
- `A weighs_with B` — ONE axis. Scored once, appearing once.

Equal weight is a judgment about importance. Compounding is a judgment about
what is being measured. A pair can be either, both, or neither.

## THIS STATE PRODUCES THE POOL, NOT THE ORDER

Owner ruling 2026-08-09, and it moves a job.

What settles here is WHICH rows are criteria and which of them compound into
one axis. That is the pool.

THE ORDER IS NOT SETTLED HERE. Whatever sequence the pool comes out in is an
enumeration, not an importance claim, and reading it as one is exactly how a
response-time requirement ended up above the foundations of the system.

THE IMPORTANCE ORDER IS COMPUTED AT cut-criteria, mechanically, from
`breaks_how_badly` — see [[meth-damage-scale]]. It runs there because the
non-differentiating axes are gone by then, so the sort covers only rows that
survive.

THE BLIND GUARD SURVIVES THE MOVE. The sort key is authored at M3, on the
requirement, before any candidate exists. Late sorting on an early key is not
the same as late weighting.

CUTTING TO THE VITAL FEW belongs to cut-criteria too, and it wants the
computed order to cut from.

ELEVEN IS THE REFERENCE, NOT THE RULE. Above it is
right where the extra rows earn it. Fifty is not a cut.

WHAT IT COSTS IS A RANGE, NEVER ONE NUMBER. Ordering n items never costs
n(n-1)/2, because transitivity settles most pairs for free.

IT DOES NOT COST n-1 EITHER, except when the answers happen to chain.

| items to order | best case | unordered input |
| --- | --- | --- |
| 11 | 10 | 26 |
| 120 | 119 | 660 |
| 150 | 149 | 873 |

WHY THE BEST CASE IS NOT THE PROMISE. Four items have 24 possible orderings,
and three yes-or-no answers distinguish at most 8 outcomes. So three answers
cannot always pick one ordering out of 24, whatever order you ask in.

The two-question version of the same thing: 1 beats 2, then 3 beats 2. Both
answers point AT 2 rather than through it, so 1 against 3 is still unknown and
transitivity says nothing.

## SEED THE WALK, AND THE BEST CASE STOPS BEING LUCK

A chain is what you get when the items arrive already in order. That is worth
engineering rather than hoping for.

THE WALK IS THREE RULES, and together they reach n-1 on a good hint.

1. SORT THE POOL BY THE HINT, most important first.
2. PROBE EACH NEW ITEM AGAINST THE CURRENT BOTTOM OF THE CHAIN.
3. ON A MISS, BINARY-SEARCH the chain for its slot.

WHY THE BOTTOM AND NOT THE MIDDLE. A chain grows at its ends. If the next item
really is the least important so far, one comparison against the bottom says
so and the chain is one longer.

A MIDDLE PLACEMENT CANNOT COST ONE QUESTION. Landing an item between two
neighbours needs two comparisons — below the upper, above the lower. Only an
end placement needs one.

WHY THE HINT ORDER MAKES EVERY ITEM AN END ITEM. Taken most-important-first,
every item you pick up is PREDICTED to be the new bottom. So the bottom probe
is exactly the question most likely to be confirmed, every time.

A HINT NEED NOT BE RIGHT. A wrong one costs one question, never a wrong
answer. The person still decides every comparison.

## THE PROBE PAYS FOR ITSELF, OR THE ENGINE DROPS IT

A probe that misses is a question spent learning almost nothing, so the walk
measures its own hint rather than trusting it.

- Track the probe's hit rate as the pass runs.
- While it hits, keep probing the bottom.
- When it stops hitting, drop the probe and search directly.

No configuration, and no guess about hint quality before seeing it work.

TWO HINTS ALREADY EXIST on the nodes, and neither needs authoring.

- `priority`. A `should` row outranks a `could` row often enough to sort by.
- The inbound register count. A requirement several RAID entries lean on is
  rarely unimportant.

So the first pass lands nearer 149 than 873, and that difference is the whole
question of whether anybody finishes it.

UNSETTLED: how to schedule the rows the hint cannot separate at all, where a
dozen share `could` and no inbound reference. Ordering those among themselves
is a small blind sort, and whether it is cheaper first or last is not argued
out yet.

## THE REMAINING COUNT IS AN ESTIMATE, AND IT MAY RISE

It is the items left times the cost per item observed so far. A run of misses
raises the observed cost, so the number goes up.

SHOW IT RISING RATHER THAN HIDE IT. A counter that only falls would be lying
about a walk whose cost depends on answers nobody has given yet.

## THE STEADY STATE IS INCREMENTAL, AND THAT IS WHAT MAKES THIS VIABLE

A later iteration re-ranks nothing. It inserts its new rows into the standing
order, and every old pair stays settled.

Adding 50 rows to a standing 150 costs about 375 questions. Ranking the
resulting 200 from scratch would cost about 1245.

So the cost of an iteration follows what that iteration ADDED, never the size
of the register.

THE ORDER IS A STANDING ARTIFACT for exactly this reason. It outlives the
iteration that built it, and a later record extends it instead of replacing
it.

## THE ORDER IS COMPUTED, THE WEIGHT COMES FROM THE BAND

Two steps, carrying two different kinds of judgment.

THE ORDER falls out of the comparisons.

- A `>` scores 1 for the winner and 0 for the loser.
- An `=` scores 0.5 for both.
- Rank by the sums.

THE WEIGHT COMES FROM THE BAND A ROW LANDS IN, never from its rank position.
Members of one band weigh the same as each other. The gap between bands is
what the boundary asserted.

WHY NOT STRAIGHT FROM RANK. Where the engine infers a pair rather than asking
it, that pair's contribution is fixed by the ordering it came from. The win
counts then follow rank position, so a weight read off them is linear in rank
whatever the judgments were. That is an ordering wearing a measurement's
clothes.

WHY THE BOUNDARY IS THE HONEST PLACE FOR MAGNITUDE. Drawing a line says
everything above it matters materially more than everything below. That is a
cardinal claim, and it costs two or three decisions in total rather than one
per pair.

A BAND VALUE IS TYPED, AND THAT IS SAFE HERE. It moves every member of the
band at once, so it cannot be nudged toward one favourite without dragging
that row's neighbours along. Three levels usually suffice.

A BAND PARTITIONS AND NEVER REORDERS. Ordering belongs to the comparison
pass, and two mechanisms touching one order would fight.

## A NUDGE IS A COMPARISON

Moving a row up the ranking is not its own kind of edit. It is written as a
comparison, and the engine re-sorts.

Two sources of truth for one order is the defect that went out with the typed
weight, and it does not come back through a drag handle.

THIS IS WHERE CYCLES COME BACK. A pair settled by transitivity is never
asked, so a contradiction cannot surface there. A nudge that disagrees with an
earlier answer surfaces it, and the engine names which answer it disagrees
with.

## THE BAND IS DRAWN ONCE, AT cut-criteria

The boundary is drawn there, with the candidates in hand and the
non-differentiators already struck.

ONE DRAWING IS ENOUGH BECAUSE THE ORDER UNDER IT IS COMPUTED. A boundary takes
a prefix of a mechanical sort. It cannot promote a favourite's axis past the
rows above it, because nothing at cut-criteria types the order — only a
recorded move can change it, and a move carries its reason.

So the gameable surface is one number: how deep the cut goes. That is visible,
and a gate reads it in a glance.

THE PER-ROW OVERRIDE IS THE PART TO WATCH. Moving one row across the boundary
out of rank order does jump the blind ordering, and it is the one edit that
can be aimed at a favourite. It carries its reason, and the gate reads it
apart from a boundary move.

## THE BAND WRITES BACK, TO ITS OWN FIELD

`criterion_band` on the node, written by the engine when the boundary lands.

NOT `priority`. That field is MoSCoW, authored at
M3, and it answers a different question: demand or wish. The band answers how
much a wish matters, and it is learned at M4. One field holding both means one
of them goes stale.

NOT `band` either. The DSM operations already use that word for something else
entirely ([[meth-dsm-banding]]), and one name across two unrelated mechanisms
is how a reader lands in the wrong card.

THREE THINGS THE ENGINE READS OFF THE MATRIX, and each is a finding rather
than an error.

- A CYCLE — A beats B, B beats C, C beats A.
  - The judgments are inconsistent, and at least one is wrong.
- A ZERO WEIGHT — a row that lost every pair.
  - Either it does not belong in the pool, or the judgments were careless.
- AN UNJUDGED PAIR — named, one line each.
  - The state stays grey until somebody answers it.

## THE THREE CUTS, AND WHERE EACH ONE CAN RUN

Two run here. The third runs elsewhere, and NOTHING WALKS BACK.

- DROP DUPLICATES — runs here.
  - Two rows sharing a `characteristic` and refining the same use case are suspects.
  - The engine flags them, and the answer is `weighs_with` or a reason.
- COMPOUND RELATED AXES — runs here, through `weighs_with`.
- DROP WHAT DOES NOT DISCRIMINATE — runs at cut-criteria, its own state.
  - It needs the candidates, and none exist yet.
  - It runs BEFORE any score is written, and that is the whole point.

THE WALK GOES FORWARD ONLY. Nothing reopens, because the cut never touches a
weight. It removes an axis from the score table and leaves every surviving
weight exactly where this state put it.

WHY THE CUT IS ITS OWN STATE. Doing it inside
evaluate-set would mean cutting with the totals already visible. That is the
same poisoning the weights-first order exists to prevent, arriving one step
later. The house already rules that composing and evaluating never share a
state; cutting and evaluating do not either.

THE CUT IS MADE ON STRUCTURE, NEVER ON SCORES. An axis every candidate meets
identically BY CONSTRUCTION can go. An axis they merely look similar on
cannot, because the resemblance is a guess and cutting on it can move the
ranking.

## WHAT THE ENGINE DECIDES, AND HOW TO CHANGE ITS MIND

This step drops things. A dropped criterion is a criterion nothing gets scored
on, so every drop is a decision, and none of them may be invisible.

EVERY DECISION BELOW READS ONE NAMED FIELD. Change the field and the decision
changes. Nothing here is a heuristic you cannot reach.

| the engine decides | it reads | to change it |
| --- | --- | --- |
| who is in the pool | the node's kind | requirement and raid nodes are in, and nothing else is |
| which rows are read-only | `priority` | a `must` row is a demand and never scored — change the priority to score it |
| which pairs are compounding suspects | `characteristic` and `refines` | two rows sharing a characteristic, or refining one use case, are offered as a merge |
| which pairs it never asks | your own earlier answers | answer an implied pair anyway to overrule the inference |
| every weight | `weighs_against` | change a judgment |

NO ROW IS DROPPED SILENTLY. Every row the engine excluded from scoring is
listed with the field that excluded it, next to the criteria table. A merge it
suggested and you accepted is listed too, with your reason.

SUGGESTING A MERGE IS NOT MAKING ONE. The suspect flag is an offer. Only
`weighs_with` compounds anything, and only a person or an agent writes that.

THE INFERENCE IS THE ONE PLACE TO WATCH. A pair settled by transitivity was
never asked, so a contradiction in your judgments cannot surface there. Re-ask
a sample of implied pairs and compare. A mismatch means an earlier answer was
wrong, and it names which.

## WHAT THE STATE STANDS ON

The state is green exactly while all of these hold.

- Every pair is settled, asked or inferred.
- No pair contradicts its reciprocal.
- No cycle stands among the pairs that were asked.
- Every `weighs_with` carries its reason.
- Every surviving axis holds a rank.

A NEW REQUIREMENT TURNS THE STATE GREY. That is correct, and it is what a
standing artifact means. The pool grew, so a pair went unjudged, so the claim
the state made stopped being true.

## WHAT CANNOT BE DERIVED

Three things, and saying so plainly is part of the method.

- THE PAIR JUDGMENT — somebody decides that this matters more than that.
  - No metadata produces it.
  - What the design buys is a judgment that is small and named and arguable, instead of a number nobody can attack.
- THE COMPOUNDING REASON — why two rows measure the same thing is a sentence.

The named external comparison a 4 or a 5 needs is NOT this state's business.
It belongs where the scoring happens ([[meth-scoring-anchors]]), because no
candidate exists here to compare anything against.

Everything else falls out.

## WHY PAIRS AND NOT A NUMBER

A weight typed straight onto a row is the shape decision theater takes. It
can be tuned until the intended winner wins, and the tuning leaves no trace.

A pairwise judgment cannot be tuned quietly. Lifting one criterion means
flipping several named pairs, and every flip is a recorded claim somebody can
argue with. The sensitivity run gets the same benefit: perturbing one
judgment is a real question, where perturbing an invented number is not.

## PRIOR ART, AND WHAT WAS TAKEN FROM IT

The walk-the-pairs editor is not new. Every serious implementation solves the
same problem the same way, and the scaling objection is the standard one in
the incomplete-comparison literature.

- ASK ONLY THE UNIMPLIED PAIR. 1000minds generates the most informative pair
  next. Prioneer asks only what a unique ranking needs.
  - Taken whole. It is the difference between 660 questions and 7,140.
- MERGE-INSERTION AS THE WALK. Preference Revealer uses Ford-Johnson, which
  sits near the log2(n!) floor.
  - Taken as the target, not as a required algorithm. Any walk near the floor
    will do.
- BANDS OVER A RANKING. The SyA estimation deck's own direct comparison places
  the extremes first and positions the rest between them.
  - Taken, and it is why three levels usually suffice.
- HUMAN COMPARISONS ARE NOISY. Monte Carlo Sort exists because people
  contradict themselves.
  - Taken as the spot check. Re-ask a sample of inferred pairs, because
    inference cannot surface a contradiction it never asked about.

WHAT WAS NOT TAKEN: a 1-9 magnitude scale on every card, as classical AHP
asks. The band boundary carries the same information for two decisions rather
than hundreds.

Links live in the note that recorded the search, `note-a3b10e1d75dd`.

## Sources

- Pahl & Beitz, Konstruktionslehre Sect 6.2.3.3 — demands versus wishes, and
  selection before evaluation.
- Pahl & Beitz Sect 6.4 — the Breiing/Knosala rules for criteria, and the
  preference matrix that derives the weights.
- The SyA corpus at @ai/sya_kb chapter 01, Rate and Decide — the eight-step
  decision model, whose step 2 demands parameter independence.
- [[meth-eight-step-decision]] — steps 1 to 3 are this card's territory.
- [[meth-scoring-anchors]] — the 0-5 scale, and the named-comparison rule.
- v1's i0016 at ref main — seven criteria weighted from requirements, and a
  red-team that caught co-moving axes carrying 0.30 on one assumption.
