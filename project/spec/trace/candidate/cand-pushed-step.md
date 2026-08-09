---
id: cand-pushed-step
type: "[[candidate]]"
name: "Pushed step"
statement: "the machine hands the step out"
picks:
  - "[[opt-the-machine-pushes-the-step]]"
  - "[[opt-one-store-for-what-happened]]"
  - "[[opt-worktree-per-record]]"
  - "[[opt-one-command-install]]"
  - "[[opt-triage-queue-in-front]]"
---

## Why this one

This is the inverted candidate. Every other line here keeps the agent asking
for work. This one has the machine deliver it.

The next step is pushed to whoever is listening. One append-only store holds
what happened, and the log view, the trace view and the inbox count are all
derived from it. Each record still gets its own worktree on its own branch.

What it trades away is a hard dependency on a live channel. A push needs a
connection that stays up, and the transport in use dropped repeatedly during
this iteration. It also loses the property that makes the current shape safe
after a compaction: a pull recomputes from wherever the walk stands, so the
person's hand cannot race the agent. A push has to solve that again.

It is drawn because a pull loop costs one round trip per hop, and the walk
just spent sixteen hops reaching one state.

## How it works

The baseline stays. The machine, the states, the forms and the corpus are
untouched. What reverses is who speaks first.

THE FIRST SEAM IS THE CHANNEL. Instead of the agent asking what is next, the
machine hands the next step to whoever is listening. The walk still advances
only when the step is done, so the discipline is unchanged — what changes is
that the machine does not wait to be asked.

THE SECOND SEAM IS THE STORE, and it is what makes a push safe. One
append-only record of what happened, with the log view, the trace view and the
inbox count all derived from it. A push has to say WHAT changed, and a single
ordered store is the only thing that can answer that without ambiguity: the
push carries a position in the log, and a listener that missed one catches up
by reading forward.

THE THIRD SEAM IS THE WORKTREE, and it is the conservative pick. Each record
keeps its own tree on its own branch. A push does not change isolation, so
this candidate deliberately leaves that alone and varies one thing.

WHAT THE COMBINATION MAKES POSSIBLE. The round trip per hop disappears. This
session walked sixteen states to reach one, four separate times, and each hop
was a request and a reply.

WHAT IT MAKES HARDER. Recovery. A pull recomputes from wherever the walk
stands, so a compaction, a crash or a slow agent cost nothing. A push has to
solve that again, and the append-only store is the mechanism it would use.

## What it costs

RESOURCE, ROUGH. A live channel and a listener. Neither is large; both are
new, and neither exists today.

THE WORST CASE THAT DECIDES VIABILITY is a dropped connection, and it is
OBSERVED rather than hypothetical. The transport in use dropped twice during
this session — once mid-read with a socket close, once as a timeout. A pull
loop treats that as a retry. A push loop treats it as a lost step unless the
store lets the listener catch up.

MAKE, REUSE OR BUY. The append-only store is close to what the call log
already is, so much of it is reuse. The push channel is a build.

THE FAILURE MODE THAT DECIDES. Two listeners, or none. A pull has exactly one
asker by construction. A push has to decide who receives, and the design says
"whoever is listening", which is not yet an answer.

## What it leans on

- A LIVE CHANNEL CAN BE KEPT UP. Already contradicted twice in one session on
  the transport actually in use, on 2026-08-09.
- ONE APPEND-ONLY STORE CAN CARRY EVERY VIEW. Plausible: the log already
  carries the feed and the inbox, so this is an extension rather than a leap.
- THE PERSON'S HAND CANNOT RACE A PUSH. The current design gets this free,
  because a pull recomputes from wherever the walk stands. A push has to earn
  it, and nothing here says how.
- LATENCY IS WORTH THE TRADE. Sixteen hops per re-entry is the number that
  motivates it. Whether those hops are slow because of the round trip, or
  slow because each one re-reads a method document, is NOT ESTABLISHED — and
  if it is the reading, this candidate buys nothing.
