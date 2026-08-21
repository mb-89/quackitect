---
minted_in: i51
id: sty-ask-once-what-is-still-running
type: "[[story]]"
statement: When I have started work that runs out of sight, I want one call that lists all of it with how much longer each piece needs, so I can wait that long instead of polling every few seconds.
actor: stk-agent
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

THE PROBLEM. Work running out of sight can only be asked about one handle at a
time, and the answer names a rate rather than a time remaining. So the only
strategy left is polling.
|||
TWO TABLES HOLD THE WORK AND NO VERB READS BOTH. `jobList` covers spawned shell
work and answers `se_run {jobs: true}` at deliverable/engine/tools-run.ts line
44. `testVerdicts` covers test runs and is read one handle at a time at line
144.

---

THE STARTING STATE. The agent has started a battery and a shell command. It
holds two handles and no list.
|||
THE REFUSAL FOR AN UNKNOWN TEST JOB POINTS AT THE WRONG LIST. `JOB_UNKNOWN`
hands back `{tool: "se_run", args: {jobs: true}}` at tools-run.ts line 152.
Following that remedy lists shell jobs, which by construction cannot hold the
test job the caller asked about.

---

STEP ONE. The agent asks what is running. Today: it asks about one handle, then
the other, and gets two answers of different shapes. After: one call, one list,
both kinds of work in it.
|||
EMPTY UNTIL M8.

---

STEP TWO. The agent reads how much longer. Today: the battery's handoff note
says what the LAST battery took, computed at start by `batteryPace` at
tools-run.ts line 31. Asking again a minute later returns the same sentence.
After: each entry names a time remaining against this run's own progress.
|||
EMPTY UNTIL M8.

---

STEP THREE. The agent checks where that figure came from. Today: there is no
figure to check. After: the entry names its basis, and an entry with no basis
says it cannot estimate rather than naming a number.
|||
EMPTY UNTIL M8.

---

STEP FOUR. The agent works for roughly that long, then asks again. Today: it
polls. After: it asks once, and the answer has moved.
|||
EMPTY UNTIL M8.

---

THE RESULT. One question answers for everything out of sight, and the answer is
actionable without being believed further than it deserves.
|||
EMPTY UNTIL M8.
