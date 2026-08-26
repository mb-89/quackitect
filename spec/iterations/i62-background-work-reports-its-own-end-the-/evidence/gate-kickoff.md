---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-24T15:43:54.336Z
authors: agent
files: null
---

# Evidence form / gate-kickoff

## current_situation

Milestone M0 is walked. The onboard retro is signed and the notes inbox stands at zero.

Nothing is built yet. This gate prices the work before any of it is done.

The record is walked by the guide alone. One hand was spawned at the setup state and closed again, because the budget this gate sets did not yet exist. The owner has since ruled the point directly: a ceiling of zero means going without a hand, and a state that fights that is an engine fix rather than an argument.

## retro_drained

- the notes inbox: drained to zero at onboard-retro. One note was written during that state and minted a work token.
- the needs-retro trigger for i4-the-panel-round-the-archived-iteration-b: cleared by that same drain, which the engine reported as retro_cleared.

## goals

- The engine holds the live end of every process it launched and asks it, on a fixed interval, whether it is still there.
- Silence past that interval ends the process and closes its entry.
- A test run closes its own entry when the process behind it exits, so the heartbeat is a backstop and not the only guard.
- No wait is silent. A wait carries a duration, and expiry does something rather than nothing.
- How long a completed task's file is kept is decided first, and only then is the clearing built.
- One engine holds a given folder and its network port, and a second one that cannot bind says so instead of running on half-alive.
- Registering a spawned hand works from wherever the walk stands.

## pulled_in

- The heartbeat over launched processes, and the kill that follows silence.
- A test run closing its own entry on process exit.
- The retention decision for completed task files, made before any clearing is built.
- The single-engine-per-folder-and-port guard.
- Making the helper registration call legal from anywhere inside a record.

## left_out

- The route, the walk's own state, and the prose an agent is served. The record's vision names these as out by construction and nothing here reaches them.
- The clearing of the completed-task pile. The retention length is decided in this record; building the sweep that acts on it is not.
- The timing of the helper budget itself. The setup state asking for a hand before this gate agrees one is a real fault, and it is a work token in the pool rather than scope here.

## walkers

0 — the guide walks this record alone.

The measurement in the gate's own guidance is against spawning: three hands each spent about fifteen minutes rebuilding context the guide already held, for edits the guide had already located by file and line. This record's work is engine edits in a handful of named files, which is exactly that shape.

This session measured the same thing again. One hand was spawned at the setup state, ran four and a half minutes, and its only surviving output was one evidence form the guide could have filled in a single call.

The owner ruled it directly while this gate was being filled: if the ceiling is zero, go without one.

A reviewer at a gate and a researcher where research happens are unaffected. Neither counts against this number and neither is discouraged.

## change_size

minor — new behaviour inside the engine, with no new product surface.

What lands is a process supervisor: the engine keeps handles it currently drops, pings on an interval, and closes entries a run already knows are finished. That is more than a fix, so patch understates it.

It adds no new vehicle, no new state machine and no new artifact kind, so major overstates it. The lane's verb surface does not grow, with one exception that only widens where an existing verb is legal.

The risk is contained to the job table and the run lane. Nothing in the corpus, the route or the forms moves.

## round_0_verify

- evidence vs claims: nothing is built, so there is no claim to check against evidence. Every figure in this brief is quoted from the record's own vision or from this session's call log.
- types: not run. No source file has changed in this record.
- lint: not run, for the same reason.
- tests: not run. The engine decides test scope from what changed, and nothing has changed yet.

## round_1_validate

- exercised against the goal: the brief is checked against the record's vision line by line. Every goal above traces to a named line of that vision.
- missing: one item of the vision is deliberately narrowed. The vision asks that retention be decided and only then the clearing built; this scope keeps the decision and leaves the sweep out, which the vision itself sanctions.
- wrong: nothing found. No goal here contradicts the vision or the record's inputs.
- out of scope: the helper-budget timing fault found this session. It is the same family as the record's fifth input but a different mechanism, and it went to the pool rather than into signed scope.
- prior art: not compared. This walk did no external research, and no claim is made about how this design stands against practice outside the repository.

## bound_breaches

- if-agent-harness-to-entrypoint: one crossing, and the interface held. The harness spawned a hand and the engine refused to count it, naming the ceiling and both remedies. The refusal was the boundary working, not a breach of it.

## round_2_red_team

- A heartbeat that pings on an interval can kill a process that is alive but busy => the ping must ask the process handle whether it exists, never whether it answered. Liveness and responsiveness are different questions and only the first is being asked.
- A run closing its own entry and a heartbeat closing it can race => the close must be idempotent, and the second closer must find the entry already settled rather than reopening or double-counting it.
- The single-engine guard can lock out a legitimate restart after a crash left a stale lock => the guard binds the port and treats the bind failure as the truth, because a live listener is a fact and a lock file is a guess.
- Deciding a retention length without building the clearing leaves the pile growing => that is accepted here. The decision is the deliverable and the pile is already growing; not deciding is what blocks the sweep.
- Widening where the helper-registration verb is legal could widen what else that verb can do in those states => the widening must reach the registration argument only, and nothing else the verb carries.

## raid_additions

- none

## verdict

pass — the brief is complete and sized.

The goals trace to the record's vision. The scope names what is pulled in and what is left out, and each exclusion has a reason rather than a silence. The change size is argued in both directions.

What this verdict does NOT rest on: any built artifact, any test run, or any comparison against outside practice. None of those exists yet, and the round-one entry says so rather than leaving a blank that reads as done.

The one open weakness is the red-team's first finding. A heartbeat is the record's central mechanism and getting liveness confused with responsiveness would make it kill working processes. It is named here so the design state answers it rather than discovering it.

## follow_up

The walk goes on to the design and build of the milestone below this gate, with the guide walking alone.

One work token stands in the pool from M0: wt-the-opening-phase-of-a-record-asks-for-a-helper-before-any-b, ready when a record's helper budget is agreed before the phase that asks for helpers.

A field report is owed at the end of this run and is not committed. It carries the helper-budget fault, the field-feedback question nobody was present to answer, and the owner's ruling on walking alone.

## anything_else

