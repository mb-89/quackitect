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
THE DISTINCTION HELD ALL THE WAY DOWN, AND IT WAS TESTED. The two halves ship as separate stories, separate requirements and separate specs, and neither was allowed to stand in for the other. tsp-work-past-its-bound-signals says it in its own words: passing the signal cases while failing the bound is not meeting the demand, it is only having stopped hiding.

---

WHY THIS STORY EXISTS AT ALL. It was missing. This iteration wrote two stories
and both told the honest-about-slowness pass, so every requirement, function
and build chunk below served that half alone. The half the iteration is named
for had no story, and nothing downstream could notice.
|||
CAUGHT INSIDE THE ITERATION AND REPAIRED THERE. The story carries `minted_in: i33`, which is the record of the repair: it was written mid-walk, after the work below it had already been drawn against the other half. NOTHING MECHANICAL CAUGHT IT. The gap was a story that did not exist, and no check can miss a node that was never minted — which is the same shape as the fault that cost this iteration its evening.

---

THE STARTING STATE. Measured on 2026-08-17, after the one-second rule had
already shipped: 1834 of 8424 calls came back slower than a second. Of 730
pulls, 184 took more than five seconds and 15 took more than thirty. The worst
single answer took 33,461 ms.
|||
READ FROM THE CALL LOG RATHER THAN ESTIMATED, AND EVERY FIGURE IS A FLOOR. The query that produced them omits records matching its own filter while reporting `older: 0` — raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not. NO CLOSING READING WAS TAKEN, so this deck cannot claim the distribution moved. The acceptance gate says the same thing in its own words: the fixing half is the thinnest of the five goals.

---

STEP ONE. The person pulls the walk forward one state. Today: the call may take
anything from 300 ms to half a minute, and which one it will be is not
predictable from what was asked. After: it comes back inside a second, and the
person's hand does not stop moving.
|||
NOT REACHED, AND THE UNPREDICTABILITY NOW HAS A NAMED CAUSE. The hop into a gate fires the full battery from that state's exit script, about a minute behind one call — six of them timed out during this walk. A SECOND CAUSE WAS FOUND THE SAME EVENING: the scope map is a filename lookup, so every edit to `engine/session.ts` forces the whole battery because no `tests/session.test.ts` exists to match it. note-ce4ac7d7af2d and note-4bfbbe7e8d93 carry it, and the owner has ruled it is fixed next.

---

STEP TWO. The person does it again, forty times in an hour, because that is
what driving the machine is. Today: the slow ones break the rhythm often enough
that the person starts batching work to avoid them, which is the tool shaping
the work instead of serving it. After: the rhythm holds.
|||
NOT REACHED, AND THIS WALK IS THE COUNTER-EXAMPLE. It did exactly the forty-times-an-hour thing for an evening and the rhythm did not hold — the owner's own words during it were that whatever this is taking, it takes way too long. Step three of machines/demos.md is the pass that would settle it, and it needs a person driving for an hour.

---

STEP THREE. The work is genuinely large — a record entered, a corpus read, a
drawing rendered. Today one record entry asked for the same 328-node corpus
sixty-six times, because each hop asked what was green and each ask fetched its
own inputs. After: the input is collected once and handed down, so the size of
the work and the number of times it is done stop multiplying.
|||
FIXED, AND THE GUARD NOW COUNTS THE THING IT NAMES. `engine/trace.ts` carries a corpus-ask counter read by `corpusAsks()`, and the green guard in `tests/drift.test.ts` asserts one ask across a whole fill. TWO EARLIER GUARDS WERE WRONG AND BOTH WERE REPLACED RATHER THAN TUNED: a wall-clock ceiling that read 1054 ms and said nothing about why, and a door-access count that cannot see a per-state corpus load at all because the memo sits above the door. A fresh-eyes tester proved the second one.

---

THE RESULT. The common call is under a second because it does its work once,
not because it does less of it. What cannot be fast says so, and that is the
sibling story rather than this one's escape hatch.
|||
HALF TRUE, AND SAID AS A HALF. The does-it-once half is built and guarded. The under-a-second half is unread in aggregate: twelve of the thirteen modelled boundaries have no calls attributed to them, so the instrument can speak for one crossing and a clock run today would read like a verdict on thirteen. That is why tsp-the-driving-calls-come-back-inside-a-second is a demonstration on a measurable story — the person's job in it is to judge whether the list has holes. It has not been run.
