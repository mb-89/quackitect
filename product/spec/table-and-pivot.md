---
id: table-and-pivot
statement: The queryable table whose pivot is the design structure matrix, and whether regions can propose sub-machines.
---

# The table, its pivot, and sub-machine regions

## 1. The answer

Three of the four claims hold, and the table and pivot are built and passing
tests. Connections live in the notes. A Bases-format `.base` file queries them
into a table. The design structure matrix is that same renderer with two
grouping keys. The fourth claim did not survive: filtering does not make a
sparse pivot dense. Filtering the rigor graph by milestone lifts density from
2.32% to 16.91% and drops twelve of fifty-eight edges. Coarsening an axis is
what makes a pivot dense. Sub-machine regions collapse to a degree check here.

## 2. The table spec

### The spec is the `.base` file, not a new grammar

A markdown table grammar was proposed during research and did not survive. The
proposal was a `## Columns` heading parsed by the existing panel parser, in the
style of `product/deliverable/machines/panels/controls.md`.

The argument against it is its own argument. The owner already writes a table
spec, in `.base` files, and Obsidian already renders them. A second grammar
creates the duplication it was meant to prevent. The engine reads the owner's
format instead.

`product/deliverable/engine/tables.ts` states the rule at line 6: "The format is
the owner's, not ours; we render it."

### What is already built, measured 2026-08-01

- `product/deliverable/engine/tables.ts` — 479 lines. It reads `.base` and
  renders `type: table` and `type: pivot`.
- `product/deliverable/tests/tables.test.ts` — 184 lines, 20 tests, all passing.
- `product/deliverable/engine/render.ts` — imports the table widget at line 25.
  It mounts it as a mirror card at line 2600.
- Three `.base` files ship. They are the rigor matrix, the voice matrix, and
  `depends.base`, which is the dependency matrix as a pivot.

All three files are untracked in git today. They are working-tree drafts, not
committed work.

### What the renderer knows, and what it refuses

The implemented subset is deliberately narrow. Anything outside it throws a
typed refusal naming the offending construct. A query language that ignores a
clause it does not understand returns a table that looks complete and is wrong.

- Top level: `properties` and `views`.
- A property carries `displayName`, which becomes the column heading.
- A view carries `type`, `name`, `order`, `sort` and `filters`.
- A filter is `and`, `or`, `not`, `prop == "value"`, `prop != "value"`, or a
  bare `prop` meaning "carries something".
- `file.name`, `file.path`, `file.folder` and `file.ext` are synthesised per
  note. These are the same fields Obsidian synthesises.

Everything else refuses. There are no formulas, no summaries and no `groupBy`.
None of the shipped views use them.

### The rigor matrix already renders

`product/deliverable/machines/rigor_matrix/matrix.base` declares fourteen
properties and five table views. All five draw. The first view returns all fifty
rigor rows through the engine, verified by test today. Nothing needs writing for
the rigor matrix. It needs only to be looked at.

### A worked example: the states as a table

This file does not exist yet. It is written out in full because it is the
smallest thing that proves the format generalises past the matrix it was written
for. Every part of it was run against the real vault before it was written down.

Save as `product/deliverable/machines/states/states.base`.

```yaml
# THE STATES OF THE MAIN MACHINE, as a list rather than a drawing.
#
# The canvas says how the states connect. This says what they ARE. Both read
# the same fourteen notes in machines/states, so neither can go stale against
# the other — there is one copy of the data and it is the notes.
#
# A note is a state when it carries a `state` key. That bare-property filter
# is the whole selection rule; nothing tags a note for this file's benefit.

properties:
  file.name:
    displayName: State
  state_kind:
    displayName: Kind
  priority:
    displayName: Priority
  legal_tools:
    displayName: Legal tools

views:
  # Every state, in name order. The plain reference view.
  - type: table
    name: The states
    filters:
      and:
        - state
    order:
      - file.name
      - state_kind
      - priority
      - legal_tools
    sort:
      - property: file.name
        direction: ASC

  # What kind of state gets what tool freedom. Three kinds against seven tool
  # sets, naming the states rather than counting them — the form you want when
  # a cell surprises you and you need to know which ones.
  - type: pivot
    name: Kind against tool freedom
    filters:
      and:
        - state
    rows: state_kind
    columns: legal_tools
    aggregate: list
    value: file.name
```

