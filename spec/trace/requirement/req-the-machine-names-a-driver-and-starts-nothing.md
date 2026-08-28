---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-the-machine-names-a-driver-and-starts-nothing
type: "[[requirement]]"
statement: The lane shall publish the named driver on the pull and shall start no process on account of it, on any host and in any mode.
kind: constraint
verify_method: inspection
breaks_if_removed: A lane that starts agents is a lane that acts outside the record on its own judgment, which is the same class of act as pushing and opening records unasked. Once it holds that power every other boundary is a convention.
breaks_how_badly: fatal
refines:
  - uc-let-the-machine-name-the-driver
source_refs:
  - uc-let-the-machine-name-the-driver step 5
  - nbr-the-driver-that-performs-the-spawn
  - raid-iss-the-engine-does-spawn-an-agent-and-the-seed-says-it-does-not
priority: must
---

## Detail

WHAT "THE NAMED DRIVER" IS, after the use case was restated 2026-08-20. This
requirement's own `source_refs` point at `uc-let-the-machine-name-the-driver`
step 5, which used to read "It puts THE MODEL NAME on the pull" and now reads
"It puts THAT STATEMENT on the pull" — the statement of how strong a hand the
work requires.

SO THE NAMED DRIVER IS WHATEVER THE DESIGN PUBLISHES AS THAT STATEMENT. A model
name is one form of it. A rung, or a class, or a two-part difficulty and a rung
together, are others. This requirement demands that it be published on the pull
and that nothing be started on account of it; it does not demand which form it
takes, and it never did — the form came in from the use case's own step.

WHY THIS NOTE EXISTS. A cold pass held every must against every candidate and
found the verdict on this one turning entirely on whether a rung counts as a
named driver, with the equivalence asserted nowhere. It was asserted nowhere
because the use case said "model name" and this row said "driver", and nobody
reconciled them.

WHAT IS UNCHANGED AND IS THE POINT OF THE ROW: the lane publishes and starts no
process, on any host and in any mode.

THE ENTRYPOINT MAY AND THE WALK MAY NOT, and the seam is when. `se-start.ts`
starts an agent before any walk exists, and `se-pty.ts` starts one inside a
pseudo-terminal for a person to watch. Neither is a walking state acting on a
computed value.

WHAT THIS FORBIDS is the milestone itself spawning. The value goes outward and
something already listening decides what to do with it.

AND SOMETHING IS LISTENING, corrected 2026-08-20: the lane answers over HTTP
before an agent is ever launched, the launched agent pulls, and `se-pty` even
carries keystrokes back into a running one. The reader reads AND ACTS today, by
handing the step to a stronger hand; what no path does is turn a running agent
into a different model mid-walk, and nothing needs one to.
