---
minted_in: i9
id: raid-dec-ownership-is-stated-by-the-host-and-acknowledged-back
type: "[[raid]]"
kind: decision
statement: The system binds to exactly one tree or refuses. Where whatever starts it can STATE which tree it is handing over, it does, and the system acknowledges that exact tree back. Where it cannot, and the editor cannot, the system runs the same test itself and refuses on any count of candidates but one.
owner: the driving agent
trigger: any change to how the root is determined, and the first time a workspace holding several folders is opened
status: decided
breaks_how_badly: fatal
how_likely: plausible
source_refs:
  - req-a-wrong-act-never-passes-silently
  - req-walk-survives-host-swap
  - raid-asm-the-hosts-pattern-test-and-its-handover-name-the-same-folder
  - cand-nothing-can-be-forgotten, and the reverse graft that showed this cell decides the seat
  - the i9 spike of 2026-08-19, which read the editor's own source and found the stating half impossible there
---

## Rejected options

THE HOST HANDS OVER THE FOLDER AND WE TAKE IT. [[opt-the-host-hands-over-the-folder]].
Simpler, and it is what the runner-up takes. Rejected because the pattern test
that decides WHETHER we start and the handover that decides WHAT we hold are
separate host features, and nothing forces them to agree. That disagreement is
silent: the lane comes up successfully, against the wrong tree.

WALK UP UNTIL A MARKER IS FOUND. [[opt-walk-up-until-a-marker-is-found]]. What
every command-line tool sampled at the M2 gate does, and it needs no host feature
at all. Rejected here because it lands the system in whatever repository happens
to be above the caller, which trades one silent failure for another.

## Consequences

THE HOST MUST BE ABLE TO STATE WHICH TREE IT OPENED. Where a host only launches
a process with a working directory, there is nothing to acknowledge and this
decision has no mechanism.

THAT CONSEQUENCE BIT, AND IT BIT ON THE PRIMARY HOST. A spike read the editor's
source on 2026-08-19 and found it cannot state the tree. The section at the foot
of this node carries what the decision became. THIS NODE'S ID STILL READS
"stated by the host", which is now half wrong; the statement above is the
current one.

A REFUSAL BECOMES POSSIBLE AT STARTUP that could not happen before. That is the
point, and it is also a new way for the product to not come up.

THIS IS THE CELL THE WHOLE COMPARISON TURNED ON. The reverse graft found that the
runner-up could take it, and taking it would have reversed the seat. It is
recorded on raid-risk-the-seat-turns-on-one-cell-and-two-grafts-are-available.

### The prior-art back-check

NO ANCESTOR TO STUDY, and that is a complete answer. The i9 scan covered how
editor extensions find and start their backends and found detection patterns
rather than handover-and-acknowledge ones. What it did find is the failure this
decision prevents, twice: Claude Code's own tracker carries repeated reports of
an extension not inheriting the shell's environment, and the Dev Containers
extension matched an error string that a vendor later reworded.

SO THE MECHANISM IS OURS AND THE FAILURE MODE IS EVERYBODY'S.

## What the spike changed, 2026-08-19

THE EDITOR CANNOT STATE WHICH FOLDER IT HANDED OVER. Its activation check finds
the folder that matched, discards that identity, and hands the extension the
whole workspace with no activation reason at all. Read from the editor's own
source and its entire published type surface.

SO THE TWO-SIDED ACT IS NOT AVAILABLE ON THE HOST THIS PRODUCT RUNS IN. It
remains available to a launcher, a hook or a command line, each of which knows
its own root and can say so.

## What the decision is now

THE GUARANTEE IS UNCHANGED AND THE MECHANISM IS ONE-SIDED. Exactly one tree, or
a refusal, and never a silent bind to the wrong one.

WHERE THE STARTER CAN STATE THE TREE, it states it and the system acknowledges
it back. Nothing about that half changed.

WHERE IT CANNOT, THE SYSTEM PRODUCES THE STATEMENT ITSELF. It runs the same
content test the host ran, once per open folder, and counts what carries the
marker.

- Nought. Refuse. Something claimed a carrier exists and none does.
- One. Bind to it, and echo it where a person reads it.
- Two or more. Refuse, and ask the person which.

## What this costs against what was decided

THE ANALOGY IS WEAKER THAN THE ONE THIS DECISION WAS BOUGHT ON. Air traffic
handover is two-sided by construction. This is a receiver checking its own
input, which is a weaker thing wearing the same guarantee.

THE SCORE THAT PUT THIS LINE AHEAD WAS AWARDED FOR THE TWO-SIDED ACT. It rested
on converting two silent failures into loud ones, and one of the two is now
converted by a self-check rather than by a handover. Whether that still scores
the same is a question for a second hand, not for the composer, and it is named
here rather than assumed either way.

WHAT DID NOT CHANGE. A wrong tree is still impossible to bind silently, and
that is the property `req-a-wrong-act-never-passes-silently` asks for.
