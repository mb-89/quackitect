---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: sty-the-call-that-comes-back-inside-a-second
type: "[[story]]"
statement: When I ask the machine to move, I want the answer back inside a second, so that driving it feels like using a tool rather than sending a request and waiting for a reply.
actor: stk-engineer-driving-agents
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

THE PROBLEM. Being told honestly that a wait is happening is better than a
still screen, and it is not the same as not waiting. A machine that explains
its slowness on every call has made the slowness bearable rather than gone.
|||

---

WHY THIS STORY EXISTS AT ALL. It was missing. This iteration wrote two stories
and both told the honest-about-slowness pass, so every requirement, function
and build chunk below served that half alone. The half the iteration is named
for had no story, and nothing downstream could notice.
|||

---

THE STARTING STATE. Measured on 2026-08-17, after the one-second rule had
already shipped: 1834 of 8424 calls came back slower than a second. Of 730
pulls, 184 took more than five seconds and 15 took more than thirty. The worst
single answer took 33,461 ms.
|||

---

STEP ONE. The person pulls the walk forward one state. Today: the call may take
anything from 300 ms to half a minute, and which one it will be is not
predictable from what was asked. After: it comes back inside a second, and the
person's hand does not stop moving.
|||

---

STEP TWO. The person does it again, forty times in an hour, because that is
what driving the machine is. Today: the slow ones break the rhythm often enough
that the person starts batching work to avoid them, which is the tool shaping
the work instead of serving it. After: the rhythm holds.
|||

---

STEP THREE. The work is genuinely large — a record entered, a corpus read, a
drawing rendered. Today one record entry asked for the same 328-node corpus
sixty-six times, because each hop asked what was green and each ask fetched its
own inputs. After: the input is collected once and handed down, so the size of
the work and the number of times it is done stop multiplying.
|||

---

THE RESULT. The common call is under a second because it does its work once,
not because it does less of it. What cannot be fast says so, and that is the
sibling story rather than this one's escape hatch.
|||
