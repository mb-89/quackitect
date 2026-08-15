---
form: log-risks
amended: "2026-08-15T10:15:22.663Z by agent — the state's guidance asks for the goal system's named conflicts as the first entries, and the decision node carrying all three was minted after the submit"
by: agent
signed_off: 2026-08-15T10:14:23.165Z
authors: agent
files:
---

# Evidence form / log-risks

## current_situation

The register opens for this record with four entries. Two were minted at the kickoff gate, where the red team named them, and two are minted here.

All four are about the same thing: whether this iteration can tell a real speed-up from a measurement artefact.

That is not the usual shape for a performance record's register, and it is the honest shape for this one. The record ranks its work by battery numbers, and the retro found that those numbers cannot currently be separated into work and queueing.

One standing entry is NOT re-opened here. raid-reload-hides-new-verbs already covers a new lane verb being unreachable in the session that built it, and this record adds no verb.

## raid_opened

- raid-dec-speed-never-buys-from-the-guard
- raid-asm-battery-timings-measure-work
- raid-asm-wall-clock-is-a-baseline
- raid-risk-git-fake-drifts-from-git
- raid-asm-method-write-reaches-every-tree

## follow_up

- Two probes are scheduled and both are cheap. One needs the scoped-run timings fix before it can run at all, and the other needs two battery runs against an unchanged tree.
- raid-risk-git-fake-drifts-from-git carries its own mitigation: one real-git test at the seam, written with the fake rather than after it.
- raid-asm-method-write-reaches-every-tree is probed for free by the merge at this record's close.
- The register is added to as the build turns things up. meth-raid says any state may open an entry the moment it is noticed, and waiting for the right state is how an entry is lost.

## anything_else

ON WHY TWO ASSUMPTIONS ABOUT MEASUREMENT RATHER THAN ONE.

They fail independently and a reader could easily fold them together.

The first asks whether one case's recorded duration measures that case's own work. Under twenty-way parallelism it may be mostly queueing.

The second asks whether the TOTAL repeats between two runs of the same tree.

Per-case numbers could be pure contention while the total stays steady. The total could wander while every case is measured cleanly. Both have to hold before any before-and-after in this record means anything, and one entry could only be probed one way.

ON THE ONE RISK THAT IS NOT ABOUT MEASUREMENT.

raid-risk-git-fake-drifts-from-git comes from the record's own text rather than from this walk. The record names it while designing the fix, which is the right moment, and recording it as a node is what makes it survive the iteration that noticed it.
