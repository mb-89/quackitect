---
form: conceal-the-reports-while-a-run-is-bound
by: agent
signed_off: 2026-08-20T10:26:36.384Z
authors: agent
files:
---

# Evidence form / conceal-the-reports-while-a-run-is-bound

## current_situation

conceal-the-reports-while-a-run-is-bound, the fifth chunk, and the one gate-prototype refused to call buildable.

IT IS NOT BUILT, AND THE BLOCK WAS RE-TESTED HERE RATHER THAN INHERITED. The gate's reason was `four exclusion lists, one empty, three disagreeing`. That is true and it is not the sharpest way to say it, so this state went and looked.

TWO CASES STAY RED and they are the only two failures in a battery of 1618.

## built

NOTHING, AND THAT IS THE ANSWER RATHER THAN A GAP.

`concealedFromLane` and `concealmentCallSites` are in `engine/benchmark-guard.ts` with the real signatures, returning `false` and `[]`, each carrying a comment naming the token it waits on. The two cases that exercise them are red and stay red.

WHY A HALF-BUILT MASK WAS REJECTED. A rule wired at the sites that are cheap and skipped at the site that is not would report a run as concealed while the reports were readable through the verb most likely to find them. A concealment that is believed and false is worse than one that is absent and named.

WHAT THE BLOCK ACTUALLY IS, measured at this state.

- `paths.ts` HAS THE SEAM AND IT IS A GOOD ONE. `containedIn` says of itself `ONE RULE, PROVED ONCE. Both lanes reach it — the write lane through resolveInRoot, the read lane directly`. A rule placed there would hold for every path either lane resolves.
- `search.ts` DOES NOT GO THROUGH IT. It imports `resolveForRead` for the search ROOT only. The MATCHES come back from ripgrep enumerating the filesystem, filtered by search's own exclusion list. So a hit inside the reports folder arrives no matter what any per-path rule at the seam says.
- SO THE ONE VERB MOST LIKELY TO FIND A PREVIOUS RUN'S NUMBERS is the one verb the seam cannot reach. That is a sharper statement than `four lists disagree`, and it is the same fact.

THE TOKEN IS `wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-`, and this chunk is why it is a dependency rather than a neighbour.

## follow_up

- THE CHUNK STAYS IN THE DRAWING rather than being struck. A blocked chunk that is planned is visible at verification and at the gate; one left out of the drawing is not, and the requirement it serves would read as forgotten instead of owed.
- `req-the-benchmark-history-is-unreadable-while-a-run-is-bound` CANNOT SHIP IN i37. Its test spec is authored, its cases are written, and they are red. That is the honest state and gate-implementation has to rule on it.
- THE FINDING ABOVE BELONGS ON THE TOKEN. `search.ts` bypassing the containment seam is more precise than the count of lists, and whoever picks the token up should have it.
- trace-design is next, then verification, then gate-implementation.

## anything_else

THE BLOCK WAS RE-TESTED BECAUSE A DEFERRAL INHERITED WITHOUT CHECKING IS A GUESS THAT HARDENS.

gate-prototype deferred this on a count of exclusion lists. That count came from an M6 spike and was correct. But my own design spec says the rule goes at CALL SITES and never against a list, which raises an obvious question the gate never had to answer: if the rule does not ride the lists, does the lists' disagreement actually block it?

THE ANSWER IS YES, AND FOR A DIFFERENT REASON THAN THE GATE GAVE. Not because the lists disagree, but because one verb never consults any of them or the seam either — it asks ripgrep and filters the answer itself.

SO THE DEFERRAL HOLDS AND ITS REASON IS REPLACED. That is worth more than the deferral: the next person to pick this up gets one named file and one named mechanism instead of a count of four.

I COULD HAVE BUILT THE CHEAP THREE-QUARTERS AND SIGNED IT. Every case except one would have gone green, the chunk would have read as done, and a benchmark run would have reported itself concealed while `se_file_search` served the previous run's numbers. Nothing in the battery would have caught it, because the case that would catch it is the one I would not have written.
