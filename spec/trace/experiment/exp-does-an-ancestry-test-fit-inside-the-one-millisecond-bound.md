---
minted_in: i37-training-iterations-a-disposable-iterati
id: exp-does-an-ancestry-test-fit-inside-the-one-millisecond-bound
type: "[[experiment]]"
statement: Can the ancestry test a checked ceiling makes on every resolved commit answer inside the one millisecond bound declared on if-benchmark-binding-to-guard?
probes:
  - raid-ar-call-answers-in-one-second
  - raid-ar-surface-answers-in-one-second
timebox: minutes — 200 iterations of three candidate primitives
form: calculation
faked: the lane. The primitives were timed as bare subprocesses rather than through se_git, so the number EXCLUDES the lane's own dispatch, logging and toll. The real figure is higher than this one, never lower.
fallback: "pre-agreed before the run: if the primitive fits inside a millisecond, the checked ceiling keeps its bound and the two one-second risks discharge as addressed."
folds_to: if-benchmark-binding-to-guard — the millisecond was the agent's own and is replaced by a derived bound
promote: none — the checked ceiling it measured is no longer the design
verdict: falls
source_refs:
  - if-benchmark-binding-to-guard
  - exp-can-the-lane-read-from-a-history-that-ends-at-the-rewind-point
  - cand-the-refusing-run-with-recorded-conditions
---

## The run

RUN 2026-08-19. 200 iterations each, on this machine, against this repository.

| primitive | microseconds per call | against a 1000 microsecond bound |
| --- | --- | --- |
| `git merge-base --is-ancestor` | **4229** | **4.2x over** |
| `git rev-parse --verify` | 1708 | 1.7x over |
| `git cat-file -e` | 1897 | 1.9x over |

## The verdict

IT FALLS. Every route is over the bound, and the cheapest is still 1.7 times
it.

## Why it falls, which decides whether it is fixable

THE COST IS THE SPAWN, NOT THE ANSWER. `rev-parse --verify HEAD` does almost
no work and still costs 1.7 milliseconds, which is the floor for starting a
process on this machine. Ancestry adds about 2.5 milliseconds of real
computation on top.

SO NO CHOICE OF GIT SUBCOMMAND FIXES IT. A checked ceiling that shells out on
every resolved commit, ref and path pays a process launch every time, and the
bound was set at a millisecond precisely because the guard sits under the walk
it is measuring.

## What this measures, and what it leaves out

THE NUMBER EXCLUDES THE LANE. These are bare subprocesses. A real check runs
inside `se_git` or the resolver, which adds dispatch, logging and the toll.

SO THE MEASUREMENT IS A FLOOR. The real cost is higher than 4229 microseconds,
never lower.

## What it settles, with the first spike beside it

THE TWO SPIKES ANSWER EACH OTHER.

- A CHECKED ceiling costs 4.2 milliseconds per resolution and breaches its own
  bound by a factor of four.
- A STRUCTURAL ceiling costs NOTHING per resolution, because there is no test
  to run. The object is absent, and asking for it fails in git's own object
  lookup rather than in a guard.

A BENCHMARK THAT SLOWED THE WALK IT MEASURES WOULD MEASURE ITSELF. That was
the argument for the millisecond bound at decompose-structure, and this is the
number that turns it from a worry into a finding.

## What it does not settle

Whether the walk resolves commits often enough for 4.2 milliseconds to matter
in aggregate. Nothing has counted resolutions per state. The bound was
declared per crossing, so it is breached whatever the frequency, but the total
cost is unmeasured.

## The threshold was invented, and this verdict is re-read

CORRECTED 2026-08-19, after the owner asked where the one millisecond bound
came from.

IT CAME FROM THE AGENT, at decompose-structure, on nobody's authority. It was
the only millisecond bound in the corpus; every other interface declares one
second or says one second does not apply.

SO `falls` IS A VERDICT AGAINST AN INVENTED THRESHOLD. The measurement stands
and the judgment does not.

WHAT STANDS: `git merge-base --is-ancestor` costs **4229 microseconds** per
call, the cost is the process spawn, and no git subcommand is meaningfully
cheaper.

WHAT FALLS AWAY: the claim that a checked ceiling "breaches its bound
fourfold". Against the product's actual convention — one second for an answer
to a caller — 4.2 milliseconds per resolution is only a problem if a lane call
resolves many commits, and nobody has counted.

WHAT SURVIVES INTACT, and it is the part the fold-back rests on: a structural
ceiling costs NOTHING per resolution, because there is no test to run. That
comparison needs no threshold at all. 4229 microseconds against zero is an
argument; 4229 microseconds against a number the agent picked is not.

THE REAL UNKNOWN IS NOW NAMED: resolutions per lane call, unmeasured, and it is
what any future bound on this crossing has to be derived from.
