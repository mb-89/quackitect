---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-reliability-is-reported-over-repeated-trials-not-one
type: "[[option]]"
found_by: prior-art
statement: "A single run is treated as a draw rather than a measurement, and what is reported is the behaviour across several trials."
source: "ref-agent-benchmark-harnesses-2026 \u2014 tau-bench pass^k; https://arxiv.org/abs/2406.12045 fetched 2026-08-19, agents at pass^8 under 25% against single-trial under 50%"
---

## What it buys

It stops a lucky run being read as an improvement.

## How it lands here, in an altered form

The owner ruled that runs CYCLE rather than repeat, so the repetition is across
iterations rather than within one. The sample is a cycle and the unit is the
paired delta, which buys the same protection while covering more shapes of
work.
