---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-risk-i15-query-toil-outweighs-savings
type: "[[raid]]"
kind: risk
statement: i15 charges real build toil now — two new lane verbs, a subset extension, a corpus-wide resolver rewrite — against vp-rigor-without-toil, whose whole point is removing toil; if later walks keep hand-searching instead of querying, the toil was paid without the saving landing.
owner: the driving agent
trigger: the next retro able to compare se_file_search/se_file_glob call share before and after the query verb ships, or the owner's own report that hand search is still the default habit
status: open
breaks_how_badly: abrasive
how_likely: plausible
impact: the iteration's own build cost outweighs what it saves downstream, and vp-rigor-without-toil's falling-se_run metric does not move — the same metric i11 already tracks.
source_refs:
  - i15-the-database-our-own-reader-over-obsidia
  - vp-rigor-without-toil
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

## Where this was noticed

Named openly in draft-vision's goal_system: "building the query layer
costs toil now, against a vision whose whole point is removing toil."
gate-kickoff already priced the now-cost as major; this entry tracks
whether the later-saving actually shows up.

## What would settle it

Compare the se_file_search/se_file_glob share of lane calls in the
retro window before i15 ships against a window of comparable size
after the query verb and its documentation are in guidance. A share
that does not fall despite the new verb existing means the toil was
paid without the saving landing, and the tool's discoverability —
not its existence — is the gap.
