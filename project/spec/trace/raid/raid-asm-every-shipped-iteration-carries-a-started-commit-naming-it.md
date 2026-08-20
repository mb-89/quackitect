---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-asm-every-shipped-iteration-carries-a-started-commit-naming-it
type: "[[raid]]"
kind: assumption
statement: "Every shipped iteration has exactly one commit whose message names it as started, so a rewind point can be found for any of them mechanically."
owner: the maintainer of the machine
trigger: the first benchmark run that names an iteration other than i33
status: deferred
defer_until: "M7 reaches a state where se_git is legal — the check is one log query, `git log --format=%s | grep '^iteration .*: started$'`, compared against the fifteen shipped records"
impact: "A benchmark cannot be pointed at part of the archive, and which part fails is discovered one run at a time rather than known."
breaks_how_badly: crippling
how_likely: plausible
probe: "unprobed \u2014 checked on i33 only, where 5f85977f is its started commit. The other ten pinned records are unchecked."
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
