---
form: fold-back
by: agent
signed_off: 2026-08-26T13:37:40.548Z
authors: agent
files: null
---

# Evidence form / fold-back

## current_situation

Eight spikes ran and all eight are answered. Four hold, one falls, two are unsettled, and one holds while firing a trigger nobody was watching.

### What the design must change

Two findings move the build.

- `el-door-rule` cannot claim complete coverage. 38 of 178 modules reach a shell, and a shell carries no path a guard can judge. The rule must state its limit out loud.
- `el-door-sweep` becomes the only complete check rather than a second opinion. It must reuse a pass that already ran, because a rule that walks the tree itself costs about 100 ms against about 1 ms for a lookup over parsed frontmatter.

### What the design may keep

The kill criterion holds by 8 modules, so one rule over four conversations survives. The write shapes cluster, so a door has something to serve. A corpus-reading check at write time costs 18 ms against a 1000 ms budget.

### What was corrected on the way

Four figures standing in the corpus were wrong and are now right.

- The shell reach was 60 of 178. It is 38.
- The one-shape count was 30 of 64. It is 25.
- Engine core was 117 sites across 50 files. It is 123 across 29.
- The network door was 6 modules. It is 2, and the spread is forty to one.

One earlier judgment was also wrong. This record had recorded the demanded-reason assumption as not probeable, on the grounds that nothing here refuses a reasonless entry. Three verbs do.

### What nothing here settled

The 50-file figure has no scope that reproduces it. Whether a write-time PARSE of the corpus fits its budget was not measured. Whether the 38 shell-reaching modules ever USE that channel for a departure was not measured either.

## folded

| experiment | folds_to | promote |
| --- | --- | --- |
| [[exp-can-a-reader-act-on-the-departures-the-tree-holds]] | Nothing moved upstream. The assumption stays open with a ready-when, because the population is one. What DOES move is a design constraint - a departure list that grows long is first evidence about the predicate, since sharpening this tree's predicate collapsed its list from 21 entries to 1. | none - the finding is the product |
| [[exp-do-the-engine-s-write-shapes-cluster-by-purpose]] | Two figures on the assumption are corrected - 30 of 64 becomes 25 of 64, and 117 across 50 files becomes 123 across 29. The door's scope is set from the read-modify-write pile at 37 of 151, never from the raw site count. The unexplained 50-file figure is recorded as open. | none - the finding is the product |
| [[exp-do-the-lists-that-demand-a-reason-collect-considered-ones]] | The assumption moves from open to probed and holds at 8 percent templated. Its earlier not-probeable reading is corrected on the node. el-door-rule gains a constraint - do not ask for a reason where the answer is mechanical, because the one cluster of boilerplate this tree holds came from a ripple. | none - the finding is the product |
| [[exp-does-a-corpus-reading-check-fit-inside-the-write-budget]] | The assumption holds and its corpus-reading half is closed. The design argument that cited the write budget as a reason to avoid a corpus check loses that leg, so the exactness the winner traded away can be bought back at the build if it is wanted. A write-time PARSE is a separate question and stays open. | none - the finding is the product |
| [[exp-does-one-rule-fit-all-four-conversations]] | The kill criterion the architecture gate deferred is now answered, and the deferral closes. The spread correction from thirteen-to-one to forty-to-one goes into any later argument about mechanism count, because the third decision reasoned from the wrong figure. Nothing reopens. | none - the finding is the product, and the counting script is throwaway |
| [[exp-does-the-seven-module-sample-speak-for-the-rest]] | The assumption moves from open to probed and splits. The door's reach may be set from the sample, which agrees within four points. The claim about which object pays may not, because the read-modify-write shape is 1.7 times denser inside the seven. The other side is 59 sites in 22 files, not 53. | none - the finding is the product |
| [[exp-where-does-the-sweep-s-runtime-actually-go]] | The corpus-size half of the affordability assumption's trigger has fired at 3118 nodes and nobody read it, which demonstrates the risk rather than arguing it. el-door-sweep gains a hard constraint - reuse a pass that already ran, because a rule that walks the tree itself costs a hundred times one that reads parsed frontmatter. | none - the finding is the product |
| [[exp-which-channels-add-a-departure-without-a-path-the-guard-can-judge]] | el-door-rule must state its coverage limit out loud, because 38 modules hold a channel the write-time guard cannot see. el-door-sweep stops being a second opinion and becomes the only complete check, which changes what the build does first. The corrected 38 replaces the overcounted 60 on the raid node and in the signed run-spikes form. | none - the finding is the product |

## follow_up

### Into the build

- `el-door-rule` states its coverage limit. The shell channel is outside what it can judge, and the rule says so rather than implying completeness.
- `el-door-sweep` reuses an existing pass. As a lookup over parsed frontmatter it costs about 1 ms; as its own walk about 100 ms.
- The door's scope comes from the read-modify-write pile, 37 sites of 151.

### Parked, with a ready-when

- Whether an author refused at write time writes a usable reason. Ready when the tree holds more than one departure, which the build produces.
- Whether a write-time PARSE of the corpus fits its budget. Ready when a check needs frontmatter rather than content.
- Whether any of the 38 shell-reaching modules uses that channel for a departure. Ready when the departure list exists and its entries can be traced to the channel that wrote them.
- The 50-file engine-core figure. Ready when somebody can name the scope it measured.

### Outside this record

- The sweep reports green on an empty corpus, and its widget guard flips on the working directory. Captured as `note-c545c46b8e56`.
- `deliverable/engine/tools-run.ts:681` returns `ok: true` hardcoded, so a red sweep can never fail the battery. Recorded at `spec/overhauls/2026-08-20/findings.md:587` and still unfixed.
- A rule has no way to declare its cost class. The difference between the 1 ms kind and the 100 ms kind is invisible until somebody times the sweep.

## anything_else

Nothing promotes into the build. That is the throwaway law working as written, not an empty result.

Every spike's product is a finding, and four of them are corrections to figures this record had already written down and reasoned from. The scripts that found them are in `scratchpad/` and die with the container.

One spike went against my own design. The write budget was cited as a reason to avoid a corpus-reading check, and at 18 ms against 1000 ms it was never the constraint.
