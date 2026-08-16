---
minted_in: i27
id: req-a-shipped-record-is-never-reclaimed
type: "[[requirement]]"
statement: When a record has shipped, the engine shall refuse entry to it, from every machine including the one that shipped it.
kind: functional
verify_method: test
breaks_if_removed: A finished record reads as available work, so an agent walks a record whose evidence already stands signed.
breaks_how_badly: crippling
refines:
  - uc-close-a-record
source_refs:
  - uc-close-a-record
  - "owner ruling 2026-08-13: there is not going to be another i8"
  - "observed 2026-08-13: two shipped records stood in the ledger reading as live claims"
  - req-a-records-own-status-decides-whether-it-is-open
priority: must
---

## Detail

THE RECORD'S OWN STATUS IS WHAT CLOSES THE DOOR. `itFind` refuses a record
that is not open, and open comes from the status field rather than from
anything on disk ([[req-a-records-own-status-decides-whether-it-is-open]]).

INCLUDING THE MACHINE THAT SHIPPED IT, which is the half worth stating. The
machine that just finished the work is the one most likely to re-enter, and it
would land in a record whose evidence already stands signed.

## What i34 rewrote here, and why the demand survived it

THE STATEMENT NAMED A MECHANISM THAT IS GONE: "mark its claim spent in the
ledger". The machine-locking specification was retired whole on 2026-08-16.

THIS ROW'S OWN REASONING ARGUED FOR THAT MECHANISM, and the argument is worth
keeping because i34 removed its premise. It read: "The record's own status says
shipped already, and it says so on a branch nobody fetches by default. THE
LEDGER IS THE ONE FILE EVERY MACHINE READS BEFORE IT ENTERS ANYTHING."

THE PREMISE WAS THE BRANCH. A record lived on a branch nobody fetched, so its
status could not reach a peer and a separate ledger had to. A record is a
folder on trunk now, so a clone that has trunk has the status, and the reason
for the second file is gone with the first problem.

WHAT WAS LOST WITH THE LEDGER, stated rather than glossed: a release and a
completion were different acts, and only the ledger could tell a peer which had
happened. Nothing distinguishes them now, because nothing hands a record back.

## Behaviour

NO MODEL IS DRAWN, and that is a change. This row carried a four-state claim
model — unclaimed, claimed, released, done — and it described the ledger rather
than the record. A record has two states this row cares about, open and
shipped, and one transition, which the statement says in a sentence.
