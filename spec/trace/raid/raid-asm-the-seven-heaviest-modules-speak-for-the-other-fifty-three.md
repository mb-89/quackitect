---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-the-seven-heaviest-modules-speak-for-the-other-fifty-three
type: "[[raid]]"
kind: assumption
statement: The 42-to-22 split found in the seven heaviest modules carries over to the other 59 engine-core writes, so the door's scope can be set from that sample alone.
owner: the driving agent
trigger: the first design state that sets the disk door's scope from the 42-to-22 figure, and any proposal to route a write outside the seven modules
status: probed
impact: The seven were chosen for carrying the most writes, and a module carries many writes partly because it repeats a shape. The sample is therefore biased toward the pile a door improves. If the other 53 look more like run.ts, the door's real reach is smaller than 42 of 64 suggests and the scope set from it is too wide.
breaks_how_badly: corrosive
how_likely: plausible
probe: answered, and it splits. On a like-for-like improve-against-lengthen proxy the sample CARRIES, at 80 percent improve inside the seven against 76 percent outside. On the shape measure it does NOT — read-modify-writes are 33 percent inside the seven against 19 percent outside, roughly 1.7 times denser. So the door's scope may be set from the sample; the claim about which object pays may not.
probed: 2026-08-26
source_refs:
  - i54-everything-exported-has-a-door-a-sweep-o
  - raid-asm-a-door-in-front-of-the-engine-s-own-disk-access-pays-for-itself
weighs_with: none
weighs_against: none
---

## Why this is written down

THE PROBE THAT FOUND 42-TO-22 DID NOT SAY THIS. It read the seven modules and
reported what it found in them. Carrying that ratio to the whole of engine core
is a second step, and it is the step nobody has taken.

THE SAMPLE IS BIASED BY CONSTRUCTION. The seven were picked because they carry
64 of the 117 core writes. A module reaches a high write count in one of two
ways: it repeats one shape many times, or it does many different things. The
first way lands in the pile a door improves.

SO 42 OF 64 IS AN UPPER BOUND ON HOW WELL A DOOR DOES, not an estimate of it.

## Probe

TAKE TEN OF THE REMAINING 43 ENGINE-CORE FILES AT RANDOM and read their writes,
sorting them into the same two piles the first probe used.

- Writes a door would improve. Repeated path building, atomic replacement, hash
  checking, the same error handling in several places.
- Writes a door would only lengthen. A single append to a log the module owns,
  a temporary file it reads straight back, a path already jailed by `paths.ts`.

THE REMAINING FILES CARRY 53 WRITES BETWEEN THEM, so ten files is roughly a
quarter of what is left and costs one reading pass.

WHAT THE RESULT MEANS. A split near 42-to-22 confirms this. A split near
run.ts's 0-to-10 says the seven were unrepresentative and the door's scope must
come down to what the seven themselves justify.

WHO RUNS IT: the walker of the state that sets the door's scope, before it sets
it.

## What it does not need to settle

THIS SAYS NOTHING ABOUT THE INTERNET DOOR OR THE WARM MODEL. Those carry their
own counts and their own unread sites, and a verdict here must not travel to
them.

## Probe result, 2026-08-26

THE SAMPLE CARRIES ON ONE MEASURE AND NOT ON THE OTHER.

### The seven are genuinely the heaviest

Verified rather than assumed. Write-site counts: `session.ts` 11, `iterations.ts` 10, `run.ts` 10, `sessionclaims.ts` 10, `benchmark.ts` 9, `produce.ts` 8, `sessionforms.ts` 6.

That is 64 sites. The next file down is `bound.ts` at 4.

### The other side is 59 sites in 22 files, not 53

This follows from the corrected engine-core total of 123 sites in 29 files.

The node's own name still carries the original 53. The id is what other nodes cite, so it is left alone.

### On the improve-against-lengthen proxy, it carries

The original 42-to-22 sorting was a judgment made per site by a person, and it could not be faithfully reconstructed. A mechanical proxy was used instead. IT IS MARKED AS A PROXY.

The proxy: a site is lengthen-only if it appends to a log, or if its target path comes from a helper defined in the same module or imported from `paths.ts`, and it is not a read-modify-write.

The proxy reproduces `run.ts` at 0 of 10 and `sessionclaims.ts` at 10 of 0 exactly. It diverges hard on `produce.ts`, giving 8 to 0 against the original 3 to 5. It is not the same rule, so only its like-for-like comparison means anything.

Applied to both sides:

- the seven: 51 improve, 13 lengthen, 80 percent improve
- the other 22 files: 45 improve, 14 lengthen, 76 percent improve

### On the shape measure, it does not

Read-modify-writes are 33 percent of sites inside the seven, at 21 of 64. Outside they are 19 percent, at 11 of 59.

Adding the preceding `mkdirSync` gives 25 of 64 inside against 6 of 59 outside.

The shape the original probe named as the payoff is about 1.7 times denser in the sample than in the rest of the engine.

### What this means for scope

The door's reach may be set from the sample.

The claim that a claim-writing object is what pays may not. That rests on the shape, and the shape does not carry.
