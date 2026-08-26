---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: raid-iss-nothing-shipped-this-round-makes-the-walk-faster
type: "[[raid]]"
kind: issue
statement: The round shipped the measurable half first and nothing faster, and that stood until a profile found the cost; four measured fixes then cut a three-hop sweep from 15,404 to 2,562 milliseconds.
owner: the driving agent
trigger: it has happened, and the implementation gate's own red team raised it
status: closed
impact: "While it stood: the record's headline read as delivered with the cost it named untouched. It is closed because the cost was found and cut, and what remains is carried by its own entry."
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - req-aiming-returns-before-the-walking-starts
  - req-a-hop-of-the-walk-carries-its-own-time-budget
---

## What was actually delivered

THE MEASURABLE HALF, and it earned its place. Every hop of a drawn route records
its own duration, and every search reports how many states it looked at.

FOUR DEFECTS ALSO STOPPED STANDING. The stop-at control reaches the stop hook,
the hook records what it decides, the built surface cannot drift from its
source, and the rigor matrix reports the rows it has.

## What was not

ANYTHING FASTER. The one speed change attempted removed the route drawing from
a bare aim, on the belief that drawing is the cost that grows with distance.

THE MEASUREMENT KILLED THE BELIEF. Building a session costs 33 milliseconds. One
expand costs 3.7 cold and 0.1 warm. A whole six-hop route costs 68. The change
was reverted, because skipping the drawing also gave up the only answer to
whether a target is reachable.

## Where the time goes is known now, and it is not what anybody guessed

THE SWEEP WAS MEASURED before this gate closed, and the answer is sharp.

| hop | what it cost to walk |
| --- | --- |
| `boot/start` | 3,877 ms |
| `boot/read_contract` | 3,468 ms |
| `boot/prepare_desk` | 3,475 ms |

THREE HOPS, 15,404 MILLISECONDS. The route drawing for the same three came to
under thirty.

THE UNIFORMITY IS THE FINDING. Those three states do entirely different work and
cost within twelve per cent of each other. A cost that does not vary with what
the state does is not the state's work — it is a fixed toll every hop pays.

ONE BARE PROCESS START on this machine is 47 ms, so a hop is worth about 74 of
them.

WHAT IS STILL UNKNOWN is which fixed thing that is. The candidates are the
condition scripts, the corpus re-read, the drawing epoch, and the state's entry
bookkeeping. Splitting one hop is the next measurement, and counting hops will
not find it.

## Why this is an issue rather than a risk

IT HAD ALREADY HAPPENED. The round reached its delivery gate with the goal unmet,
and this entry is what stopped that being read as delivered.

## What closed it

A PROFILER, ASKED FOR TWICE BY THE OWNER. The unknown this entry names — which
fixed thing the toll is — was answered by running one, not by more guessing. Its
four candidates were all wrong.

IT IS THE ROUTE DRAWING, and specifically four reads repeated hundreds of times
per hop. Each fix is one shape: check whether the input moved, and reuse the
answer where it did not.

| what was rebuilt per ask | measured |
| --- | --- |
| a whole state form, for one field | 1,034 ms |
| the same form again, to read a signature | 914 ms |
| every reachable machine, redrawn | 498 ms |
| the trace corpus re-stat'd, 2,790 files at a time | four times a hop |

THE SAME THREE HOPS THIS ENTRY TABLED.

| hop | was | is |
| --- | --- | --- |
| `boot/start` | 3,877 ms | 716 ms |
| `boot/read_contract` | 3,468 ms | 325 ms |
| `boot/prepare_desk` | 3,475 ms | 310 ms |

THE FILE DOOR'S OWN METER went from 612,532 calls in a sweep to 22,040.

## What this entry got wrong, recorded because it matters

THE UNIFORMITY WAS READ AS A FIXED TOLL. Three states doing different work cost
within twelve per cent of each other, and this entry concluded the cost could not
be the state's own.

THAT INFERENCE WAS SOUND AND THE CANDIDATE LIST WAS NOT. The cost was uniform
because every hop redraws the route, and drawing the route is the same work
wherever you stand. None of the four candidates named it.

## What is still open

THE PUBLISHED BUDGET IS STILL MISSED, and it is carried by
`raid-iss-the-hop-is-still-over-its-published-budget` rather than here. A hop is
854 milliseconds against 250.
