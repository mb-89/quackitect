---
form: identify-assumptions
by: agent
signed_off: 2026-08-24T16:09:59.562Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

Six requirement rows and three new functions stand. The sweep runs over those rows, not over memory.

Three assumptions stand for this delta. One was opened at log-risks because it was load-bearing from the first sentence; two came out of this sweep.

Standing assumptions from earlier records are not re-identified. The next state probes all of them, not only these.

## assumptions

- raid-asm-a-launched-process-can-be-asked-whether-it-still-exists
- raid-asm-asking-every-held-handle-on-an-interval-costs-nothing-measurable
- raid-asm-a-crash-releases-whatever-carries-the-workspace-hold

## sweep

- environment: ONE FOUND. The interval asks every piece of work under way, and nobody has counted how many that usually is. raid-asm-asking-every-held-handle-on-an-interval-costs-nothing-measurable. The tell was a requirement about a boundary with no number attached to it.
- toolchain: NONE BEYOND THE PLATFORM ONE. Nothing new is installed and no version floor moves. The runtime's own behaviour is being leaned on, and that claim is the platform entry rather than a second one about the toolchain.
- host: ONE FOUND, AND IT IS RECORDED AS THE CRASH ENTRY. The product does not control when it is killed, and the harness or the machine may end it at any moment. What is leaned on is that the hold dies with it, which is raid-asm-a-crash-releases-whatever-carries-the-workspace-hold.
- platform: ONE FOUND, AND IT IS THE LOAD-BEARING ONE. raid-asm-a-launched-process-can-be-asked-whether-it-still-exists. It was written at log-risks because the whole design rests on it, and this sweep confirms the placement rather than moving it. Its POSIX half has never run on any machine that has run this engine.
- neighbours: NONE, and the reason is that this change touches nothing outside the product. No datasheet is taken on trust, because no external system is consulted. The two systems named at the motivation gate were read as prior art and are not depended on.
- people: NONE, and this one was argued rather than waved past. The candidate was that a person restarting the product expects the previous run's entries to be settled rather than preserved. That is not an assumption, because the product already behaves that way and the behaviour is recorded in its own code with the reasoning beside it. It is a fact to cite, not a condition to check.

## follow_up

The next state probes every standing assumption, not only these three.

All three probes are written and none has been run. Two of them need both platform families, and one of those platforms has never run this product at all.

That is the shape of what M3 hands to M4: a design whose load-bearing condition is named, cheap to check, and unchecked.

## anything_else

TWO THINGS THIS SWEEP DELIBERATELY DID NOT RECORD AS ASSUMPTIONS.

A DECISION IS NOT AN ASSUMPTION. Choosing the mechanism that carries the hold is ours to make. Whether that mechanism releases itself on a kill is not, and only the second is an entry.

A TEST STATUS IS NOT AN ASSUMPTION. "POSIX untested" describes our ignorance rather than the thing being relied on. The claim underneath is that it behaves the same on POSIX, and that is what the entry says.
