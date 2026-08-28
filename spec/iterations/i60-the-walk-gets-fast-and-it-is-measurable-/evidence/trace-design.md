---
form: trace-design
by: agent
signed_off: 2026-08-24T18:01:48.222Z
reopened: "2026-08-24T18:01:14.178Z — observe-red was re-signed after this state, so it answered older ground. What changed above it: eight chunks now stand where four did, the four added ones touched three more engine files, and one new file was added — the extension's build options, which moved into a module of their own so the staleness guard runs the same build rather than a copy of it."
authors: agent
files: null
---

# Evidence form / trace-design

## current_situation

The round now touches eleven files and adds one. Two design specs cover them all, and one gained a claim in this pass.

[dsp-the-walk-knows-what-its-own-hops-cost](spec/trace/design-spec/dsp-the-walk-knows-what-its-own-hops-cost.md) covers the route drawer, the aim and the sweep's timing. [dsp-boot-and-power](spec/trace/design-spec/dsp-boot-and-power.md) covers the stop hook, the lifecycle record and the extension build.

## design_trace

EVERY FILE THIS ROUND TOUCHED IS CLAIMED, and the second pass added one file and one claim.

### Already claimed, and changed again in the second pass

[deliverable/engine/session.ts](deliverable/engine/session.ts) gained the drawer's own standing question, the sweep's per-hop walking times, and the rule that a hop walked OVER does not owe its reading.

[deliverable/engine/benchmark.ts](deliverable/engine/benchmark.ts) gained the hop timings on a pinned run and their summary.

[deliverable/engine/pugh.ts](deliverable/engine/pugh.ts) gained the datum pick that treats a hole as absent rather than as nought.

### Added in this pass

[deliverable/engine/vscodebuild.ts](deliverable/engine/vscodebuild.ts) holds the extension's build options in ONE place, because the staleness guard has to run the same build rather than a copy of it. It is claimed by `dsp-boot-and-power`, which already owns the extension registry and the install path.

THAT IS NOT NEAREST-SPEC CLAIMING. The spec owns what gets registered; the options that produce it are in the same family rather than beside it.

### Where the specs moved with the code

A design spec that describes the opposite of the code is worse than one that omits it, because the code cites the spec.

`dsp-the-walk-knows-what-its-own-hops-cost` gained two sections in this pass. One records that a hop has two halves — the drawing at about 8 milliseconds and the walking at about 5,400 — and that both are now timed separately. The other records the owner's ruling that walking over a state is not entering it, and why the reading guarantee survives.

### The grain, said plainly

THE GRAIN IS THE FILE, and this round's original defect was smaller than one. The notch was a single line in the wrong function of a claimed file, and every check this state runs would have passed throughout.

That is not a finding against the sweep, which says so itself. It is the reason the end-to-end note matters more than a finer sweep would.

## follow_up

TWO CLAIMED FILES GAINED BEHAVIOUR WITH NO CHECK.

`pugh.ts` gained arithmetic that decides which design wins. Its failure mode is silent: a contender vanishes and the table still looks complete.

`benchmark.ts` gained the yardstick's number.

BOTH ARE NAMED IN THEIR CHUNKS' OWN EVIDENCE rather than left for this sweep to miss, because this sweep asks whether a file is CLAIMED and not whether it is CHECKED. Those are different questions and only one of them is asked here.

## anything_else

