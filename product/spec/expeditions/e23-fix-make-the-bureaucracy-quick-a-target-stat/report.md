---
form: expedition-leave
status: done
by: agent
files:
---

# e23 — the bureaucracy gets a route, and a guard that was shouting into a void gets a voice

## What was the goal

Make getting started quick. Two halves, and they turned out to be very
different sizes.

- A TARGET STATE with a route, so the walk stops asking what to do next
  when the answer was knowable at the first step.
- A DESK THAT PREFILLS, so a person confirms rather than composes.

The owner grew it live with mechanical work that needed no input, and the
scope earned two more things that were not in the goal at all: a guard
found firing into nowhere, and a YAML break of my own making.

## What was done

THE SWEEP IS THE HEADLINE. From a cold start to the front desk used to be
six model round trips. It is one call now, and it arrives.

Nothing is waived to get there. Every hop enters its state, weighs the
slider, proves its reads, runs its scripts and writes its own feed line.
The first hop that will not pass stops it and says which and why. Proven
live: without the read hashes it halts typed at exactly the guard, and the
hops it already made stand — a sweep never rolls back.

EVERY JUDGMENT IS COLLECTED UP FRONT, on the owner's ruling. Not the first
blocker but all of them, so a person answers the lot in one sitting and
leaves the walk to run. Being asked one question at a time is how a five
minute errand becomes an afternoon.

AND EVERY DOCUMENT THE WHOLE WAY DEMANDS, which is what actually makes the
sweep one call. Two things had to be right. A transition checks BOTH ends,
so exit conditions count — most of the boot lane's reads are demanded on
the way out of a state, not into it. And a state's PULLED guidance is
named by no condition at all, so it is gathered separately.

THE BLUE LINE IS DRAWN, as a navigation system rather than a diagram. It
runs along the drawn edges. A submachine the route passes through is a
WAYPOINT — the owner's framing, and better than the badge I had planned,
because a badge is a fact about the route while a waypoint is a piece of
it. The destination is a dot the line runs into; a small arrow says where
you are. Blue throughout, since the voice keeps green, red and yellow for
verdicts.

A SESSION TARGET, aimed at the front desk on every engine start.

THE NUDGE HAD BEEN FIRING INTO A VOID. It fired ten times in one session
and nobody saw a single one, including the agent it was nudging: an
update's answer went only to the log, never back on the call. That is also
why e23 kept recovering node ids by deliberately naming a node that does
not exist and reading the refusal. `update_result` rides every call now.

AN UPDATE NAMES ITS ITEM while a checklist stands, so narration cannot
masquerade as progress.

THE LINT READS FRONTMATTER PROSE. A state's `guidance` is what an agent
reads on every visit, and it was the only prose the lint had never seen.

A YAML BREAK OF MY OWN, and the worse thing behind it. The override I wrote
closing e22 contained a colon, the writer never quoted it, and that record
stopped parsing. The writer quotes now — but the real fault was that ONE
BAD RECORD TOOK DOWN THE WHOLE CONTAINER, and with it the archive, the
survey and the route.

## What settled it

THE SUITE: 173 at entry, 184 at close, all passing.

THE SWEEP WAS RUN FOR REAL, not just tested. One call from a cold start
walked all six hops and arrived, running the full selftest on the way. The
same call with no read hashes stopped at `boot/read_contract` with
SE-C-112. That pair is the whole claim — it collapses round trips and
waives nothing.

THREE FAULTS FOUND BY THINGS THAT WERE ALREADY WATCHING, which is the part
worth reading.

- THE OWNER, looking at a board of yellow items, asked whether the nudge
  had arrived. It had not, ten times over. No test could have caught that;
  it needed somebody looking at the wrong-shaped board.
- THE PLACE-REGISTRY TEST refused my first attempt at the frozen flag as
  an unregistered param. It was right, and `frozen` became a registered
  place instead of an exemption.
- THE ARRIVAL TEST caught my update rule checking EVERY visit's open
  nodes rather than the current one. Unfixed, an update in one state would
  have been refused over a checklist in another.

TWO OF MY OWN MISTAKES, both fixed and both worth recording.

- The cache stamp was first written against size and modification time.
  That is the usual cheap answer and it is wrong here: a priority edited
  from 0.01 to 0.75 changes not one byte of length. It stamps by CONTENT
  now, and the test writes a deliberately same-length edit.
- The e22 override broke a record, and the test that should have caught it
  had been writing broken YAML itself for weeks, because it grepped the
  record instead of parsing it.

PRIOR ART WAS REAL, against the owner's expectation. Orchestration engines
compute a shortest path across the state graph and step through it. The
everyday frame is `make`.

## What was not done

THE TWENTY-SIX PROSE FINDINGS ARE NOT FIXED, and this was a judgment
against the instruction to take anything needing no input.

Rewriting a state's `guidance` changes what every agent reads and does; it
is behavioural, not cosmetic. The lint checks FORM and never meaning, so
each finding wants a judgment rather than a rewrite. Twenty-six of those at
the tail of a long session is how lazy work gets made. Deferred to
pruning, with the list in note-42caca46253d.

THE DESK PREFILL IS METHOD, NOT MECHANISM. Nothing guards a seed, so the
capability already existed and only the habit was missing. That is written
into front-desk.md. Nobody has walked an iteration seed with it yet,
because no iteration has been seeded.

FOUR IDEAS ARRIVED AND WERE ONLY CAPTURED, on the owner's instruction:
reverse engineering as an ideation function, pruning possibly widening
into refactoring, the tour skill, and the mirror highlight capability the
tour needs. The last two are the next expedition's shape.

NO VISUAL VERIFICATION. The blue line, the waypoint and the destination
dot are pinned by tests over the rendered SVG. Nobody has looked at them in
a browser. The mirror cannot be called from inside its own session.

THE COPILOT CAGE IS STILL UNVERIFIED, carried from e22 in
note-581faf78af12. The owner is checking it tomorrow.
