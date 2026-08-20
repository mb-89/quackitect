---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-asm-the-engine-can-tell-who-asked-for-a-run
type: "[[raid]]"
kind: assumption
statement: The engine can tell an agent-initiated test run from one the walk initiates, so it can refuse the first outside verification while letting the second through.
owner: the driving agent
trigger: decompose-structure, where the refusal's discriminator is chosen
probe: "holds, and better than predicted. Read engine/tools.ts: se_test already branches on scope — a call with files goes through scopedGate, a call with no arguments through runBattery, whose own description says NO ARGUMENTS runs the earned battery. The battery path already carries batteryGate and testGate. No discriminator has to be built and no caller stamp is needed; one condition goes inside a gate that already runs."
probed: 2026-08-16
status: open
impact: the refusal cannot be written, and the battery row degrades to guidance an agent is asked to remember — which is the exact failure that produced five unsanctioned batteries in one day.
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - req-the-full-battery-runs-where-the-method-says
  - raid-dec-blocking-and-the-battery-refusal-ship-together
  - "M7_50_verification: filled_by engine"
---

## The assumption

req-the-full-battery-runs-where-the-method-says demands that an
agent-initiated full battery outside verification is REFUSED. That needs the
engine to distinguish two callers of the same verb.

## Probe

CHECK WHETHER THE DISCRIMINATOR IS AVAILABLE AT THE CALL. Three candidates,
cheapest first.

- THE WALK'S POSITION. If the state is `verification`, the run is sanctioned;
  anywhere else it is not. This needs no new signal at all — the session knows
  where it stands — and it is the candidate this entry expects to hold.
- THE ABSENCE OF A FILE SCOPE. A full battery is `se_test` with no `files`
  argument. That is already how the tool distinguishes the two, and it is the
  simplest possible discriminator.
- AN EXPLICIT CALLER STAMP. Only needed if the first two fail.

THE FIRST TWO COMBINED ARE PROBABLY THE WHOLE ANSWER: refuse a no-scope
`se_test` unless the walk stands in verification. That is one condition on one
argument, and this entry exists so somebody checks it rather than assuming it.

## Why it is worth an entry rather than an assumption in somebody's head

BECAUSE THE FALLBACK IS BAD. If no discriminator works, the row cannot be
enforced and becomes guidance. M7_50 has BEEN guidance all along — it already
says the engine owns the battery — and five agent-initiated runs happened
anyway in one day. A rule that only asks is the failure this iteration is
fixing.
