---
form: find_analogy
by: agent
signed_off: 2026-08-15T16:49:27.199Z
authors: agent
files:
---

# Evidence form / find_analogy

## current_situation

M4's divergence, the analogy finder. Five clusters abstracted one level up, and the domains that already face each abstract problem named rather than three of them picked.

ONE TRANSFER LANDED HARD. The abstract problem under the-record-life is handing out a resource so two holders never take the same one and taking it back when they stop, and distributed coordination has a named answer for the part we could not close.

## applies

yes

## abstractions

| cluster | abstract_problem | domains |
| --- | --- | --- |
| the-record-life | handing out a limited thing so two takers never get the same one, and getting it back when a taker stops | distributed coordination, library lending, hotel keys, car rental, parking enforcement, air traffic slot allocation, territorial animals marking and abandoning ranges, immune clonal selection where a responding cell claims a target |
| the-bootstrap | turning an unprepared place into a working one with a single instruction and nobody present | disaster logistics and field hospitals, franchise openings, spacecraft deployment sequences, seed germination, ant colony founding, container orchestration |
| the-account | keeping a record complete enough that somebody can reconstruct WHY long after everybody has forgotten | double-entry accounting, aviation flight recorders, medical charting, legal chain of custody, laboratory notebooks, version control itself |
| the-walk | carrying somebody through a procedure they must not skip steps in, whatever the pressure | aviation checklists, surgical time-outs, nuclear plant operating procedures, air traffic handoff protocol, pharmacy dispensing checks |
| the-holding-pen | capturing an interruption without losing the thread you were on | air traffic holding patterns, emergency-room triage, kanban parking lots, interrupt handling in operating systems, a surgeon's scrub nurse holding an instrument |

## options

- [[opt-a-claim-is-a-lease-not-a-lock]]

## follow_up

- THE LEASE TRANSFER ANSWERS A HOLE THE M1 GATE COULD NOT CLOSE. [[raid-a-crashed-walk-leaves-a-folder-that-means-nothing]] asked what removes a folder when the walk dies, and the answer from coordination services is that nothing removes it — the claim lapses and the folder lapses with it.
- IT REOPENS AN OWNER RULING and says so. An abandoned claim is released by a person's judgment today, never by a timeout, and this option cannot be taken without that being revisited.
- FENCING DID NOT NEED TO TRANSFER. That literature's sharpest point is that a lease alone does not stop a paused holder writing, and git already refuses a non-fast-forward push, so the stale writer is rejected by a mechanism we have.
- FOUR CLUSTERS PRODUCED NO TRANSFER, and the domains are listed anyway so the next reader can see what was considered rather than guessing what was skipped.
- two finders remain in the fan
- nothing is parked from this state

## anything_else

### The transfer, in the source domain's own terms first

CLASSIC LOCKING ASSUMES three things that hold on one machine and not across several: that the holder can always release the lock, that everybody observes the release, and that time does not jump.

A LEASE IS A TIME-BOUNDED LOCK. The holder renews it while it works, and a crashed or partitioned holder simply stops renewing, so after the timeout the service grants it elsewhere. The renewal interval sits well inside the duration so a couple of missed renewals are survivable.

THE INVERSION IS THE MECHANISM: the cost moves from the system detecting that a holder is dead to the holder proving it is alive.

### What it looks like here

OUR CLAIM IS A LOCK. It is written when a machine enters and released by a person's judgment. Nothing expires it, which is exactly why a crashed walk leaves an iteration held by a machine that no longer exists.

A LEASE MAKES THAT ENDING ORDINARY rather than exceptional, which matters most for the case this whole iteration is about: an ephemeral cloud host whose normal ending is being switched off.

### What deliberately did not survive

A TRANSFER WITH NO LOSSES WAS NOT A TRANSFER, so the losses are named.

- FENCING TOKENS did not transfer, because git's non-fast-forward refusal already rejects the stale writer.
- AUTOMATIC RECLAMATION AS THE ONLY PATH did not transfer, because the owner ruled that a person releases an abandoned claim. The option carries that as a reopened decision rather than pretending it is settled.
- THE CLOCK ASSUMPTION came with it and is a cost, not a benefit. The same literature is emphatic that time jumps.

### Domains named but not described

HONESTLY ADMITTED rather than written up: immune clonal selection, ant colony founding and territorial marking were named because they genuinely face the abstract problems, and none of them was read closely enough to describe its mechanism without guessing. An admitted gap beats a confident paragraph about a field nobody here knows.
