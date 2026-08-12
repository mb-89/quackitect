---
id: i12-performance-hold-the-one-second-rule-on-
status: seeded
opened: 2026-08-12T19:41:19.492Z
goal: "Performance: hold the one-second rule on the surfaces that break it, paginate the pull instead of overflowing it, and kill the cubic comparison walk."
vision: "DONE LOOKS LIKE: opening the state machine answers inside a second, opening an evidence form from a note does too, a pull never hands back a payload a host has to move to disk, and the survey's window governs every list it prints.\n\nMEASURE FIRST, FIX SECOND. Nobody has profiled the machine page. A retro noted that the container-green derivation added recordDone calls per paint, so that is the first suspect to measure rather than the first thing to change.\n\nTHE NAMED ITEMS. Opening the state machine takes more than a second against the standing rule. Opening an evidence form from a note breaks it too, and preloading is sanctioned. The comparison walk closes transitively at O(n cubed) on every single call. se_survey with detail full measured 244KB and the backlog list ignored its window. A pull once returned seven thousand lines, and pulls have been persisted to disk at 240KB.\n\nTHE RULING THAT BINDS THE PULL: it never overflows, it PAGINATES.\n\nTHE SURFACE HALF: any operation past one second goes non-blocking with a toast, and a progress bar where one is possible. The engine half of that rule already exists as req-call-answers-in-one-second; this is its other side.\n\nIF THE BATTERY IS TOUCHED, take v1's shape. Progress, batch and concurrency all live INSIDE the guarded write path: a bounded worker pool whose results flow through the SAME verdict-write guard, so there is ONE serialization point and no second write path. Concurrency caps at spare cores and only order-independent tests qualify. v1 chose that over thinning the test set.\n\nONE MEASUREMENT WE ALREADY HAVE: refs.test.ts cost 99 seconds of a 508-second battery. Splitting one file by theme is the only unit that reaches a second core.\n\nFULL CONTEXT: project/spec/version-planning.md, section i12."
inputs:
  - "project/spec/version-planning.md"
  - "req-call-answers-in-one-second"
---

# i12-performance-hold-the-one-second-rule-on-

## Goal

Performance: hold the one-second rule on the surfaces that break it, paginate the pull instead of overflowing it, and kill the cubic comparison walk.

## Rough vision

DONE LOOKS LIKE: opening the state machine answers inside a second, opening an evidence form from a note does too, a pull never hands back a payload a host has to move to disk, and the survey's window governs every list it prints.

MEASURE FIRST, FIX SECOND. Nobody has profiled the machine page. A retro noted that the container-green derivation added recordDone calls per paint, so that is the first suspect to measure rather than the first thing to change.

THE NAMED ITEMS. Opening the state machine takes more than a second against the standing rule. Opening an evidence form from a note breaks it too, and preloading is sanctioned. The comparison walk closes transitively at O(n cubed) on every single call. se_survey with detail full measured 244KB and the backlog list ignored its window. A pull once returned seven thousand lines, and pulls have been persisted to disk at 240KB.

THE RULING THAT BINDS THE PULL: it never overflows, it PAGINATES.

THE SURFACE HALF: any operation past one second goes non-blocking with a toast, and a progress bar where one is possible. The engine half of that rule already exists as req-call-answers-in-one-second; this is its other side.

IF THE BATTERY IS TOUCHED, take v1's shape. Progress, batch and concurrency all live INSIDE the guarded write path: a bounded worker pool whose results flow through the SAME verdict-write guard, so there is ONE serialization point and no second write path. Concurrency caps at spare cores and only order-independent tests qualify. v1 chose that over thinning the test set.

ONE MEASUREMENT WE ALREADY HAVE: refs.test.ts cost 99 seconds of a 508-second battery. Splitting one file by theme is the only unit that reaches a second core.

FULL CONTEXT: project/spec/version-planning.md, section i12.

## Inputs

- project/spec/version-planning.md
- req-call-answers-in-one-second
