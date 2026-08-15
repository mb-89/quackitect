---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: cand-memory-served
type: "[[candidate]]"
name: "Memory served"
statement: "a core and a satellite per agent, with the record's work held in memory and served through the satellite rather than through a volume, so nothing touches disk between gates"
picks:
  - "[[opt-the-satellite-holds-the-record-in-its-own-memory]]"
  - "[[opt-a-core-and-a-satellite-per-agent]]"
  - "[[opt-one-process-per-record-rooted-by-the-os]]"
  - "[[opt-one-rule-covers-reads-and-writes-alike]]"
  - "[[opt-the-common-path-needs-no-tree-the-rare-one-names-it]]"
  - "[[opt-thin-tree-reads-shared-from-trunk]]"
  - "[[opt-name-the-resolved-tree-in-every-answer]]"
  - "[[opt-the-claim-file-registers-the-tree]]"
  - "[[opt-one-resolution-seam-not-a-rule-per-tool]]"
---

## FOLDED INTO cand-core-satellite, 2026-08-14

THIS IS NO LONGER A SEPARATE CANDIDATE. The owner ruled that it and
[[cand-core-satellite]] do not preclude each other: it is that line with one
cell moved, so putting both on a front compares a design against itself.

THE STORAGE QUESTION NOW RIDES cand-core-satellite as a refinement, with the
trade written out there.

AND IT IS WIDER THAN EITHER LINE. Holding a record's work in memory is a
choice EVERY line on the chart can make - whatever serves a record can hold
it. That is recorded on
[[opt-the-satellite-holds-the-record-in-its-own-memory]], which is adoptable
by all seven and therefore scored nowhere.

THIS RECORD IS KEPT RATHER THAN DELETED because the argument in it is the
fullest statement of the memory case anywhere, and because a losing line
stays on record. It is not judged as a candidate.

## Why this one

IT IS THE OWNER'S OWN PICTURE, drawn whole. Work on a record starts, its
content comes into memory, every read and write goes to the satellite that
holds it, and it goes back out at the gates. Input, processing, output,
applied to storage rather than to a walk.

YOU NEVER READ AN ITERATION BY GOING TO DISK. You ask the satellite. On trunk
you ask the core. The lane's own read verb, the trace graph, the panel and the
forms all keep the door they already use, and the door resolves to memory.

IT DIFFERS FROM [[cand-core-satellite]] IN EXACTLY ONE CELL, and the pair
exists so that cell's cost is visible instead of assumed. Both run a core and
a satellite per agent. This one holds the work in memory; the other leaves it
on disk. Everything else is identical.

THAT IS WHAT A FRONT IS FOR. Two lines one cell apart make the trade legible
in a way a single line with a footnote never does.

## What it sheds

DURABILITY BETWEEN GATES. Work held in memory is gone on a crash or a power
cut. req-crash-lands-safe and req-no-agent-act-destroys-work are standing
musts, and the owner's own framing accepts a bounded loss - commit at the
gates, so not too much goes. Whether "not too much" satisfies a must is a
question this line does not get to answer for itself.

THIRD-PARTY SIGHT OF THE FILES. An editor, a hand-run git command, a person's
own tooling - none of those speaks to a satellite. Our surfaces are fine; the
ones we did not write are not.

## What it does NOT shed, corrected 2026-08-14

A RAM DISK AND A KERNEL DRIVER. This line reaches memory through the process
that already serves the record, so there is no volume, no driver, no
administrator prompt, and req-one-script-installs and req-newcomer-one-command
survive untouched. That is the whole reason it is drawn instead of the RAM
disk line.

## How it works

EVERYTHING [[cand-core-satellite]] DOES, plus one change: the record's work
lives in the satellite's memory rather than on a volume.

OPENING A RECORD LOADS ITS CONTENT ONCE. A lane read answers from memory. A
lane write updates memory. The gates write it out, and landing writes it out.

NOBODY GOES TO DISK FOR AN ITERATION. The lane's read verb, the trace graph,
the panel and the forms all use the door they already use, and the door
resolves to the satellite. Trunk works the same way one level up: you ask the
core.

SO THE SURFACES ARE UNAFFECTED. req-a-surface-resolves-to-what-it-shows is
about a surface resolving against the record it shows, and a surface that
resolves through the lane keeps resolving through the lane.

WHERE THE SATELLITE LOADS ITS ENGINE CODE FROM: the record's own tree, read
once at start like everything else. The owner ruled that door open on
2026-08-14.

NO RAM DISK AND NO DRIVER. The thing a RAM disk provides - files that live in
RAM - is provided by the process that already reads them. That is the whole
reason this line is drawn and [[opt-a-records-work-lives-on-a-ram-disk]] is
not: the RAM disk needs a kernel driver and administrator rights, and this
needs neither.

## What it costs

DURABILITY BETWEEN GATES, and it is the only serious cost. Work held in memory
is gone on a crash or a power cut. req-crash-lands-safe and
req-no-agent-act-destroys-work are standing musts. The owner's framing accepts
a bounded loss - commit at the gates - and whether a bounded loss satisfies a
must is not this line's to decide.

A WRITE-BACK DESIGN NOBODY HAS DRAWN. What is flushed, when, in what order,
and what happens when a flush fails halfway. A partial flush is worse than
none, which is the same shape as a partial fan.

MEMORY PER OPEN RECORD, unmeasured. Twenty-seven trees stood on this machine
on 2026-08-13, and the target machine is a laptop already short of headroom.

THIRD-PARTY SIGHT OF THE FILES. An editor, a hand-run git command, a person's
own tooling - none speaks to a satellite. Our surfaces are fine; the ones we
did not write are not.

EVERY COST cand-core-satellite CARRIES, on top: the protocol, the supervisor,
the partial-failure states, the per-record start-up.

## What it leans on

- THAT THE GATES ARE FREQUENT ENOUGH. The whole durability argument is that a
  crash loses only the work since the last gate. Nobody has measured how long
  that window actually is on a real walk.
- THAT WRITE AND METADATA COST IS WHERE THE TIME GOES. This is the line's main
  speed argument and it is unprofiled. Windows already caches file content and
  metadata in RAM, and standby RAM is as fast as empty RAM, so the READ half of
  the argument is largely already true today without this line.
- EVERYTHING cand-core-satellite LEANS ON, unchanged, because it is that line
  with one cell moved.
