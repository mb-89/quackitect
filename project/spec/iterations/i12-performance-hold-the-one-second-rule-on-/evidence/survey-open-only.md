---
form: survey-open-only
by: agent
signed_off: 2026-08-15T11:20:16.117Z
authors: agent
files:
---

# Evidence form / survey-open-only

## current_situation

itList calls a record open when its WORKTREE DIRECTORY exists, and a close leaves that directory behind.

So i27 stood in the list headed what stands open the day after it shipped. The front desk sweeps with that list and advises from it, which makes the sweep itself wrong rather than the advice built on it.

## built

Committed in ea18e4a1.

engine/survey.ts filters the open iterations on the record's own status, dropping shipped and closed. The goal it already reads fetches the frontmatter, so the filter costs no extra read.

The expedition list above it is left alone deliberately, and the comment says why: no expedition has been seen doing this, and the guard is one line away the day one is.

Covered by tests/surveywindow.test.ts, green at 6 of 6. The new case seeds an iteration, sees it open, stamps its record shipped, and asserts it leaves both the list and the count.

## follow_up

- The count and the list are asserted to agree, which is the half that actually misled: the desk reads counts before it reads names.
- itList itself is unchanged. Its open rule is about the WORKTREE and it has other callers, including the container, where a worktree-shaped answer is the right one.

## anything_else

ON FIXING THE SURVEY RATHER THAN itList.

itList's rule is not wrong. It answers whether a record's tree is on this machine, and the container needs exactly that: a record with no worktree cannot be walked here at all.

What the SURVEY means by open is different. It heads a list called what stands open, which is a question about work, not about directories.

Two callers, two questions, one function answering both. Fixing itList would have made the container right about work and wrong about trees.

THE COST OF WRITING THE TEST CASE IS WORTH RECORDING. It failed twice before it passed, and both failures were the fixture, not the fix: the seed answers with `seeded` rather than `id`, and a record is read from ITS OWN TREE while it is open. Neither is visible from the survey's side.
