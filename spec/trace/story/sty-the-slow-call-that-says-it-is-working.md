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
STILL TRUE, AND THIS ITERATION'S OWN WALK IS THE CLEAREST INSTANCE ON FILE. Six pulls timed out entirely on the hop into a gate, because that hop's exit script fires the full battery — about a minute of real work behind a single call, with nothing on screen to say so. The record that wrote this story failed it while writing it. i51 TAKES THE AGENT'S HALF OF THE SAME CAUSE: sty-the-step-that-hands-the-walk-back makes the hop answer at once instead of holding the call, so the timeouts recorded on this slide stop happening. This story keeps the PERSON's half, which is what a surface shows while it waits, and that half is untouched.

---

THE STARTING STATE. The walk stands mid-iteration. The person asks the machine
to move. Measured on 2026-08-17: 184 of 730 pulls took more than five seconds
and 15 took more than thirty, with nothing on screen distinguishing any of them
from a stall.
|||
THE NUMBERS WERE READ FROM THE CALL LOG, NOT ESTIMATED, AND THEY ARE FLOORS. The log query that produced them drops records matching its own filter and reports `older: 0` while doing it — raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not. The real counts are at least these. NO CLOSING READING WAS TAKEN, so nothing here says the distribution moved.

---

STEP ONE. The person triggers the slow thing. Today: the surface holds still.
After: within the first second it says what is running, without taking the
screen over.
|||
SPECIFIED, NOT BUILT. req-work-past-its-bound-says-it-is-working carries the demand and tsp-work-past-its-bound-signals carries its two cases, both authored RED on purpose because nothing puts a running operation onto the panel today. That is the correct state for the state that wrote them; it is not a shipped behaviour, and this slide says so rather than implying otherwise.

---

STEP TWO. The wait continues past a few seconds. Today: still nothing, and the
person reaches for the log to find out whether the machine is alive. After: the
signal shows movement, so the question does not arise.
|||
STILL THE TODAY HALF. The reaching-for-the-log behaviour happened repeatedly during this walk, which is how the six timed-out pulls were identified at all. THE SECOND CASE IS WHAT KEEPS THE FIX HONEST when it comes: `the running signal does not take the panel over` is a separate case precisely because a signal can satisfy the first and fail the owner's framing, which asks for transparency and non-intrusiveness in one breath.

---

STEP THREE. The wait runs long enough to be a decision. After: the person can
tell from the surface alone whether waiting is sensible, and nothing they see
is a faithful completion percentage that discourages them out of a wait worth
finishing.
|||
THE NARROWING SURVIVED A PRIOR-ART SCAN THAT ARGUED AGAINST OUR FIRST READING. A 2010 University of Michigan study is reported to have found that the slow-to-fast progress bar — the most technically honest representation of actual progress — produced the HIGHEST abandonment, at 21.8 percent. PRIMARY NOT SEEN: that is a secondary write-up and the study itself was not read. The ruling that came out of it is the one this slide states: never leave a person guessing, and do not mistake that for publishing a faithful percentage.

---

THE RESULT. A slow thing is honest about being slow and the person is never
guessing whether it is working. The wait is still a wait, and it stops being a
question.
|||
NOT REACHED, AND NOT DEMONSTRABLE BY ANY INSTRUMENT EVEN WHEN IT IS. The pass line is what a person BELIEVES about the machine while they wait, and nothing reads that except a watcher asking them. tsp-a-long-wait-is-never-a-guess is that procedure and it has not been run — its step 2 has nothing to observe until the signal itself is built. Its sibling tsp-a-slow-signal-keeps-the-wait asks the other direction, whether the signal makes people leave sooner than silence would, and it is not run either.
