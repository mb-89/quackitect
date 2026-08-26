---
steps:
  - id: a-hop-carries-its-own-time
    statement: Every hop of a drawn route records what the drawing cost, and every search reports how many states it looked at, so a slow route names the slow hop instead of only its total
    depends_on: []
    realization: code
  - id: the-notch-reaches-the-tooth
    statement: The stop-at notch rides every pull so the stop hook can obey it, and the hook records all three of its outcomes so a stop it permitted can be told apart from one it failed to judge
    depends_on: []
    realization: code
  - id: the-built-surface-matches-its-source
    statement: The generated editor extension is rebuilt from its source, and a check refuses a committed build that its source no longer produces
    depends_on: []
    realization: code
  - id: pointing-keeps-the-reachability-answer
    statement: Pointing the walk draws its route and skips only the walking, because the measurement showed the drawing costs almost nothing and is the only thing that can say whether the target is reachable
    depends_on:
      - a-hop-carries-its-own-time
    realization: code
  - id: the-drawer-tells-deciding-from-failed
    statement: The route drawer stops reading a step whose judgment is still being reached as a step that failed, so a route is not abandoned because an answer had not arrived yet
    depends_on: []
    realization: code
  - id: a-record-that-holds-still-to-measure-against
    statement: A committed record of fixed size stands as the yardstick, so a walk that got slower can be told apart from a record that got bigger
    depends_on:
      - a-hop-carries-its-own-time
    realization: code
  - id: re-signing-an-answer-knocks-down-what-rests-on-it
    statement: Signing an answer again knocks down every answer that rested on it, so nothing keeps standing on ground that moved underneath it
    depends_on: []
    realization: code
  - id: a-score-cell-can-say-it-has-no-evidence
    statement: A score cell with nothing behind it says so in words, rather than carrying a number that reads exactly like a measured one
    depends_on: []
    realization: code
---

# The build drawing

Eight chunks. Six are independent and fan out; two wait on the timing work,
because they are decided BY that measurement.

## This drawing was authored twice, and the second time is the honest one

THE FIRST VERSION HAD FOUR CHUNKS, and they were exactly the four things that had
already been built. A drawing written after the build lists what happened, so it
cannot show what did not.

WHAT IT HID: four of the seven items this phase's own brief says are owed here
were absent, and no form recorded their withdrawal. A cold reviewer found the gap
by reading the brief rather than the drawing.

THE OWNER RULED THAT NOTHING LEAVES SCOPE, so the four are chunks now rather than
an omission.

## Which lenses shaped the order

TWO, AND THE SECOND IS THE ONE THAT MATTERS HERE.

RISK FIRST. The round's whole claim is that the walk is slow and that the
slowness is measurable. Nothing else could be judged until something measured a
hop, so `a-hop-carries-its-own-time` runs first and alone.

PARALLEL FLOW. The three independent chunks touch different files. The timing
work is in the route drawer, the notch work is in the pull packet and the stop
hook, and the surface work is in the build script and its guard. Nothing flows
between them, so nothing orders them.

## Why the fourth chunk waits

IT IS NOT A FILE DEPENDENCY. It is an evidence dependency.

The bare aim was built to skip the route drawing, on the reasoning that drawing
is the cost that grows with distance. That reasoning had no measurement behind
it.

The first chunk is what could measure it. Building a session costs 33 ms. One
expand costs 3.7 ms cold and 0.1 ms warm. The whole route to `end` costs 68 ms
over six hops, visiting six states.

So the fourth chunk is the first chunk's verdict applied. Skipping the drawing
saved tens of milliseconds and gave up the reachability answer, and it was
reverted.

## What each chunk is answering for

- `a-hop-carries-its-own-time` answers
  [[req-a-hop-of-the-walk-carries-its-own-time-budget]].
- `the-notch-reaches-the-tooth` answers the stop-at control doing what the
  person sets it to, which nothing answered for before.
- `the-built-surface-matches-its-source` answers a fix reaching the surface a
  person actually looks at.
- `pointing-keeps-the-reachability-answer` answers
  [[req-aiming-returns-before-the-walking-starts]] and
  [[req-a-target-that-cannot-be-reached-is-refused-quickly]] together.

## The four that were owed and were missing

EACH IS NAMED IN THE PHASE BRIEF and none was built in the first pass.

- `the-drawer-tells-deciding-from-failed` repays the standing debt. It is the
  likeliest mechanism behind the slow tail: a route-failing pull ran past thirty
  seconds 36 per cent of the time against 2 per cent for every other pull.
- `a-record-that-holds-still-to-measure-against` is the yardstick. Without it a
  walk that got slower cannot be told from a record that got bigger, which is why
  the hop-budget row could record a duration and enforce nothing.
- `re-signing-an-answer-knocks-down-what-rests-on-it` closes the case where a
  feeder answers again and its dependants keep standing on ground that moved.
- `a-score-cell-can-say-it-has-no-evidence` stops a blank reading as a measured
  number.

## What is deliberately not chunked here

THE PER-HOP TIME ITSELF, now that it is measured and inside its budget. The
mechanical flip costs 11 to 12 milliseconds warm against a budget of 250, and
bumping the drawing epoch costs nothing measurable.

THE SECONDS ARE THE STATES' OWN WORK — reading, condition scripts, entry duties —
and the owner has ruled that acceptable provided the person is told something is
happening. That signal is a different row and it has its own open issue.

SO THERE IS NOTHING LEFT TO CHUNK ABOUT THE FLIP. Chunking a fix for a cost that
is already inside its budget would be the same mistake this round made once
already, in the other direction.
