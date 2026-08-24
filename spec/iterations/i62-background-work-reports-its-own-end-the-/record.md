---
id: i62-background-work-reports-its-own-end-the-
status: seeded
opened: 2026-08-24T14:33:05.334Z
goal: "Background work reports its own end: the engine pings what it launched, a finished run closes its own entry, and no walk waits on something that is already dead."
vision: "MEASURED 2026-08-24. A test run reached 179 of 179 files with 1,803 cases done, then reported itself as running for nineteen minutes with no process alive on the machine. It held the walk at the repair step, because a leaving judgment reads as still deciding while such an entry stands.\n\nTHAT IS NOT A HUNG PROCESS. It is a finished run whose entry was never closed. The shell child records its exit correctly; the operation that owns it never hears.\n\nTHREE GHOSTS STOOD FOR FIFTEEN HOURS on one occasion, all of them reporting complete.\n\nTHE OWNER'S DESIGN, in their own words: when you start a background process, the engine pings it every so often, and if it does not answer, it kills it. That is a heartbeat rather than an inspection. A stored entry only ever guesses about something that has gone quiet; asking the thing itself does not guess.\n\nWHAT DONE LOOKS LIKE.\n\n- The engine holds the live end of everything it launched and asks, on a fixed interval, whether it is still there.\n- Silence past the interval ends it.\n- A test run closes its own entry when the process behind it exits, so the heartbeat is a backstop rather than the only guard.\n- Nothing waits silently. A wait that nobody is watching carries a duration, and expiry does something rather than nothing.\n- How long a completed task's file is worth keeping is DECIDED, and only then is the clearing built. The pile stood at 598 one morning and 1,245 that afternoon, and every pass over the folder opens all of them.\n\nTWO MORE FAULTS OF THE SAME FAMILY RIDE ALONG.\n\n- TWO ENGINES ON ONE FOLDER AND ONE PORT. Four processes were observed on this machine in two parent-and-child pairs, started 47 seconds apart, carrying identical arguments. What the second does when the bind fails was an open question on 2026-08-24 until a restart that same day took the session down and answered it.\n- RECORDING THAT A HELPER WAS LAUNCHED IS BLOCKED BY WHERE THE WALK STANDS. The call that registers a spawned hand rides one verb, and that verb is not legal in every state, so the registration is refused exactly where a hand was just spawned.\n\nWHY AN UNWATCHED MACHINE IS THE RIGHT HAND FOR IT. This is what an unattended box suffers from worst, and every item here is provable by a test with nobody at a screen.\n\nIT IS DISJOINT FROM ITS SIBLINGS BY CONSTRUCTION. Nothing here reaches the route, the walk's own state, or the prose an agent is served."
inputs:
  - "retro 2026-08-24"
  - "wt-the-engine-keeps-hold-of-everything-it-launches-and-asks-eac"
  - "wt-a-test-run-closes-its-own-entry-when-the-process-behind-it-e"
  - "wt-how-long-a-completed-task-s-file-is-worth-keeping-gets-decid"
  - "wt-one-engine-holds-a-given-folder-and-its-network-port-or-the-"
  - "wt-recording-that-a-helper-was-launched-works-from-anywhere-ins"
depends_on: []
---

# i62-background-work-reports-its-own-end-the-

## Goal

Background work reports its own end: the engine pings what it launched, a finished run closes its own entry, and no walk waits on something that is already dead.

## Rough vision

MEASURED 2026-08-24. A test run reached 179 of 179 files with 1,803 cases done, then reported itself as running for nineteen minutes with no process alive on the machine. It held the walk at the repair step, because a leaving judgment reads as still deciding while such an entry stands.

THAT IS NOT A HUNG PROCESS. It is a finished run whose entry was never closed. The shell child records its exit correctly; the operation that owns it never hears.

THREE GHOSTS STOOD FOR FIFTEEN HOURS on one occasion, all of them reporting complete.

THE OWNER'S DESIGN, in their own words: when you start a background process, the engine pings it every so often, and if it does not answer, it kills it. That is a heartbeat rather than an inspection. A stored entry only ever guesses about something that has gone quiet; asking the thing itself does not guess.

WHAT DONE LOOKS LIKE.

- The engine holds the live end of everything it launched and asks, on a fixed interval, whether it is still there.
- Silence past the interval ends it.
- A test run closes its own entry when the process behind it exits, so the heartbeat is a backstop rather than the only guard.
- Nothing waits silently. A wait that nobody is watching carries a duration, and expiry does something rather than nothing.
- How long a completed task's file is worth keeping is DECIDED, and only then is the clearing built. The pile stood at 598 one morning and 1,245 that afternoon, and every pass over the folder opens all of them.

TWO MORE FAULTS OF THE SAME FAMILY RIDE ALONG.

- TWO ENGINES ON ONE FOLDER AND ONE PORT. Four processes were observed on this machine in two parent-and-child pairs, started 47 seconds apart, carrying identical arguments. What the second does when the bind fails was an open question on 2026-08-24 until a restart that same day took the session down and answered it.
- RECORDING THAT A HELPER WAS LAUNCHED IS BLOCKED BY WHERE THE WALK STANDS. The call that registers a spawned hand rides one verb, and that verb is not legal in every state, so the registration is refused exactly where a hand was just spawned.

WHY AN UNWATCHED MACHINE IS THE RIGHT HAND FOR IT. This is what an unattended box suffers from worst, and every item here is provable by a test with nobody at a screen.

IT IS DISJOINT FROM ITS SIBLINGS BY CONSTRUCTION. Nothing here reaches the route, the walk's own state, or the prose an agent is served.

## Inputs

- retro 2026-08-24
- wt-the-engine-keeps-hold-of-everything-it-launches-and-asks-eac
- wt-a-test-run-closes-its-own-entry-when-the-process-behind-it-e
- wt-how-long-a-completed-task-s-file-is-worth-keeping-gets-decid
- wt-one-engine-holds-a-given-folder-and-its-network-port-or-the-
- wt-recording-that-a-helper-was-launched-works-from-anywhere-ins
