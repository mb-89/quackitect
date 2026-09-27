---
kind: [[rationale]]
---

# Why

The owner decided this for the model, and the decision is final. An action
taking longer than a moment answered a handle, `ops/<id>`, and writing
operations queued one at a time per tree. An agent reads this note before it
asks again.

## 1. What it measured

A pull, the check and a retro each ran past a hook's patience. A caller that
waited stood still, and a caller that timed out lost the result. A handle kept the
caller free, and the name kept the hang in sight.

## 2. Why one writer

Two writing operations on one checkout raced on the files and on git. A git hook
calling back into a writer waited on itself. One queue per tree, and hooks that
read names alone, removed both.

## 3. What it gave up

A second writer waited, even where the two touched different files. A caller
wanting a result wrote the watch or the wait, and a plain call no longer did.

## 4. What would make it wrong

A queue that stood long enough to stall the work, with writers that each touched
files of their own. A lock per file then beat one queue.
