---
minted_in: i62-background-work-reports-its-own-end-the-
id: dsp-the-entry-that-closes-itself
type: "[[design-spec]]"
statement: how the registry holds the live end of what it launched, how an entry settles whether the work reports its own ending or simply disappears, and how settling twice keeps the first outcome while recording the disagreement
realizes:
  - el-work-registry
  - if-walk-engine-to-work-registry
files:
  - deliverable/engine/run.ts
  - deliverable/tests/work-lifecycle.test.ts
---

## Responsibility

AN ENTRY STOPS BEING A GUESS. Today it is written when work starts and nothing
writes it again unless the work chooses to speak. This design gives the
registry a way to find out for itself.

## The live end

A REGISTRATION TAKES THE HANDLE, not just a description. `openOperation` gains
a way to name the running process, and the registry keeps it.

ASK THE HANDLE, NEVER THE NUMBER. Measured 2026-08-24 on linux, node v22.22.2:
a held handle reports `exitCode: 0` after a normal exit and
`signalCode: "SIGKILL"` after a kill, while a process number only says whether
something with that number is there. Numbers are reused by the operating
system, so a number-based design reports a dead run as alive.

THE NUMBER IS STILL USEFUL AS A FALLBACK, for an entry recovered from disk
after a restart, where no handle survives. It is the weaker channel and the
design says so rather than treating the two as one.

## Two closers, and neither is optional

- THE WORK'S OWN ENDING. Every kind settles its entry when its process exits.
  This is the cheap half: the exit is already observed and what is missing is
  the write that follows it.
- THE SWEEP. On a fixed interval the registry asks each held handle whether
  its process still exists, and settles the ones that are gone.

WHY BOTH. A run that crashes or is killed never reaches its own close, and
those are the runs that left entries standing for fifteen hours.

WHAT THE SWEEP ASKS IS EXISTENCE. It never asks whether the work answered. A
process that is alive and silent is left alone, and a hung one is caught by
the bound instead.

## The bound

EVERY ENTRY CARRIES ONE, with a word saying whether it was measured or
defaulted. Reaching it produces an outcome that names the bound, so a reader
can tell an expiry from a verdict.

THE PROVENANCE TRAVELS WITH THE FIGURE. That is the rule the account already
holds for a time remaining, applied to the other end of the same problem.

### The bound ends the wait, never the truth

AN EXPIRY IS THE ACCOUNT GIVING UP, not a verdict on the work. Nothing was
asked and nothing answered, so an expired entry stays correctable.

A REAL ENDING ARRIVING LATER REPLACES IT. The exit code, the settle, the
handle's own answer — each overwrites the bound's string, and the entry is put
back in front of a reader. It is not filed as two closers disagreeing, because
nothing disagreed.

WITHOUT THAT, THE READER IS TOLD ONLY THE TIMEOUT. A finished entry rides one
answer and is dropped, and an expiry spends that ride, so the run's actual
outcome would reach nobody.

### Existence beats the clock

A HANDLE THAT SAYS THE PROCESS IS THERE OUTRANKS A BOUND THAT HAS PASSED.
A process the engine can see running is better evidence than a default nobody
measured.

SO THE CLOCK DECIDES ONLY WHERE EXISTENCE CANNOT BE ASKED. That is a
registered hand, a step's leaving judgment, or work whose handle and number are
both gone.

THE LEAVING JUDGMENT IS NAMED HERE ON PURPOSE, because it is the entry class the
record's own opening measurement was about: a walk held at the step that owned
an entry nobody closed.

IT HAS NO HANDLE AND NO NUMBER. The judgment is opened as an entry and settled
by the code that resolves it, so the existence sweep has nothing to ask and the
bound is its only backstop.

THAT IS NOT A GAP, BECAUSE THE ORDINARY CLOSER IS THE ONE THAT FIRES. The
judgment settles its own entry when it resolves, exactly as a run does on exit.
The bound only matters where that never happens at all.

THE TWO ROWS WOULD OTHERWISE CONTRADICT EACH OTHER. The row above says an
alive-and-silent process is left alone; a bound that ignored the handle would
close exactly those, in the same loop, a few lines apart.

### One entry that cannot be closed never hides the entries after it

EACH CLOSE IS ISOLATED. The loop walks the table in insertion order, so a throw
on an early entry would leave every later one unswept — which is this record's
own fault, reintroduced by the code removing it.

THE HANDLE IS WHAT CAN REFUSE. Reading how a process ended is the one thing the
sweep does to every entry, and nothing promises that read answers. The writer
already swallows its own failures; this covers everything else a close touches.

### One folder's sweep closes only that folder's work

THE TABLE IS PER-PROCESS AND HOLDS EVERY FOLDER THE SERVER HAS SERVED. A read
of one folder must not close another folder's entries on its behalf, and the
throttle is per folder for the same reason.

## Settling twice

THE FIRST OUTCOME STANDS, and `settleOperation` already returns early on an
entry that is not running. What is missing is the record.

A SECOND SETTLE THAT DISAGREES LEAVES A TRACE. Two closers agreeing and two
closers fighting look identical today, and only the second is worth knowing
about.

## What the cost turned out to be

ASKING IS FREE AT THIS SCALE. Twenty handles asked in 78 microseconds, a
hundred in 147, measured the same day. Against an interval in seconds the
sweep costs nothing a caller could see.

SO THE SWEEP MAY RUN ON THE LOOP THAT SERVES CALLERS. That is only true
because it asks handles. A design that read a file per piece of work would not
have this licence, and this paragraph is the reason to re-measure if the
question ever changes.

### The floor between two asks is not covered by a case

WHAT IS PINNED is that a read closes a gone entry. That is the production path,
and a case kills a real process and reads the account without forcing anything.

WHAT IS NOT PINNED is the minimum gap that stops a burst re-asking the same
handles. Every case that needs a sweep at an exact moment forces one.

WHY IT IS LEFT UNCOVERED RATHER THAN COVERED BADLY. Observing the floor means
proving an ask did NOT happen inside a window measured in milliseconds, on a box
running a hundred and eighty test files at once. Every shape of that case is
decided by how long the machine deschedules the process, not by the code.

WHAT IT WOULD COST TO BE WRONG. The handles get asked more often than intended:
78 microseconds for twenty of them. It is a performance floor, not a
correctness one, which is why a flaky case is the worse trade.

## What it deliberately does not do

IT DOES NOT RESTART WHAT IT ENDS. Both comparable supervisors do; this one
reports the ending and the work is lost.

IT DOES NOT CLEAR THE PILE OF FINISHED ENTRIES. How long those are worth
keeping is decided in this record, and the sweep that acts on the decision is
a named non-goal.
