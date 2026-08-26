---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: opt-a-departure-is-a-debt-entry-in-the-register-that-already-exists
type: "[[option]]"
statement: A departure is recorded as a debt in the register this system already keeps, so it inherits a trigger, a repayment and a damage grade instead of inventing them.
cluster: cluster-the-door-regime
found_by: transform
source: SCAMPER Combine, applied to the incumbent widget guard — merge the departure list with the RAID register
---

## Mechanism

No new list. A departure mints an entry of kind `debt` in
`spec/trace/raid/`, and the guard reads that folder.

WHAT IT INHERITS, AND THIS IS THE WHOLE CASE. The debt kind already carries
every field this chart has been trying to add.

- A TRIGGER, which is when it comes back. That is the expiry the external sweep
  said we lack.
- A REPAYMENT SECTION, which is what closing it consists of. That is close to
  the compensating action from aviation, arriving from a second direction.
- A DAMAGE GRADE, so departures sort by what they cost rather than by date.
- A STATUS, so a repaid departure reads as repaid rather than vanishing.

The register's own card already says the thing this record is arguing: debt is
visible or it is lying, and a debt with no trigger is filed and forgotten.

WHAT IT COSTS. The guard reads a folder of nodes rather than one file, which is
slower and needs the corpus reader. It also puts machine-facing entries in a
register a person reads, so the register grows with things nobody wants to
review.

AND ONE THING DOES NOT FIT. A debt is quality traded for speed, consciously. A
departure is sometimes that, and sometimes it is a permanent correct exception
— a diagnostic page the panel will never reach is not debt and never repays.
Forcing it into the debt kind would mean the register lies about what is owed.

SO THE HONEST FORM IS NARROWER. Departures that are debt become debt entries.
Permanent ones stay in a list, and the two are told apart by whether a
repayment can be written.
