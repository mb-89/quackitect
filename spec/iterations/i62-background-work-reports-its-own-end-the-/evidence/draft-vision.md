---
form: draft-vision
by: agent
signed_off: 2026-08-24T15:47:27.889Z
authors: agent
files: null
---

# Evidence form / draft-vision

## current_situation

Iteration 62 is sized. The kickoff blessed minor, and the machine below compiled at that column.

THE RESIDENT VISION IS A FILE and it is inherited, not re-derived. It is spec/trace/value-prop/vp-the-engine.md, minted at i2: an engineer draws their own process as a state machine and the engine gives it teeth.

AT MINOR, THREE OF THIS STATE'S FOUR QUESTIONS ARE DROPPED MECHANICALLY. A minor cannot move the big idea, the to-be world or the pitch, so only the goal system is asked.

THIS RECORD IS THE SECOND HALF OF i51. That record built the report: work out of sight says it exists and how much longer it needs. This one makes the entry close itself, so the report stops describing processes that are already dead.

## goal_system

1. THE ENGINE HOLDS THE LIVE END OF WHAT IT LAUNCHED and asks it, on a fixed interval, whether it is still there.

2. SILENCE PAST THE INTERVAL ENDS THE PROCESS and closes its entry.

3. A RUN CLOSES ITS OWN ENTRY when the process behind it exits, so the heartbeat is a backstop rather than the only guard.

4. NO WAIT IS SILENT. A wait carries a duration, and expiry does something rather than nothing.

5. RETENTION IS DECIDED BEFORE CLEARING IS BUILT. How long a completed task's file is worth keeping is a ruling, and the sweep that acts on it is separate work.

6. ONE ENGINE HOLDS A GIVEN FOLDER AND ITS PORT, and a second that cannot bind says so instead of running half-alive.

7. REGISTERING A SPAWNED HAND WORKS FROM ANYWHERE INSIDE A RECORD.

CONFLICT ONE: ending a ghost against never ending a working process. A heartbeat that kills on silence will eventually meet a process that is alive and busy. RULED FOR ASKING THE WRONG QUESTION DELIBERATELY. The ping asks the handle whether the process EXISTS, never whether it ANSWERED. Liveness and responsiveness are different questions, and only the first can be asked of an arbitrary child. A supervisor that demands a reply can only supervise processes written to reply, which is not what this engine launches.

CONFLICT TWO: a self-closing entry against a single closer. Goal 3 gives every run a second way to close, so two closers can reach the same entry. RULED FOR BOTH, WITH AN IDEMPOTENT CLOSE. The second closer must find the entry already settled and do nothing, rather than reopening it or counting it twice. One closer would be simpler and is what the system has today; today is exactly the arrangement that produced ghosts standing for fifteen hours.

CONFLICT THREE: one engine per folder against recovering from a crash. A guard strong enough to stop a second engine is strong enough to lock out a legitimate restart. RULED FOR THE PORT BIND AS THE ONLY TRUTH. A live listener is a fact and a lock file is a guess, and a stale guess is what turns a recoverable crash into a dead folder.

CONFLICT FOUR: goal 7 against the state gate itself. The gate exists so that a tool illegal where you stand means the machine holds that job elsewhere, and widening a verb's legality weakens that. RULED FOR THE NARROWEST POSSIBLE WIDENING. Only the registration argument becomes legal everywhere, and nothing else the verb carries. A hand that was genuinely started is a fact about the world, and refusing to record a fact does not make it untrue.

PRIORITY ORDER when they cannot all be had: 3 first, because a run that closes its own entry fixes the measured fault outright and needs no new machinery. Then 1 and 2 together, since neither is worth anything alone. Then 6, then 7, then 4, then 5.

WHY 5 IS LAST DESPITE BEING THE CHEAPEST. It is a ruling rather than a build, and it blocks nothing above it. Deciding it early would be tidy; doing it early would displace work that stops a walk.

## follow_up

The next state defines the actual: where the engine stands today on holding, pinging and closing what it launched.

Nothing is parked from here. The goal system inherits the resident vision by pointer and bends none of it.

One thing this state deliberately does not do is compare against outside practice. A process supervisor is well-trodden ground and the comparison belongs where requirements are framed, not in an axiom.

## anything_else

