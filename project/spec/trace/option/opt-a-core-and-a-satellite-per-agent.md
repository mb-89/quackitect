---
minted_in: i27
id: opt-a-core-and-a-satellite-per-agent
type: "[[option]]"
statement: run one core that knows the whole state and one satellite per agent that knows its own, so an engine change reaches the satellite of the agent who made it and no other
cluster: cluster-the-walk
question: how a change to the engine's own code takes effect
found_by: prior-art
source: "owner ruling 2026-08-14: a core system that manages the subsystems, the subsystems know about their own state and the core knows the whole state; it degenerates into one core and one satellite, and every agent gets its own satellite"
---

## Mechanism

ONE CORE, N SATELLITES. The core knows the whole state. A satellite knows its
own. Every agent gets a satellite when their work starts, and their calls go
to it.

An engine change made by an agent is picked up by that agent's satellite. The
core and every other satellite keep what they were running.

IT DEGENERATES CLEANLY. One core and one satellite is a working system, so
the shape is not paid for until a second agent arrives. That is the owner's
own test of it and it is the strongest property on this row.

## The split, which is the whole design

- THE CORE OWNS WHAT IS GENUINELY ONE THING: the mirror, the claim ledger,
  the note inbox, the call log, and routing between satellites.
- A SATELLITE OWNS ITS AGENT'S WORK: the walk position, the bound record, the
  engine code that agent is running.

EVERY PER-AGENT SHAPE ON THIS CHART HITS THE SAME WALL, and this is the only
one that names the wall as its design rather than as a leftover.
[[opt-one-process-per-record-rooted-by-the-os]] records the same shared state
as undesigned; here it is the core's job by definition.

## Prior art, and it is ordinary rather than clever

THIS IS ONE OF THE MOST COMMON SHAPES IN SERVER SOFTWARE. Named from working
knowledge rather than read at source in this session, and the gate's
prior-art round should check them.

- nginx: one master process, N workers. The master owns configuration and
  binding; a worker serves requests.
- PostgreSQL: one postmaster, one backend process per connection.
- Browser engines: one browser process, one renderer per site.
- Language servers: one client, one server per workspace, spoken over a
  protocol rather than shared memory.
- Erlang OTP supervisor trees, which is the same shape with the reload
  question already answered.

WHAT THEY ALL SHARE is that the supervisor holds only what must be one, and
the workers are cheap to start, cheap to kill, and independently replaceable.
That is exactly what this row is asking for.

## The performance argument, which is real and unmeasured

ONE PROCESS USES ONE CORE. N satellites can use N cores.

The owner stopped working on another machine on 2026-08-14 because the
performance was bad enough to drive them off it. That is a use event against
req-call-answers-in-one-second, not just a measurement.

SO A SHAPE CHOSEN FOR ISOLATION MAY PAY FOR ITSELF IN THROUGHPUT. That is a
genuine argument and it is also the kind that flatters a favourite, so it
wants profiling rather than asserting. Recorded as note-1e3da015c26e.

WHAT IS UNMEASURED: where the time goes today, whether the slow calls are CPU
bound at all, and what a satellite costs to start with the engine load
included.

## What it costs

A PROTOCOL BETWEEN CORE AND SATELLITE, which is new machinery and a new place
for things to go wrong. Every shared read becomes a call.

SUPERVISION: starting, watching and reaping satellites, and deciding what
happens to an agent's work when their satellite dies.

WHAT A SATELLITE IS, undecided. A process, a worker thread, or an isolate.
Each behaves differently on start-up cost, on crash, and on what it can
share, and the row does not choose.
