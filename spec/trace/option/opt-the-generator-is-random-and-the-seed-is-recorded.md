---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-the-generator-is-random-and-the-seed-is-recorded
type: "[[option]]"
cluster: cluster-the-benchmark-run
question: how a run decides which iteration to walk
found_by: prior-art
statement: Work is drawn at random and the draw is written down, so the same run can be reproduced exactly without a second mechanism for fixed cases.
source: ref-agent-benchmark-harnesses-2026 — property-based testing and fuzzer corpora; RECALLED rather than fetched
---

## What it buys

Random and fixed stop being two features. One lever does both.

## How it lands here

Reduced to its smallest useful form. The only randomness left is WHICH archived
iteration a run draws when none is named, and flow-chosen-iteration carries the
seed so the draw repeats.

## Mechanism

A pseudo-random generator produces the work from a seed. The seed is written into the result. Re-running with a stored seed reproduces the draw exactly; running without one draws fresh and records what it drew.
