---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: cand-relational-plus-ensemble
type: "[[candidate]]"
name: Relational plus ensemble
statement: "heaviest build: a real relational store, two independent rankers required to agree before a candidate surfaces"
picks:
  - "[[opt-embedded-relational-store-with-sql]]"
  - "[[opt-ensemble-ranking-agreement-required]]"
---

## Why this one

The heaviest point in the shortlist, drawn deliberately so the chart spans
from cheapest to most expensive. It exists to make the true cost of a
second source of truth and a two-ranker pipeline visible and comparable
against the four lighter candidates, not because it is expected to win.

## How it works

answer-a-structured-query loads nodes, edges, states and notes into an
embedded relational store on corpus change and answers every query as a
parameterised SELECT over real tables, joined on flow edges. This is a
second copy of data the markdown corpus already holds, kept in sync by
whatever refresh mechanism rebuilds it. rank-candidate-couplings feeds two
independently-built rankers (different scores, different features) over the
same candidate pool; record-a-coupling-disposition only ever sees a
candidate both rankers agreed was plausible. The unchanged baseline
(markdown files as the source of truth, the walk) stays; the relational
store is a derived cache of it, never authoritative.

## What it costs

Largest build in the set: an embedded relational engine, a schema mapped
from four node kinds and their edges, a refresh/sync path, and a second
ranking implementation with its own feature set. Worst-case number that
decides viability: the refresh cost on every corpus write, unmeasured, and
growing with corpus size in a way the file-stat cache candidate does not.
Failure mode that decides: the relational store drifts from the markdown
truth if any write path bypasses the refresh step — a second source of
truth is safe only as long as it never becomes the first.

## What it leans on

That the refresh mechanism can be made reliably synchronous with every
lane write — not designed or tested. That building and maintaining two
independent rankers is worth the precision gain over one — the actual
precision/recall tradeoff is unmeasured, the same gap
opt-ensemble-ranking-agreement-required's own Mechanism section already
names.
