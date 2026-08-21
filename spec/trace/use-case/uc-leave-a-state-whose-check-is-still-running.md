---
minted_in: i51
id: uc-leave-a-state-whose-check-is-still-running
type: "[[use-case]]"
statement: Leave a state whose leaving condition runs a program, without the call that starts it waiting for it to end.
actor: stk-agent
trigger: the walk attempts to leave a state that declares a leaving script
precondition: the walk stands in that state and the state's other conditions are met
guarantee: the call answers inside its own budget, the program's verdict is recorded against the state when it lands, and the walk moves only on a verdict that passed
refines:
  - sty-the-step-that-hands-the-walk-back
priority: must
---

## Main scenario

1. The walker asks to leave the state.
2. The system starts the leaving program and records that a verdict is owed against this state.
3. The system answers at once, saying the check is running and naming how to read it.
4. The walker does other work, or asks what is still running.
5. The program ends and the system records its verdict against the state.
6. The walker asks to leave again.
7. The system reads the recorded verdict and moves the walk, or refuses with what the program found.

## Extensions

- 1a. A verdict is already owed against this state and the program is still running. The system joins the running one rather than starting a second, and answers as at step 3.
- 1b. A verdict is already recorded and it passed. The system moves the walk without running anything.
- 1c. A verdict is already recorded and it failed. The system refuses with what the program found, and the walker fixes it before asking again.
- 2a. The state declares no leaving program. Nothing is started and the walk moves as it always did.
- 5a. The program is killed for running past its bound. The recorded verdict says it was killed, which is a different answer from a failure it reported itself.
- 5b. The program cannot be started at all. The verdict records that, and it is a refusal rather than a pending state.
- 6a. The walker asks to leave before the verdict lands. The system answers as at step 3, and the answer is the same shape as the first one.
- 7a. Something the verdict depended on moved while it was running. The verdict is stale, and the system runs the program again rather than trusting it.

## Why the deferred verdict is the whole point

A caller whose limit is set outside this system cannot be asked to wait. The
harness decides how long it waits for a call, and this system cannot read that
number or detect that it expired.

So the answer at step 3 is not a courtesy. It is the only shape that keeps the
call inside a bound somebody else owns.
