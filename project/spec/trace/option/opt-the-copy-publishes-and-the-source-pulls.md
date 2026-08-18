---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-copy-publishes-and-the-source-pulls
type: "[[option]]"
cluster: the-bootstrap
question: how a copy's own changes are represented
statement: the copy states what it changed as something a reader can take, and the source decides whether to adopt it, so the flow runs upward instead of downward
found_by: transform
source: "SCAMPER operator REVERSE, applied to the incumbent — invert the direction of the relationship between a copy and its source"
---

## Mechanism

EVERY OTHER OPTION ON THIS CELL RUNS DOWNWARD. The source produces something and
the copy receives it, and the whole design question is how the copy survives
that.

REVERSED, THE COPY IS THE PRODUCER. It publishes what it made its own, in a form
somebody upstream can read and act on. The source pulls what it wants and
ignores the rest.

THE OWNER ALREADY NAMED THIS SHAPE, and named the vehicle for it: "if I wanna
push something back, I do it via PR or, in our case, via a note. We are just
doing what everybody already does."

SO THE ARTIFACT IS A PROPOSAL RATHER THAN A PATCH. It says here is what I
changed and why, and it carries no expectation of being taken.

## What it buys

THE ISOLATION RULE IS SATISFIED BY CONSTRUCTION AND NOT BY CARE. The copy writes
nothing outside itself. Publishing is the copy producing an artifact in its own
tree, which somebody else may later read. No mechanism reaches anywhere.

AND IT NEEDS NO MERGE. The source reads a description and decides. There is no
three-way merge, no common ancestor, and no conflict, because nothing is being
applied anywhere automatically.

THAT MAKES IT THE ONLY OPTION HERE THAT WORKS FROM A NON-ANCESTOR. Two copies
with no shared history can still read each other's proposals. Every downward
mechanism needs lineage; this one needs a reader.

## What it costs

IT DOES NOT SOLVE THE PROBLEM THIS ITERATION OPENED. The owner's demand is that
a copy can PULL engine updates. This is the opposite direction, and it leaves
that demand entirely unmet.

SO IT IS A COMPLEMENT AND NEVER A SUBSTITUTE. On the chart it fills a cell
nothing else fills, and a candidate choosing only this has answered a different
question from the one asked.

AND IT COSTS A PERSON AT THE FAR END. A proposal nobody reads is a file. The
source has to have somewhere the proposals land and somebody whose job is to
look, which is exactly the cost a pull request carries in the ordinary case.

## What the transform revealed that the ordinary framing hid

THE DOWNWARD AND UPWARD PROBLEMS ARE NOT SYMMETRIC, and running the operator is
what made that visible.

DOWNWARD NEEDS A MERGE and therefore needs lineage, a baseline, and conflict
handling. UPWARD NEEDS A READER and therefore needs prose, a reason, and
attention.

THE SECOND IS MUCH CHEAPER TO BUILD AND MUCH HARDER TO SUSTAIN. That asymmetry
is worth carrying into record-adrs, because a design that builds both will spend
almost all its engineering on one and almost all its ongoing effort on the
other.
