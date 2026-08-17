---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: tsp-the-arrival-in-one-act
type: "[[test-spec]]"
statement: "A fresh clone with no lane becomes a caged agent on a live lane in one act, and a second act changes nothing — verified by demonstration on a real cloud box."
method: "demonstration"
demonstrates:
  - "sty-send-an-agent-to-a-cloud-box"
verifies:
  - "req-one-command-takes-a-fresh-clone-to-a-live-lane"
  - "req-arriving-twice-changes-nothing"
files:
  - "none — the procedure below is the definition; the observed run is the evidence"
---

## Scope

The whole arrival, on a machine that has genuinely just been handed a checkout.

WHY THIS CANNOT BE A TEST, and the reason is not squeamishness. The claim is
about a box in a state a fixture cannot be put in: no dependencies, one shallow
branch, no cage, no lane, and a runtime that may or may not satisfy the pin. A
fixture that arranged all of that would be arranging the answer.

THE IDEMPOTENT HALF IS THE SAME PROCEDURE RUN TWICE. It is folded in here rather
than given its own spec, because running it twice is one observation, not two.

## Procedure

1. Take a machine with a fresh clone of this repository and nothing else done to it.
2. Note the wall-clock time.
3. Run `node project/deliverable/engine/bin/se-arrive.ts` — or simply start a session, where the hook fires it.
4. Read the six step lines it prints. Every one names its step and what happened.
5. Run `node .se/se-call.mjs se_pull` and observe that the machine answers with an instruction.
6. Note the wall-clock time again.
7. Run the arrival a SECOND time. Observe that every step reports what it found, that the lane already answering is reused, and that no second lane appears.

## Pass lines

- Step 5 answers, and the agent did nothing between steps 3 and 5 but invoke them.
- The elapsed time between steps 2 and 6 is under one minute.
- Step 7 starts no second lane. `ps` shows one, and the port is the one the first run reported.

## What was observed on 2026-08-17

THE BEFORE, MEASURED BY DOING IT BY HAND: most of an hour. A runtime below the
pin, an install, a shallow clone with neither `main` nor `v2`, a cage, and a
hand-written JSON-RPC client.

THE AFTER IS NOT YET OBSERVED, and this spec is written saying so. By the time
the arrival existed, this box was no longer fresh: every step now reports
already-done, which demonstrates step 7 and cannot demonstrate step 6.

SO THE PASS LINE ON TIME IS OWED, and the next cloud run owes it. The
second-run pass line was observed here, twice.
