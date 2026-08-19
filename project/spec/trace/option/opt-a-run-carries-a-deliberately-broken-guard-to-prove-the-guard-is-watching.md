---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-a-run-carries-a-deliberately-broken-guard-to-prove-the-guard-is-watching
type: "[[option]]"
found_by: transform
statement: "One request that must be refused is issued on purpose during every run, and a run whose forbidden request succeeded is discarded rather than reported."
source: "SCAMPER \u2014 Reverse, applied to the ceiling: instead of asking whether the guard held, make the run prove it by trying something that must fail"
---

## What it answers

The fatal risk. A ceiling that fails open produces a report that looks perfect,
and nothing in the report says whether the guard was ever exercised.

## Why reversing it works

A guard nobody tested is indistinguishable from a guard that is not there. A
run that deliberately asks for a commit past its rewind point and records the
refusal has PROVED the ceiling at the moment the measurement was taken, not in
a test written months earlier.

## The analogy behind it

It is the positive control from find_analogy, applied to the guard instead of
to a search.

## Mechanism

One forbidden request per run, its refusal recorded as a field on the report. A
missing or successful result invalidates the run.