Measured against the real vault: the table returns 14 rows, and the pivot is
3 by 7 with 9 of 21 cells filled, 42.9% dense.

## 3. The pivot

### The parameters it has today

- `rows` — the property whose values become row labels.
- `columns` — the property whose values become column labels.
- `aggregate` — `count` or `list`. Anything else refuses.
- `value` — which property `list` lists. Required when the aggregate is `list`.
- `filters`, `name` and `type` are inherited from the table view.

A list-valued property spreads across its elements. That is the whole mechanism
that makes the matrix possible. Pivoting the notes by their own name against
their own `depends_on` list IS the dependency matrix. There is no second data
model, no export step, and no way for the picture to disagree with the notes.

A row whose dimension value is missing goes into an em-dash bucket that sorts
last. It is never dropped. Losing rows to a blank field is the same silent wrong
answer the filters refuse.

### The three parameters it does not have

Four mature implementations were compared.

- `pandas.pivot_table` in Python.
- PostgreSQL's `crosstab`.
- arquero's `pivot` in JavaScript.
- PivotTable.js.

Between them the minimum useful pivot has nine parameters. Three of the missing
ones matter here.

- **The column universe.** PostgreSQL's two-argument `crosstab` takes a separate
  query producing the column list. Its documentation says why: with columns
  inferred from surviving rows, "some groups might not have data for some of the
  categories, [and] that doesn't work well". Our pivot infers columns from the
  data. So the matrix silently changes width whenever the filter changes.
- **The missing-cell fill.** `pandas` has `fill_value`. `crosstab` fills with
  null. Ours renders an empty cell, which is right for a matrix and wrong for a
  count table where zero is a number.
- **Shared axis ordering.** No mainstream pivot offers what a design structure
  matrix needs, which is the same explicit order on both axes. All of them
  default to alphabetical. So does ours.

arquero handles the first two as a separate composable verb rather than as pivot
parameters. Its `impute(values, {expand})` materialises the full cross product
of declared values before the pivot runs. That shape is better than adding two
arguments: declare the domain, impute, then pivot.

### What goes in the cell when the cell is an edge

The honest answer is existence, a count, or a list of names. Nothing richer,
because nothing richer exists in the data.

Two populations carry edges, and they differ.

The **canvas machines** compile an edge to exactly three fields. They are `to`,
`role`, and an optional `guard`. Measured on the compiled main machine: 19
edges, of which 11 are `normal` and 8 are `alternative`, with zero guards.
Across the whole repository five of the six declared roles are live. Only
`error` is never used.

An earlier survey reported that guards are never used anywhere. That did not
survive. The compiled iteration machines all carry `verification_attempts < 3`
on the fallback edge out of `fix-findings`, and a test asserts it.

The **rigor rows** carry `depends_on` as a flat list of strings. There is no
per-edge attribute of any kind. No guard, no role and no priority hangs off a
dependency. So a cell over that data can hold whether the dependency exists, how
many there are, or which ones. Anything else is a frontmatter change first,
turning `depends_on` into a list of maps. That decision has not been made.

The literature has a name for the choice. Browning's review separates a BINARY
design structure matrix, whose off-diagonal cell carries only a mark, from a
NUMERICAL one, whose cell carries a value or weight. Today our data supports
only the binary form. The citation:

- Author: Tyson R. Browning.
- Venue: IEEE Transactions on Engineering Management.
- Volume 48, number 3, pages 292-306, 2001.
- Status: bibliography confirmed; the taxonomy wording is second-hand.

### The defect this found: the shipped matrix has no diagonal

`depends.base` declares `rows: file.name` and `columns: depends_on`. Those are
two different vocabularies. A row label is `M0_10_onboard-retro`. A column label
is `onboard-retro`.

Measured: **zero** of the 50 row labels appear among the 49 column labels. The
matrix renders, the counts are right, and the diagonal is meaningless. No row
and column ever name the same step.

The fix is one line. Change `rows: file.name` to `rows: name`. Measured after
that change: 48 of the labels are shared, and the matrix has a real diagonal.

That fix exposes the second half of the problem. The renderer sorts both axes
alphabetically. Measured on the rigor graph:

- Alphabetical order: 31 of 58 marks fall ABOVE the diagonal, 27 below.
- Authored file-name order: 0 above, 58 below.

The rigor graph is acyclic. It has no feedback loops at all. Alphabetical
ordering invents thirty-one of them.

