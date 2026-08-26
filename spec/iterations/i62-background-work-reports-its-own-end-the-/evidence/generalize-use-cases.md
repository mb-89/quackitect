---
form: generalize-use-cases
by: agent
signed_off: 2026-08-24T16:00:55.282Z
authors: agent
files: null
---

# Evidence form / generalize-use-cases

## current_situation

Three stories stand for the delta. Each generalises into one use case, and none of the three fits an existing use case's extension.

The two nearest standing use cases were read before authoring. Both were minted by i51 and both are about ASKING what is running. This delta's goals are about the record ENDING itself, which is a different goal and therefore a different use case.

No resident use case is rewritten. Each new one names what is deliberately outside it, so a later reader is not left guessing at the edge.

## use_cases

- uc-close-the-record-of-work-that-has-ended
- uc-bound-every-wait-and-act-on-expiry
- uc-hold-a-folder-against-a-second-engine

## follow_up

M3 derives the requirements from these steps and extensions.

Two extensions are the ones to watch there, because they carry the design's hardest choices.

- Extension 2b of uc-close-the-record-of-work-that-has-ended: a process that is alive and silent is left alone. That is the ruling that keeps the heartbeat from killing working runs.
- Extension 4b of the same use case: where a handle cannot be asked at all, the system says so rather than treating silence as death. That is the fallback if the load-bearing assumption fails its probe.

## anything_else

ONE THING THE ENGINE ALREADY DOES SHAPED THESE STEPS, and it is worth naming so M3 does not specify it twice.

Extension 4a of uc-close-the-record-of-work-that-has-ended is already built. deliverable/engine/run.ts line 1490 settles entries left by a previous instance, and the comment there gives the reason: it is safe because only one instance holds the port.

SO THE THIRD USE CASE IS LOAD-BEARING FOR THE FIRST. The existing reap already assumes one instance per port and nothing enforces it. That is why the second-engine story is a should rather than a could: it makes an assumption the code already relies on into something the code checks.
