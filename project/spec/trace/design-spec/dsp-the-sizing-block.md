---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: dsp-the-sizing-block
type: "[[design-spec]]"
statement: how a compiled step becomes a two-part difficulty, a rung and a published statement — declared on the cell, read off the step, and never resolved to a model
realizes:
  - el-sizing
  - if-engine-delta-to-sizing
  - if-method-compiler-to-sizing
files:
  - project/deliverable/engine/sizing.ts
  - project/deliverable/engine/rigor-matrix.ts
  - project/deliverable/engine/pull.ts
---

## Where a difficulty is declared

ON THE CELL, BY HAND, PER CHANGE-SIZE COLUMN. A matrix row already carries one
key per column holding its `applies` value — `major: full`, `patch: none`.
The difficulty is a second value on the same cell, so the pair lives where the
judgement about that row in that column already lives.

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
