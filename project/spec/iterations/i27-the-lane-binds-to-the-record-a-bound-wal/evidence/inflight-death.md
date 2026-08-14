---
form: inflight-death
by: agent
signed_off: 2026-08-14T14:02:23.264Z
authors: agent
files:
---

# Evidence form / inflight-death

## current_situation

THE ARCHITECTURE'S OPEN QUESTION HAS AN ORDINARY ANSWER FOR DEATH, and a real one only for silence.

Four break kinds, one client each, on this machine.

- The server called exit: the caller saw ECONNRESET after 6.9 ms.
- The server crashed with abort: ECONNRESET after 94.1 ms.
- The parent sent SIGKILL from outside: ECONNRESET after 57.2 ms.
- The server stayed up and never answered: the caller was told nothing, for 3000 ms and counting.

THREE UNRELATED WAYS OF DYING PRODUCE ONE OBSERVABLE END STATE, all inside 100 ms. The channel does the detecting and the supervisor does not have to invent it.

req-crash-lands-safe asks for one distinct end state across break kinds. Three of four already give it.

THE FOURTH IS THE REAL ONE. A satellite that stays up and never answers is invisible to the platform, so only a deadline turns that silence into a verdict.

## built

- exp-inflight-death

## follow_up

THE OPEN QUESTION BECOMES A DESIGN DECISION. el-satellite-supervisor's WATCH act needs exactly one number: how long a call may go unanswered before the core answers for it. That belongs at specify-build.

WHAT THE SUPERVISOR NO LONGER OWES. Detection of a dead satellite. The channel reports it in under 100 ms whether the process exited, crashed or was killed, so no heartbeat and no liveness protocol is needed for that half.

THE WORST CASE MEASURED IS A CRASH, NOT A KILL. process.abort took thirteen times longer than a clean exit to reach the caller, because the process writes a crash dump on the way down. Any deadline has to sit above 94 ms or it will call a crashing satellite a hung one.

WHAT THE PROBE DID NOT SETTLE. It used a bare TCP channel rather than the lane's protocol, and the child died on receipt rather than part-way through real work. Nothing here says what a half-written file looks like afterwards.

## anything_else

WHY THIS IS THE SPIKE THAT CHANGED THE MOST. Every other line on the candidate chart had one process, which either runs or does not. cand-core-satellite's own record lists partial failure as the question no other line has to answer, and el-satellite-supervisor carries it as an open question rather than a solved one.

It turns out the platform answers most of it. What is left is one number, and a number is a decision rather than an unknown.

THE PROBE CODE IS THROWAWAY and lives outside the product at .se/spike/probe-inflight.mjs, with the other two. Nothing from any of them enters the build.
