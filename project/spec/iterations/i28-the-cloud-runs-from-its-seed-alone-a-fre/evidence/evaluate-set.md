---
form: evaluate-set
amended: "2026-08-15T17:25:54.698Z by agent — cut-criteria was amended upstream; it corrected one cut row's reason and moved no rank, no cutoff and no surviving axis, so every score here still stands"
by: agent
signed_off: 2026-08-15T17:13:06.711Z
authors: agent
files:
---

# Evidence form / evaluate-set

## current_situation

Four candidates, three surviving axes, twelve scores. A spawned research agent filled the table with a clean context, as the state guidance's owner ruling of 2026-08-10 requires. It received the four records, the three requirements, the anchors and the prior-art instruction. It received nothing of the composer's reasoning.

EVERY SCORE LANDS VERBATIM. Not one was written over, and I disagree with none of the twelve.

THE ARITHMETIC ELIMINATES ONE. Three candidates trade against each other and none of the three is beaten everywhere.

### Amended after a correction upstream

THE GATE FIXED A WRONG REASON IN cut-criteria. The console row was cut for a reason that did not hold, and the same cut now rests on checkable ground.

NOTHING THIS STATE USED CHANGED.

- The cut itself stands, so the surviving axes are the same three.
- The rank order is untouched.
- The cutoff is untouched.

SO NO SCORE HERE MOVED, and none was re-derived. This amendment records the ripple rather than answering the state again.

## scores

| candidate | axis | score | anchor | prior_art |
| --- | --- | --- | --- | --- |
| cand-the-scoped-fix | req-one-command-starts-an-unattended-machine | 1 | Prose relevance only: branch-as-record lets a fresh clone see iterations, and none of the entrypoint's seven steps is designed. | - |
| cand-the-scoped-fix | req-a-worktree-exists-only-while-a-walk-is-bound | 3 | States all three transitions with a commit-or-refuse close and records its holes: crashed walk, repeating sweep, 1326 files per entry. | - |
| cand-the-scoped-fix | req-a-held-iteration-names-its-holder | 2 | Keeps the ledger unchanged and notes the two reads can differ in age, but designs no holder presentation and no refusal naming one. | - |
| cand-the-lifecycle-is-the-claim | req-one-command-starts-an-unattended-machine | 1 | Touches the adopt step in prose only; verify, install, start, wait and launch are untouched and the failure-naming half is unmentioned. | - |
| cand-the-lifecycle-is-the-claim | req-a-worktree-exists-only-while-a-walk-is-bound | 4 | The tree exists exactly while a renewed claim does, so a dead ephemeral host loses it unattended, and every cost is recorded. | Kubernetes coordination.k8s.io Lease, where a holder renews and expiry lets another machine take over |
| cand-the-lifecycle-is-the-claim | req-a-held-iteration-names-its-holder | 4 | One ref answers existence and holder together, carrying the claim's timestamp and duration, so list and holders cannot be different ages. | Kubernetes Lease fields holderIdentity, renewTime and leaseDurationSeconds carry the same three facts |
| cand-no-folders-at-all | req-one-command-starts-an-unattended-machine | 2 | A fresh clone already is the single tree, so clone-enter-walk works, but the other six entrypoint steps and the failure naming are unrecorded. | - |
| cand-no-folders-at-all | req-a-worktree-exists-only-while-a-walk-is-bound | 4 | Removes the folder class outright so none can outlive a walk, and prices it: one record per machine, commit before switching, checkout cost. | vanilla git, where one clone holds one working tree and branches are switched by checkout |
| cand-no-folders-at-all | req-a-held-iteration-names-its-holder | 3 | The claim rides the iteration's own branch so one read answers who holds it, and the dead holder's surviving claim is recorded as unanswered. | - |
| cand-the-host-is-declared | req-one-command-starts-an-unattended-machine | 4 | Deletes verify and install by declaring runtime and product in an image, and records the holes: image drift, bare host with no runtime, two paths. | devcontainer.json with GitHub Codespaces, where a declared image arrives already able to run |
| cand-the-host-is-declared | req-a-worktree-exists-only-while-a-walk-is-bound | 2 | Entry materialises only the record's folder, which covers the entry path, and nothing is written about seeding, close removal or a crashed walk. | - |
| cand-the-host-is-declared | req-a-held-iteration-names-its-holder | 1 | No claim or holder mechanism appears; the only touch is a prefetched list whose invalidation the record itself calls undesigned. | - |

