---
minted_in: i1
id: raid-debt-file-grain-design-trace
type: "[[raid]]"
kind: debt
statement: The design-to-code sweep runs at file grain, so dead code inside a claimed file stays invisible to it.
owner: the driving agent
trigger: when the file-grain sweep stops finding anything new, or when a region-marker mechanism lands
status: open
looked: 2026-08-15
impact: A dead function inside a live file never surfaces as an unclaimed finding, and only a reachability probe or a reader catches it.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - note-0c5b06e4d056
  - tsp — trace-design's own guidance names the grain and its cost
---

Quality traded for speed, consciously: v1 went finer with `// design:`
region markers and swept declarations outside every region. The file
grain shipped first because it makes the whole seam mechanical today.
The payback is the region mechanism, owed when the coarse sweep goes
quiet.

Sweep 2026-08-13, at i3's onboarding retro: RESCHEDULED, trigger
re-affirmed and now named. i7 is the seeded iteration that repays it -
"the trace sharpens: finer grain than files, and the dead-code sweep
widens past the engine". The version plan records v1's answer in full:
elements are design regions, files are themes, and every v1 Go file
opened with `// design: <region-id>  implements: <req-ids>`. The debt
is repaid when i7 runs, and not before.

## Swept 2026-08-15, at i12's retro: RESCHEDULED to i7

i7's goal already names this subject in its own words: "The trace sharpens:
finer grain than files, and the dead-code sweep widens past the engine."
Same debt, same words, already planned.

The trigger stands unchanged. What moves is only that the destination is now
recorded, so the next sweep does not have to rediscover it.
