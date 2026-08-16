---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-asm-an-entry-status-says-whether-it-is-open
type: "[[raid]]"
kind: assumption
statement: A register entry's status field says whether it is open, so the owed-item guard and the close can both read it and agree.
owner: the driving agent
trigger: decompose-structure, or any close that passes with an owed item pointing at an entry somebody considers closed
probe: "unprobed, and the reason is itself a finding. The check was to compare what the close reads against what the owed-item guard would read. There is no close-side reader to compare against — searching the engine for a loose-end computation returns nothing, while req-close-refuses-loose-ends is a must graded fatal whose Detail says the engine shall refuse while any finding stands unruled. The assumption cannot be settled against a reader that is not there."
probed: 2026-08-16
status: open
impact: an owed item points at an entry the guard reads as open and a reader reads as done, so the close passes on a defect nobody accepted.
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - req-a-harmless-finding-names-an-open-entry
  - req-close-refuses-loose-ends
  - req-a-records-own-status-decides-whether-it-is-open
  - raid-risk-an-owed-item-without-a-guard-ships-a-known-defect
---

## The assumption

BOTH ENDS OF THE BUCKET READ THE SAME FIELD. The submit guard refuses an owed
item unless its entry is open. The close refuses while any owed item stands.
Both depend on `status` meaning one thing.

THE REGISTER'S OWN TEMPLATE ALLOWS EIGHT VALUES: open, probed, mitigated,
accepted, deferred, closed, decided, superseded. Only two of those are
obviously "not open", and `accepted` and `deferred` are exactly the states a
carried finding would drift into.

## Probe

READ THE EIGHT STATUS VALUES AND RULE WHICH COUNT AS OPEN for this guard, then
check that the close and the submit use the same list. One reading and one
comparison.

THE INTERESTING CASES ARE `accepted` AND `deferred`. An owed item pointing at
an accepted entry has arguably been dispositioned already — which would make
the close's refusal wrong. An owed item pointing at a deferred one has been
pushed to a later record, which is a different thing again.

## Why this is not paranoia

THE SAME ASSUMPTION FAILED IN i34, one level up. Six sites decided whether a
RECORD was open, and every one asked the filesystem instead of the record's
status field. i28 carried `status: shipped` with its directory still standing;
the survey left it out and the container kept it in. Two readers, one thing,
opposite answers, and nothing said they disagreed.

req-a-records-own-status-decides-whether-it-is-open was i34's answer for
records. This entry asks whether the same discipline holds for register
entries, before two readers are built on it rather than after.
