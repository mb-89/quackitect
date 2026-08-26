---
minted_in: i51-work-running-out-of-sight-reports-itself
id: exp-what-a-fresh-session-sees
type: "[[experiment]]"
statement: Can a session that has only the repository learn that a step's leaving judgment was running, and read its verdict once it lands?
probes:
  - raid-ar-walk-resumes-from-repo
timebox: 45 minutes
form: script
promote: none
folds_to: the operation record owes two fields, the state it belongs to and the total its progress divides into, plus a settle path that writes where a fresh session looks
faked: The third standing itself, which is not built. What was measured instead is every place a running piece of work IS recorded today, and where a leaving script's verdict actually goes. Both are the real mechanisms, read off disk and off the source.
fallback: If nothing durable can hold the third standing, the fallback is that a fresh session re-runs the judgment rather than trusting a word it cannot settle.
verdict: falls
measured: "2026-08-21. A 25-second job ran to completion out of sight. The repository recorded nothing about it: git status showed no change caused by it. Its only record was .se/jobs/job-mt2tgjw4-16.jsonl, and .gitignore line 3 excludes .se/*. A leaving script's verdict never reaches disk at all — sessionscript.ts line 105 holds it in an in-memory Map, and line 156 deletes the entry the moment the run settles. Two job tables stand side by side: .se/jobs with 35 entries and .se/test-jobs with 1."
source_refs:
  - rank-unknowns, the seeded pick
  - req-walk-resumes-from-repo
  - req-a-pending-verdict-is-recorded-against-its-state
  - req-one-call-reports-every-piece-of-work-out-of-sight
---

## Setup

Run through the lane at 2026-08-21, from `iterations/i51/run-spikes/what-a-fresh-session-sees`.

THE THIRD STANDING IS NOT BUILT, so it cannot be left running and looked at.
What CAN be measured is the machinery a third standing would have to live in, and
that machinery is all real.

FOUR THINGS WERE LOOKED AT.

- A real piece of work out of sight: a 25-second job started through the lane.
- Every file on disk that names it.
- Where a leaving script's verdict goes, read off `deliverable/engine/sessionscript.ts`.
- Where a step's PASS goes, read off any signed evidence form.

## Result

### A running job leaves no mark on the repository

THE JOB RAN 25,015 ms AND SETTLED WITH EXIT 0. While it ran, `git status
--porcelain` showed only changes that were already there before it started.

ITS ONLY RECORD IS `.se/jobs/job-mt2tgjw4-16.jsonl`, and `.gitignore` line 3
excludes `.se/*` with one exception that is not this.

SO A FRESH CLONE SEES NOTHING. Not the job, not that it ran, not that it
finished.

### A leaving script's verdict never reaches disk at all

`deliverable/engine/sessionscript.ts` line 105 declares
`scriptRuns = new Map<string, Promise<...>>()`, keyed by the state's evidence
key. Line 156 deletes the entry in a `.finally()` as soon as the run settles.

THAT IS WEAKER THAN THE JOB TABLE. A job at least has a machine-local file. A
leaving verdict has memory and nothing else, so it does not survive the process,
let alone the session.

### What a step's PASS does have is durable

A SIGNED EVIDENCE FORM CARRIES `signed_off` AND `by` in its own frontmatter, in
`spec/iterations/<record>/evidence/`. That is repository content and a fresh
session reads it.

SO TWO OF THE THREE STANDINGS ARE DURABLE and the third has no home anywhere —
not in the repository, and not even in the machine-local folder.

### The two tables the iteration exists to join are two folders

| folder | entries |
| --- | --- |
| `.se/jobs` | 35 |
| `.se/test-jobs` | 1 |

THE SPLIT IS NOT AN ABSTRACTION. It is two directories that cannot see each
other, which is what `req-one-call-reports-every-piece-of-work-out-of-sight`
asks somebody to end.

### A job record cannot say which step it belongs to

The first line of the job's own record:

    {"id":"job-mt2tgjw4-16","command":"node -e \"...\"","started":1787308711348,
     "exit":null,"running":true,"pid":11183}

WHAT IS THERE: an identity, a start time, a liveness flag, a pid, an exit slot.

WHAT IS MISSING FOR THIS DESIGN: the state the work belongs to, and any total to
divide progress into. Without the first, a settled verdict has nowhere to land.
Without the second, no duration can be computed for that kind of work.

## What this settles

[[raid-ar-walk-resumes-from-repo]] IS CONFIRMED AND SHARPENED. The risk said the
repository cannot settle a step left deciding. It cannot, and the reason is
narrower and more fixable than "the state is lost": there is simply no field
anywhere that holds it.

THE SIBLING SPIKE ALREADY SHOWED THE WORK SURVIVES.
[[exp-does-a-left-check-survive-its-call]] measured an orphaned judgment running
to completion. Put the two together and the shape is exact: the judgment finishes
and its answer has nowhere to go.

WHAT M7 MUST BUILD, and it is small. Two fields on the operation record — the
state it belongs to, and the total its progress divides into — plus a settle path
that writes the verdict where a fresh session looks. The evidence form's own
frontmatter is where every other durable standing already lives.

THE FALLBACK STAYS AVAILABLE. If the settle path is not built, a fresh session
must re-run the judgment rather than trust a word it cannot settle. That is
slower and it is honest.
