---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-asm-every-shipped-iteration-carries-a-started-commit-naming-it
type: "[[raid]]"
kind: assumption
statement: "Every shipped iteration has exactly one commit whose message names it as started, so a rewind point can be found for any of them mechanically."
owner: the maintainer of the machine
trigger: the first benchmark run that names an iteration other than i33
status: probed
defer_until: "M7 reaches a state where se_git is legal — the check is one log query, `git log --format=%s | grep '^iteration .*: started$'`, compared against the fifteen shipped records"
impact: "A benchmark cannot be pointed at part of the archive, and which part fails is discovered one run at a time rather than known."
breaks_how_badly: crippling
how_likely: plausible
probe: "FALSE, measured 2026-08-20 at run-demos. 16 shipped iterations, 6 with exactly one started commit, 10 with none, 0 with two. rewindPointFor resolves 6 of 16, so the benchmark pool is six."
probed: 2026-08-19
source_refs:
  - req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
  - fn-the-benchmark-run.locate-the-rewind-point
weighs_with: none
weighs_against: none
---

## Probe

HOW TO CHECK IT, and it is one call. Ask the log for every commit whose
subject matches `iteration <id>: started` and compare that list against the
eleven pinned records.

WHY IT IS PLAUSIBLE RATHER THAN CONCEIVABLE. The stamping code exists today
and `markStarted` writes it. But it is guarded by a check on whether `started:`
is already in the record, and records predating that guard may never have been
stamped. i27 is a folder without the modern id shape, which is one visible sign
that the archive is not uniform.

WHAT FALSIFIES IT. Any pinned record with no started commit, or with two.


## PROBED 2026-08-20 — FALSE, and worse than this node feared

RUN AT run-demos, where `se_git` finally came within reach. One script over the
whole archive.

    shipped iterations       16
    with exactly one         6
    with none                10
    with more than one       0
    rewindPointFor resolves  6 of 16

THE TEN WITHOUT: i1, i2, i3, i8, i12, i15, i17, i27, i28, i34.

THIS NODE SUSPECTED i27 because it is the one folder without the modern id
shape. i27 is among them — and so are i15, i28 and i34, which are recent. The
cause is not age.

## The mechanism was on this node all along

`markStarted` returns early when a record already carries `started:`, so a
field written any other way suppresses the commit forever. Every one of the
sixteen HAS the field. Its presence is exactly what hides its absence.

## What it costs, and it is a design claim rather than a number

THE BENCHMARK POOL IS SIX, NOT SIXTEEN: i5, i6, i11, i16, i33, i35.

`raid-dec-an-archived-iteration-is-the-benchmark-and-nothing-is-authored` rests
on the archive being reachable material. Two thirds of it is not reachable.
Nothing about the MECHANISM changes; how much it has to work with does.

THE DEFAULT RUN IS UNUSABLE UNTIL THIS IS FIXED, and that is the sharp end.
`leastRecentlyBenchmarked` sorts never-benchmarked first, and the
lowest-sorting shipped iteration is i1, which has no start commit. So
`se_benchmark` with no argument REFUSES every time. Demonstrated at run-demos
before the named run was made.

## Two fixes, and they are not the same fix

- FILTER THE POOL to iterations that can bind. Cheap, honest, and it makes the
  default work today. It also makes the pool silently smaller, so the filter
  has to SAY how many it dropped.
- BACKFILL THE TEN with a start commit each. Recovers the material, and it is
  archaeology: the right commit for each has to be found rather than guessed,
  and a guessed rewind point is worse than none.

THE FIRST IS THIS ITERATION'S TO DO IF IT SHIPS. The second is not.

## Half-probed 2026-08-20, and the half that was reachable HOLDS

WHY ONLY HALF. The probe is a git log query and `se_git` is not legal in a gate
state. The tools that ARE legal answer a narrower question, and that narrower
question was run.

WHAT WAS MEASURED. Fifteen records now carry `status: shipped`, not the eleven
this node was written against. ALL FIFTEEN CARRY A `started:` STAMP, including
`i27`, which is the one folder without the modern id shape and the reason this
node was graded plausible rather than conceivable.

WHY THAT IS NOT THE ANSWER. `markStarted` in `engine/iterations.ts` writes the
field and the commit TOGETHER:

    if (/^started: /m.test(raw)) return;
    writeFileSync(recAbs, ... `status: open\nstarted: ${...}` ...);
    git(it.path, ["add", "-A"], "add");
    git(it.path, ["commit", "-q", "-m", `iteration ${it.id}: started`], "commit");

THE GUARD IS THE WHOLE RISK. A record that already carries `started:` returns
before the commit. So a field written by hand, by an older code path, or by a
migration suppresses the commit forever, and the field's presence is exactly
what hides it.

SO THE FIELD BEING UNIVERSAL RAISES THE ODDS AND SETTLES NOTHING. Fifteen of
fifteen have the field. How many have the commit is unknown, and the failure
mode is silent by construction.

## Why it is deferred rather than accepted

ACCEPTING IT WOULD BE ACCEPTING THE THING THE NODE WAS MINTED TO DOUBT. The
check is one command and it is blocked only by where the walk currently stands,
which is the weakest possible reason to close a crippling assumption.

THE UNTIL IS MECHANICAL, not a judgment call: the first state in M7 whose legal
tools include `se_git`. The exact command is in the frontmatter.
