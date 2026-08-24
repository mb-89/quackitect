---
form: pointing-keeps-the-reachability-answer
amended: "2026-08-24T20:00:47.180Z by agent — the open work this form named as unmeasured has since been measured and repaired"
by: agent
signed_off: 2026-08-24T16:33:03.026Z
authors: agent
files:
---

# Evidence form / pointing-keeps-the-reachability-answer

## current_situation

A `draw` flag let a bare aim skip the route drawing. Its premise was that drawing is the search whose cost grows with distance, so pointing must not pay it.

The premise was reasoned, never measured. The instrument that could measure it is this round's first chunk.

## built

THE FLAG IS GONE, AND THE MEASUREMENT IS WHY.

### What the measurement said

Building a session costs 33 ms. One expand costs 3.7 ms cold and 0.1 ms warm. The whole route to `end` costs 68 ms over six hops, visiting six states.

So skipping the drawing saved tens of milliseconds against an aim observed taking seconds. The seconds are somewhere else.

### What skipping it cost

Only the drawing can say whether the target is reachable at all. A bare aim that does not draw stores a direction it cannot vouch for, and the refusal arrives a call later.

That is the opposite of what [[req-a-target-that-cannot-be-reached-is-refused-quickly]] asks for.

### What changed

`setTarget` in [deliverable/engine/session.ts](deliverable/engine/session.ts) takes one argument again and always draws.

The aim handler in [deliverable/engine/tools.ts](deliverable/engine/tools.ts) draws first and returns before sweeping when `go: false`. The sweep is the walking, and the walking is what pointing must not pay for. Both forms of the verb still stand, which the owner ruled.

[dsp-the-walk-knows-what-its-own-hops-cost.md](spec/trace/design-spec/dsp-the-walk-knows-what-its-own-hops-cost.md) carries the measurement table under its bare-aim section, so the code comments cite something that says what they claim.

### The check

The case in [deliverable/tests/clear-jump.test.ts](deliverable/tests/clear-jump.test.ts) asserted the false premise. It now asserts what the row actually demands: pointing moves nothing, records the direction, answers reachability, and reports what the search looked at.

No timing assertion, deliberately. A clock in a test measures the machine it runs on.

## follow_up

THE ROUND'S OWN MISTAKE IS THE THING TO CARRY, not the revert.

A plausible-looking cost was found and code was changed before anything measured whether it was the cost. The register entry warning against exactly that was written by the same hand, and the instrument was already in it.

What caught it was the owner asking why anything in a system this small takes twenty seconds. Measuring took four minutes.

THE SWEEP HAS SINCE BEEN MEASURED, and this line said it had not.

A PROFILER FOUND FOUR READS repeated hundreds of times per hop. A three-hop sweep fell from 15,404 milliseconds to 2,562 cold, and the file door's own meter from 612,532 calls to 22,040.

THE LESSON ABOVE HELD ON THE SECOND ATTEMPT. Nothing was changed until the profile named the cost, and the four candidates an earlier guess had listed were all wrong.

AND IT WAS NEARLY BROKEN AGAIN. The hand that did the speed work then published a false breach against the budget, comparing the whole hop with a row that binds only the flip. A reviewer asked for the measurement, and that entry is closed as refuted.

## anything_else