The authored file names are already a topological order, sequenced by hand when
the files were named. A design structure matrix in that order is perfectly
triangular, which is the entire analytical payoff of drawing one. So the pivot
needs a declared axis order before the matrix means anything. That is the
highest-value change on this page.

## 4. Does filtering really fix sparsity

### No. Measured, not argued.

The claim under test is "a pivot over a filtered population is dense by
construction, so no sparse mode is needed". It is false on this repository's own
data, along this repository's own natural filter.

The rigor dependency graph has 50 steps and 58 dependencies, 2.32% dense. The
most natural filter is by milestone, of which there are ten. Filtering rows and
columns to one milestone gives:

| Milestone | Steps | Edges inside | Density | Edges dropped |
| --- | --- | --- | --- | --- |
| M0 | 2 | 1 | 25.00% | 0 |
| M1 | 7 | 8 | 16.33% | 1 |
| M2 | 5 | 4 | 16.00% | 3 |
| M3 | 4 | 4 | 25.00% | 1 |
| M4 | 6 | 5 | 13.89% | 2 |
| M5 | 6 | 6 | 16.67% | 1 |
| M6 | 4 | 3 | 18.75% | 1 |
| M7 | 7 | 6 | 12.24% | 1 |
| M8 | 4 | 5 | 31.25% | 1 |
| M9 | 5 | 4 | 16.00% | 1 |
| **All ten** | 50 | 46 | **16.91%** | **12** |

Filtering buys a factor of seven. The best single milestone is still 69% empty.
The worst is 88% empty. Twelve of the fifty-eight edges vanish, which is 21% of
the whole dependency structure. They are exactly the hand-offs between
milestones, which is the part a reader most needs.

Filtering along a classification axis is worse still. Filtering the rigor rows
to `state_kind == "gate"` produces a completely empty matrix. Every gate edge
runs between kinds rather than within one.

The mechanism is arithmetic. A pivot over an adjacency relation takes an INDUCED
SUBGRAPH. For mean out-degree `d` over `n` rows the density is `d/n`. The rigor
graph's mean out-degree is 1.16, so reaching 50% density needs `n` of two or
fewer. Filtering only shrinks `n`. Induced density rises only when the filter
happens to select a community, and a classification facet is orthogonal to
community structure.

### What does work: coarsening an axis

Aggregation, not filtering, is what produces a dense matrix. Three shipped views
show it directly. Measured today from the engine:

- `What each step waits for` — 50 by 49, 59 cells filled, **2.4%**.
- `Kind against the patch column` — 3 by 3, 6 cells filled, **66.7%**.
- `Which steps, by kind and minor` — 3 by 4, 8 cells filled, **66.7%**.

Same notes, same filter, same renderer. The difference is entirely the choice of
grouping key.

Aggregating the dependency graph to milestone grain gives a 10 by 10 matrix with
19 filled cells. Ten sit on the diagonal, nine on the first superdiagonal, and
none anywhere else. That is a perfect two-wide band at 100% occupancy. It is
the most readable matrix this repository can produce. It is also a summary,
because the cells hold counts and you cannot click through to a dependency.

### The practical rule

- Use a filter to make a matrix SMALLER, and say how many edges it dropped.
- Use a coarser grouping key to make a matrix DENSER.
- Use an explicit axis order to make a matrix MEAN something.

The caption already reports size and fill. It should also report dropped edges.
A matrix that quietly loses a fifth of its data is worse than one that is mostly
empty.

## 5. Regions and sub-machines

### The decomposition is real, unique and linear

Single-entry single-exit region decomposition is a solved problem with a primary
citation, and the claim holds in full. The citation:

- Authors: Richard Johnson, David Pearson and Keshav Pingali.
- Title: "The Program Structure Tree: Computing Control Regions in Linear Time".
- Venue: PLDI 1994, pages 171-185.
- DOI: 10.1145/178243.178258.
- Status: the paper's PDF was read. Venue, pages and DOI come from dblp, because
  the author preprint carries no venue header.

The four properties, one by one.

- **Real.** Definition 3 defines a region as an ordered edge pair. The first
  edge dominates the second. The second post-dominates the first. Every cycle
  containing one contains the other.
