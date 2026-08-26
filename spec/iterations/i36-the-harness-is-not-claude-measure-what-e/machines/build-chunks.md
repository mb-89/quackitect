---
steps:
  - id: server-lifecycle-logging
    statement: PROMOTED from exp-copilot-connection-reset-keeps-server-alive - durable server lifecycle logging and an explicit HTTP keep-alive policy, so a transport reset is distinguishable from a server exit
    depends_on: []
    realization: code
  - id: harness-registry
    statement: One place naming every supported harness and the limits measured for it, read by the engine rather than copied into it
    depends_on: []
    realization: code
  - id: harness-identification
    statement: The lane names which harness it is running in, and the name is available before the first work state
    depends_on:
      - harness-registry
    realization: code
  - id: payload-limit-guard
    statement: No instruction text and no tool description served to a harness exceeds that harness's measured limit
    depends_on:
      - harness-registry
    realization: code
  - id: cage-inventory-check
    statement: The live tool inventory of a caged session holds zero native project tools and keeps the permitted web-search exception
    depends_on:
      - harness-registry
    realization: code
  - id: stopping-layer-report
    statement: A call ending without a normal result names the layer that ended it - server, transport, host or stop hook - or says unknown
    depends_on:
      - server-lifecycle-logging
    realization: code
  - id: bound-ties-to-measured-limit
    statement: The answer bound reads the smallest measured inline host limit, and cursor paging reconstructs the whole result byte for byte
    depends_on:
      - harness-registry
    realization: code
  - id: boot-tolerates-stale-test-record
    statement: Boot reaches the front desk over a stale or malformed test record, with no manual repair and no check silenced
    depends_on: []
    realization: code
  - id: recurring-failure-becomes-work
    statement: A non-misuse failure shape repeating inside the window mints exactly one piece of durable work carrying an owner and a trigger
    depends_on: []
    realization: code
  - id: spill-is-per-server
    statement: The answer spill directory belongs to the server that wrote it, not to a module global, so parallel servers at different roots stop reading each other's spill
    depends_on: []
    realization: code
---

# The build drawing

Ten chunks. Five have no dependency and start together; the rest wait on one
thing each.

## What shapes the order

THE REGISTRY IS THE ROOT. Four chunks need to know which harness they are
talking to and what its measured limits are, so the registry lands before any
of them. It is deliberately small: a list and a table of numbers, with no
behaviour of its own.

THE PROMOTED SPIKE STARTS. `server-lifecycle-logging` enters pre-verified from
exp-copilot-connection-reset-keeps-server-alive, which already measured the
reset it exists to explain. It is assigned on that experiment node's `chunk:`
key.

TWO CHUNKS ANSWER TO NOBODY. `boot-tolerates-stale-test-record` and
`recurring-failure-becomes-work` touch neither the harness list nor the
transport, so they run in parallel with everything else.

## The strategies that shaped this

RISK FIRST, for the two that carry the iteration's own uncertainty. The
stopping-layer report is the one thing the spike could not settle, and the
harness registry is what every other harness claim rests on.

THIN SLICES, so an interruption costs one chunk rather than the build. No
chunk here spans two elements.

DEPENDENCY, and only where it is real. `stopping-layer-report` genuinely
cannot be written before the lifecycle log exists, because the log is the
evidence it reports from. Everything else that looks sequential is not.

## What is deliberately not a chunk

THE LIVE STOP CONTRACT REMAINS OWED. The spike's own fold says so: the
stop-event half still needs a live Copilot observation, and no amount of code
substitutes for it. It is an open assumption, not a build step.

THE RECURRENCE THRESHOLD IS UNDECIDED. req-repeated-failure-shape-becomes-durable-work
carries no measure, so `recurring-failure-becomes-work` builds the mechanism
against the cheapest reading - twice is recurrence - and the number moves when
the measure lands.

## Why the spill chunk is here and not in a later iteration

THE BATTERY CANNOT BE TRUSTED UNTIL IT IS FIXED, and verification fires the
battery. A run on 2026-08-19 returned 94 failures out of 1405, and the great
majority carried one message: `spill read failed`, with the named file simply
absent.

THE CAUSE IS A MODULE GLOBAL. `bound.ts` keeps `spillDir` at module scope and
`tools.ts` sets it from the root at every server build. The test runner builds
servers at different temporary roots in one process and runs them in parallel,
so the last build wins and every other server writes its spill into a
directory its own reader never looks in.

THE CURSOR PATH IS THE OTHER HALF. `spill()` returns the fixed string
`.se/answers/<tool>.json`, which the reader resolves against ITS root. A path
that does not say which root it belongs to cannot survive two roots.

SO IT IS THIS ITERATION'S WORK. The requirement it serves is
req-oversized-results-remain-recoverable-through-the-lane, whose whole claim
is that a bounded result is reconstructable through the lane. A spill the
reader cannot find is that requirement failing, and the battery has been
saying so.
