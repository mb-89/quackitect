---
form: memory-served
by: agent
signed_off: 2026-08-14T10:47:00.000Z
authors: agent
files:
---

# Evidence form / memory-served

## current_situation

cand-memory-served is composed. Three sections written into the candidate
note, nothing minted from here.

IT IS cand-core-satellite WITH ONE CELL MOVED. Same core, same satellites,
same rooting, same engine answer. The record's work lives in the satellite's
memory rather than on a volume.

THE PAIR EXISTS SO THAT CELL'S COST IS VISIBLE. Two lines one cell apart make
a trade legible in a way one line with a footnote never does, and if they
score identically the method says out loud that the cell does not matter.

THE OWNER'S CORRECTION IS BUILT INTO IT. An earlier draft of the option said
this shape loses visibility of the files. That was too broad. Nobody reads an
iteration by going to disk - they ask the satellite, and on trunk they ask the
core. Our own surfaces keep the door they already use. What is genuinely lost
is THIRD-PARTY sight: an editor, a hand-run git command, tooling we did not
write.

THE RAM DISK IS NOT WHAT THIS LINE USES, and that is the finding rather than a
detail. A RAM disk on Windows needs a kernel driver and administrator rights,
because Windows ships none. The process that already serves the record can
hold the files with no volume, no driver and no install.

## built

project/spec/trace/candidate/cand-memory-served.md - three sections appended:
How it works, What it costs, What it leans on.

No node minted from this state.

## follow_up

DURABILITY IS THE OPEN QUESTION AND IT IS A `must`. Work held in memory is
gone on a crash. req-crash-lands-safe and req-no-agent-act-destroys-work both
stand. The owner's framing accepts a bounded loss - commit at the gates - and
whether a bounded loss satisfies a must is the gate's to rule on, not this
line's.

NOBODY HAS MEASURED THE GATE WINDOW. The whole durability argument is that a
crash loses only the work since the last gate. How long that is on a real walk
is unknown, and it is the number that decides whether the bound is acceptable.

THE READ HALF OF THE SPEED ARGUMENT IS LARGELY ALREADY TRUE. Windows caches
file content and metadata in standby memory, and standby RAM is as accessible
as empty RAM. A second read of a small file already comes from memory today.
What this line actually buys is on WRITES and metadata churn, and that is
unprofiled.

THE WRITE-BACK DESIGN IS UNDRAWN: what is flushed, when, in what order, and
what happens when a flush fails halfway.

## anything_else

WHY THE RAM DISK STAYS ON THE CHART THOUGH NO LINE TAKES IT.

The owner asked for the memory answer to be kept as a candidate, and it is -
by the road that costs least. opt-a-records-work-lives-on-a-ram-disk remains
on the chart as the answer a profile could revive: if the slow calls turn out
to be write- or metadata-bound AND holding files in a process turns out to be
unworkable, a volume is the fallback.

IT IS NOT DEAD, IT IS SECOND. That distinction is worth keeping, because the
reason it is second is an install cost rather than a performance one, and
install costs can change.

WHAT WOULD MOVE IT TO FIRST: a profile showing heavy write and metadata cost,
plus a reason the in-process answer cannot work. Neither exists today.
