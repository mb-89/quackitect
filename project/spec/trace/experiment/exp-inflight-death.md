---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: exp-inflight-death
type: "[[experiment]]"
statement: What does a caller see when the process serving its call dies mid-answer, and do the break kinds look the same to it?
probes:
  - raid-ar-crash-lands-safe
timebox: one hour
form: script
promote: "none — the deadline is one number for specify-build, and it must sit above the 94 ms a crash takes to reach the caller"
folds_to: "raid-ar-crash-lands-safe is re-grounded, because the channel detects a dead satellite in under 100 ms"
faked: a bare TCP channel rather than the real lane protocol, and a child that dies on receipt rather than mid-work; no satellite exists to kill
fallback: if a caller cannot tell a dead server from a slow one, every call carries a deadline and the core answers for a satellite that misses it
verdict: holds
measured: 2026-08-14 — three break kinds all answered ECONNRESET within 100 ms; a hung server told the caller nothing in 3000 ms
source_refs:
  - rank-unknowns, the seeded pick
  - el-satellite-supervisor
  - req-crash-lands-safe
---

## Setup

The owner's Windows machine, 2026-08-14, Node v24.16.0.

A child process served a loopback TCP channel. A client connected, sent one
request, and the child died instead of answering. Four break kinds, one
client each, with a 3000 ms patience.

- EXIT. The server called `process.exit(1)` on receipt.
- ABORT. The server called `process.abort()`, which is a crash.
- HANG. The server stayed up and simply never answered.
- KILL. The parent sent SIGKILL from outside, which is the supervisor
  reaping or the operating system.

## Result

| break kind | what the caller saw | after |
| --- | --- | --- |
| exit | error, ECONNRESET | 6.9 ms |
| abort | error, ECONNRESET | 94.1 ms |
| kill from outside | error, ECONNRESET | 57.2 ms |
| hang | nothing at all | 3000 ms and counting |

## What it settles

THE ARCHITECTURE'S OPEN QUESTION HAS AN ORDINARY ANSWER FOR DEATH. Three
unrelated ways of dying produce ONE observable end state at the caller, and
all three inside 100 ms. The channel does the detecting; the supervisor does
not have to invent it.

That is [[req-crash-lands-safe]]'s own measure, which asks for one distinct
end state across break kinds. Three of four already give it.

THE FOURTH KIND IS THE REAL ONE. A satellite that stays up and never answers
tells the caller nothing, forever. The platform will not help, so a deadline
is the only mechanism that turns silence into a verdict.

## What that makes it

A DESIGN DECISION RATHER THAN AN UNKNOWN. The supervisor's WATCH act needs
one number — how long a call may go unanswered before the core answers for
it — and that number belongs at specify-build.

The requirement already names the shape: an offer that goes silent collapses
to the same state an explicit dismissal reaches. A deadline is how silence
gets there.

## What it does not settle

- The probe used a bare TCP channel, not the lane's protocol.
- The child died on receipt rather than part-way through real work, so
  nothing here says what a half-written file looks like afterwards.
- No satellite exists to kill. The break kinds are the platform's, not the
  product's.

## The 94 ms

`process.abort()` took thirteen times longer to reach the caller than a clean
exit, because the process writes a crash dump on the way down. The caller
still found out, and it is worth knowing that the worst case measured is a
crash rather than a kill.
