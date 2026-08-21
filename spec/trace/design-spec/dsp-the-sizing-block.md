---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: dsp-the-sizing-block
type: "[[design-spec]]"
statement: how a compiled step becomes a two-part difficulty, a rung and a published statement — declared on the cell, read off the step, and never resolved to a model
realizes:
  - el-sizing
  - if-engine-delta-to-sizing
  - if-method-compiler-to-sizing
  - if-sizing-to-walk-engine
files:
  - deliverable/engine/sizing.ts
  - deliverable/engine/rigor-matrix.ts
  - deliverable/engine/machine.ts
  - deliverable/engine/session.ts
---

## Where a difficulty is declared

ON THE CELL, BY HAND, PER CHANGE-SIZE COLUMN, AS ONE SCALAR. A matrix row
already carries one key per column holding its `applies` value — `major: full`,
`patch: none` — and a `<column>_note` beside it. The difficulty is a third key
in the same shape: `major_complexity: C3/R1`.

IT IS A SCALAR AND NOT A NESTED MAP, corrected 2026-08-20. This spec first said
a `complexity:` block keyed by column, each holding two figures. The loader's
own comment says why that cannot work: "Both are scalars, because a Bases table
edits a cell inline and cannot edit a nested map." A shape the surface cannot
edit puts the rating out of reach of the person who does the rating.

THE TWO FIGURES RIDE ONE STRING, `<judgement>/<reading>`, and an unreadable one
refuses naming both vocabularies. That keeps the pair together where a reader
looks, at the cost of a parse the nested shape would not have needed.

IT IS PER COLUMN AND NOT PER ROW, and this was measured rather than assumed.
`draft-vision` spans three rungs across its columns and not monotonically: it
sits low at `major`, where the agent accepts a standing artifact, and high at
`product`, where it frames one from nothing. One value per row cannot say that.
`req-every-matrix-row-declares-its-complexity` demands a value per column in
which the row applies, and this is why.

A COLUMN WHERE THE ROW DOES NOT APPLY OWES NOTHING. `applies: none` means the
row is not walked there, so there is no work to size. The loader refuses a
MISSING difficulty only where `applies` is one of `full`, `tailored` or
`inherit`.

AND THE LOAD-TIME REFUSAL IS OFF UNTIL THE MATRIX SAYS IT IS RATED. Turning it
on before the 154 active cells carry values would make the product unloadable,
and rating them is the matrix owner's judgement rather than this build's.

SO A MISSING RATING REFUSES AT THE POINT OF USE INSTEAD, and nothing ever
proceeds without one — `difficultyOf` throws for a step that has none. The
requirement's demand is that the engine never proceed without a complexity, and
that holds either way.

THE SEAM IS ONE LINE IN THE MATRIX FOLDER'S OWN README, and the check reads the
file rather than a flag in code. Saying "every active cell carries a complexity"
and MAKING it binding is then one act rather than two that can disagree.

A PLACEHOLDER ROW THAT SEEDS A SUB-MACHINE CARRIES NO DIFFICULTY OF ITS OWN, and
this is `exp-two-hands-rating-the-same-six-cells`'s promotion. Two independent
readers agreed on five of six sampled cells and disagreed on exactly one —
`M7_40 build-steps` — and both named it their least-sure for the same reason:
the row is a placeholder for work that happens elsewhere. Three such rows exist.
The loader refuses a difficulty on a row carrying `seeds`, and the rating
attaches to the states the sub-machine seeds.

## The two figures, and why one scalar was not enough

A DIFFICULTY IS A PAIR: how hard the JUDGEMENT is, and how much has to be READ.
`raid-dec-difficulty-is-two-figures-and-is-named-per-state`.

THE CORPUS HOLDS BOTH EXTREMES, which is the argument. A finder state reads one
method card and asks for deep original judgement. A partition state reads
forty-nine function nodes and renders a table. One scalar calls both `major`
and lets whoever reads it choose wrongly with confidence.

THE PAIR IS THE INPUT AND THE RUNG IS THE DECISION, and both are published. That
redundancy was argued as a cost — two things to keep consistent — and it is what
discharges `req-a-machine-decision-repeats`'s second half: the engine records
what it read. A consumer that disagrees with our rung can still use the pair.

## The corner where the two figures disagree

A PAIR IS TWO ORDINAL FIGURES AND A RUNG IS ONE POSITION, so the mapping needs a
rule for the corner. `cand-whoever-holds-the-hands-decides` named this cost on
its own face: the mapping onto a one-dimensional ladder needs a rule where the
two axes disagree, and `raid-asm-the-model-ladder-is-a-total-order` was already
unproven.

THE RULE IS THE HIGHER POSITION. A step whose judgement is easy and whose reading
is enormous gets the hand the reading demands, and the other way round. Under-
driving produces a plausible wrong answer that passes; over-driving costs money.
The asymmetry is the same one `req-a-weaker-driver-than-named-owes-a-recorded-reason`
already encodes, and this rule is that ruling applied one level down.