- **Unique.** Definition 5 picks the canonical regions by a minimality
  condition. Theorem 1 proves any two canonical regions are disjoint or nested,
  which is what makes them a tree. Every predicate is purely graph-theoretic.
  There is no tie to break and no seed to pick.
- **Linear.** Section 3.5 states the algorithm runs in O(E) time.
- **No preconditions you would expect.** It needs neither acyclicity nor
  reducibility. The abstract says "arbitrary control flow graphs (including
  irreducible ones)". What it does need is one start with no predecessors, one
  end with no successors, and every node on a path between them.

The algorithm makes arbitrary choices internally. Figure 4 line 7 picks "any
child". Theorem 6 proves those choices cannot reach the answer. That matters for
a derived view: run it twice, get the same regions.

### One correction: there are two decompositions, not one

The 1994 program structure tree bounds regions by EDGES. A later refined process
structure tree bounds them by NODES. It is strictly finer, and separately proven
unique and modular. The citation:

- Authors: Jussi Vanhatalo, Hagen Völzer and Jana Koehler.
- Title: "The Refined Process Structure Tree".
- Conference version: BPM 2008, pages 100-115. DOI 10.1007/978-3-540-85758-7_10.
- Journal version: Data & Knowledge Engineering 68(9):793-818, 2009. DOI
  10.1016/j.datak.2009.02.015.
- Status: bibliography confirmed from dblp. The paper itself could not be read.
  ScienceDirect returned 403 and the other venues are paywalled.

What was read instead is US Patent 8,786,602 B2. It was filed by IBM in 2008
with three of the four authors as inventors. It states the node-bounded
definition in the authors' own words, along with four properties:

- Uniqueness, and that no two canonical fragments overlap.
- Modularity, meaning a local change has only a local effect.
- Determinism, meaning identical graphs parse identically.
- Linear time in the number of edges.

A patent is not the paper. Treat this as strong corroboration, not as the
source.

The phrase "one input and one output" is the node-flavoured one, which is the
2009 variant. That matters because the node variant SPLITS a hub. Its
normalisation step cuts every node with more than one incoming and more than one
outgoing edge, and `idle` has nine of each. Which flavour is meant should be
written down. Nothing in the repository records it.

### What it finds on our machines

Measured on the compiled main machine: 10 canonical regions, of which 9 are
single states. The regions are `{boot}`, the whole nine-state strongly connected
component around `idle`, and one region per satellite state.

Measured on the rigor dependency graph: 42 canonical regions, of which 38 are
single nodes. The four that are not have 12, 9, 5 and 4 nodes. They do not match
the milestone numbering. They span M1 with M2, and M3 with M4, plus part of M5
and part of M8. Four milestones get nothing, and only 30 of 50 nodes are
covered.

### The part that did not survive

On every graph in this repository, the set of single-node canonical regions is
EXACTLY the set of nodes with in-degree 1 and out-degree 1. The sets are
identical, with no exceptions, on four graphs:

- The compiled main machine.
- `boot`.
- `ideation`.
- The rigor dependency graph.

The reason is elementary. A one-node region needs exactly one entry edge and
exactly one exit edge.

Every declared sub-machine compiles to ONE state in its parent. Measured on the
main machine today: six sub-machines are declared, and all six have in-degree 1
and out-degree 1.

So the proposed lint — "every declared sub-machine must be a canonical
single-entry single-exit region of the compiled parent" — is two lines of
arithmetic on degrees. It does not need the paper.

As a discovery mechanism it fails the other way. It reports that all nine
non-terminal states of the main machine are regions, when six were chosen. It
reports 38 one-node regions on the rigor graph. A view that says "every step is
a sub-machine" has told the reader nothing.

### What is true instead

Regions cannot propose sub-machines on graphs this shape. What they can do is
CHECK a proposal, and the check is cheap and exact.

The useful version already has results. For any candidate region, count the
edges entering from outside and leaving to outside. Exactly one of each means
the region is a legal sub-machine. Measured over the ten rigor milestones:

- M5, M6, M7 and M8 each score exactly one in and one out. They are clean
  sub-machines as authored.
- M0 scores one in and zero out. M9 scores zero in and one out. Those are the
  ends of the chain.
- M1 through M4 spill between two and four edges. They are not sub-machines.

The four clean ones are bounded by gates:

- `rank-unknowns` into `gate-architecture`.
- `author-tests` into `gate-prototype`.
- `fill-story-evidence` into `gate-implementation`.
- `finalize-docs` into `gate-validation`.

