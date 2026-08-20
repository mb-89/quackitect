---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-the-size-of-a-run-is-part-of-the-result-s-name
type: "[[option]]"
cluster: cluster-the-benchmark-run
question: how a result carries the conditions it was taken under
found_by: prior-art
statement: "A measurement is never quoted without the scale it was taken at, so a reader cannot compare two numbers that were never comparable."
source: "ref-agent-benchmark-harnesses-2026 \u2014 TPC-H scale factors; https://www.tpc.org/tpch/ fetched 2026-08-19"
---

## What it buys

It makes an incomparable comparison impossible to state by accident.

## How it lands here

The change-size column is the scale factor and already exists. A benchmark
report carries it, and req-a-benchmark-report-carries-the-conditions-of-its-run
refuses a report without it.

## Mechanism

The scale is an input to the run and a field on the result. A reader cannot obtain a number without also obtaining the scale it was taken at, because they are written together.
