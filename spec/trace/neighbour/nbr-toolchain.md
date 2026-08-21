---
minted_in: i1
id: nbr-toolchain
type: "[[neighbour]]"
statement: The local toolchain the checks run on — Node, the typechecker, the linter-formatter and the test runner.
direction: out
group: required-toolchain
---

## Interface

Processes spawned through `se_run` and `se_test`, with their output captured
in full under the call's ref.

The three gates run in one order: the typechecker, then the linter-formatter,
then the scoped tests. The commit hook runs the first two and BLOCKS, so a
red gate cannot be committed around.

The lane FIXES what the formatter can fix and hands back the fixed content;
what it cannot reach rides the result as findings.

## What i9 changes, 2026-08-19

ONE CROSSING WAS NEVER MODELLED HERE and this iteration depends on it. The
launcher INSTALLS the runtime and its tools through the system package
manager, and pulls the new path into its own window.

THAT IS A DIFFERENT DIRECTION FROM THE REST OF THIS NODE. Everything else
here spawns a process to run a check. This one changes what is installed on
the machine.

AND IT IS THE ONE STEP THAT CANNOT MOVE. A process needing the runtime in
order to start can never be the thing that installs it, which is why the
launcher survives as a one-time act rather than disappearing.

SO THE SPLIT THIS ITERATION DRAWS RUNS THROUGH THIS NEIGHBOUR. Installing the
runtime stays in the launcher. Every other crossing here — spawning the
checks, capturing their output — already happens per folder and moves with
the entry point.