THE PAIR STILL GOES OUT BESIDE THE RUNG, which is what makes the rule
correctable. A consumer that reads a rung of `author` and a pair saying the
judgement is trivial can see that the reading drove it, and choose otherwise.
That is the redundancy this design paid two-things-to-keep-consistent for.

A PAIR THE LADDER CANNOT PLACE AT ALL is the no-match value and not this rule's
business. The rule maps positions that exist; a figure outside the vocabulary
returns `NotApplicable` carrying the pair.

## Where a difficulty is read

OFF THE STEP IN HAND, NEVER OFF THE MATRIX. The compiled machine carries the
cell's values onto each state at compile time, and the sizing block reads the
step. That is why `el-sizing` has two inbound interfaces and no lookup path
into the corpus: `if-method-compiler-to-sizing` and
`if-engine-delta-to-sizing` both hand it a compiled machine.

SO `obtain-a-step-s-difficulty` IS A FIELD READ AND NOT A JOIN. A join would
make the answer depend on the matrix as it stands NOW rather than on the machine
the walk is running, and a rating edited mid-walk would change what a running
record is being sized against.

## Where a difficulty must never go

NOT INTO A DEMAND LEDGER. `req-the-complexity-value-is-read-live-and-never-pinned`
keeps it out of every record's demands, so that changing a rating reopens no
standing claim.

TODAY THAT HOLDS BY CONSTRUCTION AND THE BUILD MUST NOT BREAK IT.
`demandsFor` builds each demand from three named things — an applies, an
evidence and a shape — and `shapeOf` serialises four named keys. A difficulty
on the cell reaches none of them, so it is ignored unless somebody adds it.

THE TEST IS ON THE DIGEST AND NOT ON THE CODE PATH, and
`tsp-a-complexity-never-enters-a-demand-ledger` says why: a test that reads the
implementation passes while the implementation says so, and a test that compares
digests across a rating change passes only while the behaviour holds.

## What is published, and what is not

A RUNG NAME AND THE PAIR IT CAME FROM. No model name, ever, and no roster in
this tree. `raid-dec-the-block-names-a-rung-and-never-a-model`. Resolving a
rung to a concrete hand belongs to whoever holds the hands, which in our own
deployment is the walking agent.

A NO-MATCH IS A RETURNED VALUE AND NOT A SILENCE.
`raid-dec-the-no-match-is-a-returned-value-not-a-silence`, verified at the
primary — OASIS XACML 3.0, OASIS Standard, 22 January 2013 — where
`NotApplicable` and `Indeterminate` are distinct returned results: no policy
matched is a different outcome from the evaluation failing. An absence on the
wire is indistinguishable from a crash and from never having run.

AND THE UNMATCHED VALUE CARRIES THE RUNG IT COULD NOT PLACE, so a reader can see
what was asked for. Falling back to the session's current hand is forbidden,
because a silent fallback is indistinguishable from a working lookup.

## Where the claimed files moved, 2026-08-20

THIS SPEC CLAIMED `engine/pull.ts` AND THE PUBLISHING DID NOT LAND THERE.
`pull.ts` scans and serves GUIDANCE documents; the pull's answer envelope is
assembled in `session.ts`. A planned name that survives the record unrealised
is what `trace-design` exists to catch, and this one was caught by it.

`engine/machine.ts` JOINS THE CLAIM because `StateDecl` is where the
difficulty rides. Carrying a value onto the compiled step is a change to what a
step IS, and that declaration is machine.ts's.

## Where it lands on the pull

BESIDE THE STATE AND THE TIER, on the answer the walk already returns. The pull
is the one call the agent makes, so the statement reaches a reader without a
second channel and without a protocol.

THE BLOCK STARTS NOTHING. `req-the-machine-names-a-driver-and-starts-nothing`.
The lane does not spawn, in the same way it does not push, does not open records
unasked and does not reach the screen. That division is the lane's grain and this
element sits inside it.

## What this design does not decide

WHETHER THE DIFFICULTY RIDES THE COMPILED STATE OR IS READ FROM THE CELL EACH
TIME. The restated requirement forbids the LEDGER and nothing else, and both
shapes satisfy it. The compiled-state route is what the interfaces above imply
and it is not written into the requirement.

HOW A RUNG MAPS TO A HAND. Outside this tree by design. What this block owes is
a vocabulary stable enough to implement against, which is the cost of not
asserting a roster.

## The return leg became a named crossing in i51

THIS SPEC ALWAYS DETAILED THE RETURN and nothing named it. The sized instruction
goes back to the walk engine, which is what hands it to the caller.

WHY IT ONLY BECAME A CROSSING NOW. The element matrix computes an owed cell where
a flow's producer and consumer sit in different elements. Nothing in the function
model CONSUMED `flow-instruction` inside this tree until i51 minted
`hand-back-a-step-still-deciding`, which does.

SO [[if-sizing-to-walk-engine]] IS DECLARED AND THIS SPEC REALIZES IT. The
exchange is as old as the element; only the node is new.

NOTHING ABOUT THE SIZING CHANGES. It still names a rung and never a model, it
still starts nothing, and a no-match is still a returned value rather than a
silence.
