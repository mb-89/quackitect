---
unreachable_refs:
  - cand-the-program-route
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-dec-an-override-merges-key-by-key
type: "[[raid]]"
kind: decision
statement: An override states only the keys it changes and the machine merges them into the received artifact, rather than replacing the whole artifact or calling through to what it replaced.
owner: the driving agent
status: decided
breaks_how_badly: crippling
how_likely: plausible
impact: The grain decides what a copy can change and what it silently stops receiving. Whole-file replacement means overriding one line costs the whole file forever, so every later upstream improvement to its untouched parts never arrives.
source_refs:
  - req-overlay-resolution
  - req-overlay-survives-update
  - opt-the-override-merges-into-what-it-changes
  - cand-the-program-route
---

## The choice

THE OVERRIDE IS A PARTIAL DOCUMENT. It names some keys and says nothing about
the rest, and resolution walks both structures together taking the override's
value wherever it has one.

AND IT NEEDS NO EXTENSION POINT NAMED IN ADVANCE. Nothing was replaced, so
nothing has to be reachable from the replacement.

## Why not the two obvious alternatives

WHOLE-ARTIFACT REPLACEMENT IS THE UNIVERSAL ONE and that is its whole argument:
it works on any file at all, needs nothing from upstream, and is why it is
everywhere. It is also why a copy that overrides one line owns the entire file
from then on, and every later upstream improvement to its untouched parts stops
arriving. That cost is paid silently and forever.

CALL-THROUGH REQUIRES UPSTREAM TO HAVE NAMED THE PARTS. The override reaches
only what the base author chose to expose, so a copy cannot override a part
nobody named. That puts a decision about grain in the hands of somebody who does
not know what the copy needs.

## Rejected options

THE OVERRIDE REPLACES THE WHOLE ARTIFACT. REJECTED on the silent-inheritance
cost above. Three vendoring systems in the survey document that consequence in
their own words, so it is not a theoretical objection.

THE OVERRIDE CALLS THROUGH TO WHAT IT REPLACED. REJECTED because it moves the
grain decision upstream. It is the runner-up's pick and it is genuinely better
in one place: a copy can reach the original from inside the override, which
merging cannot express.

## Consequences

IT ONLY WORKS ON ARTIFACTS WITH STRUCTURE, and this is the sharp cost. Three of
the four systems the survey read fall back to whole-file replacement for prose
and templates, which is most of what this product's method actually consists of.

SO A FALLBACK IS OWED AND IS NOT YET DESIGNED. Frontmatter merges key by key.
Prose sections do not, and something has to say what happens there. That is
build work and it is named here rather than discovered later.

AND THE HONEST RESOLUTION MAY BE BOTH. Merge structured keys, call through for
prose. Both mechanisms are already in the corpus, neither contradicts
identity-keyed matching, and the cost is two resolution paths plus a rule
saying which applies — which is exactly the kind of complexity
[[req-a-wrong-act-never-passes-silently]] bites on.
