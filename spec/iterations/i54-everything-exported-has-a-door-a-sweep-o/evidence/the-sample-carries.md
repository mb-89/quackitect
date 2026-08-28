---
form: the-sample-carries
by: agent
signed_off: 2026-08-26T13:34:57.274Z
authors: agent
files: null
---

# Evidence form / the-sample-carries

## current_situation

UNSETTLED. The two measures disagree.

### The seven really are the heaviest

Verified rather than assumed. Write-site counts: `session.ts` 11, `iterations.ts` 10, `run.ts` 10, `sessionclaims.ts` 10, `benchmark.ts` 9, `produce.ts` 8, `sessionforms.ts` 6.

That is 64 sites. The next file down is `bound.ts` at 4.

### The other side is 59 sites in 22 files, not 53

This follows from the corrected engine-core total of 123 sites in 29 files. The node's own name still carries 53, because the id is what other nodes cite.

### The sorting rule could not be reconstructed

The original 42-to-22 split was a judgment made per site by a person, and nothing recorded the rule it applied.

A mechanical proxy stood in, and it is marked as a proxy. A site is lengthen-only if it appends to a log, or if its target path comes from a helper defined in the same module or imported from `paths.ts`, and it is not a read-modify-write.

The proxy reproduces `run.ts` at 0 of 10 and `sessionclaims.ts` at 10 of 0 exactly. It diverges hard on `produce.ts`, giving 8 to 0 against the original 3 to 5. It is not the same rule, so only its like-for-like comparison means anything.

### On the proxy, the sample carries

- the seven: 51 improve, 13 lengthen, 80 percent improve
- the other 22 files: 45 improve, 14 lengthen, 76 percent improve

Four points apart is not a sample that misleads.

### On the shape measure, it does not

Read-modify-writes are 33 percent of sites inside the seven, at 21 of 64. Outside they are 19 percent, at 11 of 59.

Adding the preceding `mkdirSync` gives 25 of 64 inside against 6 of 59 outside.

The shape the original probe named as the payoff is about 1.7 times denser in the sample than in the rest of the engine.

### Why that disagreement is real rather than noise

The bias the assumption predicted is exactly this one. A module carries many writes partly because it repeats a shape, so the heaviest modules over-represent whatever shape they repeat.

The proxy cannot see that, because it sorts on where a path comes from rather than on what the write does.

## built

- spec/trace/experiment/exp-does-the-seven-module-sample-speak-for-the-rest.md

## follow_up

- The door's reach may be set from the sample. On the measure the assumption actually names, the two sides agree within four points.
- The claim about which object pays may not be set from the sample. That rests on the read-modify-write shape, and the shape is 1.7 times denser inside the seven.
- The original 42-to-22 sorting rule is lost. Any future comparison against it must use a stated rule applied to both sides, never the old figure.
- The 53 in this node's name is now known to be 59. The name stays; readers citing the figure should take it from the body.

## anything_else

The proxy is the weakest part of this run and it is marked as such on the experiment node.

It reproduces two of seven modules exactly and misses a third badly. That is enough for a like-for-like comparison across both sides, and not enough to re-derive the original split.

The raw per-module counts for the other 22 files are on the experiment node, as the sanctioned fallback for anyone who wants to sort them by a different rule.
