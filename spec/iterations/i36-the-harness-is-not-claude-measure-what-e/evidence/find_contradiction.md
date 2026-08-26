---
form: find_contradiction
by: agent
signed_off: 2026-08-19T11:19:16.411Z
authors: agent
files: null
---

# Evidence form / find_contradiction

## current_situation

Prior art and benchmarking are recorded. This is finder 3 of 7 (contradiction/TRIZ), run over the same touched clusters.

## applies

yes

## contradictions

| cluster | contradiction | improving | degrading | separation |
| --- | --- | --- | --- | --- |
| cluster-the-walk (route-a-failure-shape) | routing every non-misuse failure toward durable work floods the register with one row per occurrence | thoroughness | attention/signal | IN LEVEL — judge at the shape, not the occurrence |
| cluster-the-walk (hold-the-session-through-work) | blocking every stop to protect unfinished work also blocks a host's legitimate request to end the session | reliability (no premature stop) | responsiveness to a real stop | IN LEVEL — block at the session level while yielding at the call level; the hook clears once the machine reports wait, a blocker, or a completed target |
| cluster-the-walk (name-the-stopping-layer) | naming the exact stopping layer on every interrupted call needs instrumentation across every layer, which slows the common case | diagnostic certainty | speed/simplicity of the common path | IN TIME — diagnose lazily, only once a call has already ended abnormally, never on the happy path |
| cluster-the-walk / cluster-the-arrival (serve-a-step, oversized results) | serving the whole result inline is most complete, but the largest results exceed every host's inline limit | completeness | payload size at the boundary | IN TIME — serve a bounded first page now, the remainder later through a lane-owned cursor, already the accepted design |

## options

- opt-classify-failure-shape-by-refusal-clause-not-occurrence

## follow_up

The remaining finders (analogy, without/trimming, heuristic, transform/SCAMPER, probing) run next.

## anything_else

