---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-dec-the-agent-is-told-it-is-walking-a-benchmark
type: "[[raid]]"
kind: decision
statement: A benchmark run is never disguised as real work. The agent is told, and the claim the result makes is narrowed to match.
owner: the owner
trigger: the first time a benchmark number is quoted as production behaviour rather than as process overhead
status: decided
impact: An agent that knows its output is discarded works differently from one that does not, so the number understates. It is a floor rather than an estimate. Blinding would fix the transfer and would require the machine to lie to the agent it governs.
breaks_how_badly: crippling
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - req-the-benchmark-history-is-unreadable-while-a-run-is-bound
  - "owner ruling 2026-08-19: open, not blind"
  - "i37 find_analogy: blinding domains show the honest alternative is to state what an unblinded measurement supports"
  - ref-agent-benchmark-harnesses-2026
---

## What it settles

Whether the instrument deceives its subject. It does not.

## What the narrowing costs

The result describes PROCESS OVERHEAD and never production behaviour. That
limit is written into the report rather than left to be discovered.

## Why the paired delta survives it

The same bias sits on both sides of a pair, so a comparison between two machine
versions is unaffected by a bias that is constant across them.

## Rejected options

- BLIND THE AGENT, dressing the run as ordinary work. Rejected by the owner: it buys transferability and costs the honesty rules the whole system runs on.
- SAY NOTHING EITHER WAY. Rejected: silence is blinding without the courage to call it that, and it makes the bias unmeasurable.

## Consequences

- Every benchmark report states that it measures process overhead and not production behaviour.
- The number is a FLOOR rather than an estimate.
- A paired delta between two machine versions stays valid, because the same bias sits on both sides of the pair.
