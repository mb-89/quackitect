---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-asm-an-entry-status-says-whether-it-is-open
type: "[[raid]]"
kind: assumption
statement: A register entry's status field says whether it is open, so the owed-item guard and the close can both read it and agree.
owner: the driving agent
trigger: decompose-structure, or any close that passes with an owed item pointing at an entry somebody considers closed
probe: "HALF SETTLED 2026-08-16, at i6's verification, and the trigger fired exactly as written. The guard read `status === open` while its own comment named three dead statuses, so it refused `accepted`, `probed`, `mitigated` and `deferred` — every one an entry with an owner and a trigger. The eight values are now ruled: closed, decided and superseded are settled and carry nothing; the other five are live and carry a claim. engine/stateform.ts implements that list and tests/owed-ref.test.ts drives all eight. THE CLOSE-SIDE HALF IS STILL UNSETTLEABLE for the reason first recorded here: searching the engine for a loose-end computation returns nothing, while req-close-refuses-loose-ends is a must graded fatal. One reader now has a ruled list; the other does not exist, so the two cannot be compared."
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

## What the probe found, 2026-08-16

THE TRIGGER FIRED AS WRITTEN. An owed item pointed at an entry the guard
read as not-open and a reader would read as live: two cloud
demonstrations naming an ACCEPTED debt entry as the reason they cannot
be observed.

THE ENTRY'S OWN PREDICTION WAS RIGHT. This row said the interesting
cases are `accepted` and `deferred`, and `accepted` is the one that bit.

THE CODE DISAGREED WITH ITS OWN COMMENT, which is why it survived. The
comment named the dead set — closed, decided, missing — and the code
tested for `open`. A reader checking either one alone would have found
nothing wrong.

AND THE CORPUS DISAGREED WITH ITSELF, which is why nobody hit it sooner.
Two debt entries in the same situation carry different statuses:
`raid-debt-human-observed-demonstrations` is `open` and was accepted,
re-accepted at i12's retro; the cloud one is `accepted`. Only the first
ever worked, so the narrow rule looked right for as long as nobody used
the other.

## The ruling

SETTLED, AND CARRIES NOTHING: closed, decided, superseded. Each means
there is nobody left holding the claim.

LIVE, AND CARRIES A CLAIM: open, probed, mitigated, accepted, deferred.
Each has an owner and a trigger, which is the reason the guard demands a
reference at all.

ACCEPTED IS THE STRONGEST CARRIER, not the weakest. Somebody looked at
it and decided to ship anyway, on the record. Refusing it forced the
choice between a fabricated tick and a stall.

## Why this stays open

THE SECOND HALF IS UNCHANGED. The close-side reader does not exist, so
the comparison this row was written to make still cannot be made. The
trigger stands.
