---
form: reopen-frontier
by: agent
signed_off: 2026-08-13T12:14:07.954Z
authors: agent
files:
---

# Evidence form / reopen-frontier

## current_situation

Re-recording i3 as minor moved the demands of eight standing steps. The reopen put a token on all eight, so the walk stood in M0's kickoff gate and M3's write-requirements at once — two steps on one sequential chain, which no legal marking holds. The owner saw it in the mirror.

## built

machine.ts, in `reopenStates`.

`inst.active = [...stateIds]` becomes a frontier filter: a reopened state gets a token only when no OTHER reopened state sits upstream of it.

    const frontier = stateIds.filter((id) => !stateIds.some((o) => o !== id && downstreamCone(m, [o]).has(id)));

WHY THE REST NEED NO TOKEN. The same reopen drops their inbound fuel, so they re-arm and fire again once their feeders sign. They are re-reached by walking, which is what walking is for.

A GENUINE FORK KEEPS EVERY TOKEN. The frontier of a real AND branch is several states, none downstream of another, and the filter leaves all of them.

ENFORCEMENT WAS NEVER WRONG — the input check refused each out-of-order arrival. What was wrong was the POSITION, which is what the mirror draws and what the pull offers.

Cases: tests/tokens.test.ts — four, covering one chain, argument order, a genuine fork, and the single-step case.

## follow_up

Nothing owed. A reopened step that is not the frontier still draws like a step never walked, which loses the fact that it was reopened. Noted for the retro rather than built.

## anything_else

