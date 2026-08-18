---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-record-names-method-and-revision-and-travels-with-the-copy
type: "[[option]]"
cluster: the-bootstrap
question: how a copy's own changes are represented
statement: the copy carries a record naming, per upstream change, which one it was, at which revision, by what method it was satisfied, and when the next action falls due
found_by: analogy
source: 14 CFR 91.417(a)(2)(v) and 91.417(b)(2), read at ecfr.gov — the aircraft maintenance record, which lives on the airframe and transfers with it on sale
---

## Mechanism

FOUR FIELDS PER ENTRY, and each earns its place.

- WHICH directive, by number.
- AT WHICH REVISION, by date.
- THE METHOD OF COMPLIANCE — what was actually done, not that something was.
- WHEN THE NEXT ACTION IS DUE, where the obligation recurs.

WHERE IT LIVES IS THE OTHER HALF. §91.417(b)(2) requires the record to be
retained and transferred with the aircraft when it is sold. It is a property of
the unit, not a row in the manufacturer's database.

AND MODIFICATIONS SIT BESIDE IT. §91.417(a)(2)(vi) keeps the major-alteration
forms on the same permanent record. Whoever next works on the aircraft reads the
compliance list and the alteration list side by side, and that adjacency is the
design rather than an accident of filing.

## What transfers

NAMING THE METHOD IS WHAT MAKES THE RECORD USEFUL LATER. "Done" cannot be
re-examined. "Satisfied by this alternative, for this reason" can be checked
against a changed upstream, and can be found by the next copy with the same
problem.

NAMING THE REVISION IS WHAT MAKES A RE-ISSUE TRACTABLE. When upstream reissues
a fix, the record says which version was actually performed, so the difference
between them is computable. A record saying only "applied" cannot answer that.

THE NEXT-DUE FIELD MAKES A RECURRING OBLIGATION SELF-ANNOUNCING rather than
depending on somebody remembering. This iteration has no recurring obligations
yet, and it is the field most likely to be dropped as unnecessary and most
likely to be wanted later.

AND IT TRAVELS. A copy handed to a colleague carries its own history of what it
took and how. Nothing needs to be reachable, which is the property this
product's isolation rule demands and every registry-based mechanism fails.

## What breaks in translation

THERE IS NO LICENSED SIGNER. §43.9 requires the signature, certificate number
and kind of certificate of the person approving the work, and §43.7 restricts
who may sign at all. The record has force because a licensed individual staked a
credential on it. Software has no licensing body, so an entry is self-attested,
and far more often filled in optimistically than forged.

THE HONEST SUBSTITUTE IS DIFFERENT IN KIND. Make the method of compliance
MACHINE-CHECKABLE, so the tool re-verifies rather than trusting an attestation.
That is arguably stronger than a signature — and it narrows the mechanism to
changes whose satisfaction a program can decide, which the interesting ones
frequently are not.

THE RETENTION PERIODS DO NOT CARRY. Medical device correction records are kept
two years beyond the device's expected life. Aircraft records outlive several
owners. A copy of this product may be abandoned inside a year, so the concept of
retention survives and the durations do not.

## How it differs from what already stands on this cell

[[opt-a-mirror-beside-an-overlay]] AND [[opt-the-copys-changes-are-a-declared-patch-series]]
BOTH RECORD WHAT THE COPY CHANGED. Neither records what the copy RECEIVED, or
at which version, or how it satisfied it.

THOSE ARE TWO DIFFERENT LEDGERS AND BOTH ARE NEEDED. One says what is mine. The
other says what arrived and what I did with it. A copy holding only the first
cannot answer whether it ever took a given fix.
