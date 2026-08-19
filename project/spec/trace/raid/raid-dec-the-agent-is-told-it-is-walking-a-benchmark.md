---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-dec-the-agent-is-told-it-is-walking-a-benchmark
type: "[[raid]]"
kind: decision
statement: "A benchmark run is never disguised as real work. The agent is told, and the claim the result makes is narrowed to match."
owner: the owner
trigger: "the first time a benchmark number is quoted as production behaviour rather than as process overhead"
status: decided
impact: "An agent that knows its output is discarded works differently from one that does not, so the number understates. It is a floor rather than an estimate. Blinding would fix the transfer and would require the machine to lie to the agent it governs."
breaks_how_badly: crippling
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - "owner ruling 2026-08-19: open, not blind"
  - "i37 find_analogy: blinding domains show the honest alternative is to state what an unblinded measurement supports"
  - "ref-agent-benchmark-harnesses-2026"
---

## What it settles

Whether the instrument deceives its subject. It does not.

## What the narrowing costs

The result describes PROCESS OVERHEAD and never production behaviour. That
limit is written into the report rather than left to be discovered.

## Why the paired delta survives it

The same bias sits on both sides of a pair, so a comparison between two machine
versions is unaffected by a bias that is constant across them.
