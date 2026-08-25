---
form: the-registration-takes-the-live-end
by: agent
signed_off: 2026-08-24T16:29:40.170Z
authors: agent
files:
---

# Evidence form / the-registration-takes-the-live-end

## current_situation

A registration says what work was started and nothing more. The entry is written when the work begins, and only the work choosing to speak ever writes it again.

So an entry is a stored guess about something that has gone quiet. Everything else in this record needs that to stop being true.

This chunk gives the registry the live end.

## built

deliverable/engine/run.ts.

- openOperation now accepts the running process itself, and a bare process number where no handle exists. The Job record already carried both fields; nothing was reaching them.
- stillThere asks the handle first and the number second, and answers there, gone or unknown.
- The number is persisted, so an entry rebuilt after a reload keeps its weaker channel.

ASK THE HANDLE, NEVER THE NUMBER, AND THE COMMENT SAYS WHY. A handle names HOW a process ended. A number only says whether something with that number is there, and numbers are reused by the operating system, so a number-based design reports a dead run as alive.

UNKNOWN IS A THIRD ANSWER AND NOT AN EDGE CASE. Where neither channel can be asked, nothing may read silence as death. That is the fallback if the platform assumption ever fails on a host this has not run on.

## follow_up

Three chunks lean on this one and none of them lean on each other, so they fan out from here.

- The work closing its own entry.
- The sweep settling what is gone.
- The bound and the disagreement record.

## anything_else

THE TEST FOUND THE GAP BEFORE THE BUILD DID, and the typechecker found it before the test ran.

The case written at author-tests passed a process number where the design had already ruled that the handle is the channel. The typechecker refused the unknown field, which is how the gap surfaced at all.

SO THE TEST WAS CORRECTED RATHER THAN THE DESIGN. A number can say a process is gone and can never say how it went, and the case that asserts an exit code now registers the handle.
