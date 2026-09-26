---
kind: [[rationale]]
---

# Why

The owner decided this for the model, and the decision is final. Every process,
door and provider held a lease its own work loop renewed, and a watchdog acted
on an expired one. An agent reads this note before it asks again.

## 1. What it bought

A part that stopped read as stopped. A heartbeat off a timer beside a hung loop
read as alive, so the lease came off the work loop. A stale mark on every name
of an expired provider told a reader not to trust the value.

## 2. What it gave up

Every part carried the renewal, and a slow run near its deadline risked a
restart it did not need. Every name and action declared a deadline, or took its
kind's default.

## 3. What would make it wrong

Deadlines set so tight that the restarts outnumbered the hangs they caught. The
alarms then trained a reader to ignore them, and the fix was the deadlines and
not the leases.
