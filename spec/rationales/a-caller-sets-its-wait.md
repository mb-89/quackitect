---
kind: [[rationale]]
---

# Why

The owner decided this for the model, and the decision is final. One kind of
action stood, and every call took a record, `ops/<id>`, inside the index. The
caller set a wait, and a call ending within it answered the result. One running
past it answered `still running`, with the fraction done and the time gone by. An agent stored no handle
and spent no turn polling.

Writing operations queued one at a time per tree. An agent reads this note
before it asks again.

## 1. What it measured

A pull, the check and a retro each ran past a hook's patience. A caller that
waited stood still, and a caller that timed out lost the result. An earlier
ruling handed a longer action a handle at once. The agent then stored the handle
and spent turns polling it, and the split between `q.Action` and `q.Op` asked
every author to guess a length.

## 2. What the wait bought

| what the ruling gave | why |
|---|---|
| a plain answer for most calls | a call ending within its wait answered the result |
| no handle an agent keeps | the hook module handed a late result into the session's next turn |
| no turn spent polling | `ops/wait` with no handle waited on the session's open operations |
| no guess to maintain | the call reports the fraction done and the time gone by, and the caller works out the rest |
| a stop that knew what still ran | the Stop hook named the open operations and how far each had come |

## 3. Where it came from

| the earlier work | what it lent |
|---|---|
| RFC 7240, `Prefer: wait` and `respond-async` | a wait the request sets, and `202` with a status link past it |
| Google AIP-151, long-running operations | `WaitOperation` with a timeout |
| `kubectl wait --timeout` | a wait the caller bounds |
| `docker run`, attached or with `-d` | following to the end, or answering at once |
| the background tasks of Claude Code | a run that goes to the background, and a notification at its end |

## 4. Why one writer

Two writing operations on one checkout raced on the files and on git. A git hook
calling back into a writer waited on itself. One queue per tree, and hooks that
read names alone, removed both.

## 5. What it gave up

A second writer waited, even where the two touched different files. A caller
wanting a time to go worked it out from the fraction and the time gone by.

## 6. What would make it wrong

A queue that stood long enough to stall the work, with writers that each touched
files of their own. A lock per file then beat one queue. An agent host with no
hook to carry a late result would need the handle again.
