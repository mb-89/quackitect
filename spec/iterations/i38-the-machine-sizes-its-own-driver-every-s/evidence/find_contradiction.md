---
form: find_contradiction
by: agent
signed_off: 2026-08-20T11:54:05.994Z
authors: agent
files:
---

# Evidence form / find_contradiction

## current_situation

The prior-art finder minted five options. This finder asks a different question: where does improving one thing make another worse, and can any of those be broken rather than traded?

FOUR CONTRADICTIONS STAND IN THIS DESIGN and three of them have a break. The fourth is a trade and the table says so rather than dressing it up.

The vendored contradiction matrix was consulted for each pair rather than reasoned from memory.

## applies

yes — the design's own goal system already names three conflicts and rules each one by trading, which is exactly the state a contradiction finder is for: a ruled trade is where a break was not looked for.

## contradictions

| contradiction, plainly | improving | worsens | matrix cell says | broken or traded |
| --- | --- | --- | --- | --- |
| The same milestone must name the same driver every time, and the right driver for THIS work is not the same every time. | 27 Reliability | 35 Adaptability or versatility | 13 the other way round, 35 parameter changes, 24 intermediary | BROKEN by separation in time — the mapping is frozen for a record's whole walk and revised between walks, so a run replays exactly while the table still learns. opt-the-decision-is-fixed-within-a-run-and-revised-between-them |
| A submachine must be walked by a worker strong enough for its hardest item, and paying that for every item wastes most of the walk. | 27 Reliability | 25 Loss of time | 1 segmentation, 10 preliminary action | BROKEN by segmentation — split the submachine where the spread is wide, so no item is ever under-driven and the maximum is taken over a narrower group. opt-split-a-submachine-where-the-spread-is-wide |
| A declared value can never be contradicted by what the work turned out to need, and a value that could be contradicted is not a declaration. | 28 Measurement accuracy | 37 Difficulty of detecting and measuring | 26 copying, 24 intermediary, 28 mechanics substitution | BROKEN by inversion — derive the rung from a declared judge instead of typing it, so the declaration is itself checkable by running it. opt-derive-the-rung-from-what-will-judge-the-output, minted by the prior-art finder |
| The machine must decide which driver the work needs, and the agent must be free to refuse the decision. | 38 Extent of automation | 27 Reliability | 11 beforehand cushioning, 27 cheap short-living, 32 colour changes | TRADED, not broken, and named as such. The asymmetry — stronger free, weaker owing a recorded reason — is a trade with a mark on it rather than a resolution, and it has no mechanism behind it. raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it |

## options

- opt-the-decision-is-fixed-within-a-run-and-revised-between-them
- opt-split-a-submachine-where-the-spread-is-wide

## follow_up

- THE FIRST BREAK IS THE ONE WORTH ARGUING ABOUT. Determinism and fitness are only opposed at the same timescale. Freeze the mapping for a record's walk and revise it between walks, and a run replays exactly while the table still improves — which is the only route in the whole option set to an error signal without giving up reproducibility.

- IT CARRIES A COST THIS ITERATION ALREADY UNDERSTANDS. A pinned mapping is a new pinned thing, and a pin that moves reopens claims. It must stay out of the demand ledger for the same reason the complexity value must, and that constraint is already a requirement.

- THE SECOND BREAK HAS A CHEAP HALF AND AN EXPENSIVE HALF, and only the expensive half needs a drawing change. Reporting the spread and letting a person split costs nothing and is reachable now; splitting automatically edits `depends_on` and trips the cascade this record already has an entry for.

- THE FOURTH CONTRADICTION IS TRADED AND SHOULD NOT BE LEFT THERE. The asymmetry between asking for a stronger driver and asking for a weaker one is the design's only safety rule and it has no mechanism. A finder that only records the trade has done half its job; this one records it as unbroken so a later state cannot mistake it for settled.

## anything_else

