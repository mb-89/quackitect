---
form: clear-jump
by: agent
signed_off: 2026-08-14T17:25:05.275Z
authors: agent
files:
---

# Evidence form / clear-jump

## current_situation

`req-a-clear-jump-is-one-call` stood on this record with NO CHUNK BEHIND IT. Twelve chunks were planned and none of them was the jump.

The requirement was minted at this record's own write-requirements, from an owner ruling of 2026-08-14: "a jump to a state that everything is good for and that needs no checks shall be one tool call - you declare the target, you say you want to go there, and the machine answers everything is ready, you are there now".

THE GAP WAS REPORTED AND THE OWNER ADDED THE CHUNK ON THEIR WORD, mid-build.

What the requirement asked for was missing. What the DEFECT needed was missing too, and they turned out to be the same fix seen from two sides.

## built

Two halves, both in the engine, and the second is what actually stopped the bleeding.

HALF ONE — ONE CALL. `se_aim` takes `go: true`. It sets the target and then walks it, and the answer says whether it ARRIVED. Aiming alone still moves nothing, which is the older law and is unchanged.

HALF TWO — THE SWEEP IS BOUNDED IN TIME. `Session.SWEEP_BUDGET_MS`, twenty seconds, checked BETWEEN hops.

WHY BETWEEN HOPS AND NOWHERE ELSE. That is the only moment the walk stands on ONE whole state with nothing half-applied. The sweep had a hop guard of 64 and no time bound at all, so a long route ran past the caller's timeout and was CUT OFF mid-hop. The next pull then computed from a position the machine disagreed with, and `completeState` refused it — `<state> is not active`.

STOPPING AT THE BUDGET IS NOT A FAILURE AND SAYS SO. The answer names the hops walked and the budget, and the route recomputes from wherever it stopped. Nothing is lost and the next sweep carries on.

Proof by test: `project/deliverable/tests/clear-jump.test.ts`, 4 of 4 green, test job `test-mst7kv46-5`.

- aiming alone still moves nothing
- aim with go lands the walk in the same call and answers that it arrived
- the sweep stops ON A STATE at its budget, never between two
- a sweep stopped at its budget resumes and arrives

PROOF IN PRODUCTION, and it is the better evidence. Walking from the front desk into this very chunk is the same forty-four hop route that produced the error eight times. It took FOUR pulls, each answering cleanly, with no timeout and no `is not active`.

The defect's own reproduction no longer reproduces.

## follow_up

THE `go` FLAG CANNOT BE EXERCISED IN THE SESSION THAT BUILT IT, and that is a harness fact rather than a defect in the flag.

A reload restarts the engine on new sources, but the harness holds the tool SCHEMAS it listed at session start. `go` is absent from that copy, so the client drops the property before the call leaves and the engine never sees it. SE-C-101 cannot fire, because there is no unknown argument by the time the boundary is reached — it is a silent drop.

Re-fetching the schema does not help; the same old definition comes back.

Captured as `note-11dff6e4d1de`. THE RULE IT IMPLIES: a change to a tool's SHAPE needs a new session, not a reload. New behaviour on existing arguments lands immediately, and this session relied on that repeatedly.

SO THE FLAG IS PROVEN BY TEST AND NOT YET BY HAND. Whoever picks this up next has a one-line check: `se_aim {to: "<somewhere far>", go: true}` should answer `arrived: true` without a pull.

The bounded sweep needs no such caveat. It changes behaviour on an existing path and was exercised four times getting here.

## anything_else

One thing the budget does NOT do, so nobody credits it with more than it earns.

IT DOES NOT MAKE THE WALK FASTER. A forty-four hop route still costs what forty-four hops cost. What changed is that the cost is now paid in whole hops with an answer at the end of each stretch, instead of being cut off somewhere in the middle.

TWENTY SECONDS IS NOT A MEASURED NUMBER. It is chosen to sit well under every timeout the lane has been driven through, and the comment says so rather than dressing it as a measurement. If a host with a tighter timeout ever appears, this is the one line to change — and the caller can already pass its own budget.

THE HOP GUARD OF 64 STAYS. It catches a loop, which is a different failure from a route that is merely long, and neither guard covers the other.
