---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-asm-an-entry-status-says-whether-it-is-open
type: "[[raid]]"
kind: assumption
statement: A register entry's status field says whether it is open, so the owed-item guard and the close can both read it and agree.
owner: the driving agent
trigger: decompose-structure, or any close that passes with an owed item pointing at an entry somebody considers closed
probe: "holds. worktree.ts now carries the close-side reader (req-close-refuses-loose-ends, built i11): DISPOSED = {closed, superseded, mitigated, decided, accepted, deferred}, and the close blocks while a ref is NOT in that set. The form-side guard (openRaidRef, stateform.ts) accepts only literal status===\"open\" as a valid owed-item target. The two lists differ, but they compose safely: every ref the form lets an owed line point at (status open) is also a ref the close still blocks on, so no owed item can be filed against something the close would then silently treat as resolved. The interesting cases named below, accepted and deferred, ARE in DISPOSED, so an owed item pointing at either is correctly read as already dispositioned. One narrow asymmetry: status probed blocks the close (not in DISPOSED) but cannot be the target of a NEW owed line at submit (form-side only accepts open) — that fails toward over-strictness, not toward the silent-pass this entry was written to catch."
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
