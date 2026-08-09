---
id: cand-signalled-line
type: "[[candidate]]"
name: "Signalled line"
statement: "a token per section, one queue to land through"
picks:
  - "[[opt-token-block-with-staff-and-ticket]]"
  - "[[opt-decision-trace-schema]]"
  - "[[opt-serialised-merge-queue]]"
  - "[[opt-idempotent-scaffold-with-drift-detection]]"
  - "[[opt-triage-queue-in-front]]"
---

## Why this one

This is the safety candidate. It takes railway signalling seriously and
applies the same discipline to the record and to the inbox.

A section of the walk is entered only while holding its token. Every decision
event writes one fixed evidence record. Branches land through a single
first-in-first-out queue. Strays sit in a triage queue until somebody rules
them work.

What it trades away is throughput and lightness. A queue serialises what could
run at once. Ceremony that is right for a large change is overhead on a
one-line fix, and the method already warns that a per-fix record is a failure
mode.

It is drawn because two failures this iteration were concurrency failures. A
join lost its fuel when a branch was re-walked. Trunk and a record's worktree
diverged with nothing arbitrating between them. A token discipline is the
named answer to both.

## How it works

The baseline stays. What changes is that every shared thing acquires an owner
for the time it is being used, and nothing proceeds without holding one.

THE FIRST SEAM IS BETWEEN THE TOKEN AND THE EVIDENCE RECORD. A section of the
walk is entered only while holding its token, and the decision record written
on the way out names the token that was held. So the account is not a
separate discipline bolted on — it is what the token hands back when it is
released.

THE TICKET IS THE PART THAT MAKES IT USABLE. A token that must be held for a
whole branch would serialise work that has no reason to be serial. A written
ticket, issued against a held token, lets several walkers follow one another
through the same section in a known order. That is what the railway does, and
it is the difference between safety and gridlock.

THE SECOND SEAM IS THE LANDING QUEUE. Every branch lands through one
first-in-first-out queue, with conflicts resolved in tiers by how much
judgment they need. The queue is the token discipline applied to trunk: trunk
is a section, and only the branch at the head holds it.

THE THIRD SEAM IS THE INBOX. A stray sits in a triage queue in front of the
backlog, so nothing becomes work without somebody ruling it work. Same shape
again: arrival is not admission.

WHAT THE COMBINATION MAKES POSSIBLE. Every concurrent hazard in the system
gets ONE mechanism instead of three. The scaffold is idempotent, so re-running
it against a live tree reports drift rather than overwriting — which is the
same promise the queue makes about trunk.

## What it costs

RESOURCE, ROUGH. A token registry and a queue are small: a file per section
naming its holder, and an ordered list. Neither is a service and neither needs
a daemon.

THE WORST CASE THAT DECIDES VIABILITY is queue latency with one worker. Every
land waits for the one ahead. Today the system has a single agent and a single
owner, so the queue is almost always empty and the cost is near zero. At more
than a handful of concurrent records it becomes the bottleneck, and NO
MEASUREMENT EXISTS for where that turns.

MAKE, REUSE OR BUY. The merge queue is well-trodden and can be reused in
shape. The token discipline is BUILT here — nothing off the shelf models a
walk's sections.

THE FAILURE MODE THAT DECIDES. Ceremony on small work. The method already
rules that a per-fix record is a failure, and a token plus a ticket plus a
queue position for a one-line change is that failure wearing safety's clothes.

## What it leans on

- CONCURRENCY IS THE REAL PROBLEM HERE. Two failures on 2026-08-09 were
  concurrency failures, which is evidence but not proof that the pattern
  holds.
- SECTIONS CAN BE NAMED AHEAD OF TIME. A token needs a section to guard. If
  the hazardous regions turn out to be discovered rather than declared, the
  discipline has nothing to hold.
- ONE QUEUE IS ENOUGH. True while the number of concurrent records stays
  small, and untested above that.
- A DECISION EVENT HAS A FIXED MINIMUM RECORD. The schema has to be settled
  once and hold across every kind of decision, or it fragments into per-kind
  schemas and stops being one thing.
