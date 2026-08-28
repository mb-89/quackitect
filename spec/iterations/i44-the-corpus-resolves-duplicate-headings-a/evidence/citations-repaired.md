---
form: citations-repaired
by: agent
signed_off: 2026-08-28T11:34:53.118Z
authors: agent
files:
---

# Evidence form / citations-repaired

## current_situation

The stale-citation class is empty. It stood at 35 findings across 24 nodes when the chunk opened, and reads 0 now over the whole trace.

The split is 0 repaired against 35 marked unreachable, and that split is measured rather than judged. Two git queries over every ref in the whole history answer empty for all 35 cited paths, so not one of them has ever existed here under any name.

The marker is a new frontmatter key, `unreachable_citations`, read by `staleCitations` in `deliverable/engine/corpus-sweeps.ts`. Two cases guard it.

## built

### The class is empty

The stale-citation class stands at 0, measured over the whole trace on 2026-08-28. It stood at 35 when the chunk opened.

### The split, which the risk asks for

- REPAIRED BY POINTING SOMEWHERE REAL: 0
- MARKED UNREACHABLE: 35, across 24 nodes

THAT IS ALL MARKERS, AND THE REASON IS MEASURED RATHER THAN ASSERTED. `raid-risk-the-unreachable-marker-becomes-the-cheap-answer` says the cheap judgment is always "not reachable", so the judgment was made by a check anyone can repeat.

### The check

Two git queries over the whole history, every ref:

- `git log --all --diff-filter=RD --name-status` over the ten cited engine and case paths.
- `git log --all --diff-filter=RDA --name-status` over the six cited node and data paths.

BOTH ANSWER EMPTY. Not one of the 35 cited paths has ever existed in this repository, under that name or any other. There is no rename to follow, so a repair would have to invent a target.

### What the 35 actually are

- PROSE THAT ALREADY SAYS THE FILE NEVER LANDED. `dsp-the-install-preflight.md` and `dsp-the-state-declaration.md` both read "THIS SPEC CLAIMED ... FROM i9 AND NOTHING EVER LANDED THERE". The sentence is correct; only the checker was naive.
- HISTORY QUOTED VERBATIM. A git conflict message naming a path deleted in HEAD, and four scratchpad spikes run once and removed.
- REPORTS NEVER WRITTEN. Seven, under two nodes whose own titles say the demonstrations are unperformed and the demos are owed.
- A NODE THAT NO LONGER STANDS. `vp-vendoring.md`, cited by the issue whose title is that the value prop does not stand.
- FILES FROM ANOTHER TREE. An experiment that ran inside a vehicle, and probe transcripts recording what was read on a given date.

### The marker

A node listing a path under `unreachable_citations` in its frontmatter declares that path deliberately gone, and `staleCitations` leaves it alone.

IT IS A DECLARATION AND NOT A SILENCER. One entry per path, in the node that carries the citation, so markers can be counted against repairs without reading any code.

THE LIST IS READ WITH A REGEX, not a yaml parser, because `deliverable/engine/corpus-sweeps.ts` takes text and nothing else.

### Two cases guard it

Both in `deliverable/tests/corpus-sweeps.test.ts`.

- A citation the node marks unreachable is not reported.
- The marker silences only the paths it names, so an unmarked stale path in the same node still comes back.

The second exists because a marker that silenced the whole node would pass the first case and be useless.

## follow_up

### For the validation gate

COUNT THE MARKERS AGAINST THE REPAIRS. This chunk lands 35 markers and 0 repairs, which is further toward the marker than `raid-risk-the-unreachable-marker-becomes-the-cheap-answer` expected. The evidence for it is a git query anyone can repeat, and the gate should repeat it rather than accept the count.

### For the maintainer of the corpus

TWO DESIGN SPECS NOW READ ODDLY. `dsp-the-install-preflight.md` says nothing ever landed at `engine/bin/install-preflight.ts`, and `deliverable/engine/bin/preflight.ts` exists today. Both sentences are true, and neither mentions the other. That is a prose gap, not a citation defect, and it is out of this chunk's scope.

### Not for this iteration

The seven owed demonstration reports stay owed. Marking them changes nothing about the debt the two raid nodes already carry.

## anything_else

