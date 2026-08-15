---
minted_in: i27
id: opt-a-records-work-lives-on-a-ram-disk
type: "[[option]]"
statement: put a record's whole working copy on a RAM disk when the record opens, work there for the length of the walk, and push it back to durable storage at the gates
cluster: cluster-the-walk
question: where a record's working files live while it is open
found_by: prior_art
source: "owner ruling 2026-08-14: research RAM discs on Windows — when you start an iteration you put it in RAM, you work only in RAM, at the end you push it out of RAM, you commit at the gates so not too much gets lost"
---

## Mechanism

Opening a record materialises its working copy on a RAM-backed volume. Every
lane call resolves there. At each gate the work is committed out to durable
storage, and closing the record flushes and releases the volume.

IT IS THE IPO SHAPE APPLIED TO STORAGE. Input at open, processing in RAM,
output at the gates.

## What Windows actually offers, researched 2026-08-14

WINDOWS SHIPS NO RAM DISK. There is no tmpfs equivalent in the box, which is
why a third-party market exists at all.

- IMDISK TOOLKIT is free and open source, and supports unattended install
  with `/fullsilent`. It installs a KERNEL DRIVER and requires
  administrator rights; version 2.1.1 raises a UAC prompt when called with
  reduced privileges.
- OSFMOUNT is free but proprietary. It creates multiple RAM drives with no
  size limit and can set them read-only.
- ARSENAL IMAGE MOUNTER is the driver behind a maintained ImDisk
  replacement (tmcdos/ramdisk on GitHub), for a project that wants a
  supported driver rather than the older one.
- BENCHMARKS DISAGREE ABOUT WHICH IS FAST. One comparison rates OSFMount
  consistently fast; another rates ImDisk the slowest RAM disk it tested.
  Nobody here has run either.

## The disconfirming finding, which matters more than the tools

WINDOWS ALREADY CACHES FILE CONTENT AND FILE-SYSTEM METADATA IN RAM. That is
what standby memory is, and for practical purposes standby RAM is as
accessible as empty RAM.

SO A RAM DISK BUYS LITTLE ON READS of small, recently-touched files. The
second read is already coming from memory. This corpus is thousands of small
markdown files, read over and over, which is precisely the case the cache
already serves.

WHERE IT STILL WINS: writes and metadata churn. Creating, renaming and
deleting many small files goes through the file system and the journal on a
real volume and goes nowhere on a RAM disk.

WHERE IT WINS NOTHING AT ALL: a CPU-bound workload.
raid-asm-the-target-machine-is-many-throttled-cores records the machine that
drove the owner off it today, and its named problem is clock speed rather
than storage. A RAM disk is an IO fix aimed at a CPU bottleneck.

## What it costs

AN ADMIN INSTALL AND A KERNEL DRIVER, which collides head-on with
req-one-script-installs, req-newcomer-one-command and req-fresh-machine-runs.
Every one of those is about a newcomer getting running without ceremony, and
a driver install with a UAC prompt is ceremony.

VOLATILITY. Everything in RAM is gone on power loss or a crash. The owner's
own framing accepts that - commit at the gates, so not too much is lost - but
req-crash-lands-safe and req-no-agent-act-destroys-work are standing musts,
and work between two gates is exactly what would be lost.

SIZING. A RAM disk is a fixed reservation on a machine already short of
headroom. The throttled laptop is not obviously a machine with spare RAM.

## The honest verdict for the chart

IT IS A REAL OPTION AND IT IS AIMED AT THE WRONG BOTTLENECK ON TODAY'S
EVIDENCE. It stays on the chart because the evidence is one owner report and
no profile, and a profile could move it.

PROFILE FIRST. If the slow calls turn out to be write- or metadata-bound this
option becomes strong. If they are CPU-bound it is dead weight, and the fix
is spreading work across the cores the machine actually has.
