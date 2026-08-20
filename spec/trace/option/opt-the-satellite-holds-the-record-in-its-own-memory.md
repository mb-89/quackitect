---
minted_in: i27
id: opt-the-satellite-holds-the-record-in-its-own-memory
type: "[[option]]"
statement: hold a record's working copy inside the process serving it rather than on any volume, so a read is a memory lookup and a write is a memory write, with durable storage touched only when the record lands
cluster: cluster-the-walk
question: where a record's working files live while it is open
found_by: transform
source: taking the RAM disk idea and asking what it is FOR — if the point is that the work lives in memory, a volume is one way to get there and the process's own heap is another
---

## Mechanism

The engine serving a record loads that record's files once and keeps them.
A lane read answers from memory. A lane write updates memory. Durable storage
is written at the gates and at landing.

NO DRIVER, NO VOLUME, NO ADMIN. The thing a RAM disk provides - files that
live in RAM - is provided by the program that already reads them.

## Why this is the transform rather than the original

A RAM DISK PUTS A FILE SYSTEM BETWEEN THE ENGINE AND ITS OWN DATA, and then
puts that file system in memory. If the goal is memory-speed access, the file
system in the middle is the part that can be removed rather than accelerated.

WHAT THE FILE SYSTEM WAS BUYING: other programs can see the files. An editor,
a git command, a person's own tooling. That is not nothing, and it is exactly
what this option sheds.

## Every line can take this, corrected 2026-08-14

AN EARLIER DRAFT SAID THIS NEEDED A PROCESS PER RECORD. That was too narrow
and the owner corrected it: holding a record's work in memory is a choice
EVERY candidate on the chart can make.

WHATEVER SERVES A RECORD CAN HOLD IT. A satellite can. A single shared engine
can, keyed by record. The thing that reads the files is the thing that can
keep them, and every line has one.

WHAT DIFFERS BETWEEN LINES IS THE BILL, not the possibility.

- A process per record pays memory per process and gets isolation free.
- One shared engine pays for every open record at once, in one heap, and has
  to key the store by record itself.

SO THIS IS A ROW-WIDE REFINEMENT rather than a property of any shape, and it
is adoptable by all seven lines. It is scored nowhere for that reason: an
option every candidate can take differentiates none of them.

OUR OWN SURFACES DO NOT LOSE SIGHT OF ANYTHING, and an earlier draft of this
option said they did. That was wrong and the owner corrected it the same day.

NOBODY READS AN ITERATION BY GOING TO DISK. They ask the satellite, and the
satellite answers. The trace graph, the panel, the forms and the lane's own
read verb all go through the same door they already go through, and the door
resolves to memory instead of to a volume. Trunk works the same way one level
up: you ask the core rather than the disk.

SO req-a-surface-resolves-to-what-it-shows IS UNAFFECTED. A surface that
resolves through the lane keeps resolving through the lane.

WHAT IS GENUINELY LOST IS THIRD-PARTY SIGHT. An editor opening a file, a git
command run by hand, a person's own tooling - none of those speaks to the
satellite, and none of them would find the file. That cost is real and it is
smaller than the one this option was first written with.

## What it costs

DURABILITY, the same as the RAM disk and for the same reason. Work between
two gates is in memory only, and req-crash-lands-safe and
req-no-agent-act-destroys-work are standing musts.

A WRITE-BACK DESIGN nobody has drawn. What is flushed, when, in what order,
and what happens if a flush fails halfway.

MEMORY PER OPEN RECORD, unmeasured. Twenty-seven trees stood on this machine
on 2026-08-13.

## What it buys over the RAM disk

NO ADMIN INSTALL AND NO KERNEL DRIVER, so req-one-script-installs and
req-newcomer-one-command survive intact. That is the RAM disk's largest cost
and this option does not pay it.
