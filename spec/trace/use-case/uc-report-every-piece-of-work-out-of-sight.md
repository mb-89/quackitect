---
minted_in: i51
id: uc-report-every-piece-of-work-out-of-sight
type: "[[use-case]]"
statement: Learn what work this session started is still running, and how much longer each piece needs.
actor: stk-agent
trigger: the walker wants to know whether work it started has finished
precondition: none
guarantee: every piece of work this session started is in the answer, each entry says whether it is running and how much longer it needs, and every figure names the measurement it came from
refines:
  - sty-ask-once-what-is-still-running
priority: must
---

## Main scenario

1. The walker asks what work is running.
2. The system collects every piece of work this session started, whatever kind it is.
3. For each running piece, the system computes how much longer it needs from what that piece has already done against what it has left.
4. The system answers with one list, each entry naming the kind of work, whether it is running, how much longer, and what the figure was computed from.
5. The walker does other work for roughly that long.
6. The walker asks again, and the figures have moved.

## Extensions

- 2a. Nothing is running. The answer is an empty list, which is a complete answer and not an absence.
- 2b. A piece of work finished since the last ask. It appears with its verdict rather than disappearing, so a walker that missed the moment still learns the outcome.
- 3a. The piece cannot say what it has left. The entry says it cannot estimate, and never names a figure.
- 3b. Nothing on this machine has ever run this kind of work before, so there is no measurement to compute against. Same as 3a.
- 3c. The measurement exists and is known to be unreliable. The entry names it anyway, because naming the basis is what lets a reader discount it.
- 4a. The list is long enough to risk the caller's own answer limit. The answer is bounded and says so, with a way to read the rest.
- 6a. The figure did not move between two asks. That is a fact about the work, and the entry says which measurement is not advancing rather than repeating a stale number silently.

## What is deliberately outside it

Work started by another session, or by another copy of this project, is not in
the answer. There is no shared store and none is added.

A process this system did not start is invisible here. The two things this
system knows about are the work it spawned itself.
