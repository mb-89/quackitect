---
minted_in: i62-background-work-reports-its-own-end-the-
id: raid-iss-a-finished-run-keeps-reporting-itself-as-running
type: "[[raid]]"
kind: issue
statement: "A background run whose process has exited keeps its entry marked running, so the work account reports processes that no longer exist."
owner: the maintainer
trigger: "any walk held at a leaving judgment, and any account listing an entry running longer than the work it describes could take"
status: closed
looked: 2026-08-24
impact: "A leaving judgment reads as still deciding while such an entry stands, so the walk stops at the step that owns it. The walk cannot be resumed by anything the agent does, because nothing it can call changes the entry."
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - i62-background-work-reports-its-own-end-the-
weighs_with: none
weighs_against: none
---

## What was measured

MEASURED 2026-08-24. A test run reached 179 of 179 files with 1,803 cases
done. It then reported itself as running for nineteen minutes, with no process
alive on the machine.

THREE OF THEM STOOD FOR FIFTEEN HOURS on one occasion, all reporting complete.

## Why it was an issue and not a risk

It had already happened, more than once, and it was happening on the course as
it then stood. Nothing about the arrangement that produced it had changed.

## What closed it

TWO CLOSERS NOW STAND WHERE NONE DID, both built in this record.

- THE WORK CLOSES ITS OWN ENTRY when its process exits, for every kind of run
  rather than only a test run.
- THE SWEEP CLOSES WHAT IS ALREADY GONE, asked on the reads that compose the
  account, which run before any answer reaches a reader.

A PROCESS THAT IS ALIVE AND SILENT IS LEFT ALONE, which is the guard on the
second closer rather than a limitation of it.

EACH IS PINNED BY A CASE THAT WAS RED BEFORE IT, in
deliverable/tests/work-lifecycle.test.ts, and the run is reported in
sty-the-run-that-died-while-nobody-was-holding-it.

WHAT THIS DOES NOT COVER, and it is a different question on purpose: a process
that exists and is HUNG. That is the bound's job —
req-every-wait-declares-a-bound-and-expiry-acts.

## Where the break actually is

THE SHELL CHILD RECORDS ITS EXIT CORRECTLY. That half works.

WHAT NEVER HEARS IS THE OPERATION THAT OWNS IT. The entry is a stored record
of something that was started, and nothing connects the child's exit to it.

SO THE ENTRY IS A GUESS about something that has gone quiet, and a guess is
what it stays until somebody asks the process itself.

## What closes it

Either half of this record's design closes it on its own, and both are built
because each covers what the other misses.

- A run closes its own entry when the process behind it exits.
- The engine pings what it launched and ends what does not answer.
