---
id: responsiveness
scope: always
statement: Fast tooling. Every interaction gives feedback within 1 second; long tasks report progress every minute; the more interactive, the more it should overachieve.
---
## Guide (load on demand)
Fast tooling is a design goal. It binds quackitect itself AND the output it produces (the report, and anything a vehicle ships).

Reference machine: a 2025 mid-range laptop.

- Every user interaction produces visible feedback within **1 second**. If the work takes longer, emit an acknowledgement first, within that second (for example "started computing…").
- A long-running task reports progress **at least once per minute**.
- The more frequent and interactive an interaction is, the more it should **overachieve** this bound — beat it by as much as is free.
- Apply this only where it needs no major architecture rework and degrades no other design goal. Responsiveness is a goal, not a licence to break the others.
