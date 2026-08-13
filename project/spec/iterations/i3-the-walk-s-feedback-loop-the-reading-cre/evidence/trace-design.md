---
form: trace-design
reopened: "2026-08-13T12:17:42.495Z — no route runs past it, so its claim is not standing and the router reports arrival instead of saying why"
by: agent
signed_off: 2026-08-13T12:18:04.000Z
authors: agent
files:
---

# Evidence form / trace-design

## current_situation

The sweep has nothing new to claim. Every file this iteration touched was already claimed before it started.

- machine.ts and session.ts by [[dsp-walk-machine]]
- rigor-matrix.ts by [[dsp-method-compilation]]
- iterations.ts by [[dsp-record-lifecycle]]
- stateform.ts by [[dsp-evidence-forms]]
- tools.ts by [[dsp-lane-door]]

No engine file was added. Six were changed, and all six sit inside standing specs.

FOUR NEW TEST FILES were written — change-size, scaffold-entry, field-omit, promotions-stay-home. Design specs do not claim tests; those belong to the test-spec slice, which author-tests extended with two new specs and two amended ones.

No element and no interface changed, so coverage is unmoved.

## design_trace

| design-spec | realizes | files |
| --- | --- | --- |

## follow_up

The verification battery runs next, then the implementation gate.

One step stays owed from author-tests and is named in its spec: a walking case for the placeholder entry refusal. It is asserted by inspection today, which proves it ships and not that it fires.

## anything_else

THE SWEEP'S LIMIT MET THIS ITERATION HEAD ON, and it is worth recording where it will be read.

The grain is the FILE. This iteration's reopen-frontier work was four cases APPENDED to tokens.test.ts, a file already claimed. A sweep for unclaimed files sees nothing there.

That matters because the reverse sweep this milestone promises — a test FILE no spec references — is the mechanism that would otherwise have forced this iteration's four late requirements into existence before their code. It would have caught three of the four. The fourth is exactly this case.

The owner ruled the finer grain retro material, and it is noted with the count.

WHAT I DID NOT DO: claim a file under the nearest spec to make a number go green. Nothing was unclaimed, so nothing needed it — but the temptation is real and the guidance names it, so the absence is worth stating.
