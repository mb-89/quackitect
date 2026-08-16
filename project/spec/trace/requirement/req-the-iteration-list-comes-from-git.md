---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: req-the-iteration-list-comes-from-git
type: "[[requirement]]"
statement: When the container is asked which iterations exist, the engine shall derive each iteration's open state from its record status on local git refs, and shall not use the presence of a worktree directory to decide it.
kind: functional
characteristic: functional-suitability
verify_method: test
breaks_if_removed: A machine that never held an iteration's folder cannot see that iteration at all, so a fresh clone finds no work and cannot be given any.
breaks_how_badly: crippling
refines:
  - uc-start-an-unattended-machine
source_refs:
  - uc-start-an-unattended-machine step 4
  - sty-work-on-two-machines
  - raid-asm-git-answers-open-without-a-worktree
  - raid-no-iterations-are-visible-without-a-reachable-remote
priority: must
---

## Detail

THE TWO ANSWERS THAT DISAGREE TODAY, and this row removes one of them.

| reader | how it answers today | after this row |
| --- | --- | --- |
| the container, engine/iterations.ts itList | `open: existsSync(path)` | the record status, from git |
| the survey, engine/survey.ts | status not in shipped or closed | unchanged |

LOCAL REFS, NEVER THE REMOTE. The question is answered from `refs/heads/it/*`
in the local clone. A fetch refreshes those refs and is not part of answering.
An implementation that queries the remote to list iterations fails this row,
and it is the easiest wrong version to write by accident.

DISK PRESENCE MAY REMAIN AS A CACHE. What it may never be is the answer. A
cache that disagrees with git is a bug in the cache; today it is the truth.

## Why it is not a quality row

It carries no measure. The cost of the git read is a separate concern and it
is [[raid-asm-git-answers-open-without-a-worktree]], whose probe times both
paths at the real iteration count before this row is implemented.
