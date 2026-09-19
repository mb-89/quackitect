---
kind: [[rationale]]
explains: [[spec/guidance/code/refactoring]]
---

# Why

A warning stands where a rule names a line and the door lets the write through.
Nobody owns that line afterwards, so the count climbs and the push door holds
every push once a file it carries stands at warning.

## 1. Why a second hand

The session holding a ticket has its own work. A warning on a file that ticket
leaves alone costs that session a read, a fix and a commit. It buys the ticket
nothing. So the stop door starts a second hand. That hand takes one file, and
leaves the branch to the session.

## 2. Why one file

Two hands writing one branch race. One file a hand bounds that race to a file
the session stands outside. The window keeps the hand off what a write touched
lately.

## 3. Why its own note

The rules here reach that hand alone. A working session reading them weighs a
refactoring pass against the ticket in its hand. That is the trade this design
takes off the session.