An earlier pass reported that no milestone is a clean sub-machine. That did not
survive.

That result is worth more than the decomposition. It says the one-input
one-output rule is already a property of the authored data, in the place where
the data is largest.

### If it is ever built anyway

Do not implement the cycle-equivalence test by enumerating cycles. It is
exponential. On a chain of binary branch points the count doubles per branch,
reaching 262,144 cycles and 2.6 seconds at 56 nodes.

Use the cut-pair test instead. Add an edge from end to start. Drop edge
directions. Then test whether deleting both edges raises the connected-component
count. That is O(E) per pair, and it agreed exactly with cycle enumeration on
every cyclic graph here.

There is no JavaScript or TypeScript implementation to port. The npm registry
returns nothing for "rpst". GitHub code search returns nothing in TypeScript.
The only full node-bounded implementation is jBPT, which is LGPL-3.0. The
permissive ones sit inside V8 and LLVM in C++, and neither is liftable.

LLVM's own header carries the warning that applies here: "if you do not need the
RegionInfo, but dominance information could be sufficient please base your work
only on the dominator tree".

## 6. The first step

Fix the dependency matrix's axes. Three changes, one file each, useful alone.

1. In `product/deliverable/machines/rigor_matrix/depends.base`, change
   `rows: file.name` to `rows: name`. The matrix gains a diagonal. Measured: 48
   shared labels instead of 0.
2. In `product/deliverable/engine/tables.ts`, add an optional `order` to a pivot
   view naming the axis sequence, defaulting to the current alphabetical sort.
   Then order the dependency matrix by file name. Measured: 58 marks below the
   diagonal and 0 above, instead of 27 and 31.
3. Add the dropped-edge count to the pivot caption, beside the size and fill it
   already reports.

That is a few dozen lines against a renderer that already works. It turns a
matrix that reads as thirty-one feedback loops into one that reads as a clean
sequence. Nothing else on this page is worth doing first.

Two one-line fixes belong in the same pass. `voice_matrix/matrix.base` line 39
lists `- COMMENT` where the property is lowercase `comment`, so that column
renders empty. And `machines/panels/controls.md` documents three parameter types
where the renderer knows five.

## 7. What this does not solve

**Editable cells.** There is no frontmatter writer anywhere in the engine. A
search across all engine files finds one hit, and it is the parser assigning its
own result. No POST route writes a note. Both matrix files justify their flat
scalar cells by inline editing, so the data shape was chosen for an affordance
that does not exist. Building it needs a YAML writer that preserves comments and
key order in files the owner hand-edits.

**Readability.** Nothing here was rendered and looked at. Whether a 50 by 49
matrix is easier to read than a node-link drawing of the same 58 edges is
untested. The nearest evidence is Ghoniem, Fekete and Castagliola in
Information Visualization 4(2):114-135, 2005. They found matrices win above
roughly twenty vertices and lose at path-following. Their sparsest condition is
far denser than ours, so it may not transfer.

**The main machine as a matrix.** Eighteen of its nineteen edges lie in one row
and one column of `idle`. A matrix of a star is 121 blank cells framing a cross.
It has twelve states and is walked as a path, so it fails both halves of the
evidence above. It should stay a drawing.

**Performance.** Nothing was timed. The mirror morphs its cards in place, and a
table cell carries neither an id nor a distinguishing tag name. So a large table
may repaint whole on every poll. This is unmeasured, and it is a real risk for a
polling pane.

**Which population the matrix is over.** The 50 rigor steps and the 12 machine
states are different questions. Both are expressible as views. Neither has been
chosen as the one that matters.

**Whether the Obsidian preview still matters.** Obsidian's Bases ships four view
types — table, cards, list and map — and groups by exactly one property. So
`type: pivot` is ours alone, and Obsidian cannot open it. That is deliberate and
recorded in `depends.base`. It does mean the matrix is engine-only, and the cost
of losing preview parity has not been priced. Both checks of Obsidian's
capabilities came from its documentation, not from a running application.

**The compiled iteration machines are not acyclic.** The rigor rows form a clean
directed acyclic graph. The machine compiled from them does not. The fallback
edge out of `fix-findings` induces a recovery edge back, making a two-cycle in
every column. A topological axis order exists for the data and not for the
walked machine. Nothing here measured what that one edge does to the matrix.
