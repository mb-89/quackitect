---
minted_in: i1
id: vp-vendoring
type: "[[value-prop]]"
statement: As a builder with my own product, I need to run quackitect as it is, or overlay it with my own method without forking it.
audience: stk-vehicle-owner
outcome: a vehicle is a complete independent copy of the engine that its owner may change entirely, lays its own guidance over what it carries, and can still take improvements from where it came from — while nothing it does can reach that source
priority: must
---

## Success criteria

- A colleague clones the vehicle repository and works, with no access to the quackitect checkout and nothing of it installed.
  Metric: the vehicle repository's dependencies on the quackitect working copy. Target: none.
- Nothing a vehicle does can reach the source it came from.
  Metric: writes, links, mounts or install steps from a vehicle that resolve outside its own tree. Target: zero.
- A vehicle takes an upstream improvement without abandoning changes it did not choose to abandon.
  Metric: the vehicle's own changes lost to an engine update. Target: none it did not decide on.
- A vehicle run resolves what it carries through ONE chain, so which layer answered is never ambiguous.
  Metric: identities resolving two ways on one load. Target: zero.

## Unlike

Forking. A fork gets you your own guidance and loses every upstream improvement from the day you take it. The difference is the overlay chain: your method sits on top, and the engine underneath keeps moving.

## Notes (not load-bearing)

The wording follows v1's own Moore frame at its engine-vehicle iteration: other projects VENDOR AND OVERLAY WITHOUT FORKING.

The reason this is a must rather than a nice-to-have: quackitect goes open source, while company-specific guidance must stay inside the company. Without vendoring, those two facts cannot both hold.

## Amended 2026-08-18, at i16's frame-delta

THE OUTCOME LINE CARRIED A MECHANISM AND THE MECHANISM WAS WRONG. It ended
"and never writes under the engine", which reads as a prohibition on a vehicle
changing what it carries. The owner ruled the opposite on 2026-08-18: a vehicle
is self-sufficient, owns everything in it, and may change all of it including
the parts the parent wrote.

WHERE THE WRONG WORDING CAME FROM. v2 decided this correctly, once, at
`product/spec/ledger/se/law-imports-are-read-only.md` — an owner ruling of
2026-07-25, read at ref v2. Its rule is about the DIRECTION OF WRITES, not about
a folder: an IMPORT is read-only and nothing may reach it, while "only a
VENDORED dependency may be modified, and only our own copy of it".

A VEHICLE VENDORS. So the law's own sentence GRANTS what this outcome line was
forbidding, and the v3 wording inverted it.

WHY THE LAW EXISTS, because the reason is what keeps the rule sharp. Witnessed
2026-07-25: package.json declared the kb module as an npm `file:` dependency,
npm implemented that as a symlink into a sibling checkout, and a routine
`git worktree remove --force` followed the link and deleted that repository's
working tree and its .git. The law's verdict: "The symlink was only the
mechanism of the day — what actually failed was that a write reached the
imported source at all."

WHAT THE CRITERIA NOW MEASURE. The first two are the goals: run alone, and
reach nothing upstream. The third is the one a fork can never satisfy and is
the whole reason this is not a fork. The fourth is what stops "one chain" from
quietly meaning "whichever layer answered first this time".

AND ONE CRITERION WAS REMOVED RATHER THAN REWORDED: writes under the engine
during a vehicle run, target zero. It measured the wrong folder. The folder
that matters is the SOURCE, and it is not inside the vehicle at all.

THE FULL ARGUMENT stands at raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours,
which carries v2's law verbatim with its witness.
