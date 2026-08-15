---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: opt-a-claim-is-a-lease-not-a-lock
type: "[[option]]"
statement: A claim carries an expiry and the holding machine renews it while it works, so a machine that dies stops holding its iteration without anybody deciding it has died.
cluster: the-record-life
found_by: analogy
source: "distributed systems: the lease pattern, transferred from coordination services to the claim ledger"
---

## Mechanism

THE HOLDER PROVES IT IS ALIVE, rather than the system detecting that it is
dead. That inversion is the whole transfer.

- A claim is written with a duration rather than as an open-ended marker.
- The walking machine renews it periodically while it holds the iteration.
- A claim nobody renews expires, and the iteration returns to the pool.
- The renewal interval sits well inside the duration, so several missed
  renewals are survivable before anything is reclaimed.

## The domain it came from

DISTRIBUTED COORDINATION SERVICES. The mechanism in its own terms: classic
locking assumes the holder can always release the lock, that everybody
observes the release, and that time does not jump. None of those hold across
machines. A lease is a time-bounded lock, and when a holder crashes or is
partitioned it simply stops renewing, so the service is free to grant it
elsewhere after the timeout.

THE SENTENCE WORTH KEEPING, from that literature: a lease does not make
failure disappear, it makes failure survivable.

## What it answers here

THE HOLE THE M1 GATE FOUND AND COULD NOT CLOSE.
[[raid-a-crashed-walk-leaves-a-folder-that-means-nothing]] says the rule "a
folder means somebody is working it right now" holds only while every walk
ends through the close, and that on an ephemeral host a stopped container is
the expected ending rather than the exceptional one.

A LEASE MAKES THAT ENDING ORDINARY. Nothing has to notice the crash. The claim
lapses on its own, and whatever the folder's existence hangs off lapses with
it.

## What survived the translation, and what did not

SURVIVED: the inversion of who proves what, the duration-plus-renewal shape,
and the acceptance that a lapsed holder may be alive but unreachable.

DID NOT SURVIVE: fencing tokens. That literature's sharpest point is that a
lease alone does not stop a paused holder waking up and writing, so a
monotonic token must accompany every write. Our writes land on a branch and
git refuses a non-fast-forward push, so the remote already rejects the stale
writer. The fencing problem is answered by a mechanism we have rather than by
one we would add.

DELIBERATELY DID NOT SURVIVE: automatic reclamation as the only path. The
owner ruled that an abandoned claim is released by a person's judgment, never
by a timeout. A lease reopens that ruling, and this option cannot be taken
without the owner revisiting it.

## What it costs

A CLOCK BECOMES LOAD-BEARING. Lease expiry depends on time comparisons across
machines, and the same literature is emphatic that time jumps.

AND IT FIGHTS THE OFFLINE RULING, partially. A machine working offline cannot
renew, so its lease lapses and another machine may take the iteration. That is
the desync the owner already accepted knowingly, so it is a cost that was
priced rather than a new one — but it becomes automatic rather than rare.

## Sources

- https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
- https://engineersmeetai.substack.com/p/why-distributed-systems-prefer-leases
- https://singhajit.com/distributed-systems/lease/
- https://hackernoon.com/the-fencing-gap-why-your-distributed-lock-isnt-safe-and-how-to-fix-it