## front


## reading

### The elimination, and whether I accept it

ONE CANDIDATE IS BEATEN EVERYWHERE. `cand-the-scoped-fix` scores 1, 3, 2. `cand-no-folders-at-all` scores 2, 4, 3 — higher on every axis, with no trade anywhere.

I ACCEPT IT. The arithmetic is right and I have no argument against any of the three scores that produce it.

WHAT ITS LOSS COSTS IS WORTH SAYING. It was the smallest-change candidate in the set. With it gone the front holds nothing cheap: every survivor changes something structural. That is a fact about the set, not a reason to keep a dominated member.

### No axis is flat

ALL THREE AXES SEPARATE. Every one has a spread of at least 3 points across the four candidates, so none is a criterion the decision fails to turn on, and none signals a missing criterion.

THE SEPARATION IS UNUSUALLY CLEAN, and it is worth naming why. The three axes divide the four candidates almost orthogonally. Two candidates own the claim axis, two own the worktree axis, one owns the bootstrap axis, and no candidate owns two.

### How far the front sits from utopia

UTOPIA IS 4, 4, 4 — the best score reached on each axis. Nobody is there.

- `cand-the-lifecycle-is-the-claim` at 1, 4, 4 is short by 3, on the bootstrap axis alone.
- `cand-no-folders-at-all` at 2, 4, 3 is short by 2, then 0, then 1.
- `cand-the-host-is-declared` at 4, 2, 1 is short by 0, then 2, then 3.

THE GAP IS NOT FAR ON EVERY AXIS. Each survivor is at or near utopia on something, and each has exactly one axis where it collapses. That is the shape a graftable set has, and it is the reason M5 composes rather than picks.

THE BOOTSTRAP AXIS IS THE WEAK ONE. It is ranked FIRST, on a requirement graded fatal, and three of the four candidates score 1 or 2 on it. Only the candidate that abandons the claim axis entirely reaches par there.

SO THE SET AS COMPOSED UNDER-SERVES ITS TOP CRITERION. That is a true property of these four, not a gap in any one of them: the finders that produced the options worked the worktree and claim problems, and one lone option worked the host. M5 inherits that imbalance and must answer it.

NO WINNER IS PICKED HERE. That is M5's.

## follow_up

- THREE CANDIDATES GO FORWARD: `cand-the-lifecycle-is-the-claim`, `cand-no-folders-at-all`, `cand-the-host-is-declared`
- ONE IS ELIMINATED: `cand-the-scoped-fix`, beaten on all three axes with no trade
- M5 MUST ANSWER THE BOOTSTRAP IMBALANCE. The top-ranked axis is served by exactly one survivor, and that survivor scores 1 on the claim axis.
- THE GRAFT IS AVAILABLE, since the three survivors' strengths do not overlap. Nothing here decides whether to take it.
- ONE FINDING RIDES FORWARD FROM cut-criteria: what a worktree CONTAINS rests on no requirement, so the 1326-file measurement scored nothing.
- gate-candidates is next, and the owner asked to meet there.

## anything_else

### How the scoring was run

THE RULING WAS FOLLOWED LITERALLY. A subagent was spawned with a clean context. It was given four record paths, three requirement paths, the six anchors, and an instruction to find prior art. It was told nothing about why any candidate exists or which one anybody favours.

IT WAS ALSO TOLD THE CAP: no named external comparison, no score above 3. That cap bit. Five of the twelve rows score 4, and every one of them carries a name.

### The three names that earned a 4

- KUBERNETES LEASE, for the two rows the claim lifecycle wins. Its `holderIdentity`, `renewTime` and `leaseDurationSeconds` are the same three facts our claim carries.
- VANILLA GIT, for the no-folders worktree row. One clone, one working tree, branches switched by checkout.
- DEVCONTAINER WITH CODESPACES, for the bootstrap row. A declared image arrives already able to run.

NONE SCORED 5. Nothing in this set was judged better than its named comparison, and that is the honest result rather than a modest one.

### What I did not do

I DID NOT ADJUST A SCORE, and I did not record a disagreement beside one, because I have none. Reading the twelve rows against the four records, each anchor sentence points at something the record actually says or actually omits.

THE ONE I CHECKED HARDEST was `cand-the-lifecycle-is-the-claim` scoring 1 on bootstrap, since it is otherwise the strongest survivor. The record does mention adopting a machine. It designs none of verify, install, start, wait or launch. A 1 on the gesture anchor is right.
