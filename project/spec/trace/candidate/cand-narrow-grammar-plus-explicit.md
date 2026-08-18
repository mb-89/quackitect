---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: cand-narrow-grammar-plus-explicit
type: "[[candidate]]"
name: "Narrow grammar plus explicit"
statement: "narrowest scope on both rows: the probed regex grammar, and the judge-a-claim-shaped explicit review with no auto-classification"
picks:
  - "[[opt-closed-regex-grammar-for-filter-expressions]]"
  - "[[opt-explicit-disposition-on-every-candidate]]"
---

## Why this one

The narrowest-scope point in the shortlist on both rows at once: the
probed regex grammar rather than a general expression parser, and explicit
review rather than any auto-classification. It exists to show what the
smallest defensible build looks like when both rows independently choose
the minimum-scope option, not the cheapest overall (that is
cand-continue-v1s-shape) but the most conservative about what gets built.

## How it works

answer-a-structured-query matches each filter clause against one closed
regex (`field OP "value"` or `field OP false`, per this session's own
probe and its follow-up check against all 25 harvested files), refusing
anything the regex does not match — no general boolean expression parser.
rank-candidate-couplings is unchanged. record-a-coupling-disposition
surfaces every ranked candidate to a person and requires an explicit
verdict on each one, the judge-a-claim shape, with no threshold and no
auto-classified band. The unchanged baseline stays untouched; both chosen
options are the narrowest-scope member of their row.

## What it costs

Smallest parser surface of any candidate (one regex per operator, not a
grammar), plus the same per-candidate review cost as cand-explicit-and-safe.
Worst case on the query side: a filter shape the regex does not cover
refuses outright rather than degrading, which is a correctness feature but
means any future query need reopens this code rather than falling through.
Failure mode that decides: same as cand-explicit-and-safe on the disposition
side — review load scales with candidate volume, unbounded.

## What it leans on

That the harvested subset's operator set (`==`, `!=` against strings and
booleans, confirmed this session) stays the whole of what queries need —
the same open question opt-closed-regex-grammar-for-filter-expressions
already names. That candidate volume stays reviewable by hand, the same
assumption cand-explicit-and-safe rests on.
