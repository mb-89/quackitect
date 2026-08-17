---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: sty-the-slow-call-that-says-it-is-working
type: "[[story]]"
statement: When something I asked for takes longer than a second, I want it to say it is working and roughly where it is, so I can decide whether to wait rather than watch a still screen.
actor: stk-engineer-driving-agents
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

THE PROBLEM. A surface that takes thirty seconds and a surface that has hung
look identical, so the person spends the wait deciding whether to keep waiting
instead of doing anything useful.
|||

---

THE STARTING STATE. The walk stands mid-iteration. The person asks the machine
to move. Measured on 2026-08-17: 184 of 730 pulls took more than five seconds
and 15 took more than thirty, with nothing on screen distinguishing any of them
from a stall.
|||

---

STEP ONE. The person triggers the slow thing. Today: the surface holds still.
After: within the first second it says what is running, without taking the
screen over.
|||

---

STEP TWO. The wait continues past a few seconds. Today: still nothing, and the
person reaches for the log to find out whether the machine is alive. After: the
signal shows movement, so the question does not arise.
|||

---

STEP THREE. The wait runs long enough to be a decision. After: the person can
tell from the surface alone whether waiting is sensible, and nothing they see
is a faithful completion percentage that discourages them out of a wait worth
finishing.
|||

---

THE RESULT. A slow thing is honest about being slow and the person is never
guessing whether it is working. The wait is still a wait, and it stops being a
question.
|||
