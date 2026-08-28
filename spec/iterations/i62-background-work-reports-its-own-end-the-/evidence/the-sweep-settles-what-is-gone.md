---
form: the-sweep-settles-what-is-gone
by: agent
signed_off: 2026-08-24T16:30:16.081Z
authors: agent
files: null
---

# Evidence form / the-sweep-settles-what-is-gone

## current_situation

Work that ends cleanly now closes its own entry. Work that crashes or is killed never reaches that path, and those are the runs that produced the measured fault.

The engine already closes what a PREVIOUS instance left behind, at startup. Nothing covers a process that dies while this instance is running.

This chunk is that backstop.

## built

deliverable/engine/run.ts, sweepGoneOperations, called from jobList.

IT ASKS EXISTENCE AND NEVER RESPONSIVENESS. Every entry still marked running that holds a handle or a number is asked whether its process is there. The ones that are gone are settled.

A PROCESS THAT IS ALIVE AND SILENT IS LEFT ALONE. Silence is not evidence of death, and a supervisor that treats it as such ends work that was running. A hung process is caught by the entry's bound instead, which is a different question asked on purpose.

UNKNOWN IS NOT GONE. Where neither channel can be asked, the entry stands. Reading silence as death on such a host would end work on a machine that merely could not answer.

WHERE THE HANDLE HAS THE OUTCOME, THE SWEEP USES IT. Only a bare process number leaves `gone` as the honest answer.

IT RIDES THE READ THAT COMPOSES THE ACCOUNT, throttled to one sweep every 250 milliseconds. That is the one moment the engine reliably has both the handles and a reason to look.

## follow_up

One chunk is left in this strand: the bound on every entry, and the record of a disagreeing settle.

AFTER THAT THE JOIN WAITS FOR NOTHING and the build machine closes.

## anything_else

THE SWEEP RUNS ON THE LOOP THAT SERVES CALLERS, AND THAT NEEDED A MEASUREMENT rather than a judgment.

The product's own law is that nothing may block the loop that draws the interface, and that a check scanning thousands of things belongs off the request path.

MEASURED 2026-08-24 on linux, node v22.22.2: 20 handles asked in 78 microseconds, 100 in 147. Against an interval in seconds that is nothing a caller could see.

THE LICENCE IS ABOUT WHAT IS ASKED, NOT ABOUT THE SWEEP. A design that read a file per piece of work would not have it, and the comment in the code says so where somebody might change the question.
